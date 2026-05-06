import type { SerialEventName, SerialMessage } from '@/types/game.types'

const SERIAL_EVENTS = new Set<SerialEventName>([
  'ARDUINO_READY',
  'DFPLAYER_READY',
  'DFPLAYER_ERROR',
  'BT1PRESS',
  'BT2PRESS',
  'RESET',
  'LOCKED',
  'UNLOCKED',
  'PONG',
])

export function parseSerialEvent(line: string): SerialEventName | null {
  const normalized = line.trim().toUpperCase()

  if (SERIAL_EVENTS.has(normalized as SerialEventName)) {
    return normalized as SerialEventName
  }

  return null
}

export function parseSerialMessage(line: string): SerialMessage | null {
  const raw = line.trim()
  const normalized = raw.toUpperCase()

  if (!normalized) return null

  if (normalized === 'STATUS:LOCKED') {
    return { type: 'status', locked: true, raw }
  }

  if (normalized === 'STATUS:UNLOCKED') {
    return { type: 'status', locked: false, raw }
  }

  if (normalized === 'DFPLAYER:READY') {
    return { type: 'dfplayer', ready: true, raw }
  }

  if (normalized === 'DFPLAYER:ERROR') {
    return { type: 'dfplayer', ready: false, raw }
  }

  if (normalized.startsWith('ERROR:')) {
    return { type: 'error', message: raw.slice('ERROR:'.length), raw }
  }

  const eventName = parseSerialEvent(normalized)
  if (eventName) {
    return { type: 'event', eventName, raw }
  }

  return { type: 'unknown', raw }
}

export function splitSerialLines(buffer: string) {
  const lines = buffer.split(/\r?\n/)
  const rest = lines.pop() ?? ''

  return {
    lines,
    rest,
  }
}
