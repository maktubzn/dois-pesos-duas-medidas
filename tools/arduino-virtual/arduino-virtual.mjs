#!/usr/bin/env node
import readline from 'node:readline'
import {
  DEFAULT_BAUD_RATE,
  createInitialState,
  handleArduinoCommand,
  inputToArduinoEvent,
  inputToLocalCommand,
  runProtocolSelfTest,
  splitSerialInput,
} from './protocol.mjs'

function parseArgs(argv) {
  const args = {
    baudRate: DEFAULT_BAUD_RATE,
    list: false,
    port: null,
    selfTest: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--list') args.list = true
    else if (arg === '--self-test') args.selfTest = true
    else if (arg === '--port') args.port = argv[++index] ?? null
    else if (arg === '--baud') args.baudRate = Number(argv[++index] ?? DEFAULT_BAUD_RATE)
  }

  return args
}

async function loadSerialPort() {
  try {
    return await import('serialport')
  } catch {
    console.error('[arduino-virtual] Dependencia serialport nao instalada.')
    console.error('[arduino-virtual] Rode: rtk npm --prefix tools/arduino-virtual install')
    process.exitCode = 1
    return null
  }
}

function writeLine(port, line) {
  port.write(`${line}\n`, (error) => {
    if (error) console.error(`[arduino-virtual] Erro ao escrever: ${error.message}`)
  })
}

function attachKeyboard(port) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'arduino> ',
  })

  console.log('[arduino-virtual] Comandos locais: 1/a=BT1PRESS, 2/b=BT2PRESS, r=RESET, status, lock, unlock, ping, reset_hw, exit')
  rl.prompt()

  rl.on('line', (line) => {
    const trimmed = line.trim()
    if (trimmed === 'exit' || trimmed === 'quit') {
      rl.close()
      return
    }

    const event = inputToArduinoEvent(trimmed)
    if (event) {
      writeLine(port, event)
      console.log(`[arduino-virtual] -> ${event}`)
      rl.prompt()
      return
    }

    const command = inputToLocalCommand(trimmed)
    if (command) {
      const result = handleArduinoCommand(command, attachKeyboard.state)
      attachKeyboard.state = result.state
      result.lines.forEach((response) => {
        writeLine(port, response)
        console.log(`[arduino-virtual] -> ${response}`)
      })
      rl.prompt()
      return
    }

    console.log('[arduino-virtual] Comando local desconhecido.')
    rl.prompt()
  })

  rl.on('close', () => {
    console.log('[arduino-virtual] Encerrando.')
    port.close()
  })
}

attachKeyboard.state = createInitialState()

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.selfTest) {
    const result = runProtocolSelfTest()
    console.log(JSON.stringify(result, null, 2))
    process.exitCode = result.ok ? 0 : 1
    return
  }

  const serialport = await loadSerialPort()
  if (!serialport) return

  const { SerialPort } = serialport

  if (args.list) {
    const ports = await SerialPort.list()
    ports.forEach((port) => console.log(`${port.path}\t${port.manufacturer ?? ''}`))
    return
  }

  if (!args.port) {
    console.error('[arduino-virtual] Informe a porta do simulador. Exemplo: --port COM8')
    console.error('[arduino-virtual] Chrome/Admin deve escolher a outra ponta do par, por exemplo COM7.')
    process.exitCode = 1
    return
  }

  const port = new SerialPort({ path: args.port, baudRate: args.baudRate })
  let serialBuffer = ''
  let state = createInitialState()

  port.on('open', () => {
    console.log(`[arduino-virtual] Aberto em ${args.port} @ ${args.baudRate}`)
    console.log('[arduino-virtual] Admin/Chrome deve conectar na porta pareada.')
    writeLine(port, 'ARDUINO_READY')
  })

  port.on('data', (chunk) => {
    serialBuffer += chunk.toString('utf8')
    const split = splitSerialInput(serialBuffer)
    serialBuffer = split.rest

    split.lines.forEach((line) => {
      const command = line.trim()
      if (!command) return
      console.log(`[arduino-virtual] <- ${command}`)
      const result = handleArduinoCommand(command, state)
      state = result.state
      result.lines.forEach((response) => {
        writeLine(port, response)
        console.log(`[arduino-virtual] -> ${response}`)
      })
    })
  })

  port.on('error', (error) => {
    console.error(`[arduino-virtual] Erro serial: ${error.message}`)
  })

  attachKeyboard(port)
}

void main()

