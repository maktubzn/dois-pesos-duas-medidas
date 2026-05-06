import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const rawDir = resolve(root, 'public/audio/_raw')
const targets = [
  {
    label: 'voz',
    outDir: resolve(root, 'public/audio/voz'),
    match: /contador|voz/i,
    bitrate: '128k',
  },
  {
    label: 'sfx',
    outDir: resolve(root, 'public/audio/sfx'),
    match: /resposta|tempo|grupo|sfx|relogio/i,
    bitrate: '96k',
  },
  {
    label: 'stingers',
    outDir: resolve(root, 'public/audio/stingers'),
    match: /veredito|fim|stinger/i,
    bitrate: '128k',
  },
]

function hasFfmpeg() {
  const result = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' })
  return result.status === 0
}

function getTarget(fileName) {
  return targets.find((target) => target.match.test(fileName)) ?? targets[1]
}

function outputName(fileName) {
  return `${basename(fileName, extname(fileName))}.mp3`
}

if (!existsSync(rawDir)) {
  mkdirSync(rawDir, { recursive: true })
}

for (const target of targets) {
  mkdirSync(target.outDir, { recursive: true })
}

const files = readdirSync(rawDir).filter((file) => !file.startsWith('.') && statSync(join(rawDir, file)).isFile())

if (files.length === 0) {
  console.log('[audio] public/audio/_raw esta vazio. Coloque os arquivos originais ali antes de otimizar.')
  process.exit(0)
}

if (!hasFfmpeg()) {
  console.log('[audio] ffmpeg nao encontrado. Nada foi alterado.')
  console.log('[audio] Instale ffmpeg ou rode manualmente:')
  console.log('ffmpeg -y -i entrada.wav -ac 1 -ar 44100 -codec:a libmp3lame -b:a 128k public/audio/voz/contador_5.mp3')
  console.log('ffmpeg -y -i entrada.wav -ac 1 -ar 44100 -codec:a libmp3lame -b:a 96k public/audio/sfx/resposta_certa.mp3')
  process.exit(0)
}

for (const file of files) {
  const source = join(rawDir, file)
  const target = getTarget(file)
  const destination = join(target.outDir, outputName(file))
  const before = statSync(source).size
  const result = spawnSync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'warning',
    '-i',
    source,
    '-ac',
    '1',
    '-ar',
    '44100',
    '-codec:a',
    'libmp3lame',
    '-b:a',
    target.bitrate,
    destination,
  ], { stdio: 'inherit' })

  if (result.status !== 0) {
    console.warn(`[audio] falhou: ${file}`)
    continue
  }

  const after = statSync(destination).size
  console.log(`[audio] ${file} -> ${target.label}/${outputName(file)} ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`)
}
