import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = 'docs/sprint-2/harness-7/evidencias'
const screenshotDir = join(evidenceDir, 'screenshots')
const frameDir = join(evidenceDir, 'frames')
const videoDir = join(evidenceDir, 'videos')

mkdirSync(screenshotDir, { recursive: true })
mkdirSync(frameDir, { recursive: true })
mkdirSync(videoDir, { recursive: true })

const teachingScenes = [
  'how_to_play_first',
  'how_to_play_score',
  'how_to_play_wrong',
  'how_to_play_tribunal',
] as const

async function loginAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
}

function writeJson(name: string, data: unknown) {
  writeFileSync(join(evidenceDir, name), `${JSON.stringify(data, null, 2)}\n`)
}

async function readAdminAudit(page: Page) {
  return page.locator('main').evaluate((root) => {
    const grid = document.querySelector('[data-admin-command-grid="true"]')
    const primaryActions = Array.from(document.querySelectorAll('[data-primary-action="true"]')).filter((node) => {
      const element = node as HTMLElement
      const style = window.getComputedStyle(element)
      return style.display !== 'none' && style.visibility !== 'hidden' && !element.hasAttribute('disabled')
    })
    const buttons = Array.from(grid?.querySelectorAll('button') ?? []).map((button) => button.textContent?.replace(/\s+/g, ' ').trim())
    return {
      phase: root.getAttribute('data-phase'),
      layoutVersion: document.querySelector('[data-admin-layout-version]')?.getAttribute('data-admin-layout-version'),
      hasSidebar: Boolean(document.querySelector('[data-admin-sidebar="true"]')),
      technicalOpen: document.querySelector('details[aria-label="Tecnico avancado"]')?.hasAttribute('open') ?? null,
      commandGridText: grid?.textContent ?? '',
      primaryActionCount: primaryActions.length,
      buttons,
      shellBackground: window.getComputedStyle(root).backgroundColor,
    }
  })
}

async function readPreShowSample(stage: Page) {
  return stage.locator('main').evaluate((root) => ({
    phase: root.getAttribute('data-phase'),
    scene: document.querySelector('[data-preshow-scene]')?.getAttribute('data-preshow-scene') ?? null,
    elapsedMs: Number(document.querySelector('[data-preshow-elapsed-ms]')?.getAttribute('data-preshow-elapsed-ms') ?? 0),
    videoState: document.querySelector('[data-video-state]')?.getAttribute('data-video-state') ?? null,
    videoCurrentTime: Number(document.querySelector('video')?.currentTime ?? 0),
  }))
}

test('@visual:harness-7 admin dark radical e pre-show sem pulos', async ({ browser }) => {
  test.setTimeout(260_000)

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: { dir: videoDir },
  })
  const consoleErrors: string[] = []
  const failedRequests: string[] = []
  const admin = await context.newPage()
  const stage = await context.newPage()

  for (const page of [admin, stage]) {
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`))
  }

  await admin.goto('/admin')
  await expect(admin.getByRole('button', { name: /google|apple|facebook/i })).toHaveCount(0)
  await admin.screenshot({ path: join(screenshotDir, 'admin-login-dark.png'), fullPage: true })

  await loginAdmin(admin)
  await stage.goto('/stage')

  await expect(admin.locator('[data-admin-layout-version="harness-7-dark"]')).toBeVisible()
  await expect(admin.locator('[data-admin-sidebar="true"]')).toBeVisible()
  await expect(admin.locator('details[aria-label="Tecnico avancado"]')).not.toHaveAttribute('open', '')
  await expect(admin.locator('[data-admin-command-grid="true"]')).not.toContainText('RESET_HW')
  await expect.poll(async () => (await readAdminAudit(admin)).primaryActionCount).toBe(1)
  await admin.screenshot({ path: join(screenshotDir, 'admin-dark-1366x768.png'), fullPage: true })
  const audit1366 = await readAdminAudit(admin)

  await admin.setViewportSize({ width: 1920, height: 1080 })
  await admin.screenshot({ path: join(screenshotDir, 'admin-dark-1920x1080.png'), fullPage: true })
  await admin.setViewportSize({ width: 1366, height: 768 })

  await admin.getByRole('button', { name: 'Iniciar pre-show', exact: true }).first().click()
  const samples: Array<Awaited<ReturnType<typeof readPreShowSample>> & { sampledAtMs: number }> = []
  const startedAt = Date.now()

  for (let index = 0; index < 64; index += 1) {
    await stage.waitForTimeout(1_000)
    const sample = await readPreShowSample(stage)
    samples.push({ ...sample, sampledAtMs: Date.now() - startedAt })
    await stage.screenshot({ path: join(frameDir, `preshow-frame-${String(index + 1).padStart(2, '0')}.png`) })
    if (sample.scene === 'button_check' || sample.scene === 'ready_to_start') break
  }

  const sceneDurations = Object.fromEntries(
    teachingScenes.map((scene) => {
      const seen = samples.filter((sample) => sample.scene === scene)
      const first = seen[0]
      const last = seen[seen.length - 1]
      return [
        scene,
        {
          samples: seen.length,
          firstElapsedMs: first?.elapsedMs ?? null,
          lastElapsedMs: last?.elapsedMs ?? null,
          observedMs: first && last ? last.elapsedMs - first.elapsedMs : 0,
        },
      ]
    }),
  )

  for (const scene of teachingScenes) {
    const duration = sceneDurations[scene]
    expect(duration.samples, `${scene} apareceu pouco ou foi pulada`).toBeGreaterThanOrEqual(5)
    expect(duration.observedMs, `${scene} durou menos que o minimo visual`).toBeGreaterThanOrEqual(8_000)
  }

  await admin.getByRole('button', { name: 'Testar mesa', exact: true }).click()
  await admin.keyboard.press('z')
  await admin.getByRole('button', { name: 'Pedir proximo sinal', exact: true }).click()
  await admin.keyboard.press('m')
  await stage.screenshot({ path: join(screenshotDir, 'preshow-mesa-ab-reconhecida.png'), fullPage: true })

  await admin.getByRole('button', { name: 'Avancar para pronto', exact: true }).click()
  await admin.getByRole('button', { name: 'Iniciar quiz', exact: true }).first().click()
  await admin.screenshot({ path: join(screenshotDir, 'admin-dark-quiz-pronto.png'), fullPage: true })
  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await admin.getByRole('button', { name: 'Pular countdown' }).click({ timeout: 5_000 }).catch(() => undefined)
  await admin.keyboard.press('z')
  await admin.screenshot({ path: join(screenshotDir, 'admin-dark-decisao.png'), fullPage: true })
  await expect(admin.getByLabel('Operacao').getByRole('button', { name: /CORRETO|Confirmar A\/B|Marcar correto/ })).toBeVisible()

  const auditDecision = await readAdminAudit(admin)
  writeJson('harness-7-admin-preshow.json', {
    generatedAt: new Date().toISOString(),
    audit1366,
    auditDecision,
    samples,
    sceneDurations,
    consoleErrors,
    failedRequests,
  })

  await context.close()

  expect(consoleErrors).toEqual([])
  expect(failedRequests.filter((request) => !request.includes('net::ERR_ABORTED'))).toEqual([])
})
