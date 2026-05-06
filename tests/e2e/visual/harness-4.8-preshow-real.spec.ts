import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = 'docs/sprint-2/harness-4.8/evidencias'
const frameDir = join(evidenceDir, 'frames')
const screenshotDir = join(evidenceDir, 'screenshots')
const videoDir = join(evidenceDir, 'videos')
const metricsPath = join(evidenceDir, 'preshow-real-metrics.json')

mkdirSync(frameDir, { recursive: true })
mkdirSync(screenshotDir, { recursive: true })
mkdirSync(videoDir, { recursive: true })

interface PreShowSample {
  sampleElapsedMs: number
  stageElapsedMs: number
  phase: string | null
  scene: string | null
  videoState: string | null
  videoCurrentTime: number
  videoPaused: boolean
  videoCount: number
  titleState: string | null
}

async function loginAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
}

async function collectSample(stage: Page, elapsedMs: number): Promise<PreShowSample> {
  return stage.evaluate((elapsed) => {
    const root = document.querySelector('[data-preshow-status]')
    const video = document.querySelector('video[aria-label="Video 1 do pre-show"]') as HTMLVideoElement | null
    return {
      phase: document.querySelector('main')?.getAttribute('data-phase') ?? null,
      scene: root?.getAttribute('data-preshow-scene') ?? null,
      sampleElapsedMs: elapsed,
      stageElapsedMs: Number(root?.getAttribute('data-preshow-elapsed-ms') ?? -1),
      videoState: root?.getAttribute('data-video-state') ?? null,
      videoCurrentTime: video?.currentTime ?? -1,
      videoPaused: video?.paused ?? true,
      videoCount: document.querySelectorAll('video[aria-label="Video 1 do pre-show"]').length,
      titleState: document.querySelector('[data-title-state]')?.getAttribute('data-title-state') ?? null,
    }
  }, elapsedMs)
}

test('@visual:preshow-4.8 pre-show real completo com video persistente e mesa A/B', async ({ browser }) => {
  test.setTimeout(90_000)

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: { dir: videoDir },
  })
  const consoleErrors: string[] = []
  const failedRequests: string[] = []

  context.on('page', (page) => {
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', (request) => {
      const errorText = request.failure()?.errorText ?? ''
      if (errorText === 'net::ERR_ABORTED') return
      failedRequests.push(`${request.method()} ${request.url()} ${errorText}`)
    })
  })

  const stage = await context.newPage()
  const admin = await context.newPage()
  await stage.goto('/stage')
  await loginAdmin(admin)

  await expect(stage.locator('[data-preshow-scene="waiting_logo"]')).toBeVisible()
  await stage.screenshot({ path: join(screenshotDir, '00-espera-logo-info.png'), fullPage: true })

  await admin.getByRole('button', { name: 'Iniciar pre-show' }).first().click()
  await expect(stage.locator('[data-preshow-status="playing"]')).toBeVisible()

  const samples: PreShowSample[] = []
  let previousElapsed = 0
  for (let second = 0; second <= 42; second += 1) {
    const elapsedMs = second * 1000
    if (elapsedMs > previousElapsed) {
      await stage.waitForTimeout(elapsedMs - previousElapsed)
    }
    previousElapsed = elapsedMs
    samples.push(await collectSample(stage, elapsedMs))
    await stage.screenshot({ path: join(frameDir, `preshow-${String(second).padStart(2, '0')}s.png`), fullPage: true })
  }

  await expect(stage.locator('[data-preshow-scene="button_check"]')).toBeVisible()
  await expect(stage.getByText('Mesa A, pressione o botao de vez.')).toBeVisible()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'intro')

  await admin.getByRole('button', { name: 'Testar mesa' }).click()
  await admin.bringToFront()
  await admin.keyboard.press('z')
  await expect(stage.getByRole('heading', { name: 'Mesa A reconhecida' })).toBeVisible()
  await admin.getByRole('button', { name: 'Pedir proximo sinal' }).click()
  await admin.bringToFront()
  await admin.keyboard.press('m')
  await expect(stage.getByText('Mesa B reconhecida').first()).toBeVisible()
  await expect(stage.getByText('O julgamento pode começar.')).toBeVisible()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'intro')
  await stage.screenshot({ path: join(screenshotDir, 'mesa-ab-reconhecida-pronto.png'), fullPage: true })

  const loadedAssets = await stage.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name))
  const forbiddenQuizAssets = ['barraMoldura.png', '/img/01.png', '/img/03(header).png', '/img/04(brasao).png', '/img/brasao dc.png', 'senhor-destino']
  const forbiddenLoaded = forbiddenQuizAssets.filter((asset) => loadedAssets.some((url) => url.includes(asset)))
  const videoSamples = samples.filter((sample) => sample.stageElapsedMs >= 2_000 && sample.stageElapsedMs <= 8_000)
  const heldSamples = samples.filter((sample) => sample.stageElapsedMs >= 10_000)
  const titleSamples = samples.filter((sample) => sample.scene === 'title_over_video')
  const titleIndex = samples.findIndex((sample) => sample.scene === 'title_over_video')
  const firstTeachingIndex = samples.findIndex((sample) => sample.scene === 'how_to_play_first')
  const scoreTeachingIndex = samples.findIndex((sample) => sample.scene === 'how_to_play_score')
  const scenes = Array.from(new Set(samples.map((sample) => sample.scene)))
  const tableResult = {
    mesaA: await stage.getByText('Mesa A reconhecida').count(),
    mesaB: await stage.getByText('Mesa B reconhecida').count(),
    phaseAfterTableTest: await stage.locator('main').getAttribute('data-phase'),
  }

  writeFileSync(
    metricsPath,
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        samples,
        scenes,
        tableResult,
        loadedAssets,
        forbiddenLoaded,
        consoleErrors,
        failedRequests,
        webSerialLimitation: 'Playwright nao automatiza Web Serial diretamente neste fluxo; teste usou fallback real de teclado z/m sem alterar producao.',
      },
      null,
      2,
    )}\n`,
  )

  expect(videoSamples.at(-1)?.videoCurrentTime ?? 0).toBeGreaterThan((videoSamples[0]?.videoCurrentTime ?? 0) + 3)
  expect(heldSamples.every((sample) => sample.videoState === 'held-final-frame')).toBe(true)
  expect(titleSamples.some((sample) => sample.titleState === 'full')).toBe(true)
  expect(titleIndex).toBeGreaterThan(-1)
  expect(firstTeachingIndex).toBeGreaterThan(titleIndex)
  expect(scoreTeachingIndex).toBeGreaterThan(firstTeachingIndex)
  expect(samples.every((sample) => sample.videoCount === 1 || sample.scene === 'waiting_logo' || sample.scene === 'blackout_to_video')).toBe(true)
  expect(forbiddenLoaded).toEqual([])
  expect(tableResult.phaseAfterTableTest).toBe('intro')
  expect(consoleErrors).toEqual([])
  expect(failedRequests).toEqual([])

  await context.close()
})
