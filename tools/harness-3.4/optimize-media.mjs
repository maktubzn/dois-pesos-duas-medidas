import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '../..')
const sourceDir = path.join(rootDir, 'public', 'img')
const questionsSourceDir = path.join(rootDir, 'public', 'img das perguntas')
const outputDir = path.join(rootDir, 'public', 'img-optimized')
const questionsOutputDir = path.join(rootDir, 'public', 'img das perguntas-optimized')
const manifestPath = path.join(outputDir, 'manifest.json')

mkdirSync(outputDir, { recursive: true })
mkdirSync(questionsOutputDir, { recursive: true })

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with code ${result.status ?? 'unknown'}`)
  }
}

function ensureParent(filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true })
}

function sizeKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function optimizeImage({ source, target, scale, webpArgs }) {
  ensureParent(target)
  const args = ['-y', '-i', source]

  if (scale) {
    args.push('-vf', `scale=${scale}:flags=lanczos`)
  }

  args.push(...webpArgs, target)
  run('ffmpeg', args)
}

function optimizeVideo({ source, target, scale, audioBitrate = '64k', crf = '28' }) {
  ensureParent(target)
  run('ffmpeg', [
    '-y',
    '-i',
    source,
    '-vf',
    `scale=${scale}:flags=lanczos`,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    crf,
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-c:a',
    'aac',
    '-b:a',
    audioBitrate,
    target,
  ])
}

function optimizePoster({ source, target, scale }) {
  ensureParent(target)
  run('ffmpeg', ['-y', '-ss', '0.25', '-i', source, '-frames:v', '1', '-vf', `scale=${scale}:flags=lanczos`, '-q:v', '88', target])
}

const jobs = [
  {
    kind: 'image',
    source: path.join(sourceDir, 'bg-FNL1.png'),
    target: path.join(outputDir, 'bg-FNL1.webp'),
    scale: '1280:-2',
    webpArgs: ['-c:v', 'libwebp', '-lossless', '0', '-q:v', '82', '-compression_level', '6'],
  },
  {
    kind: 'image',
    source: path.join(sourceDir, 'bg-FNL2.png'),
    target: path.join(outputDir, 'bg-FNL2.webp'),
    scale: '1280:-2',
    webpArgs: ['-c:v', 'libwebp', '-lossless', '0', '-q:v', '82', '-compression_level', '6'],
  },
  {
    kind: 'image',
    source: path.join(sourceDir, 'logoinfo.png'),
    target: path.join(outputDir, 'logoinfo.webp'),
    scale: '1024:-2',
    webpArgs: ['-c:v', 'libwebp', '-lossless', '0', '-q:v', '88', '-compression_level', '6'],
  },
  {
    kind: 'image',
    source: path.join(sourceDir, '02.png'),
    target: path.join(outputDir, '02.webp'),
    scale: '1024:-2',
    webpArgs: ['-c:v', 'libwebp', '-lossless', '0', '-q:v', '86', '-compression_level', '6'],
  },
  {
    kind: 'image',
    source: path.join(questionsSourceDir, 'senhor-destino.png'),
    target: path.join(questionsOutputDir, 'senhor-destino.webp'),
    scale: '1024:-2',
    webpArgs: ['-c:v', 'libwebp', '-lossless', '0', '-q:v', '88', '-compression_level', '6'],
  },
  {
    kind: 'video',
    source: path.join(sourceDir, 'video1.mp4'),
    target: path.join(outputDir, 'video1.mp4'),
    scale: '1024:-2',
  },
  {
    kind: 'video',
    source: path.join(sourceDir, 'BGVIDEO.mp4'),
    target: path.join(outputDir, 'BGVIDEO.mp4'),
    scale: '1024:-2',
  },
]

const manifest = []

for (const job of jobs) {
  const sourceSize = statSync(job.source).size

  if (job.kind === 'image') {
    optimizeImage(job)
  } else {
    optimizeVideo(job)
  }

  const targetSize = statSync(job.target).size
  manifest.push({
    source: path.relative(rootDir, job.source).replaceAll('\\', '/'),
    target: path.relative(rootDir, job.target).replaceAll('\\', '/'),
    kind: job.kind,
    sourceSize,
    targetSize,
    savedBytes: sourceSize - targetSize,
    sourceSizeLabel: sizeKb(sourceSize),
    targetSizeLabel: sizeKb(targetSize),
  })
}

const posterSource = path.join(outputDir, 'video1.mp4')
const posterTarget = path.join(outputDir, 'video1-poster.webp')
optimizePoster({ source: posterSource, target: posterTarget, scale: '1024:-2' })

const posterSourceSize = statSync(posterSource).size
const posterTargetSize = statSync(posterTarget).size
manifest.push({
  source: path.relative(rootDir, posterSource).replaceAll('\\', '/'),
  target: path.relative(rootDir, posterTarget).replaceAll('\\', '/'),
  kind: 'poster',
  sourceSize: posterSourceSize,
  targetSize: posterTargetSize,
  savedBytes: posterSourceSize - posterTargetSize,
  sourceSizeLabel: sizeKb(posterSourceSize),
  targetSizeLabel: sizeKb(posterTargetSize),
})

writeFileSync(manifestPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), assets: manifest }, null, 2)}\n`)

console.log(`Wrote optimized assets to ${path.relative(rootDir, outputDir).replaceAll('\\', '/')}`)
