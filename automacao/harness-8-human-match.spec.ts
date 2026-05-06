import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

type Group = 'A' | 'B'
type HumanAction = 'correct' | 'wrong' | 'timeout-pass-pass'

const evidenceDir = 'docs/sprint-2/harness-9/evidencias/automacao/harness-8-human-match'
const screenshotDir = join(evidenceDir, 'screenshots')
const reportPath = join(evidenceDir, 'harness-8-human-match.json')

mkdirSync(screenshotDir, { recursive: true })

async function loginAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('[data-admin-sidebar="true"]')).toBeVisible()
}

async function clickFirst(page: Page, name: string | RegExp) {
  await page.getByRole('button', { name }).first().click({ timeout: 10_000 })
}

async function startCleanQuiz(admin: Page, stage: Page) {
  const reset = admin.getByRole('button', { name: 'Reiniciar partida' }).first()
  if (await reset.isVisible().catch(() => false)) {
    admin.once('dialog', (dialog) => dialog.accept())
    await reset.click()
  }
  const startQuiz = admin.getByRole('button', { name: 'Iniciar quiz', exact: true }).first()
  if (await startQuiz.isVisible().catch(() => false)) await startQuiz.click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_prepare', { timeout: 8_000 })
}

async function answerDecision(admin: Page, action: Exclude<HumanAction, 'timeout-pass-pass'>) {
  const confirm = admin.getByRole('button', { name: 'Confirmar A/B' }).first()
  if (await confirm.isVisible().catch(() => false)) {
    const correctText = await admin.getByTestId('correct-option').textContent().catch(() => '')
    const correct = correctText?.match(/Correta:\s*([AB])/i)?.[1]?.toUpperCase() === 'B' ? 'B' : 'A'
    const selected = action === 'correct' ? correct : correct === 'A' ? 'B' : 'A'
    await admin.getByRole('button', { name: selected, exact: true }).first().click()
    await confirm.click()
    return
  }
  await clickFirst(admin, action === 'correct' ? /CORRETO|Marcar correto/i : /ERRADO|Errada/i)
}

async function playRound(admin: Page, stage: Page, group: Group, action: HumanAction, round: number) {
  await clickFirst(admin, 'Iniciar rodada')
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'round_countdown', { timeout: 8_000 })
  await clickFirst(admin, 'Pular countdown')
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'buzz_open', { timeout: 8_000 })

  if (action === 'timeout-pass-pass') {
    await expect(stage.locator('main')).toHaveAttribute('data-phase', 'tribunal_challenge', { timeout: 25_000 })
    await clickFirst(admin, 'Passar')
    await clickFirst(admin, 'Passar')
  } else {
    await admin.getByRole('button', { name: `Mesa ${group}`, exact: true }).first().click()
    await expect(stage.locator('main')).toHaveAttribute('data-phase', 'team_answering', { timeout: 5_000 })
    await answerDecision(admin, action)
    await admin.waitForTimeout(300)
    if ((await stage.locator('main').getAttribute('data-phase')) === 'team_answering') {
      await answerDecision(admin, action)
    }
  }

  await stage.screenshot({ path: join(screenshotDir, `match-round-${round}-${group}-${action}.png`), fullPage: true })
  await expect(stage.locator('main')).toHaveAttribute('data-phase', /round_end|answer_locked|scoring/, { timeout: 8_000 })
  const finishFeedback = admin.getByRole('button', { name: 'Encerrar feedback' }).first()
  if (await finishFeedback.isVisible().catch(() => false)) {
    await expect(finishFeedback).toBeEnabled({ timeout: 5_000 })
    await finishFeedback.click()
  } else {
    await admin.waitForTimeout(3_200)
  }
  await clickFirst(admin, /Proxima rodada|Proximo round manual/)
}

async function runMatch(
  admin: Page,
  stage: Page,
  name: string,
  pattern: Array<{ group: Group; action: HumanAction }>,
) {
  const startedAt = Date.now()
  await startCleanQuiz(admin, stage)
  const phases: string[] = []

  for (let index = 0; index < pattern.length; index += 1) {
    await playRound(admin, stage, pattern[index].group, pattern[index].action, index + 1)
    phases.push((await stage.locator('main').getAttribute('data-phase')) ?? 'unknown')
  }

  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'game_over', { timeout: 8_000 })
  const finalShot = join(screenshotDir, `${name}-final.png`)
  await stage.screenshot({ path: finalShot, fullPage: true })
  const result = await stage.locator('main').evaluate(() => {
    const final = document.querySelector('[aria-label="Fim do jogo"]')
    return {
      phase: document.querySelector('main')?.getAttribute('data-phase') ?? null,
      winner: final?.getAttribute('data-winner') ?? null,
      score: final?.querySelector('[aria-label="Placar final"]')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
    }
  })

  return {
    name,
    durationMs: Date.now() - startedAt,
    phases,
    finalShot,
    ...result,
  }
}

test('harness 8 simula 3 partidas completas como operador humano', async ({ browser }) => {
  test.setTimeout(900_000)
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: { dir: join(evidenceDir, 'videos') },
  })
  const consoleErrors: string[] = []
  const failedRequests: string[] = []
  const admin = await context.newPage()
  const stage = await context.newPage()

  for (const page of [admin, stage]) {
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText ?? ''
      if (failure !== 'net::ERR_ABORTED') failedRequests.push(`${request.method()} ${request.url()} ${failure}`)
    })
  }

  await stage.goto('/stage')
  await loginAdmin(admin)

  await admin.getByRole('button', { name: 'Pre-show', exact: true }).click()
  await clickFirst(admin, 'Testar mesa')
  await expect(stage.locator('[data-preshow-scene="how_to_play_tribunal"]')).toBeVisible()
  await expect(stage.locator('[data-preshow-scene="button_check"]')).toBeVisible({ timeout: 14_000 })
  await admin.keyboard.press('z')
  await clickFirst(admin, 'Pedir proximo sinal')
  await admin.keyboard.press('m')
  await expect(stage.getByRole('heading', { name: 'Mesa B reconhecida' })).toBeVisible({ timeout: 5_000 })

  await admin.getByRole('button', { name: 'Tecnico', exact: true }).click()
  await expect(admin.locator('details[aria-label="Tecnico avancado"]')).toHaveAttribute('open', '')
  await admin.getByRole('button', { name: 'Operacao', exact: true }).click()

  const tenCorrectA = Array.from({ length: 10 }, () => ({ group: 'A' as Group, action: 'correct' as HumanAction }))
  const tenWrongA = Array.from({ length: 10 }, () => ({ group: 'A' as Group, action: 'wrong' as HumanAction }))
  const stress = [
    { group: 'A' as Group, action: 'timeout-pass-pass' as HumanAction },
    ...Array.from({ length: 9 }, (_, index) => ({
      group: index % 2 === 0 ? ('A' as Group) : ('B' as Group),
      action: 'correct' as HumanAction,
    })),
  ]

  const reports = [
    await runMatch(admin, stage, 'partida-1-a-acerta', tenCorrectA),
    await runMatch(admin, stage, 'partida-2-a-erra-b-ganha', tenWrongA),
    await runMatch(admin, stage, 'partida-3-stress-timeout-sidebar', stress),
  ]

  const csvButton = admin.getByRole('button', { name: 'CSV da partida' }).first()
  if (await csvButton.isVisible().catch(() => false)) await csvButton.click()

  writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        inputFallback: 'keyboard z/m via Admin because Web Serial cannot be granted automatically by Playwright',
        reports,
        consoleErrors,
        failedRequests,
      },
      null,
      2,
    )}\n`,
  )

  await context.close()

  expect(reports).toHaveLength(3)
  expect(reports.every((report) => report.phase === 'game_over')).toBe(true)
  expect(consoleErrors).toEqual([])
  expect(failedRequests).toEqual([])
})
