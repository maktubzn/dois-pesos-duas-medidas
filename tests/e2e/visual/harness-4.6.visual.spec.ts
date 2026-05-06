import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = 'docs/sprint-2/harness-4.7/evidencias/visual'
const screenshotDir = join(evidenceDir, 'screenshots')
const summaryPath = join(evidenceDir, 'visual-summary.json')

mkdirSync(screenshotDir, { recursive: true })

async function loginAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
}

async function assertNoOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }))
  expect(metrics.scrollWidth, `horizontal overflow at ${metrics.width}x${metrics.height}`).toBeLessThanOrEqual(metrics.width + 2)
  expect(metrics.scrollHeight, `vertical overflow at ${metrics.width}x${metrics.height}`).toBeLessThanOrEqual(metrics.height + 2)
}

function recordSummary(name: string, data: Record<string, unknown>) {
  writeFileSync(summaryPath, `${JSON.stringify({ name, capturedAt: new Date().toISOString(), ...data }, null, 2)}\n`, {
    flag: 'a',
  })
}

test('@visual:preshow pre-show keeps one persistent video base and holds final frame', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, recordVideo: { dir: `${evidenceDir}/videos` } })
  const stage = await context.newPage()
  const admin = await context.newPage()
  await stage.goto('/stage')
  await loginAdmin(admin)

  await admin.getByRole('button', { name: 'Iniciar pre-show' }).first().click()
  await expect(stage.locator('[data-preshow-status="playing"]')).toBeVisible()
  await stage.waitForTimeout(2_200)
  const early = await stage.locator('video[aria-label="Video 1 do pre-show"]').evaluate((video: HTMLVideoElement) => video.currentTime)
  await stage.screenshot({ path: join(screenshotDir, 'visual-47-preshow-video-early.png'), fullPage: true })
  await stage.waitForTimeout(3_200)
  const later = await stage.locator('video[aria-label="Video 1 do pre-show"]').evaluate((video: HTMLVideoElement) => video.currentTime)
  expect(later).toBeGreaterThan(early + 1.5)

  await stage.waitForTimeout(8_000)
  await expect(stage.locator('[data-video-state="held-final-frame"]')).toBeVisible()
  await expect(stage.locator('video[aria-label="Video 1 do pre-show"]')).toHaveCount(1)
  await stage.screenshot({ path: join(screenshotDir, 'visual-47-preshow-held-frame.png'), fullPage: true })

  await expect(stage.locator('[data-preshow-scene^="how_to_play"]')).toBeVisible({ timeout: 8_000 })
  await expect(stage.locator('video[aria-label="Video 1 do pre-show"]')).toHaveCount(1)
  await assertNoOverflow(stage)
  await stage.screenshot({ path: join(screenshotDir, 'visual-47-preshow-overlay-rules.png'), fullPage: true })
  recordSummary('visual:preshow', { checks: ['currentTime advances', 'held final frame', 'video persists into overlays'] })
  await context.close()
})

test('@visual:preshow Stage does not load quiz assets during intro', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const stage = await context.newPage()
  const admin = await context.newPage()
  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.getByRole('button', { name: 'Iniciar pre-show' }).first().click()
  await stage.waitForTimeout(5_000)

  const loaded = await stage.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  )
  const forbidden = ['barraMoldura.png', '/img/01.png', '/img/03(header).png', '/img/04(brasao).png', '/img/brasao dc.png', 'senhor-destino']
  for (const asset of forbidden) {
    expect(loaded.some((url) => url.includes(asset)), `asset loaded during intro: ${asset}`).toBe(false)
  }
  recordSummary('visual:preshow-assets', { forbidden })
  await context.close()
})

test('@visual:admin operation mode is not a cockpit at 1366x768', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, recordVideo: { dir: `${evidenceDir}/videos` } })
  const page = await context.newPage()
  await loginAdmin(page)
  await expect(page.getByLabel('Operacao')).toBeVisible()
  await expect(page.getByLabel('Tecnico avancado')).toBeVisible()

  const visibleButtons = await page.locator('button:visible').count()
  expect(visibleButtons).toBeLessThanOrEqual(18)
  await assertNoOverflow(page)
  await page.screenshot({ path: join(screenshotDir, 'visual-47-admin-operacao-1366x768.png'), fullPage: true })
  recordSummary('visual:admin', { viewport: '1366x768', visibleButtons })
  await context.close()
})

test('@visual:timers answer timer falls by real elapsed time without debug expiry', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, recordVideo: { dir: `${evidenceDir}/videos` } })
  const stage = await context.newPage()
  const admin = await context.newPage()
  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.getByRole('button', { name: 'Iniciar quiz' }).click()
  await admin.getByRole('button', { name: 'Iniciar rodada manual' }).click()
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19/, { timeout: 5_000 })
  const startText = await stage.getByLabel('Tempo de resposta').textContent()
  await stage.waitForTimeout(3_200)
  const endText = await stage.getByLabel('Tempo de resposta').textContent()
  const startValue = Number(startText?.match(/\d+/)?.[0] ?? 0)
  const endValue = Number(endText?.match(/\d+/)?.[0] ?? 0)
  expect(endValue).toBeLessThanOrEqual(startValue - 2)
  expect(endValue).toBeGreaterThanOrEqual(startValue - 5)
  await stage.screenshot({ path: join(screenshotDir, 'visual-47-real-timer-3s.png'), fullPage: true })
  recordSummary('visual:timers', { startValue, endValue })
  await context.close()
})

test('@visual:final-show captures entrance peak and rest without audio gate', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: `${evidenceDir}/videos` } })
  const stage = await context.newPage()
  const admin = await context.newPage()
  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.getByRole('button', { name: 'Iniciar quiz' }).click()

  await admin.getByRole('button', { name: 'Iniciar rodada manual' }).click()
  await admin.keyboard.press('z')
  await admin.getByRole('button', { name: 'Marcar correto' }).click()
  for (let index = 0; index < 10; index += 1) {
    await admin.getByRole('button', { name: 'Proximo round manual' }).click()
  }

  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'game_over')
  await expect(stage.getByLabel('Fim do jogo')).toContainText('Grupo A vence')
  await expect(stage.getByRole('button', { name: /audio da tv/i })).toHaveCount(0)
  await stage.screenshot({ path: join(screenshotDir, 'visual-47-final-entrance.png'), fullPage: true })
  await stage.waitForTimeout(1_300)
  await stage.screenshot({ path: join(screenshotDir, 'visual-47-final-peak.png'), fullPage: true })
  await stage.waitForTimeout(1_300)
  await expect(stage.getByLabel('Placar final')).toContainText('Grupo A')
  await stage.screenshot({ path: join(screenshotDir, 'visual-47-final-rest.png'), fullPage: true })
  recordSummary('visual:final-show', { checks: ['entrance', 'peak', 'rest', 'audio gate hidden'] })
  await context.close()
})
