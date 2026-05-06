import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = 'docs/sprint-2/harness-9/evidencias/automacao/operador-profissional'
const screenshotDir = join(evidenceDir, 'screenshots')
const reportPath = join(evidenceDir, 'operador-profissional-report.json')

type Group = 'A' | 'B'
type RoundAction = 'correct' | 'wrong' | 'timeout' | 'tribunal-correct' | 'tribunal-pass-pass'

interface ClickLog {
  atMs: number
  page: 'admin' | 'stage'
  label: string
}

interface GameReport {
  name: string
  startedAt: string
  durationMs: number
  winner: string | null
  finalScore: string | null
  phaseAtEnd: string | null
  operatorClicks: ClickLog[]
  screenshots: string[]
  consoleErrors: string[]
  failedRequests: string[]
  stageAudio: unknown
  assetsByPhase: Record<string, string[]>
  preShow?: {
    samples: Array<{ elapsedMs: number; currentTime: number; paused: boolean; state: string | null; scene: string | null }>
    frameScreenshots: string[]
  }
}

mkdirSync(screenshotDir, { recursive: true })

function nowIso() {
  return new Date().toISOString()
}

async function loginAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Usuario').fill('admin123')
  await page.getByLabel('Senha').fill('121212')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
}

async function clickButton(page: Page, clicks: ClickLog[], pageName: 'admin' | 'stage', label: string | RegExp) {
  const started = performance.now()
  const locator = page.getByRole('button', { name: label }).first()
  await locator.click({ timeout: 15_000 })
  clicks.push({ atMs: Math.round(performance.now() - started), page: pageName, label: String(label) })
}

async function waitForTurnOpen(stage: Page) {
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'buzz_open', { timeout: 8_000 })
}

async function resolveTribunalIfOpen(admin: Page, stage: Page, clicks: ClickLog[], mode: 'pass-pass' | 'correct' = 'pass-pass') {
  const tribunalOpen = await stage
    .locator('main')
    .getAttribute('data-phase', { timeout: 2_000 })
    .then((phase) => phase === 'tribunal_challenge')
    .catch(() => false)

  if (!tribunalOpen) return

  if (mode === 'correct') {
    await clickButton(admin, clicks, 'admin', 'Arriscar')
    await clickButton(admin, clicks, 'admin', 'Correto (+20)')
    return
  }

  await clickButton(admin, clicks, 'admin', 'Passar')
  await clickButton(admin, clicks, 'admin', 'Passar')
}

async function advanceToNextRound(admin: Page, stage: Page, clicks: ClickLog[], round: number) {
  if ((await stage.locator('main').getAttribute('data-phase')) === 'game_over') return
  await admin.waitForTimeout(300)
  await admin.getByRole('button', { name: 'Operacao', exact: true }).click({ timeout: 5_000 }).catch(() => undefined)

  const finishFeedback = admin.getByRole('button', { name: 'Encerrar feedback' }).first()
  if (await finishFeedback.isVisible().catch(() => false)) {
    await expect(finishFeedback).toBeEnabled({ timeout: 5_000 })
    await finishFeedback.click({ timeout: 8_000 })
    clicks.push({ atMs: 0, page: 'admin', label: 'Encerrar feedback' })
    await admin.waitForTimeout(300)
  }

  const startRound = admin.getByRole('button', { name: 'Iniciar rodada' }).first()
  if (round < 10 && (await startRound.isVisible().catch(() => false))) return

  const nextRound = admin.getByRole('button', { name: 'Proxima rodada' }).first()
  const clicked = await nextRound
    .click({ timeout: 8_000 })
    .then(() => true)
    .catch(() => false)

  if (clicked) {
    clicks.push({ atMs: 0, page: 'admin', label: 'Proxima rodada' })
    return
  }

  await resolveTribunalIfOpen(admin, stage, clicks)
  if (await finishFeedback.isVisible().catch(() => false)) {
    await expect(finishFeedback).toBeEnabled({ timeout: 5_000 })
    await finishFeedback.click({ timeout: 8_000 })
    clicks.push({ atMs: 0, page: 'admin', label: 'Encerrar feedback' })
    await admin.waitForTimeout(300)
  }
  if (round < 10 && (await startRound.isVisible().catch(() => false))) return
  if ((await stage.locator('main').getAttribute('data-phase')) === 'game_over') return
  await nextRound.click({ timeout: 8_000 })
  clicks.push({ atMs: 0, page: 'admin', label: 'Proxima rodada' })
}

async function answerOperatorPanel(admin: Page, clicks: ClickLog[], action: 'correct' | 'wrong') {
  const choiceConfirm = admin.getByRole('button', { name: 'Confirmar A/B' }).first()
  if (await choiceConfirm.isVisible().catch(() => false)) {
    const correctText = await admin.getByTestId('correct-option').textContent({ timeout: 2_000 }).catch(() => '')
    const correctChoice = correctText?.match(/Correta:\s*([AB])/i)?.[1]?.toUpperCase() === 'B' ? 'B' : 'A'
    const choice = action === 'correct' ? correctChoice : correctChoice === 'A' ? 'B' : 'A'
    const operation = admin.getByLabel('Operacao')
    await operation.getByRole('button', { name: choice, exact: true }).click({ timeout: 15_000 })
    clicks.push({ atMs: 0, page: 'admin', label: choice })
    const confirm = operation.getByRole('button', { name: 'Confirmar A/B' })
    await expect(confirm).toBeEnabled({ timeout: 5_000 })
    await confirm.click({ timeout: 15_000 })
    clicks.push({ atMs: 0, page: 'admin', label: 'Confirmar A/B' })
    return
  }

  await clickButton(admin, clicks, 'admin', action === 'correct' ? 'Marcar correto' : /ERRADO|Errada/i)
}

async function snapshotStage(stage: Page, name: string, screenshots: string[]) {
  const file = join(screenshotDir, `${name}.png`)
  await stage.screenshot({ path: file, fullPage: true })
  screenshots.push(file)
}

async function collectAssetsByPhase(stage: Page) {
  return stage.evaluate(() => {
    const phase = document.querySelector('main')?.getAttribute('data-phase') ?? 'unknown'
    const resources = performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => /\/(img|img-optimized|img das perguntas|audio)\//.test(name))
    return { phase, resources }
  })
}

async function collectFinalState(stage: Page) {
  return stage.evaluate(() => {
    const finalShow = document.querySelector('[aria-label="Fim do jogo"]')
    return {
      phase: document.querySelector('main')?.getAttribute('data-phase') ?? null,
      winner: finalShow?.getAttribute('data-winner') ?? null,
      finalScore: finalShow?.querySelector('[aria-label="Placar final"]')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      audio: window.StageAudioDebug?.getState() ?? null,
    }
  })
}

async function startFreshGame(admin: Page, clicks: ClickLog[]) {
  const resetButton = admin.getByRole('button', { name: 'Reiniciar partida' }).first()
  if (await resetButton.isVisible().catch(() => false)) {
    admin.once('dialog', (dialog) => dialog.accept())
    await clickButton(admin, clicks, 'admin', 'Reiniciar partida')
  }
  const startQuiz = admin.getByRole('button', { name: 'Iniciar quiz' }).first()
  if (await startQuiz.isVisible().catch(() => false)) {
    await clickButton(admin, clicks, 'admin', 'Iniciar quiz')
  }
  await expect(admin.getByText('Rodada 1/10').first()).toBeVisible({ timeout: 10_000 })
}

async function answerRound(
  admin: Page,
  stage: Page,
  clicks: ClickLog[],
  group: Group,
  action: RoundAction,
  round: number,
) {
  await clickButton(admin, clicks, 'admin', 'Iniciar rodada')
  await expect(stage.getByLabel('Tempo de resposta')).toBeVisible({ timeout: 6_000 })

  if (action === 'timeout' || action === 'tribunal-correct' || action === 'tribunal-pass-pass') {
    await expect(stage.locator('main')).toHaveAttribute('data-phase', 'tribunal_challenge', { timeout: 25_000 })
    if (action === 'tribunal-correct') {
      await resolveTribunalIfOpen(admin, stage, clicks, 'correct')
    } else if (action === 'tribunal-pass-pass') {
      await resolveTribunalIfOpen(admin, stage, clicks)
    }
  } else {
    await waitForTurnOpen(stage)
    await admin.bringToFront()
    await admin.keyboard.press(group === 'A' ? 'z' : 'm')
    clicks.push({ atMs: 0, page: 'admin', label: `keyboard ${group}` })
    await expect(stage.locator('main')).toHaveAttribute('data-phase', /team_answering|answer_locked/, { timeout: 5_000 })
    await expect(stage.getByText('COM A PALAVRA')).toBeVisible({ timeout: 5_000 })
    await answerOperatorPanel(admin, clicks, action)
    await resolveTribunalIfOpen(admin, stage, clicks)
  }

  await advanceToNextRound(admin, stage, clicks, round)
}

async function finishWithPattern(
  admin: Page,
  stage: Page,
  clicks: ClickLog[],
  pattern: Array<{ group: Group; action: RoundAction }>,
) {
  for (let index = 0; index < pattern.length; index += 1) {
    await answerRound(admin, stage, clicks, pattern[index].group, pattern[index].action, index + 1)
  }
  await expect(stage.locator('main')).toHaveAttribute('data-phase', 'game_over', { timeout: 12_000 })
}

test('operador profissional executa 4 jogos variaveis com Admin e Stage reais', async ({ browser }) => {
  test.setTimeout(600_000)
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, recordVideo: { dir: join(evidenceDir, 'videos') } })

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
  await clickButton(stage, [], 'stage', 'Ativar audio da TV')

  const reports: GameReport[] = []

  const preShowClicks: ClickLog[] = []
  const preShowSamples: GameReport['preShow']['samples'] = []
  const preShowFrames: string[] = []
  await clickButton(admin, preShowClicks, 'admin', 'Iniciar pre-show')
  for (const elapsedMs of [2_000, 8_000, 16_000, 30_000, 41_000]) {
    await stage.waitForTimeout(elapsedMs === 2_000 ? 2_000 : elapsedMs - preShowSamples.at(-1)!.elapsedMs)
    const sample = await stage.evaluate((elapsed) => {
      const video = document.querySelector('video[aria-label="Video 1 do pre-show"]') as HTMLVideoElement | null
      const root = document.querySelector('[data-preshow-status]')
      return {
        elapsedMs: elapsed,
        currentTime: video?.currentTime ?? -1,
        paused: video?.paused ?? true,
        state: root?.getAttribute('data-video-state') ?? null,
        scene: root?.getAttribute('data-preshow-scene') ?? null,
      }
    }, elapsedMs)
    preShowSamples.push(sample)
    const frame = join(screenshotDir, `preshow-${elapsedMs}.png`)
    await stage.screenshot({ path: frame, fullPage: true })
    preShowFrames.push(frame)
  }
  await clickButton(admin, preShowClicks, 'admin', 'Avancar para pronto')
  await snapshotStage(stage, 'preshow-ready', preShowFrames)

  const gameDefinitions = [
    {
      name: 'vitoria-limpa-grupo-a',
      pattern: Array.from({ length: 10 }, () => ({ group: 'A' as Group, action: 'correct' as RoundAction })),
    },
    {
      name: 'vitoria-grupo-b-erros-a',
      pattern: Array.from({ length: 10 }, () => ({ group: 'A' as Group, action: 'wrong' as RoundAction })),
    },
    {
      name: 'tribunal-e-desempate-possivel',
      pattern: [
        { group: 'A' as Group, action: 'tribunal-correct' as RoundAction },
        ...Array.from({ length: 9 }, () => ({ group: 'A' as Group, action: 'wrong' as RoundAction })),
      ],
    },
    {
      name: 'stress-pausa-mute-pass-reset-repetir',
      pattern: Array.from({ length: 10 }, (_, index) => ({
        group: index % 2 === 0 ? ('A' as Group) : ('B' as Group),
        action: index === 0 ? ('tribunal-pass-pass' as RoundAction) : ('correct' as RoundAction),
      })),
    },
  ]

  for (const definition of gameDefinitions) {
    const startedAtMs = performance.now()
    const clicks: ClickLog[] = []
    const screenshots: string[] = []
    const assetsByPhase: Record<string, string[]> = {}

    await startFreshGame(admin, clicks)
    if (definition.name.includes('stress')) {
      await clickButton(admin, clicks, 'admin', 'Mudo')
      await clickButton(admin, clicks, 'admin', 'Com som')
    }
    await snapshotStage(stage, `${definition.name}-start`, screenshots)
    const startAssets = await collectAssetsByPhase(stage)
    assetsByPhase[startAssets.phase] = startAssets.resources

    await finishWithPattern(admin, stage, clicks, definition.pattern)
    await snapshotStage(stage, `${definition.name}-final-entrada`, screenshots)
    await stage.waitForTimeout(1_200)
    await snapshotStage(stage, `${definition.name}-final-pico`, screenshots)
    await stage.waitForTimeout(1_200)
    await snapshotStage(stage, `${definition.name}-final-repouso`, screenshots)

    if (definition.name.includes('stress')) {
      await clickButton(admin, clicks, 'admin', /Repetir( Final Show)?/)
      await stage.waitForTimeout(500)
      await snapshotStage(stage, `${definition.name}-final-replay`, screenshots)
    }

    const finalState = await collectFinalState(stage)
    const endAssets = await collectAssetsByPhase(stage)
    assetsByPhase[endAssets.phase] = endAssets.resources

    reports.push({
      name: definition.name,
      startedAt: nowIso(),
      durationMs: Math.round(performance.now() - startedAtMs),
      winner: finalState.winner,
      finalScore: finalState.finalScore,
      phaseAtEnd: finalState.phase,
      operatorClicks: clicks,
      screenshots,
      consoleErrors: [...consoleErrors],
      failedRequests: [...failedRequests],
      stageAudio: finalState.audio,
      assetsByPhase,
      preShow: definition.name === 'vitoria-limpa-grupo-a' ? { samples: preShowSamples, frameScreenshots: preShowFrames } : undefined,
    })
  }

  await context.close()

  writeFileSync(reportPath, `${JSON.stringify({ generatedAt: nowIso(), games: reports }, null, 2)}\n`)

  expect(reports).toHaveLength(4)
  expect(reports.every((report) => report.phaseAtEnd === 'game_over')).toBe(true)
  expect(consoleErrors).toEqual([])
  expect(failedRequests).toEqual([])
})
