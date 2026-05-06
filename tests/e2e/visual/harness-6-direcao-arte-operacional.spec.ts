import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = 'docs/sprint-2/harness-6/evidencias'
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

function writeJson(name: string, data: unknown) {
  writeFileSync(join(evidenceDir, name), `${JSON.stringify(data, null, 2)}\n`)
}

async function readVisualState(admin: Page, stage: Page) {
  return {
    admin: await admin.locator('main').evaluate((root) => {
      const technical = document.querySelector('details[aria-label="Tecnico avancado"]')
      const operationGrid = document.querySelector('[data-admin-command-grid="true"]')
      const operationButtons = Array.from(operationGrid?.querySelectorAll('button') ?? [])
        .filter((button) => {
          const style = window.getComputedStyle(button)
          return style.display !== 'none' && style.visibility !== 'hidden' && !button.hidden
        })
        .map((button) => button.textContent?.replace(/\s+/g, ' ').trim())

      return {
        phase: root.getAttribute('data-phase'),
        hasSidebar: Boolean(document.querySelector('[data-admin-sidebar="true"]')),
        technicalOpen: technical?.hasAttribute('open') ?? null,
        commandGridText: operationGrid?.textContent ?? '',
        operationButtons,
      }
    }),
    stage: await stage.locator('main').evaluate((root) => ({
      phase: root.getAttribute('data-phase'),
      winner: root.getAttribute('data-winner'),
      tribunalImage: document.querySelector('[data-tribunal-image-state]')?.getAttribute('data-tribunal-image-state') ?? null,
      timerDisplay: document.querySelector('[data-timer-display]')?.getAttribute('data-timer-display') ?? null,
      slotText: document.querySelector('[data-group="A"]')?.textContent ?? '',
      finalWinnerCard: document.querySelector('[data-final-winner-card]')?.getAttribute('data-final-winner-card') ?? null,
    })),
  }
}

test('@visual:harness-6 direcao de arte operacional', async ({ browser }) => {
  test.setTimeout(135_000)

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
  await admin.screenshot({ path: join(screenshotDir, 'admin-login.png'), fullPage: true })
  await expect(admin.getByRole('button', { name: /google|apple|facebook/i })).toHaveCount(0)
  await loginAdmin(admin)
  await stage.goto('/stage')

  await expect(admin.locator('[data-admin-sidebar="true"]')).toBeVisible()
  await expect(admin.locator('details[aria-label="Tecnico avancado"]')).not.toHaveAttribute('open', '')
  await expect(admin.locator('[data-admin-command-grid="true"]')).not.toContainText('RESET_HW')
  await admin.screenshot({ path: join(screenshotDir, 'admin-operacao-1366x768.png'), fullPage: true })

  await admin.setViewportSize({ width: 1920, height: 1080 })
  await admin.screenshot({ path: join(screenshotDir, 'admin-operacao-1920x1080.png'), fullPage: true })
  await admin.setViewportSize({ width: 1366, height: 768 })

  await admin.getByRole('button', { name: 'Iniciar quiz', exact: true }).first().click()
  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await admin.getByRole('button', { name: 'Pular countdown' }).click({ timeout: 5_000 }).catch(() => undefined)
  await expect(stage.getByLabel('Area temporaria da pergunta')).toBeVisible({ timeout: 6_000 })
  await admin.keyboard.press('z')
  await expect(stage.getByText('COM A PALAVRA')).toBeVisible()
  await admin.screenshot({ path: join(screenshotDir, 'admin-decisao-correto-errado.png'), fullPage: true })
  await stage.screenshot({ path: join(screenshotDir, 'stage-cards-grupos-slots.png'), fullPage: true })
  await expect(stage.locator('[data-group="A"]')).toContainText('JOGADOR')
  await expect(stage.locator('[data-group="A"]')).not.toContainText('Jogador 1')
  const cardsVisualState = await readVisualState(admin, stage)

  const operation = admin.getByLabel('Operacao')
  const markCorrect = operation.getByRole('button', { name: 'Marcar correto' })
  if (await markCorrect.count()) {
    await markCorrect.click()
  } else {
    const choiceA = operation.getByRole('button', { name: 'A', exact: true })
    if (await choiceA.count()) {
      await choiceA.click()
    }
    await operation.getByRole('button', { name: 'Confirmar A/B' }).click()
  }
  await expect(admin.locator('[data-phase="round_end"]')).toBeVisible({ timeout: 8_000 })

  await admin.getByText('Tecnico / Avancado').click()
  await admin.getByRole('button', { name: 'Proximo round manual', exact: true }).click()
  await admin.getByText('Tecnico / Avancado').click()
  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await admin.getByRole('button', { name: 'Pular countdown' }).click({ timeout: 5_000 }).catch(() => undefined)
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19/, { timeout: 5_000 })
  await expect.poll(async () => stage.locator('main').getAttribute('data-phase'), { timeout: 26_000 }).toBe('tribunal_challenge')
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19|18/, { timeout: 5_000 })
  await expect(stage.getByRole('dialog', { name: 'Desafio do Tribunal' })).toBeVisible()
  await expect(stage.getByRole('dialog', { name: 'Desafio do Tribunal' })).toContainText(/Tempo|segundos/)
  await admin.screenshot({ path: join(screenshotDir, 'admin-tribunal-20s.png'), fullPage: true })
  await stage.screenshot({ path: join(screenshotDir, 'stage-tribunal-20s-mesa.png'), fullPage: true })

  await admin.getByLabel('Operacao').getByRole('button', { name: 'Passar' }).click()
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Passar' }).click()
  await expect(admin.locator('[data-phase="round_end"]')).toBeVisible({ timeout: 5_000 })
  await admin.getByText('Tecnico / Avancado').click()
  for (let index = 0; index < 9; index += 1) {
    await admin.getByRole('button', { name: 'Proximo round manual', exact: true }).click()
  }
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'game_over')
  await expect(stage.locator('[data-final-winner-card]')).toBeVisible()
  await stage.screenshot({ path: join(screenshotDir, 'stage-final-show-vencedor.png'), fullPage: true })
  const finalVisualState = await readVisualState(admin, stage)

  admin.once('dialog', (dialog) => dialog.accept())
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Reiniciar partida' }).click()
  await admin.getByRole('button', { name: 'Iniciar pre-show', exact: true }).first().click()
  await expect(stage.locator('[data-preshow-scene^="how_to_play"]')).toBeVisible({ timeout: 22_000 })
  await stage.screenshot({ path: join(screenshotDir, 'stage-preshow-ensino-lento.png'), fullPage: true })

  const technicalDrawer = admin.locator('details[aria-label="Tecnico avancado"]')
  if (await technicalDrawer.evaluate((node) => node.hasAttribute('open'))) {
    await admin.getByText('Tecnico / Avancado').click()
  }
  const visualState = await readVisualState(admin, stage)
  expect(visualState.admin.hasSidebar).toBe(true)
  expect(visualState.admin.technicalOpen).toBe(false)
  expect(visualState.admin.commandGridText).not.toContain('RESET_HW')
  expect(cardsVisualState.stage.slotText).toContain('JOGADOR')
  expect(cardsVisualState.stage.slotText).not.toContain('Jogador 1')
  expect(finalVisualState.stage.tribunalImage).toBe('public-img')
  expect(finalVisualState.stage.finalWinnerCard).toBeTruthy()

  writeJson('validacao-visual-operacional.json', {
    generatedAt: new Date().toISOString(),
    visualState,
    cardsVisualState,
    finalVisualState,
    consoleErrors,
    failedRequests,
  })

  await context.close()

  expect(consoleErrors).toEqual([])
  expect(failedRequests.filter((request) => !request.includes('net::ERR_ABORTED'))).toEqual([])
})
