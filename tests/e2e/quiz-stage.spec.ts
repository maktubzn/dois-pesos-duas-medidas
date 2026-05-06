import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const screenshotDir = 'docs/sprint-2/harness-3.4/screenshots'

mkdirSync(screenshotDir, { recursive: true })

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1366, height: 768 },
  { width: 900, height: 900 },
]

async function loginAdmin(page: import('@playwright/test').Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
}

async function openTechnical(page: Page) {
  const advanced = page.locator('details[aria-label="Tecnico avancado"]')
  const isOpen = await advanced.evaluate((node) => node.hasAttribute('open')).catch(() => false)
  if (!isOpen) {
    await page.getByText('Tecnico / Avancado').click()
  }
}

async function startRoundAndReveal(page: Page) {
  await page.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await page.getByLabel('Operacao').getByRole('button', { name: 'Pular countdown' }).click({ timeout: 3_000 }).catch(() => undefined)
  await expect(page.locator('[data-phase="buzz_open"]')).toBeVisible({ timeout: 8_000 })
}

async function forceTechnicalNextRounds(page: Page, count: number) {
  await openTechnical(page)
  for (let index = 0; index < count; index += 1) {
    await page.getByRole('button', { name: /Proxima rodada|Proximo round manual/ }).first().click({ timeout: 8_000 })
  }
}

for (const viewport of viewports) {
  test(`stage has no overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/stage')
    await page.evaluate(() => window.localStorage.clear())

    const metrics = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth <= window.innerWidth,
      overflowY: document.documentElement.scrollHeight <= window.innerHeight,
      hasVideo: Boolean(document.querySelector('video')),
      videoLoops: document.querySelector('video')?.loop ?? true,
      hasPreShow: Boolean(document.querySelector('[data-preshow-scene="waiting_logo"]')),
      hasGavelDom: Boolean(document.querySelector('[class*="gavel"], [data-testid*="gavel"]')),
      hasArduinoPanel: document.body.textContent?.includes('Conectar Arduino') ?? false,
      failedAssets: performance
        .getEntriesByType('resource')
        .filter((entry) => entry.name.includes('/img/') && entry.duration === 0)
        .map((entry) => entry.name),
      scoreText: Array.from(document.querySelectorAll('[aria-label="Placar dos grupos"] span')).map((node) => node.textContent),
    }))

    expect(metrics.overflowX).toBe(true)
    expect(metrics.overflowY).toBe(true)
    expect(metrics.hasPreShow).toBe(true)
    expect(metrics.hasVideo).toBe(false)
    expect(metrics.hasGavelDom).toBe(false)
    expect(metrics.hasArduinoPanel).toBe(false)
    expect(metrics.failedAssets).toEqual([])
    expect(metrics.scoreText.join(' ')).not.toContain('PTS')

    await page.screenshot({
      path: `${screenshotDir}/stage-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
    })
  })
}

test('admin login protects the control table', async ({ page }) => {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('wrong')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Credencial invalida')).toBeVisible()

  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
})

test('admin interface uses botao de vez language', async ({ page }) => {
  await loginAdmin(page)

  await expect(page.getByLabel('Operacao')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Iniciar quiz', exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Iniciar quiz', exact: true }).first().click()
  await expect(page.getByRole('button', { name: 'Iniciar rodada', exact: true }).first()).toBeVisible()
  await page.getByText('Tecnico / Avancado').click()
  await expect(page.getByText('Grupo com a vez')).toBeVisible()
  await expect(page.locator('body')).not.toContainText(/buzz/i)
})

test('harness 4.3 admin controls public audio on the Stage', async ({ page }) => {
  await loginAdmin(page)

  await expect(page.getByRole('link', { name: 'Abrir Stage' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mudo' })).toBeVisible()
  const masterVolume = page.getByLabel('Volume master').first()
  await expect(masterVolume).toBeVisible()

  await page.getByRole('button', { name: 'Mudo' }).click()
  await expect(page.getByRole('button', { name: 'Com som' })).toBeVisible()
  await masterVolume.fill('65')
  await expect(masterVolume).toHaveValue('65')
  await expect(page.getByRole('button', { name: /Iniciar pre-show|Pausar pre-show|Continuar pre-show/ })).toHaveCount(1)
  await page.getByText('Tecnico / Avancado').click()
  await expect(page.getByRole('button', { name: 'Conectar mesa' })).toHaveCount(1)
})

test('stage exposes TV audio unlock and does not play public audio before it', async ({ page }) => {
  await page.goto('/stage')

  await expect(page.getByRole('button', { name: 'Ativar audio da TV' })).toBeVisible()
  await page.evaluate(async () => {
    window.QuizStageDebug?.startNewQuiz()
    await window.QuizStageDebug?.openAnswerWindow()
  })
  expect(await page.evaluate(() => window.StageAudioDebug?.getState().unlocked)).toBe(false)
  expect(await page.evaluate(() => window.StageAudioDebug?.getState().loopIds)).toEqual([])

  await page.getByRole('button', { name: 'Ativar audio da TV' }).click()
  await expect(page.getByRole('button', { name: 'Audio da TV ativo' })).toBeVisible()
  expect(await page.evaluate(() => window.StageAudioDebug?.getState().unlocked)).toBe(true)
})

test('harness 4.4 normal scoring and tribunal challenge on Stage', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/stage')

  await page.evaluate(async () => {
    window.QuizStageDebug?.startNewQuiz()
    await window.QuizStageDebug?.openAnswerWindow()
    window.QuizStageDebug?.lockGroupA()
    window.QuizStageDebug?.markCorrect()
  })
  await expect(page.getByLabel('Placar dos grupos')).toContainText('PTS 10')
  await expect(page.getByLabel('Feedback da rodada')).toContainText('Grupo A marcou ponto')

  await page.evaluate(async () => {
    window.QuizStageDebug?.nextRound()
    await window.QuizStageDebug?.openAnswerWindow()
    window.QuizStageDebug?.lockGroupA()
    window.QuizStageDebug?.markWrong()
  })
  await expect(page.getByLabel('Feedback da rodada')).toContainText('Grupo B recebeu +5')

  await page.evaluate(async () => {
    window.QuizStageDebug?.nextRound()
    await window.QuizStageDebug?.openAnswerWindow()
    window.QuizStageDebug?.expireTimer()
  })
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'tribunal_challenge')
  await expect(page.getByLabel('Desafio do Tribunal')).toContainText('DESAFIO DO TRIBUNAL')
  await expect(page.getByLabel('Desafio do Tribunal')).toContainText(/Grupo [AB]/)

  await page.evaluate(() => {
    window.QuizStageDebug?.tribunalPass()
    window.QuizStageDebug?.tribunalPass()
  })
  await expect(page.getByLabel('Feedback da rodada')).toContainText('O tribunal registra silêncio nos autos.')
})

test('harness 4.4 tribunal music is active only during challenge', async ({ page }) => {
  await page.goto('/stage')
  await page.getByRole('button', { name: 'Ativar audio da TV' }).click()
  await expect(page.getByRole('button', { name: 'Audio da TV ativo' })).toBeVisible()

  await page.evaluate(async () => {
    window.QuizStageDebug?.startNewQuiz()
    await window.QuizStageDebug?.openAnswerWindow()
    window.QuizStageDebug?.expireTimer()
  })
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'tribunal_challenge')
  await expect.poll(() => page.evaluate(() => window.StageAudioDebug?.getState().loopIds ?? [])).toContain('desafio_tribunal_theme')

  await page.evaluate(() => {
    window.QuizStageDebug?.tribunalRisk()
    window.QuizStageDebug?.resolveTribunalCorrect()
  })
  await expect.poll(() => page.evaluate(() => window.StageAudioDebug?.getState().loopIds ?? [])).not.toContain('desafio_tribunal_theme')
})

test('harness 4.5 Final Show exposes winner controls without resetting history by accident', async ({ browser }) => {
  test.setTimeout(45_000)

  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const stage = await context.newPage()
  const admin = await context.newPage()

  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.getByRole('button', { name: 'Iniciar quiz' }).first().click()
  await startRoundAndReveal(admin)
  await admin.bringToFront()
  await admin.bringToFront()
  await admin.keyboard.press('z')
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Marcar correto' }).click()

  await forceTechnicalNextRounds(admin, 10)

  const finalShow = stage.getByLabel('Fim do jogo')
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'game_over')
  await expect(finalShow).toBeVisible()
  await expect(finalShow).toContainText('Final Show')
  await expect(finalShow).toContainText('Grupo A vence')
  await expect(finalShow).toContainText('Placar final: 10 x 0')
  await expect(finalShow).toContainText('Diferenca: 10 pontos')
  await expect(finalShow).toContainText('Veredito registrado')
  await expect(finalShow).toHaveAttribute('data-winner', 'A')

  await openTechnical(admin)
  const finalPanel = admin.getByLabel('Controles do Final Show')
  await expect(finalPanel).toBeVisible()
  await expect(finalPanel).toContainText('Grupo A')
  await expect(finalPanel).toContainText('10 x 0')
  await expect(admin.getByLabel('Estado operacional').getByText('Proxima acao').locator('..')).toContainText('Abrir ou repetir Final Show')

  admin.once('dialog', (dialog) => dialog.accept())
  await finalPanel.getByRole('button', { name: 'Encerrar e voltar para espera' }).click()
  await expect(finalShow).toBeHidden()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'game_over')

  await finalPanel.getByRole('button', { name: 'Abrir Final Show' }).click()
  await expect(finalShow).toBeVisible()
  await finalPanel.getByRole('button', { name: 'Repetir Final Show' }).click()
  await expect(finalShow).toHaveAttribute('data-final-show-status', /open|replaying/)

  const finalOverflow = await stage.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth <= window.innerWidth,
    overflowY: document.documentElement.scrollHeight <= window.innerHeight,
  }))
  expect(finalOverflow).toEqual({ overflowX: true, overflowY: true })

  await stage.setViewportSize({ width: 1920, height: 1080 })
  const wideOverflow = await stage.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth <= window.innerWidth,
    overflowY: document.documentElement.scrollHeight <= window.innerHeight,
  }))
  expect(wideOverflow).toEqual({ overflowX: true, overflowY: true })

  admin.once('dialog', (dialog) => dialog.accept())
  await finalPanel.getByRole('button', { name: 'Reiniciar partida' }).click()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'intro')

  await context.close()
})

test('admin help modal opens, searches and closes with Esc', async ({ page }) => {
  await loginAdmin(page)

  const helpButton = page.getByRole('button', { name: 'Ajuda' })
  await helpButton.click()
  const dialog = page.getByRole('dialog', { name: 'Ajuda' })
  await expect(dialog).toBeVisible()
  await page.getByPlaceholder('Audio, mesa, CSV...').fill('CSV')
  await expect(dialog).toContainText('Historico/CSV')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(helpButton).toBeFocused()
})

test('stage interface avoids the old public term', async ({ page }) => {
  await page.goto('/stage')

  await expect(page.locator('body')).not.toContainText(/buzz/i)
})

test('stage background director uses the official harness backgrounds', async ({ page }) => {
  await page.goto('/stage')

  const idleMetrics = await page.evaluate(() => ({
    hasWaitingLogo: Boolean(document.querySelector('img[src="/img-optimized/logoinfo.webp"]')),
    hasBackgroundTwo: Boolean(document.querySelector('img[src="/img/01-background.png"]')),
  }))

  expect(idleMetrics.hasWaitingLogo).toBe(true)
  expect(idleMetrics.hasBackgroundTwo).toBe(false)

  await page.evaluate(() => window.QuizStageDebug?.startNewQuiz())
  await expect(page.locator('[data-background-mode="game"]')).toBeVisible()
  await page.waitForFunction(() => {
    const background = document.querySelector('img[src="/img/01-background.png"]') as HTMLElement | null
    if (!background) return false
    return Number.parseFloat(getComputedStyle(background).opacity) > 0.9
  })

  const gameOpacity = await page.evaluate(() =>
    Number.parseFloat(
      getComputedStyle(document.querySelector('img[src="/img/01-background.png"]') as HTMLElement).opacity,
    ),
  )

  expect(gameOpacity).toBeGreaterThan(0.9)
})

test('harness 3 captures round timer and feedback states', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/stage')

  await page.evaluate(() => window.QuizStageDebug?.startNewQuiz())
  await expect(page.getByLabel('Estado da rodada')).toContainText('Rodada 1/10')
  await page.screenshot({ path: `${screenshotDir}/round_prepare-1366x768.png`, fullPage: true })

  await page.evaluate(() => window.QuizStageDebug?.showQuestionCard())
  await expect(page.getByLabel('Area temporaria da pergunta')).toBeVisible()
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${screenshotDir}/question_reveal-1366x768.png`, fullPage: true })

  await page.evaluate(async () => {
    await window.QuizStageDebug?.openAnswerWindow()
  })
  await expect(page.getByLabel('Tempo de resposta')).toContainText(/20|19/)
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${screenshotDir}/timer_running-1366x768.png`, fullPage: true })

  await page.evaluate(() => window.QuizStageDebug?.lockGroupA())
  await expect(page.getByText('COM A PALAVRA')).toBeVisible()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${screenshotDir}/turn_locked_A-1366x768.png`, fullPage: true })

  await page.evaluate(() => window.QuizStageDebug?.markCorrect())
  await expect(page.getByLabel('Feedback da rodada')).toContainText(/Grupo A marcou ponto/)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${screenshotDir}/feedback_correct-1366x768.png`, fullPage: true })

  await page.evaluate(() => window.QuizStageDebug?.nextRound())
  await page.evaluate(async () => {
    await window.QuizStageDebug?.openAnswerWindow()
  })
  await page.evaluate(() => window.QuizStageDebug?.expireTimer())
  await expect(page.getByLabel('Feedback da rodada')).toContainText('Tempo esgotado')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${screenshotDir}/time_up-1366x768.png`, fullPage: true })
})

test('admin broadcasts game state to the stage', async ({ browser }) => {
  test.setTimeout(90_000)
  const context = await browser.newContext()
  const stage = await context.newPage()
  const admin = await context.newPage()

  await stage.goto('/stage')
  await loginAdmin(admin)

  await expect(stage.locator('[data-preshow-scene="waiting_logo"]')).toBeVisible()
  await expect(stage.locator('img[src="/img-optimized/logoinfo.webp"]')).toBeVisible()

  await admin.getByRole('button', { name: 'Iniciar pre-show', exact: true }).click()
  await expect(stage.locator('[data-preshow-status="playing"]')).toBeVisible()
  await expect(stage.locator('[data-preshow-scene="cinematic_video"], [data-preshow-scene="title_over_video"]')).toBeVisible({
    timeout: 8_000,
  })
  await expect(stage.locator('video source[src="/img-optimized/video1.mp4"]')).toHaveCount(1)
  await expect(stage.getByText('DOIS PESOS,')).toBeVisible({ timeout: 16_000 })
  await expect(stage.getByText('DUAS MEDIDAS')).toBeVisible()
  await admin.getByRole('button', { name: 'Pausar pre-show' }).click()
  await expect(stage.locator('[data-preshow-status="paused"]')).toBeVisible()
  await admin.getByRole('button', { name: 'Continuar pre-show' }).click()
  await expect(stage.locator('[data-preshow-status="playing"]')).toBeVisible()
  await admin.getByRole('button', { name: 'Testar mesa' }).click()
  await expect(stage.locator('[data-preshow-scene="how_to_play_tribunal"]')).toBeVisible()
  await expect(stage.getByText('Antes do julgamento, teste das mesas.')).toBeVisible()
  await expect(stage.locator('[data-preshow-scene="button_check"]')).toBeVisible({ timeout: 14_000 })
  await expect(stage.getByText('Mesa A, pressione o botao de vez.')).toBeVisible()
  await admin.getByText('Tecnico / Avancado').click()
  await admin.getByRole('button', { name: 'Reiniciar pre-show' }).click()
  await expect(stage.locator('[data-preshow-status="playing"]')).toBeVisible()
  await admin.getByRole('button', { name: 'Reiniciar Como funciona' }).click()
  await expect(stage.locator('[data-preshow-scene="how_to_play_first"]')).toBeVisible()
  await admin.getByLabel('Operacao').getByRole('button', { name: 'Avancar para pronto' }).click()
  await expect(stage.locator('[data-preshow-status="finished"]')).toBeVisible()
  await expect(stage.locator('[data-preshow-scene="ready_to_start"]')).toBeVisible()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'intro')

  await admin.getByLabel('Operacao').getByRole('button', { name: 'Iniciar quiz' }).click()
  await expect(stage.getByLabel('Estado da rodada')).toContainText('Rodada 1/10')

  await startRoundAndReveal(admin)
  await expect(stage.getByLabel('Area temporaria da pergunta')).toBeVisible()
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19/, { timeout: 5_000 })

  await admin.bringToFront()
  await admin.bringToFront()
  await admin.getByRole('button', { name: 'Mesa A', exact: true }).first().click()
  await expect(stage.getByText('COM A PALAVRA')).toBeVisible()

  await admin.getByLabel('Operacao').getByRole('button', { name: /CORRETO|Marcar correto/i }).first().click()
  await expect(admin.locator('[data-feedback="correct"]')).toBeVisible()
  await expect(stage.getByLabel('Feedback da rodada')).toContainText(/Grupo A marcou ponto/)
  await expect(stage.getByLabel('Placar dos grupos')).toContainText('PTS 10')

  await forceTechnicalNextRounds(admin, 10)

  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'game_over')
  await expect(stage.getByLabel('Fim do jogo')).toBeVisible()
  await expect(stage.getByLabel('Fim do jogo')).toContainText('Final Show')
  await expect(stage.getByLabel('Fim do jogo')).toContainText('Grupo A vence')
  await stage.waitForTimeout(500)
  await stage.screenshot({ path: `${screenshotDir}/game_over-1366x768.png`, fullPage: true })
  await context.close()
})

test('harness 3.2 round sequence controls countdown and waits for operator next round', async ({ browser }) => {
  test.setTimeout(60_000)
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const stage = await context.newPage()
  const admin = await context.newPage()

  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.getByRole('button', { name: 'Iniciar quiz' }).click()
  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()

  const countdown = stage.getByTestId('round-countdown')
  await expect(countdown).toBeVisible()
  await expect(countdown).toContainText('RODADA 01')
  await admin.keyboard.press('z')
  await expect(stage.getByText('COM A PALAVRA')).toHaveCount(0)
  await admin.getByRole('button', { name: 'Pausar sequencia' }).click()
  await expect(admin.getByRole('button', { name: 'Continuar sequencia' })).toBeVisible()
  const frozenCountdown = await countdown.textContent()
  await stage.setViewportSize({ width: 1920, height: 1080 })
  await stage.screenshot({ path: `${screenshotDir}/countdown-round-1920x1080.png`, fullPage: true })
  await stage.setViewportSize({ width: 1366, height: 768 })
  await stage.screenshot({ path: `${screenshotDir}/countdown-round-1366x768.png`, fullPage: true })

  await stage.waitForTimeout(500)
  await expect(countdown).toHaveText(frozenCountdown ?? '')

  await admin.getByRole('button', { name: 'Continuar sequencia' }).click()
  await admin.getByRole('button', { name: 'Pular countdown' }).click({ timeout: 3_000 }).catch(() => undefined)
  await expect(stage.getByLabel('Area temporaria da pergunta')).toBeVisible()
  await expect(stage.getByLabel('Tempo de resposta')).toContainText(/20|19/, { timeout: 4_000 })
  await stage.screenshot({ path: `${screenshotDir}/auto-question-reveal-after-countdown.png`, fullPage: true })

  await admin.getByRole('button', { name: 'Mesa A', exact: true }).first().click()
  await expect(stage.getByText('COM A PALAVRA')).toBeVisible()
  await expect(admin.getByText('Grupo com a vez').locator('..')).toContainText('A')
  await admin.getByLabel('Operacao').getByRole('button', { name: /CORRETO|Marcar correto/i }).first().click()
  await expect(stage.getByLabel('Feedback da rodada')).toContainText(/Grupo A marcou ponto/)
  await admin.bringToFront()
  await expect(admin.locator('[data-phase="round_end"]')).toBeVisible({ timeout: 5_000 })
  await expect(admin.getByRole('button', { name: 'Proxima rodada' }).first()).toBeVisible()
  await expect(countdown).toHaveCount(0)
  await admin.getByRole('button', { name: 'Proxima rodada' }).first().click()
  await expect(admin.getByLabel('Operacao').getByText('Rodada preparada')).toBeVisible()
  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  await expect(countdown).toBeVisible({ timeout: 4_000 })
  await expect(countdown).toContainText('RODADA 02')

  await context.close()
})

test('harness 3.2 Veredito Final also receives automatic countdown', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const stage = await context.newPage()
  const admin = await context.newPage()

  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.getByRole('button', { name: 'Iniciar quiz' }).click()

  await forceTechnicalNextRounds(admin, 10)

  await admin.getByRole('button', { name: 'Iniciar rodada', exact: true }).first().click()
  const countdown = stage.getByTestId('round-countdown')
  await expect(countdown).toBeVisible()
  await expect(countdown).toContainText('VEREDITO FINAL')
  await stage.screenshot({ path: `${screenshotDir}/countdown-veredito-final-1920x1080.png`, fullPage: true })

  await context.close()
})

test('pre-show 2.1 screenshots and ready state do not auto-start quiz', async ({ browser }) => {
  test.setTimeout(90_000)
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const stage = await context.newPage()
  const admin = await context.newPage()

  await stage.goto('/stage')
  await loginAdmin(admin)
  await admin.screenshot({ path: `${screenshotDir}/admin-preshow-controls.png`, fullPage: true })
  await expect(stage.locator('[data-preshow-scene="waiting_logo"]')).toBeVisible()
  await stage.screenshot({ path: `${screenshotDir}/logo-waiting-1920x1080.png`, fullPage: true })

  await admin.getByRole('button', { name: 'Iniciar pre-show', exact: true }).click()
  await expect(stage.locator('[data-preshow-status="playing"]')).toBeVisible()
  await expect(stage.locator('video source[src="/img-optimized/video1.mp4"]')).toHaveCount(1, { timeout: 8_000 })

  await expect(stage.locator('[data-preshow-scene="title_over_video"]')).toBeVisible({ timeout: 18_000 })
  await expect(stage.locator('[data-title-source="code"]')).toContainText('DOIS PESOS,')
  await stage.screenshot({ path: `${screenshotDir}/cinematic-video-title-1920x1080.png`, fullPage: true })

  await expect(stage.getByText('Depois da vez, sao 20 segundos.')).toBeVisible({ timeout: 24_000 })
  await expect(stage.getByText('Pegou a vez e calou: -10 para sua mesa, +10 para o rival.')).toBeVisible({ timeout: 14_000 })
  await admin.getByRole('button', { name: 'Testar mesa' }).click()
  await expect(stage.locator('[data-preshow-scene="how_to_play_tribunal"]')).toBeVisible()
  await expect(stage.getByText('Antes do julgamento, teste das mesas.')).toBeVisible()
  await stage.waitForTimeout(900)
  await stage.screenshot({ path: `${screenshotDir}/how-to-play-1920x1080.png`, fullPage: true })

  await expect(stage.locator('[data-preshow-scene="button_check"]')).toBeVisible({ timeout: 14_000 })
  await expect(stage.getByText('Mesa A, pressione o botao de vez.')).toBeVisible()
  await admin.bringToFront()
  await admin.keyboard.press('z')
  await expect(stage.getByRole('heading', { name: 'Mesa A reconhecida' })).toBeVisible()
  await admin.getByRole('button', { name: 'Pedir proximo sinal' }).click()
  await admin.bringToFront()
  await admin.keyboard.press('m')
  await expect(stage.getByText('Mesa B reconhecida').first()).toBeVisible()
  await expect(stage.getByText('Mesas A e B reconhecidas. Aguarde o Admin iniciar o quiz.')).toBeVisible()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'intro')

  await admin.getByRole('button', { name: 'Avancar para pronto' }).click()
  await expect(stage.locator('[data-preshow-status="finished"]')).toBeVisible()
  await expect(stage.locator('[data-preshow-scene="ready_to_start"]')).toBeVisible()
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'intro')
  await stage.screenshot({ path: `${screenshotDir}/ready-to-start-1920x1080.png`, fullPage: true })

  await stage.setViewportSize({ width: 1366, height: 768 })
  await stage.screenshot({ path: `${screenshotDir}/preshow-1366x768.png`, fullPage: true })

  await expect(stage.locator('body')).not.toContainText(/buzz/i)

  await context.close()
})

test('fallback keyboard remains direct on admin without serial', async ({ page }) => {
  await loginAdmin(page)
  await page.getByRole('button', { name: 'Iniciar quiz' }).click()
  await startRoundAndReveal(page)
  await expect(page.getByText('Timer').locator('..')).toContainText(/running|20|19/, { timeout: 5_000 })
  await page.keyboard.press('z')
  await expect(page.getByText('Grupo com a vez').locator('..')).toContainText('A')
})

test('harness 3.1 admin preview, A/B card, history export and clear', async ({ page }) => {
  await loginAdmin(page)
  await page.getByRole('button', { name: 'Iniciar quiz' }).click()
  await page.getByText('Tecnico / Avancado').click()
  await expect(page.getByRole('heading', { name: 'Preview TV' })).toBeVisible()
  await expect(page.getByTestId('question-card')).toContainText('Quem e este personagem?')
  await page.screenshot({ path: `${screenshotDir}/admin-preview-character.png`, fullPage: true })

  await forceTechnicalNextRounds(page, 8)

  await expect(page.getByRole('heading', { name: 'Resposta' })).toBeVisible()
  await expect(page.getByText('Escolha A/B')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar A/B' })).toBeDisabled()

  await startRoundAndReveal(page)
  await page.keyboard.press('z')
  await page.getByRole('button', { name: 'A', exact: true }).first().click()
  await page.getByRole('button', { name: 'Confirmar A/B' }).first().click()
  const historyPanel = page.getByRole('heading', { name: 'Historico' }).locator('..')
  await expect(historyPanel.getByText('Eventos').first().locator('..')).toContainText(/[1-9]/)
  await page.screenshot({ path: `${screenshotDir}/admin-ab-history.png`, fullPage: true })

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'CSV de eventos' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/historico-dois-pesos.*\.csv/)

  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Limpar historico' }).click()
  await expect(historyPanel.getByText('Eventos').first().locator('..')).toContainText('0')
})

test('harness 3.1 Veredito Final resolves a tied match without public correct answer leak', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/stage')
  await page.evaluate(() => window.QuizStageDebug?.startNewQuiz())

  for (let round = 0; round < 10; round += 1) {
    await page.evaluate(() => window.QuizStageDebug?.nextRound())
  }

  await page.evaluate(() => window.QuizStageDebug?.showQuestionCard())
  await expect(page.getByTestId('question-card')).toContainText('Veredito Final')
  await expect(page.locator('body')).not.toContainText(/Correta:/)
  await page.screenshot({ path: `${screenshotDir}/stage-veredito-final.png`, fullPage: true })

  await page.evaluate(async () => {
    await window.QuizStageDebug?.openAnswerWindow()
    window.QuizStageDebug?.lockGroupB()
    window.QuizStageDebug?.selectCorrectChoice()
    window.QuizStageDebug?.confirmChoice()
  })

  const gameOver = page.getByLabel('Fim do jogo')
  await expect(gameOver).toBeVisible()
  await expect(gameOver).toContainText(/Grupo [AB] vence/)
})
