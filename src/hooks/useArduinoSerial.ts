import { useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { SerialCommand, SerialEventName } from '@/types/game.types'
import { parseSerialMessage, splitSerialLines } from '@/utils/serialParser'

interface SerialPortLike {
  readable?: ReadableStream<Uint8Array>
  writable?: WritableStream<Uint8Array>
  open: (options: { baudRate: number }) => Promise<void>
  close: () => Promise<void>
}

interface NavigatorSerialLike {
  serial?: {
    requestPort: () => Promise<SerialPortLike>
  }
}

export function useArduinoSerial() {
  const portRef = useRef<SerialPortLike | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null)
  const setSerialStatus = useGameStore((state) => state.setSerialStatus)
  const setSerialLastCommand = useGameStore((state) => state.setSerialLastCommand)
  const handleSerialMessage = useGameStore((state) => state.handleSerialMessage)
  const receiveInput = useGameStore((state) => state.receiveInput)

  const supported = Boolean((navigator as Navigator & NavigatorSerialLike).serial)

  const simulate = useCallback(
    (eventName: SerialEventName) => {
      if (eventName === 'BT1PRESS') {
        receiveInput('A', 'virtual')
        return
      }

      if (eventName === 'BT2PRESS') {
        receiveInput('B', 'virtual')
        return
      }

      // All events including RESET go through handleSerialMessage for consistent ACK-only behavior
      handleSerialMessage({ type: 'event', eventName, raw: eventName })
    },
    [handleSerialMessage, receiveInput],
  )

  const send = useCallback(
    async (command: SerialCommand) => {
      const port = portRef.current
      if (!port?.writable) {
        setSerialStatus(supported ? 'disconnected' : 'unsupported')
        return false
      }

      const writer = port.writable.getWriter()
      writerRef.current = writer

      try {
        await writer.write(new TextEncoder().encode(`${command}\n`))
        setSerialLastCommand(command)
        return true
      } catch {
        setSerialStatus('error')
        return false
      } finally {
        writer.releaseLock()
        writerRef.current = null
      }
    },
    [setSerialLastCommand, setSerialStatus, supported],
  )

  const readLoop = useCallback(async () => {
    const port = portRef.current
    if (!port?.readable) return

    let buffer = ''
    const decoder = new TextDecoder()
    const reader = port.readable.getReader()
    readerRef.current = reader

    try {
      while (portRef.current) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const split = splitSerialLines(buffer)
        buffer = split.rest
        split.lines.forEach((line) => {
          const message = parseSerialMessage(line)
          if (message) handleSerialMessage(message)
        })
      }
    } catch {
      setSerialStatus('error')
    } finally {
      reader.releaseLock()
      readerRef.current = null
    }
  }, [handleSerialMessage, setSerialStatus])

  const connect = useCallback(async () => {
    const serial = (navigator as Navigator & NavigatorSerialLike).serial

    if (!serial) {
      setSerialStatus('unsupported')
      return false
    }

    setSerialStatus('connecting')

    try {
      const port = await serial.requestPort()
      await port.open({ baudRate: 9600 })
      portRef.current = port
      setSerialStatus('connected')
      void readLoop()
      void send('STATUS')
      return true
    } catch {
      portRef.current = null
      setSerialStatus('error')
      return false
    }
  }, [readLoop, send, setSerialStatus])

  const disconnect = useCallback(async () => {
    try {
      await writerRef.current?.close()
      await readerRef.current?.cancel()
      await portRef.current?.close()
    } catch {
      setSerialStatus('error')
      return false
    } finally {
      portRef.current = null
      setSerialStatus('disconnected')
    }

    return true
  }, [setSerialStatus])

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return
      }

      const target = event.target as HTMLElement | null
      const tagName = target?.tagName.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return
      }

      if (event.key.toLowerCase() === 'z') {
        simulate('BT1PRESS')
      } else if (event.key.toLowerCase() === 'm') {
        simulate('BT2PRESS')
      } else if (event.key.toLowerCase() === 'r') {
        simulate('RESET')
      } else {
        return
      }

      event.preventDefault()
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [simulate])

  return {
    supported,
    connect,
    disconnect,
    send,
    ping: () => send('PING'),
    status: () => send('STATUS'),
    lock: () => send('LOCK'),
    unlock: () => send('UNLOCK'),
    resetHardware: () => send('RESET_HW'),
    playBuzz: () => send('PLAY_BUZZ'),
    stopAudio: () => send('STOP_AUDIO'),
    setVolume: (volume: number) => {
      const clamped = Math.max(0, Math.min(30, Math.trunc(volume)))
      return send(`VOLUME:${clamped}`)
    },
    simulate,
  }
}
