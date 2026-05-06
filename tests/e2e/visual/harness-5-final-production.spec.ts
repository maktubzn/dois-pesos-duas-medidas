import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = 'docs/sprint-2/harness-5-final/evidencias'
const screenshotDir = join(evidenceDir, 'screenshots')
const videoDir = join(evidenceDir, 'videos')

mkdirSync(screenshotDir, { recursive: true })
mkdirSync(videoDir, { recursive: true })

async function loginAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
}

async function openTechnical(page: Page) {
  const advanced = page.locator('details[aria-label="Tecnico avancado"]')
  if (!(await advanced.evaluate((node) => node.hasAttribute('open')).catch(() => false))) {
    await page.getByText('Tecnico / Avancado').click()
  }
}

async function startQuizAndRound(admin: Page, stage: Page) {
  await admin.getByRole('button', { name: 'Iniciar quiz', exact: true }).first().click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_prepare')
}

function writeJson(name: string, data: unknown) {
  writeFileSync(join(evidenceDir, name), `${JSON.stringify(data, null, 2)}\n`)
}

test('@visual:harness-5 Stage realtime, Admin, Tribunal, Final Show e CSV', async ({ browser }) => {
  test.setTimeout(120_000)

  const consoleErrors: string[] = []
  const failedRequests: string[] = []
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: { dir: videoDir },
  })

  const stage = await context.newPage()
  const admin = await context.newPage()
  for (const page of [stage, admin]) {
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`))
  }

  await admin.goto('/admin')
  await admin.screenshot({ path: join(screenshotDir, 'admin-login-1366x768.png'), fullPage: true })
  await loginAdmin(admin)
  await admin.screenshot({ path: join(screenshotDir, 'admin-operacao-desconectado-1366x768.png'), fullPage: true })
  await expect(admin.getByRole('alert')).toContainText('Mesa/Arduino desconectada')

  await stage.goto('/stage')
  await expect(stage.locator('[data-visibility-state="visible"]')).toBeVisible()
  await expect(admin.getByText(/Stage online|Sem heartbeat|Stage atrasada/)).toBeVisible()

  await startQuizAndRound(admin, stage)
  const countdownSamples: Array<{ at: number; value: string | null; clock: string | null; realtimeAge: string | null }> = []
  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()

  const collectCountdownSample = async () => {
    const sample = await stage.locator('main').evaluate((root) => ({
      value: document.querySelector('[data-testid="round-countdown"] strong')?.textContent?.trim() ?? null,
      clock: root.getAttribute('data-stage-clock-ms'),
      realtimeAge: root.getAttribute('data-realtime-age-ms'),
    }))
    countdownSamples.push({ at: Date.now(), ...sample })
  }

  await expect.poll(async () => {
    await collectCountdownSample()
    return countdownSamples.at(-1)?.value ?? null
  }, { intervals: [50, 100, 150, 250, 400, 600], timeout: 3_500 }).toMatch(/[1-4]/)
  await collectCountdownSample()
  await admin.waitForTimeout(850)
  await collectCountdownSample()
  await admin.waitForTimeout(950)
  await collectCountdownSample()
  await admin.waitForTimeout(950)
  await collectCountdownSample()
  await admin.waitForTimeout(950)
  await collectCountdownSample()
  await expect.poll(async () => stage.locator('main').getAttribute('data-phase'), { timeout: 3_000 }).toBe('buzz_open')

  const countdownSequence = countdownSamples.map((item) => item.value).filter(Boolean).join(',')
  expect(countdownSequence).toMatch(/4.*3.*2|3.*2.*1|2.*1/)
  await stage.bringToFront()
  await stage.screenshot({ path: join(screenshotDir, 'stage-countdown-realtime-sem-alternar-foco.png'), fullPage: true })

  await expect(stage.getByLabel('Area temporaria da pergunta')).toBeVisible({ timeout: 7_000 })
  await expect(stage.locator('[data-timer-display]')).toHaveAttribute('data-timer-display', /20|19/)
  await stage.screenshot({ path: join(screenshotDir, 'stage-pergunta-timer-20s.png'), fullPage: true })

  await admin.bringToFront()
  await admin.locator('main').click({ position: { x: 12, y: 12 } })
  await admin.keyboard.press('z')
  await stage.bringToFront()
  await expect(stage.getByText('COM A PALAVRA')).toBeVisible()
  await expect(stage.locator('[data-timer-display]')).toHaveAttribute('data-timer-display', /10|9/)
  await admin.bringToFront()
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Marcar correto' }).click()
  await expect(stage.getByLabel('Feedback da rodada')).toContainText(/Grupo A marcou ponto/)
  await expect(admin.locator('[data-phase="round_end"]')).toBeVisible({ timeout: 5_000 })

  await openTechnical(admin)
  await admin.getByRole('button', { name: 'Proximo round manual', exact: true }).click()
  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await admin.getByRole('button', { name: 'Pular countdown' }).click({ timeout: 5_000 }).catch(() => undefined)
  await stage.bringToFront()
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19/, { timeout: 5_000 })
  await expect.poll(async () => stage.locator('main').getAttribute('data-phase'), { timeout: 32_000 }).toBe('tribunal_challenge')
  await expect(stage.getByLabel('Desafio do Tribunal')).toBeVisible()
  await expect(stage.getByLabel('Desafio do Tribunal').locator('img[src="/img/mesa-tribunal.png"]')).toHaveCount(1)
  await stage.screenshot({ path: join(screenshotDir, 'stage-tribunal-mesa-tribunal.png'), fullPage: true })

  await admin.bringToFront()
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Passar' }).click()
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Passar' }).click()
  await expect(admin.locator('[data-phase="round_end"]')).toBeVisible({ timeout: 5_000 })

  await admin.getByRole('button', { name: 'Proximo round manual', exact: true }).click()
  for (let index = 0; index < 9; index += 1) {
    await admin.getByRole('button', { name: 'Proximo round manual', exact: true }).click()
  }
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'game_over')
  await expect(stage.locator('[data-final-winner-card]')).toBeVisible()
  await stage.screenshot({ path: join(screenshotDir, 'stage-final-show-card-vencedor.png'), fullPage: true })

  const downloadPromise = admin.waitForEvent('download')
  await admin.getByRole('button', { name: 'CSV da partida' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/partida-dois-pesos.*\.csv/)
  const csvPath = join(evidenceDir, 'partida-exemplo.csv')
  await download.saveAs(csvPath)

  writeJson('stage-realtime-sessao-smoke.json', {
    generatedAt: new Date().toISOString(),
    countdownSamples,
    consoleErrors,
    failedRequests,
    stage: await stage.locator('main').evaluate((root) => ({
      phase: root.getAttribute('data-phase'),
      visibility: root.getAttribute('data-visibility-state'),
      realtimeAgeMs: root.getAttribute('data-realtime-age-ms'),
      timerDisplay: document.querySelector('[data-timer-display]')?.getAttribute('data-timer-display') ?? null,
      finalWinnerCard: document.querySelector('[data-final-winner-card]')?.getAttribute('data-final-winner-card') ?? null,
      tribunalImage: document.querySelector('[data-tribunal-image-state]')?.getAttribute('data-tribunal-image-state') ?? null,
    })),
  })

  await context.close()

  expect(consoleErrors).toEqual([])
  expect(failedRequests.filter((request) => !request.includes('net::ERR_ABORTED'))).toEqual([])
})
