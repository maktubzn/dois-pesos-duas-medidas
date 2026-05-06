#!/usr/bin/env node
import readline from 'node:readline'
import { setTimeout as delay } from 'node:timers/promises'
import { SerialPort } from 'serialport'
import { createArduinoVirtualProtocol, normalizeArduinoVirtualCommand } from './protocol.mjs'

function parseArgs(argv) {
  const args = {
    port: null,
    baudRate: 9600,
    locked: false,
    dfplayerReady: false,
    list: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--port' && argv[index + 1]) {
      args.port = argv[index + 1]
      index += 1
      continue
    }

    if (value === '--baud' && argv[index + 1]) {
      args.baudRate = Number.parseInt(argv[index + 1], 10) || 9600
      index += 1
      continue
    }

    if (value === '--locked') {
      args.locked = true
      continue
    }

    if (value === '--dfplayer-ready') {
      args.dfplayerReady = true
      continue
    }

    if (value === '--list') {
      args.list = true
      continue
    }

    if (value === '--help' || value === '-h') {
      args.help = true
    }
  }

  return args
}

function printHelp() {
  console.log([
    'Arduino virtual tool',
    '',
    'Usage:',
    '  npm run arduino:virtual -- --port COM7',
    '  npm run arduino:virtual -- --list',
    '',
    'Local commands:',
    '  1 | a | bt1 | bt1press   inject BT1PRESS',
    '  2 | b | bt2 | bt2press   inject BT2PRESS',
    '  r | reset                inject RESET',
    '  ping | status | lock | unlock | reset_hw | reset',
    '                           forward a host command to the paired port',
    '  help                     print this help',
    '  exit | quit              stop the tool',
  ].join('\n'))
}

async function listPorts() {
  const ports = await SerialPort.list()

  if (ports.length === 0) {
    console.log('No serial ports found.')
    return
  }

  ports.forEach((port, index) => {
    const details = [
      port.path,
      port.manufacturer ? `manufacturer=${port.manufacturer}` : null,
      port.serialNumber ? `serial=${port.serialNumber}` : null,
      port.vendorId ? `vid=${port.vendorId}` : null,
      port.productId ? `pid=${port.productId}` : null,
    ]
      .filter(Boolean)
      .join(' ')

    console.log(`${index + 1}. ${details}`)
  })
}

function isExitCommand(input) {
  return input === 'EXIT' || input === 'QUIT'
}

function isHardwareShortcut(input) {
  return (
    input === '1' ||
    input === 'A' ||
    input === 'BT1' ||
    input === 'BT1PRESS'
  )
}

function isHardwareShortcutB(input) {
  return (
    input === '2' ||
    input === 'B' ||
    input === 'BT2' ||
    input === 'BT2PRESS'
  )
}

function isResetShortcut(input) {
  return input === 'R' || input === 'RESET'
}

function isHostCommand(input) {
  return (
    input === 'PING' ||
    input === 'STATUS' ||
    input === 'LOCK' ||
    input === 'UNLOCK' ||
    input === 'RESET_HW' ||
    input === 'RESET' ||
    input === 'LED1_ON' ||
    input === 'LED2_ON' ||
    input === 'LEDS_OFF' ||
    input === 'PLAY_BUZZ' ||
    input === 'STOP_AUDIO' ||
    input.startsWith('VOLUME:')
  )
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printHelp()
    return
  }

  if (args.list) {
    await listPorts()
    return
  }

  const protocol = createArduinoVirtualProtocol({
    locked: args.locked,
    dfplayerReady: args.dfplayerReady,
  })

  let port = null
  let portBuffer = ''

  async function writeLines(lines) {
    if (lines.length === 0) {
      return
    }

    if (!port) {
      lines.forEach((line) => console.log(line))
      return
    }

    for (const line of lines) {
      await new Promise((resolve, reject) => {
        port.write(`${line}\n`, (error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
    }
  }

  async function writeCommand(command) {
    const normalized = normalizeArduinoVirtualCommand(command)
    if (!normalized) {
      return
    }

    if (!port) {
      await writeLines(protocol.handleHostLine(command))
      return
    }

    await new Promise((resolve, reject) => {
      port.write(`${command}\n`, (error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }

  async function injectHardware(eventName) {
    const responses = protocol.injectHardwareEvent(eventName)
    await writeLines(responses)
  }

  function printPrompt() {
    if (rl.closed) {
      return
    }

    rl.setPrompt(port ? 'arduino-virtual> ' : 'protocol> ')
    rl.prompt()
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  })

  rl.on('line', async (rawLine) => {
    const input = normalizeArduinoVirtualCommand(rawLine)

    try {
      if (!input) {
        printPrompt()
        return
      }

      if (isExitCommand(input)) {
        rl.close()
        return
      }

      if (input === 'HELP') {
        printHelp()
        printPrompt()
        return
      }

      if (isHardwareShortcut(input)) {
        await injectHardware('BT1PRESS')
        printPrompt()
        return
      }

      if (isHardwareShortcutB(input)) {
        await injectHardware('BT2PRESS')
        printPrompt()
        return
      }

      if (isResetShortcut(input)) {
        await injectHardware('RESET')
        printPrompt()
        return
      }

      if (isHostCommand(input)) {
        await writeCommand(rawLine.trim())
        printPrompt()
        return
      }

      if (!port) {
        await writeLines(protocol.handleHostLine(rawLine))
      } else {
        await writeCommand(rawLine.trim())
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
    }

    printPrompt()
  })

  rl.on('close', async () => {
    try {
      await port?.close()
    } catch {
      // Ignore close errors during shutdown.
    }

    process.exit(0)
  })

  if (!args.port) {
    console.log('No serial port configured. Running in local protocol console mode.')
    console.log('Type help for commands.')
    printPrompt()
    return
  }

  try {
    port = new SerialPort({
      path: args.port,
      baudRate: args.baudRate,
      autoOpen: false,
    })
  } catch (error) {
    console.error(`Failed to create serial port ${args.port}:`, error instanceof Error ? error.message : String(error))
    rl.close()
    return
  }

  port.on('error', (error) => {
    console.error(`Serial error: ${error.message}`)
  })

  port.on('data', (chunk) => {
    portBuffer += Buffer.from(chunk).toString('utf8')

    const lines = portBuffer.split(/\r?\n/)
    portBuffer = lines.pop() ?? ''

    void (async () => {
      for (const line of lines) {
        const responses = protocol.handleHostLine(line)
        if (responses.length > 0) {
          console.log(`< ${line}`)
          await writeLines(responses)
        }
      }
    })()
  })

  try {
    await new Promise((resolve, reject) => {
      port.open((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })

    console.log(`Opened ${args.port} at ${args.baudRate} baud.`)
    await writeLines(protocol.startupMessages())
    printPrompt()
  } catch (error) {
    console.error(`Failed to open ${args.port}:`, error instanceof Error ? error.message : String(error))
    rl.close()
  }

  process.on('SIGINT', async () => {
    rl.close()
  })

  await delay(0)
}

await main()
