export const DEFAULT_BAUD_RATE = 9600

const LEGACY_COMMAND_RESPONSES = new Map([
  ['PING', (state) => ({ state, lines: ['PONG'] })],
  ['STATUS', (state) => ({ state, lines: [`STATUS:${state.locked ? 'LOCKED' : 'UNLOCKED'}`] })],
  ['LOCK', (state) => ({ state: { ...state, locked: true }, lines: ['LOCKED'] })],
  ['UNLOCK', (state) => ({ state: { ...state, locked: false }, lines: ['UNLOCKED'] })],
  ['RESET_HW', (state) => ({ state: { ...state, locked: false }, lines: ['RESET'] })],
  ['RESET', (state) => ({ state: { ...state, locked: false }, lines: ['RESET'] })],
])

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeCommand(value) {
  return normalizeText(value).toUpperCase()
}

export function createInitialState() {
  return { locked: false }
}

export function handleArduinoCommand(input, state = createInitialState()) {
  const command = normalizeCommand(input)
  if (!command) return { state, lines: [] }

  const handler = LEGACY_COMMAND_RESPONSES.get(command)
  if (handler) return handler(state)

  return {
    state,
    lines: [`ERROR:UNKNOWN_COMMAND:${command}`],
  }
}

export function inputToArduinoEvent(input) {
  const command = normalizeText(input).toLowerCase()
  if (command === '1' || command === 'a' || command === 'bt1' || command === 'bt1press') return 'BT1PRESS'
  if (command === '2' || command === 'b' || command === 'bt2' || command === 'bt2press') return 'BT2PRESS'
  if (command === 'r' || command === 'reset') return 'RESET'
  return null
}

export function inputToLocalCommand(input) {
  const command = normalizeText(input).toLowerCase()
  if (command === 'status') return 'STATUS'
  if (command === 'lock') return 'LOCK'
  if (command === 'unlock') return 'UNLOCK'
  if (command === 'ping') return 'PING'
  if (command === 'reset_hw' || command === 'reset-hw') return 'RESET_HW'
  if (command === 'reset') return 'RESET'
  return null
}

export function splitSerialInput(buffer) {
  const lines = String(buffer).split(/\r?\n/)
  const rest = lines.pop() ?? ''
  return { lines, rest }
}

export class ArduinoVirtualProtocol {
  constructor(options = {}) {
    const {
      locked = false,
      dfplayerReady = false,
      emitStartup = true,
    } = options

    this.locked = Boolean(locked)
    this.dfplayerReady = Boolean(dfplayerReady)
    this.buffer = ''
    this.emitStartup = emitStartup !== false
  }

  snapshot() {
    return {
      locked: this.locked,
      dfplayerReady: this.dfplayerReady,
      bufferedBytes: this.buffer.length,
    }
  }

  startupMessages() {
    if (!this.emitStartup) {
      return []
    }

    return [
      'ARDUINO_READY',
      this.dfplayerReady ? 'DFPLAYER_READY' : 'DFPLAYER_ERROR',
      `STATUS:${this.locked ? 'LOCKED' : 'UNLOCKED'}`,
    ]
  }

  statusMessages() {
    return [
      `STATUS:${this.locked ? 'LOCKED' : 'UNLOCKED'}`,
      this.dfplayerReady ? 'DFPLAYER_READY' : 'DFPLAYER_ERROR',
    ]
  }

  ingestHostChunk(chunk) {
    this.buffer += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8')
    const split = splitSerialInput(this.buffer)
    this.buffer = split.rest

    const lines = []
    for (const line of split.lines) {
      lines.push(...this.handleHostLine(line))
    }

    return lines
  }

  flushBuffer() {
    const pending = normalizeText(this.buffer)
    this.buffer = ''
    return pending ? this.handleHostLine(pending) : []
  }

  handleHostLine(line) {
    const command = normalizeCommand(line)
    if (!command) return []

    if (command === 'PING') return ['PONG']
    if (command === 'STATUS') return this.statusMessages()

    if (command === 'LOCK') {
      this.locked = true
      return ['LOCKED']
    }

    if (command === 'UNLOCK') {
      this.locked = false
      return ['UNLOCKED']
    }

    if (command === 'RESET_HW' || command === 'RESET') {
      this.locked = false
      return ['RESET']
    }

    if (command === 'LED1_ON') return ['LED1_ON_OK']
    if (command === 'LED2_ON') return ['LED2_ON_OK']
    if (command === 'LEDS_OFF') return ['LEDS_OFF_OK']
    if (command === 'PLAY_BUZZ') return ['PLAYED:1']
    if (command === 'STOP_AUDIO') return ['AUDIO_STOPPED']
    if (command.startsWith('VOLUME:')) {
      return this.dfplayerReady ? [command] : ['DFPLAYER_ERROR']
    }

    return [`ERROR:UNKNOWN_COMMAND:${normalizeText(line)}`]
  }

  injectHardwareEvent(eventName) {
    const normalized = normalizeCommand(eventName)

    if (normalized === 'BT1PRESS' || normalized === 'BT2PRESS') {
      if (this.locked) {
        return []
      }

      this.locked = true
      return [normalized]
    }

    if (normalized === 'RESET') {
      this.locked = false
      return ['RESET']
    }

    return []
  }
}

export function createArduinoVirtualProtocol(options) {
  return new ArduinoVirtualProtocol(options)
}

export function normalizeArduinoVirtualCommand(input) {
  return normalizeCommand(input)
}

export function runProtocolSelfTest() {
  const protocol = createArduinoVirtualProtocol()
  const transcript = []

  for (const command of ['PING', 'STATUS', 'LOCK', 'STATUS', 'UNLOCK', 'RESET_HW', 'BOOP']) {
    transcript.push({ in: command, out: protocol.handleHostLine(command) })
  }

  const events = ['1', '2', 'a', 'b', 'r'].map((input) => [input, inputToArduinoEvent(input)])
  const assertions = [
    transcript[0].out[0] === 'PONG',
    transcript[1].out[0] === 'STATUS:UNLOCKED',
    transcript[1].out[1] === 'DFPLAYER_ERROR',
    transcript[2].out[0] === 'LOCKED',
    transcript[3].out[0] === 'STATUS:LOCKED',
    transcript[4].out[0] === 'UNLOCKED',
    transcript[5].out[0] === 'RESET',
    transcript[6].out[0] === 'ERROR:UNKNOWN_COMMAND:BOOP',
    events[0][1] === 'BT1PRESS',
    events[1][1] === 'BT2PRESS',
    events[4][1] === 'RESET',
  ]

  return {
    ok: assertions.every(Boolean),
    transcript,
    events,
    startup: protocol.startupMessages(),
  }
}
