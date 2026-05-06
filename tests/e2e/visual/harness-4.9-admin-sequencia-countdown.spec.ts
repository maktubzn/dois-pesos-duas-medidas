import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = 'docs/sprint-2/harness-4.9/evidencias'
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

async function readAdminState(page: Page) {
  return page.locator('main').evaluate((root) => {
    const operation = document.querySelector('[aria-label="Operacao"]')
    const visibleButtons = Array.from(operation?.querySelectorAll('button') ?? [])
      .filter((button) => {
        const style = window.getComputedStyle(button)
        return style.display !== 'none' && style.visibility !== 'hidden' && !button.hidden
      })
      .map((button) => button.textContent?.replace(/\s+/g, ' ').trim() ?? '')

    return {
      phase: root.getAttribute('data-phase'),
      feedback: root.getAttribute('data-feedback'),
      feedbackRemainingMs: Number(root.getAttribute('data-feedback-remaining-ms') ?? 0),
      shellBackground: window.getComputedStyle(root).backgroundColor,
      operationButtonCount: visibleButtons.length,
      operationButtons: visibleButtons,
      text: document.body.innerText,
    }
  })
}

async function readStageState(page: Page) {
  return page.locator('main').evaluate((root) => ({
    phase: root.getAttribute('data-phase'),
    text: document.body.innerText,
    timerText: document.querySelector('[aria-label="Tempo de resposta"]')?.textContent ?? '',
    countdownText: document.querySelector('[data-testid="round-countdown"] strong')?.textContent?.trim() ?? null,
  }))
}

function writeJson(name: string, data: unknown) {
  writeFileSync(join(evidenceDir, name), `${JSON.stringify(data, null, 2)}\n`)
}

test('@visual:admin-4.9 fluxo operacional branco, timers reais e reset sem loop', async ({ browser }) => {
  test.setTimeout(95_000)

  const consoleErrors: string[] = []
  const failedRequests: string[] = []
  const flow: unknown[] = []

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: { dir: videoDir },
  })

  const attachDiagnostics = (page: Page) => {
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`))
  }

  const stage = await context.newPage()
  const admin = await context.newPage()
  attachDiagnostics(stage)
  attachDiagnostics(admin)

  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.screenshot({ path: join(screenshotDir, 'admin-branco-operacao-1366x768.png'), fullPage: true })

  const adminState = await readAdminState(admin)
  expect(adminState.shellBackground).toBe('rgb(255, 255, 255)')
  expect(adminState.operationButtonCount).toBeLessThanOrEqual(6)

  await admin.setViewportSize({ width: 1920, height: 1080 })
  await admin.screenshot({ path: join(screenshotDir, 'admin-branco-operacao-1920x1080.png'), fullPage: true })
  await admin.setViewportSize({ width: 1366, height: 768 })

  await admin.getByRole('button', { name: 'Iniciar quiz', exact: true }).first().click()
  await expect(admin.locator('[data-phase="round_prepare"]')).toBeVisible()
  expect((await readAdminState(admin)).operationButtonCount).toBeLessThanOrEqual(2)
  flow.push({ step: 'quiz_ready', admin: await readAdminState(admin), stage: await readStageState(stage), at: Date.now() })

  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()

  const countdownSamples: Array<{ atMs: number; value: string | null }> = []
  const countdownStartedAt = Date.now()
  for (let index = 0; index < 10; index += 1) {
    const stageState = await readStageState(stage)
    if (stageState.countdownText !== null) {
      countdownSamples.push({
        atMs: Date.now() - countdownStartedAt,
        value: stageState.countdownText,
      })
    }
    if ((index === 0 || index === 3 || index === 6) && stageState.countdownText !== null) {
      await stage.screenshot({ path: join(screenshotDir, `countdown-${index}.png`), fullPage: true })
    }
    if (countdownSamples.some((sample) => sample.value === '1') && stageState.countdownText === null) break
    await stage.waitForTimeout(450)
  }

  await expect(stage.getByLabel('Area temporaria da pergunta')).toBeVisible({ timeout: 6_000 })
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19/, { timeout: 4_000 })
  await stage.screenshot({ path: join(screenshotDir, 'pergunta-timer-20s.png'), fullPage: true })
  flow.push({ step: 'buzz_open', countdownSamples, admin: await readAdminState(admin), stage: await readStageState(stage), at: Date.now() })

  await admin.keyboard.press('z')
  await expect(stage.getByText('COM A PALAVRA')).toBeVisible()
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19/, { timeout: 4_000 })
  await stage.screenshot({ path: join(screenshotDir, 'resposta-grupo-a-10s.png'), fullPage: true })
  flow.push({ step: 'team_answering', admin: await readAdminState(admin), stage: await readStageState(stage), at: Date.now() })

  await admin.getByLabel('Operacao').getByRole('button', { name: 'Marcar correto' }).click()
  await expect(stage.getByLabel('Feedback da rodada')).toContainText(/Grupo A marcou ponto/)
  await stage.screenshot({ path: join(screenshotDir, 'feedback-correto-3s.png'), fullPage: true })
  await expect(admin.locator('[data-phase="round_end"]')).toBeVisible({ timeout: 5_000 })
  await expect(admin.getByRole('button', { name: 'Proxima rodada' }).first()).toBeVisible()
  flow.push({ step: 'round_end_manual_wait', admin: await readAdminState(admin), stage: await readStageState(stage), at: Date.now() })

  await admin.getByText('Tecnico / Avancado').click()
  admin.once('dialog', (dialog) => dialog.accept())
  await admin.getByRole('button', { name: 'Enviar RESET_HW' }).click()
  admin.once('dialog', (dialog) => dialog.accept())
  await admin.getByRole('button', { name: 'Enviar RESET_HW' }).click()
  await admin.screenshot({ path: join(screenshotDir, 'reset-hw-tecnico-sem-loop.png'), fullPage: true })

  const resetText = (await readAdminState(admin)).text
  expect(resetText).not.toContain('Fluxo automatico: RESET_HW')
  expect((resetText.match(/RESET_HW ignorado/g) ?? []).length).toBeLessThanOrEqual(1)

  const sequence = countdownSamples.map((sample) => sample.value)
  expect(sequence).toContain('4')
  expect(sequence).toContain('3')
  expect(sequence).toContain('2')
  expect(sequence).toContain('1')

  writeJson('admin-sequencia-countdown.json', {
    generatedAt: new Date().toISOString(),
    flow,
    countdownSamples,
    consoleErrors,
    failedRequests,
  })

  const blockingFailedRequests = failedRequests.filter((request) => !request.includes('net::ERR_ABORTED'))
  expect(consoleErrors).toEqual([])
  expect(blockingFailedRequests).toEqual([])

  await context.close()
})

test('@visual:admin-4.9 tribunal dois passes e espera operador', async ({ browser }) => {
  test.setTimeout(85_000)

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: { dir: videoDir },
  })
  const stage = await context.newPage()
  const admin = await context.newPage()

  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.getByRole('button', { name: 'Iniciar quiz', exact: true }).first().click()
  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await stage.getByTestId('round-countdown').waitFor({ state: 'visible' })
  await admin.getByRole('button', { name: 'Pular countdown' }).click({ timeout: 5_000 }).catch(() => undefined)
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19/, { timeout: 5_000 })

  const timerSamples: Array<{ atMs: number; stage: Awaited<ReturnType<typeof readStageState>> }> = []
  const startedAt = Date.now()
  for (let index = 0; index < 5; index += 1) {
    timerSamples.push({ atMs: Date.now() - startedAt, stage: await readStageState(stage) })
    await stage.waitForTimeout(4_200)
  }

  await expect(admin.locator('[data-phase="tribunal_challenge"]')).toBeVisible({ timeout: 8_000 })
  await expect(stage.getByLabel('Desafio do Tribunal')).toBeVisible()
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/10|9/, { timeout: 4_000 })
  await admin.bringToFront()
  await admin.screenshot({ path: join(screenshotDir, 'admin-tribunal-decisao.png'), fullPage: true })
  await expect(admin.getByLabel('Operacao').getByRole('button', { name: 'Passar' })).toBeEnabled({ timeout: 2_000 })
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Passar' }).click()
  await expect(admin.getByLabel('Controles do Desafio do Tribunal')).toContainText(/Passaram/)
  await expect(admin.getByLabel('Operacao').getByRole('button', { name: 'Passar' })).toBeEnabled({ timeout: 2_000 })
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Passar' }).click()
  await expect(stage.getByLabel('Feedback da rodada')).toContainText(/silêncio|silencio/i)
  await stage.bringToFront()
  await stage.screenshot({ path: join(screenshotDir, 'tribunal-decisao-20s.png'), fullPage: true })
  await stage.screenshot({ path: join(screenshotDir, 'tribunal-dois-passes-silencio.png'), fullPage: true })
  await expect(admin.locator('[data-phase="round_end"]')).toBeVisible({ timeout: 5_000 })

  writeJson('tribunal-dois-passes.json', {
    generatedAt: new Date().toISOString(),
    timerSamples,
    admin: await readAdminState(admin),
    stage: await readStageState(stage),
  })

  await context.close()
})
