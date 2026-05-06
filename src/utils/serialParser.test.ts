import { describe, expect, it } from 'vitest'
import { parseSerialEvent, parseSerialMessage, splitSerialLines } from './serialParser'

describe('serial parser', () => {
  it('parses supported Arduino events', () => {
    expect(parseSerialEvent('ARDUINO_READY')).toBe('ARDUINO_READY')
    expect(parseSerialEvent('DFPLAYER_READY')).toBe('DFPLAYER_READY')
    expect(parseSerialEvent('DFPLAYER_ERROR')).toBe('DFPLAYER_ERROR')
    expect(parseSerialEvent('BT1PRESS\r')).toBe('BT1PRESS')
    expect(parseSerialEvent('bt2press')).toBe('BT2PRESS')
    expect(parseSerialEvent('RESET')).toBe('RESET')
    expect(parseSerialEvent('LOCKED')).toBe('LOCKED')
    expect(parseSerialEvent('unlocked')).toBe('UNLOCKED')
    expect(parseSerialEvent('PONG')).toBe('PONG')
    expect(parseSerialEvent('UNKNOWN')).toBeNull()
  })

  it('parses protocol v2 structured messages', () => {
    expect(parseSerialMessage('STATUS:LOCKED')).toEqual({
      type: 'status',
      locked: true,
      raw: 'STATUS:LOCKED',
    })
    expect(parseSerialMessage('DFPLAYER:ERROR')).toEqual({
      type: 'dfplayer',
      ready: false,
      raw: 'DFPLAYER:ERROR',
    })
    expect(parseSerialMessage('ERROR:UNKNOWN_COMMAND:BOOP')).toEqual({
      type: 'error',
      message: 'UNKNOWN_COMMAND:BOOP',
      raw: 'ERROR:UNKNOWN_COMMAND:BOOP',
    })
    expect(parseSerialMessage('PONG')).toEqual({
      type: 'event',
      eventName: 'PONG',
      raw: 'PONG',
    })
    expect(parseSerialMessage('')).toBeNull()
  })

  it('splits complete lines and keeps the remaining partial line', () => {
    expect(splitSerialLines('BT1PRESS\nRESET\nBT')).toEqual({
      lines: ['BT1PRESS', 'RESET'],
      rest: 'BT',
    })
  })
})
