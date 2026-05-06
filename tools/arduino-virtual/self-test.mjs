import assert from 'node:assert/strict'
import { createArduinoVirtualProtocol } from './protocol.mjs'

function expectDeepEqual(actual, expected, label) {
  assert.deepEqual(actual, expected, label)
  console.log(`ok ${label}`)
}

function expectEqual(actual, expected, label) {
  assert.equal(actual, expected, label)
  console.log(`ok ${label}`)
}

function main() {
  const protocol = createArduinoVirtualProtocol()

  expectDeepEqual(
    protocol.startupMessages(),
    ['ARDUINO_READY', 'DFPLAYER_ERROR', 'STATUS:UNLOCKED'],
    'startup messages',
  )

  expectDeepEqual(protocol.ingestHostChunk('PI'), [], 'partial ping chunk')
  expectDeepEqual(protocol.ingestHostChunk('NG\n'), ['PONG'], 'ping response')
  expectDeepEqual(protocol.ingestHostChunk('STATUS\n'), ['STATUS:UNLOCKED', 'DFPLAYER_ERROR'], 'status response')

  expectDeepEqual(protocol.handleHostLine('LOCK'), ['LOCKED'], 'lock command')
  expectDeepEqual(protocol.handleHostLine('STATUS'), ['STATUS:LOCKED', 'DFPLAYER_ERROR'], 'locked status')
  expectDeepEqual(protocol.injectHardwareEvent('BT1PRESS'), [], 'ignore buzzer while locked')

  expectDeepEqual(protocol.handleHostLine('UNLOCK'), ['UNLOCKED'], 'unlock command')
  expectDeepEqual(protocol.injectHardwareEvent('BT1PRESS'), ['BT1PRESS'], 'bt1press event')
  expectEqual(protocol.snapshot().locked, true, 'lock after bt1press')
  expectDeepEqual(protocol.injectHardwareEvent('RESET'), ['RESET'], 'reset event')
  expectEqual(protocol.snapshot().locked, false, 'unlock after reset')

  expectDeepEqual(protocol.handleHostLine('RESET_HW'), ['RESET'], 'reset hw command')
  expectDeepEqual(protocol.handleHostLine('PING'), ['PONG'], 'ping command')
  expectDeepEqual(protocol.handleHostLine('UNKNOWN'), ['ERROR:UNKNOWN_COMMAND:UNKNOWN'], 'unknown command')

  const readyProtocol = createArduinoVirtualProtocol({ dfplayerReady: true, locked: true })
  expectDeepEqual(
    readyProtocol.startupMessages(),
    ['ARDUINO_READY', 'DFPLAYER_READY', 'STATUS:LOCKED'],
    'startup messages with dfplayer ready',
  )
  expectDeepEqual(readyProtocol.handleHostLine('STATUS'), ['STATUS:LOCKED', 'DFPLAYER_READY'], 'dfplayer ready status')

  console.log('self-test complete')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
}
