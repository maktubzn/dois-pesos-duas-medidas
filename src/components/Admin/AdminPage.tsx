import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode, RefObject } from 'react'
import { QuestionCard } from '@/components/QuestionCard/QuestionCard'
import { useArduinoSerial } from '@/hooks/useArduinoSerial'
import { useAdminRealtime } from '@/hooks/useRealtimeBridge'
import { useGameStore } from '@/store/gameStore'
import type { ChoiceOption, GroupId, QuizPhase, QuizQuestion, SerialCommand } from '@/types/game.types'
import { downloadHistoryCsv, downloadMatchSessionCsv } from '@/utils/historyStorage'
import { formatCountdown } from '@/utils/roundSequence'
import { serialEventToGroup } from '@/utils/serialEventToGroup'
import { getPreShowScene } from '@/utils/preShowTimeline'
import styles from './AdminPage.module.css'

const AUTH_KEY = 'dois-pesos-admin-auth'
const ADMIN_USER = 'admin123'
const ADMIN_PASSWORD = '121212'
const RESET_HW_DEBOUNCE_MS = 2_000

const PHASE_LABELS: Record<QuizPhase, string> = {
  intro: 'Intro',
  idle: 'Aguardando',
  round_preparing: 'Preparando mesa',
  round_countdown: 'Countdown',
  round_prepare: 'Rodada preparada',
  input_ready: 'Mesa pronta',
  question_reveal: 'Pergunta revelada',
  buzz_open: 'Botões de vez liberados',
  team_answering: 'Resposta em andamento',
  pass_decision: 'Passa acionado',
  repass_decision: 'Repassa acionado',
  answer_locked: 'Resposta travada',
  scoring: 'Pontuação registrada',
  auto_next_round_delay: 'Feedback',
  round_end: 'Rodada encerrada',
  time_up: 'Botões bloqueados',
  tribunal_challenge: 'Desafio do Tribunal',
  game_over: 'Jogo encerrado',
  error: 'Erro operacional',
}

const FEEDBACK_LABELS = {
  none: '--',
  correct: 'Acerto registrado',
  wrong: 'Erro registrado',
  time_up: 'Tempo esgotado',
  opponent_bonus: 'Bonus ao adversario',
  silence_penalty: 'Silencio: -10/+10',
  tribunal_correct: 'Tribunal correto',
  tribunal_wrong: 'Tribunal errado',
  tribunal_silence: 'Silencio nos autos',
} as const

const PRE_SHOW_LABELS = {
  idle: 'Aguardando',
  playing: 'Tocando',
  paused: 'Pausado',
  skipped: 'Pulado',
  finished: 'Finalizado',
} as const

const PRE_SHOW_SCENE_LABELS = {
  waiting_logo: 'Logo de espera',
  blackout_to_video: 'Blackout de abertura',
  cinematic_video: 'Video 1',
  title_over_video: 'Titulo sobre video',
  how_to_play_first: 'Tribunal',
  how_to_play_score: 'Botao de vez / 20s',
  how_to_play_wrong: 'Silencio -10/+10',
  how_to_play_tribunal: 'Teste em seguida',
  button_check: 'Teste da mesa',
  ready_to_start: 'Pronto para iniciar',
} as const

function formatPhase(phase: QuizPhase) {
  return PHASE_LABELS[phase]
}

function isChoiceQuestion(question: QuizQuestion | null) {
  return question?.type === 'text_choice' || question?.type === 'tie_breaker'
}

function getQuestionKindLabel(question: QuizQuestion | null) {
  if (!question) return 'Sem pergunta'
  if (question.type === 'character_image') return 'Imagem'
  if (question.type === 'tie_breaker') return 'Veredito Final'
  return 'A/B'
}

function getCorrectAnswerLabel(question: QuizQuestion | null) {
  if (!question) return '--'
  if (question.type === 'character_image') return question.characterName
  return question.correctOption
}

function getCorrectAnswerReference(question: QuizQuestion | null) {
  if (!question) return 'Aguardando pergunta.'
  if (question.type === 'character_image') return `Personagem exibido: ${question.characterName} | Arquivo: ${question.imageFile}`
  if (question.type === 'tie_breaker') return question.explanation ?? `Alternativa correta: ${question.correctOption}`
  return question.explanation ?? `Alternativa correta: ${question.correctOption}`
}

function getOperatorPrompt(question: QuizQuestion | null) {
  if (!question) return 'Aguardando rodada'
  if (question.type === 'character_image') return 'Quem e este personagem?'
  return question.prompt
}

function getRecommendedAction(phase: QuizPhase, preShowStatus: keyof typeof PRE_SHOW_LABELS) {
  if (phase === 'intro' && preShowStatus === 'idle') return 'Iniciar pre-show e ativar audio na TV'
  if (phase === 'intro' && preShowStatus === 'playing') return 'Acompanhar pre-show ou pausar se precisar'
  if (phase === 'intro' && preShowStatus === 'finished') return 'Iniciar quiz quando a sala estiver pronta'
  if (phase === 'round_prepare') return 'Iniciar rodada'
  if (phase === 'round_countdown') return 'Aguardar countdown ou pular se necessario'
  if (phase === 'round_preparing') return 'Preparando mesa antes de revelar pergunta'
  if (phase === 'input_ready') return 'Mesa pronta; pergunta pode aparecer'
  if (phase === 'buzz_open') return 'Aguardar sinal da mesa'
  if (phase === 'team_answering') return 'Confirmar resposta do grupo'
  if (phase === 'tribunal_challenge') return 'Operar Arriscar ou Passar no Desafio do Tribunal'
  if (phase === 'scoring' || phase === 'answer_locked' || phase === 'time_up') return 'Aguardar feedback'
  if (phase === 'round_end') return 'Clicar proxima rodada'
  if (phase === 'game_over') return 'Abrir ou repetir Final Show'
  return 'Monitorar estado da partida'
}

function confirmAction(message: string) {
  return window.confirm(message)
}

const HELP_TOPICS = [
  {
    category: 'Abrir telas',
    text: 'Abra /admin para operar e /stage na TV. Na Stage, clique em Ativar audio da TV antes do publico entrar.',
  },
  {
    category: 'Conectar Arduino',
    text: 'Conecte a mesa pelo Admin. Se a mesa nao responder, use Resetar mesa fisica e depois rode Testar mesa.',
  },
  {
    category: 'Testar mesas',
    text: 'No pre-show, clique Testar mesa. Mesa A e Mesa B precisam aparecer como reconhecidas. Esse teste nao pontua e nao inicia quiz.',
  },
  {
    category: 'Se Mesa A/B falhar',
    text: 'Clique Resetar mesa fisica, teste de novo e confira o ultimo evento serial. Em emergencia, use fallback Mesa A/B pelo Admin.',
  },
  {
    category: 'Iniciar rodada',
    text: 'Use Iniciar rodada. A mesa fica bloqueada no countdown e libera o botao de vez quando a pergunta estiver aberta.',
  },
  {
    category: 'Botao de vez e 20s',
    text: 'Quando um grupo pega a vez, ele tem 20 segundos para responder. O Admin decide correto, errado ou reabre a vez.',
  },
  {
    category: 'Silencio',
    text: 'Se o grupo pega a vez e nao responde, recebe -10 e o rival recebe +10. Isso nao vale no pre-show nem no teste de mesa.',
  },
  {
    category: 'Tribunal',
    text: 'No Desafio do Tribunal, o grupo chamado pode arriscar ou passar. A Stage mostra o grupo e o tempo, sem gabarito.',
  },
  {
    category: 'Resposta correta',
    text: 'O nome do personagem e a referencia correta ficam so no Admin, no painel Decisao. A Stage nunca mostra spoiler.',
  },
  {
    category: 'Historico/CSV',
    text: 'Ao fim da apresentacao, exporte CSV da partida e CSV de eventos. Limpar historico pede confirmacao.',
  },
  {
    category: 'Audio',
    text: 'O som publico toca na Stage. Se nao houver som, ative audio na TV, tire do mudo e confirme o volume publico.',
  },
  {
    category: 'Emergencia',
    text: 'Se a mesa fisica parar, use Resetar mesa fisica. Se ainda falhar, opere com fallback Mesa A/B e registre no log.',
  },
  {
    category: 'Contingencia',
    text: 'Nao reinicie a partida para recuperar Arduino. Resetar mesa fisica nao zera placar, nao avanca rodada e nao abre input sozinho.',
  },
]

function useAdminAuth() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'true')

  const login = (user: string, password: string) => {
    if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setAuthenticated(true)
      return true
    }

    return false
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthenticated(false)
  }

  return { authenticated, login, logout }
}

export function AdminPage() {
  const { authenticated, login, logout } = useAdminAuth()

  if (!authenticated) {
    return <AdminLogin onLogin={login} />
  }

  return <AdminDashboard onLogout={logout} />
}

function getAdminSection(phase: QuizPhase) {
  if (phase === 'intro') return 'Pre-show'
  if (phase === 'tribunal_challenge') return 'Tribunal'
  if (phase === 'game_over') return 'Historico'
  if (phase === 'idle') return 'Operacao'
  return 'Partida'
}

function AdminShell({
  phase,
  roundFeedback,
  feedbackRemainingMs,
  activeSection,
  onSectionChange,
  children,
}: {
  phase: QuizPhase
  roundFeedback: string
  feedbackRemainingMs: number
  activeSection: string
  onSectionChange: (section: string) => void
  children: ReactNode
}) {
  return (
    <main
      className={styles.adminShell}
      data-phase={phase}
      data-feedback={roundFeedback}
      data-feedback-remaining-ms={Math.round(feedbackRemainingMs)}
    >
      <AdminSidebar activeSection={activeSection} onSectionChange={onSectionChange} />
      <div className={styles.adminWorkspace}>{children}</div>
    </main>
  )
}

function AdminSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: string
  onSectionChange: (section: string) => void
}) {
  const items = ['Operacao', 'Pre-show', 'Partida', 'Tribunal', 'Historico', 'Tecnico']

  return (
    <aside className={styles.adminSidebar} aria-label="Navegacao do Admin" data-admin-sidebar="true">
      <div className={styles.sidebarLogo} aria-label="INFO">INFO</div>
      <nav className={styles.sidebarNav} aria-label="Modos do Admin">
        {items.map((item) => (
          <button
            type="button"
            className={item === activeSection ? styles.sidebarItemActive : styles.sidebarItem}
            key={item}
            onClick={() => onSectionChange(item)}
            aria-current={item === activeSection ? 'page' : undefined}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function AdminTopStatusBar({ children }: { children: ReactNode }) {
  return <div className={styles.topStatusBar}>{children}</div>
}

function AdminMainAction({ children }: { children: ReactNode }) {
  return <section className={styles.mainActionPanel} aria-label="Acao principal do operador">{children}</section>
}

function AdminStagePreview({ children }: { children: ReactNode }) {
  return <aside className={styles.stagePreviewPanel} aria-label="Preview da Stage">{children}</aside>
}

function AdminOperationPanel({ children }: { children: ReactNode }) {
  return <div className={styles.operationPanel} data-admin-operation-panel="true">{children}</div>
}

function AdminDecisionPanel({ children }: { children: ReactNode }) {
  return <section className={styles.decisionPanel} aria-label="Painel de decisao">{children}</section>
}

function AdminTechnicalDrawer({
  children,
  open,
  onToggle,
}: {
  children: ReactNode
  open: boolean
  onToggle: (open: boolean) => void
}) {
  return (
    <details className={styles.advanced} aria-label="Tecnico avancado" open={open} onToggle={(event) => onToggle(event.currentTarget.open)}>
      <summary>Tecnico / Avancado</summary>
      {children}
    </details>
  )
}

function AdminLogin({ onLogin }: { onLogin: (user: string, password: string) => boolean }) {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ok = onLogin(user.trim(), password)
    if (!ok) setError('Credencial invalida')
  }

  return (
    <main className={styles.loginShell}>
      <section className={styles.loginFrame} aria-label="Acesso administrativo">
        <form className={styles.loginCard} onSubmit={handleSubmit} aria-label="Login admin">
          <span className={styles.eyebrow}>Mesa de controle</span>
          <h1>Admin</h1>
          <label>
            Usuario
            <input value={user} onChange={(event) => setUser(event.target.value)} autoComplete="username" />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button type="submit">Entrar</button>
        </form>
        <aside className={styles.loginBrand} aria-label="Painel visual INFO">
          <strong>INFO</strong>
          <span>Dois Pesos, Duas Medidas</span>
        </aside>
      </section>
    </main>
  )
}

function AdminHelpModal({
  open,
  query,
  onQueryChange,
  onClose,
  returnFocusRef,
}: {
  open: boolean
  query: string
  onQueryChange: (query: string) => void
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const wasOpenRef = useRef(false)
  const normalizedQuery = query.trim().toLowerCase()
  const topics = normalizedQuery
    ? HELP_TOPICS.filter((topic) => `${topic.category} ${topic.text}`.toLowerCase().includes(normalizedQuery))
    : HELP_TOPICS

  useEffect(() => {
    if (!open) return undefined
    searchRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>('button, input, [href], [tabindex]:not([tabindex="-1"])') ?? [],
      ).filter((element) => !element.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      return
    }
    if (!wasOpenRef.current) return
    returnFocusRef.current?.focus()
    wasOpenRef.current = false
  }, [open, returnFocusRef])

  if (!open) return null

  return (
    <div className={styles.helpBackdrop} role="presentation">
      <section
        ref={modalRef}
        className={styles.helpModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-help-title"
      >
        <header className={styles.helpHeader}>
          <div>
            <span className={styles.eyebrow}>Operacao</span>
            <h2 id="admin-help-title">Ajuda</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar ajuda">
            Fechar
          </button>
        </header>
        <label className={styles.helpSearch}>
          Buscar
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            placeholder="Audio, mesa, CSV..."
          />
        </label>
        <div className={styles.helpTopics} aria-live="polite">
          {topics.map((topic) => (
            <article key={topic.category}>
              <h3>{topic.category}</h3>
              <p>{topic.text}</p>
            </article>
          ))}
          {topics.length === 0 ? <p className={styles.emptyHelp}>Nenhum topico encontrado.</p> : null}
        </div>
      </section>
    </div>
  )
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { publishSerialEvent, stageAudioStatus, stageHeartbeat } = useAdminRealtime()
  const {
    supported,
    connect,
    disconnect,
    ping,
    status,
    lock,
    unlock,
    resetHardware,
  } = useArduinoSerial()

  const phase = useGameStore((state) => state.phase)
  const preShowStatus = useGameStore((state) => state.preShowStatus)
  const preShowElapsedMs = useGameStore((state) => state.preShowElapsedMs)
  const preShowInputCheckStatus = useGameStore((state) => state.preShowInputCheckStatus)
  const preShowInputCheckReceivedGroups = useGameStore((state) => state.preShowInputCheckReceivedGroups)
  const preShowInputCheckLastGroup = useGameStore((state) => state.preShowInputCheckLastGroup)
  const scoreA = useGameStore((state) => state.scoreA)
  const scoreB = useGameStore((state) => state.scoreB)
  const currentRound = useGameStore((state) => state.currentRound)
  const totalRounds = useGameStore((state) => state.totalRounds)
  const activeSlot = useGameStore((state) => state.activeSlot)
  const activeGroup = useGameStore((state) => state.activeGroup)
  const timerRemaining = useGameStore((state) => state.timerRemaining)
  const timerStatus = useGameStore((state) => state.timerStatus)
  const roundFeedback = useGameStore((state) => state.roundFeedback)
  const feedbackRemainingMs = useGameStore((state) => state.feedbackRemainingMs)
  const quizMode = useGameStore((state) => state.quizMode)
  const currentRoundQuestion = useGameStore((state) => state.currentRoundQuestion)
  const selectedChoice = useGameStore((state) => state.selectedChoice)
  const winner = useGameStore((state) => state.winner)
  const winReason = useGameStore((state) => state.winReason)
  const finalShowStatus = useGameStore((state) => state.finalShowStatus)
  const tribunalStatus = useGameStore((state) => state.tribunalStatus)
  const tribunalCalledGroup = useGameStore((state) => state.tribunalCalledGroup)
  const tribunalPassedGroups = useGameStore((state) => state.tribunalPassedGroups)
  const tribunalAttemptingGroup = useGameStore((state) => state.tribunalAttemptingGroup)
  const tribunalOutcome = useGameStore((state) => state.tribunalOutcome)
  const tieBreakerAttempt = useGameStore((state) => state.tieBreakerAttempt)
  const tieBreakerBlockedGroups = useGameStore((state) => state.tieBreakerBlockedGroups)
  const autoSequenceStatus = useGameStore((state) => state.autoSequenceStatus)
  const roundIntroStatus = useGameStore((state) => state.roundIntroStatus)
  const roundIntroDelayMs = useGameStore((state) => state.roundIntroDelayMs)
  const roundIntroRemainingMs = useGameStore((state) => state.roundIntroRemainingMs)
  const postFeedbackDelayMs = useGameStore((state) => state.postFeedbackDelayMs)
  const pendingAutomationToken = useGameStore((state) => state.pendingAutomationToken)
  const historyEvents = useGameStore((state) => state.historyEvents)
  const lastScoredGroup = useGameStore((state) => state.lastScoredGroup)
  const lastScoreDelta = useGameStore((state) => state.lastScoreDelta)
  const serialStatus = useGameStore((state) => state.serialStatus)
  const serialLastEvent = useGameStore((state) => state.serialLastEvent)
  const serialLastCommand = useGameStore((state) => state.serialLastCommand)
  const serialError = useGameStore((state) => state.serialError)
  const dfPlayerReady = useGameStore((state) => state.dfPlayerReady)
  const gameLog = useGameStore((state) => state.gameLog)
  const publicAudioMuted = useGameStore((state) => state.publicAudioMuted)
  const publicAudioMasterVolume = useGameStore((state) => state.publicAudioMasterVolume)
  const appendLog = useGameStore((state) => state.appendLog)
  const playPreShow = useGameStore((state) => state.playPreShow)
  const pausePreShow = useGameStore((state) => state.pausePreShow)
  const resumePreShow = useGameStore((state) => state.resumePreShow)
  const skipPreShow = useGameStore((state) => state.skipPreShow)
  const restartPreShow = useGameStore((state) => state.restartPreShow)
  const restartPreShowBriefing = useGameStore((state) => state.restartPreShowBriefing)
  const finishPreShow = useGameStore((state) => state.finishPreShow)
  const tickPreShow = useGameStore((state) => state.tickPreShow)
  const startPreShowInputCheck = useGameStore((state) => state.startPreShowInputCheck)
  const requestNextPreShowInputCheck = useGameStore((state) => state.requestNextPreShowInputCheck)
  const resetPreShowInputCheck = useGameStore((state) => state.resetPreShowInputCheck)
  const startQuiz = useGameStore((state) => state.startQuiz)
  const nextRound = useGameStore((state) => state.nextRound)
  const prepareRoundInput = useGameStore((state) => state.prepareRoundInput)
  const markInputReady = useGameStore((state) => state.markInputReady)
  const receiveInput = useGameStore((state) => state.receiveInput)
  const revealQuestion = useGameStore((state) => state.revealQuestion)
  const openBuzz = useGameStore((state) => state.openBuzz)
  const reopenTurn = useGameStore((state) => state.reopenTurn)
  const resetRound = useGameStore((state) => state.resetRound)
  const resetGame = useGameStore((state) => state.resetGame)
  const markCorrect = useGameStore((state) => state.markCorrect)
  const markWrong = useGameStore((state) => state.markWrong)
  const tribunalRisk = useGameStore((state) => state.tribunalRisk)
  const tribunalPass = useGameStore((state) => state.tribunalPass)
  const resolveTribunalAttempt = useGameStore((state) => state.resolveTribunalAttempt)
  const cancelTribunalChallenge = useGameStore((state) => state.cancelTribunalChallenge)
  const openFinalShow = useGameStore((state) => state.openFinalShow)
  const replayFinalShow = useGameStore((state) => state.replayFinalShow)
  const closeFinalShow = useGameStore((state) => state.closeFinalShow)
  const selectChoice = useGameStore((state) => state.selectChoice)
  const confirmChoice = useGameStore((state) => state.confirmChoice)
  const clearHistory = useGameStore((state) => state.clearHistory)
  const pauseTimer = useGameStore((state) => state.pauseTimer)
  const resumeTimer = useGameStore((state) => state.resumeTimer)
  const tickTimer = useGameStore((state) => state.tickTimer)
  const tickFeedback = useGameStore((state) => state.tickFeedback)
  const finishFeedback = useGameStore((state) => state.finishFeedback)
  const startRoundSequence = useGameStore((state) => state.startRoundSequence)
  const pauseRoundSequence = useGameStore((state) => state.pauseRoundSequence)
  const resumeRoundSequence = useGameStore((state) => state.resumeRoundSequence)
  const endRoundSequence = useGameStore((state) => state.endRoundSequence)
  const enterRoundCountdown = useGameStore((state) => state.enterRoundCountdown)
  const tickRoundCountdown = useGameStore((state) => state.tickRoundCountdown)
  const skipRoundCountdown = useGameStore((state) => state.skipRoundCountdown)
  const finishRoundCountdown = useGameStore((state) => state.finishRoundCountdown)
  const forceNextRoundTechnical = useGameStore((state) => state.forceNextRoundTechnical)
  const completeAutoSequence = useGameStore((state) => state.completeAutoSequence)
  const setPublicAudioMuted = useGameStore((state) => state.setPublicAudioMuted)
  const setPublicAudioMasterVolume = useGameStore((state) => state.setPublicAudioMasterVolume)
  const activeGroupRef = useRef<GroupId | null>(null)
  const publishedSerialEventRef = useRef<string | null>(null)
  const startRoundTimeoutRef = useRef<number | null>(null)
  const automationTimeoutRef = useRef<number | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)
  const countdownFrameRef = useRef<number | null>(null)
  const timerFrameRef = useRef<number | null>(null)
  const feedbackFrameRef = useRef<number | null>(null)
  const preShowFrameRef = useRef<number | null>(null)
  const preShowInputPrepareKeyRef = useRef<string | null>(null)
  const countdownTransitionTokenRef = useRef<string | null>(null)
  const helpButtonRef = useRef<HTMLButtonElement | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpQuery, setHelpQuery] = useState('')
  const [manualAdminSection, setManualAdminSection] = useState<string | null>(null)
  const [technicalOpen, setTechnicalOpen] = useState(false)
  const [adminClockMs, setAdminClockMs] = useState(() => Date.now())
  const roundIntroRemainingRef = useRef(roundIntroRemainingMs)
  const preShowScene = getPreShowScene(preShowStatus, preShowElapsedMs)
  const recommendedAction = getRecommendedAction(phase, preShowStatus)
  const tribunalPanelVisible =
    phase === 'tribunal_challenge' ||
    roundFeedback === 'tribunal_correct' ||
    roundFeedback === 'tribunal_wrong' ||
    roundFeedback === 'tribunal_silence'
  const finalShowPanelVisible = phase === 'game_over'

  const activeAdminSection = manualAdminSection ?? getAdminSection(phase)

  const handleSidebarSectionChange = useCallback(
    (section: string) => {
      setManualAdminSection(section)
      setTechnicalOpen(section === 'Tecnico')
      appendLog(`SIDEBAR_NAV: ${section}`)
      window.setTimeout(() => {
        const target = document.querySelector<HTMLElement>(`[data-admin-section="${section}"]`)
        target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }, 0)
    },
    [appendLog],
  )
  const stageHeartbeatAgeMs = stageHeartbeat ? Math.max(0, adminClockMs - stageHeartbeat.receivedAt) : null
  const stageStatusLabel = !stageHeartbeat
    ? 'Sem heartbeat'
    : stageHeartbeat.visibilityState !== 'visible'
      ? 'Stage oculta'
      : stageHeartbeatAgeMs !== null && stageHeartbeatAgeMs > 3_000
        ? 'Stage atrasada'
        : 'Stage online'

  const sendSerial = useCallback(
    async (label: string, command: SerialCommand, action: () => Promise<boolean>) => {
      const ok = await action()
      appendLog(ok ? `${label}: ${command} enviado` : `${label}: ${command} pendente sem serial`)
      return ok
    },
    [appendLog],
  )

  const lastResetHwRef = useRef<number>(0)

  const runResetHardware = useCallback(
    async (label = 'Tecnico', options: { force?: boolean } = {}) => {
      const now = Date.now()
      if (!options.force && now - lastResetHwRef.current < RESET_HW_DEBOUNCE_MS) {
        appendLog('HARDWARE_RESET_WARN: RESET_HW ignorado por debounce 2s')
        return false
      }
      lastResetHwRef.current = now
      appendLog(`HARDWARE_RESET_REQUESTED source=${label}`)
      const ok = await sendSerial(label, 'RESET_HW', resetHardware)
      appendLog(ok ? `HARDWARE_RESET_OK source=${label}` : `HARDWARE_RESET_WARN source=${label} reason=serial_unavailable`)
      return ok
    },
    [appendLog, resetHardware, sendSerial],
  )

  const handleTechnicalResetHardware = useCallback(async () => {
    const confirmed = confirmAction('Enviar RESET_HW para a mesa? Use apenas em manutencao tecnica.')
    if (!confirmed) return false
    return runResetHardware('Tecnico')
  }, [runResetHardware])

  const handleManualResetHardware = useCallback(async () => {
    appendLog('MANUAL_ARDUINO_RESET_REQUESTED')
    const resetOk = await runResetHardware('Manual operacional')
    const state = useGameStore.getState()
    const inputAllowed =
      state.phase === 'buzz_open' &&
      state.inputReady &&
      !state.buzzLocked &&
      state.timerStatus === 'running'
    const lockOk = inputAllowed ? true : await sendSerial('Manual operacional', 'LOCK', lock)
    const statusOk = await sendSerial('Manual operacional', 'STATUS', status)
    appendLog(
      resetOk && lockOk && statusOk
        ? 'MANUAL_ARDUINO_RESET_OK: mesa resetada sem alterar placar/rodada'
        : `MANUAL_ARDUINO_RESET_WARN reset=${resetOk} lock=${lockOk} status=${statusOk}`,
    )
    return resetOk && lockOk && statusOk
  }, [appendLog, lock, runResetHardware, sendSerial, status])

  const runUnlock = useCallback(
    () => sendSerial('Fluxo automatico', 'UNLOCK', unlock),
    [sendSerial, unlock],
  )

  const runLock = useCallback(
    () => sendSerial('Fluxo automatico', 'LOCK', lock),
    [lock, sendSerial],
  )

  const runStatus = useCallback(
    () => sendSerial('Mesa', 'STATUS', status),
    [sendSerial, status],
  )

  const runPrepareHardwareForRound = useCallback(async () => {
    appendLog('ROUND_HARDWARE_PREPARE_START: reset/preparo da mesa solicitado')
    const resetOk = await runResetHardware('Fluxo automatico')
    const lockOk = await runLock()
    appendLog(
      resetOk && lockOk
        ? 'ROUND_HARDWARE_PREPARE_OK: mesa resetada e bloqueada'
        : 'ROUND_HARDWARE_PREPARE_WARN: serial ausente/pendente; fallback Mesa A/B continua operacional',
    )
    return resetOk && lockOk
  }, [appendLog, runLock, runResetHardware])

  const clearStartRoundTimeout = useCallback(() => {
    if (!startRoundTimeoutRef.current) return
    window.clearTimeout(startRoundTimeoutRef.current)
    startRoundTimeoutRef.current = null
  }, [])

  const clearAutomationTimers = useCallback(() => {
    if (automationTimeoutRef.current) {
      window.clearTimeout(automationTimeoutRef.current)
      automationTimeoutRef.current = null
    }
    if (countdownFrameRef.current) {
      window.clearInterval(countdownFrameRef.current)
      countdownFrameRef.current = null
    }
  }, [])

  const clearFeedbackTimeout = useCallback(() => {
    if (!feedbackTimeoutRef.current) return
    window.clearTimeout(feedbackTimeoutRef.current)
    feedbackTimeoutRef.current = null
  }, [])

  const scheduleFeedbackCompletion = useCallback(() => {
    clearFeedbackTimeout()
    feedbackTimeoutRef.current = window.setTimeout(() => {
      finishFeedback()
      feedbackTimeoutRef.current = null
    }, 3_000)
  }, [clearFeedbackTimeout, finishFeedback])

  const clearCountdownTimers = useCallback(() => {
    if (countdownFrameRef.current) {
      window.clearInterval(countdownFrameRef.current)
      countdownFrameRef.current = null
    }
  }, [])

  const revealAfterCountdown = useCallback(async () => {
    const state = useGameStore.getState()
    const transitionToken =
      state.pendingAutomationToken ?? `countdown-${state.currentRound}-${state.quizMode}-${state.tieBreakerAttempt}-${state.roundIntroDelayMs}`

    if (countdownTransitionTokenRef.current === transitionToken) {
      appendLog(`COUNTDOWN_TRANSITION_IGNORED_DUPLICATE: ${transitionToken}`)
      return
    }

    countdownTransitionTokenRef.current = transitionToken
    appendLog(`COUNTDOWN_TRANSITION_REQUESTED: ${transitionToken}`)
    finishRoundCountdown()
    prepareRoundInput()
    void runUnlock()
    markInputReady()
    revealQuestion()
    openBuzz()
    appendLog(`COUNTDOWN_TRANSITION_DONE: ${transitionToken}`)
  }, [appendLog, finishRoundCountdown, markInputReady, openBuzz, prepareRoundInput, revealQuestion, runUnlock])

  async function handleStartSequence() {
    countdownTransitionTokenRef.current = null
    clearStartRoundTimeout()
    clearAutomationTimers()
    clearFeedbackTimeout()
    await runLock()
    startRoundSequence()
  }

  function handlePauseSequence() {
    clearAutomationTimers()
    pauseRoundSequence()
  }

  function handleResumeSequence() {
    resumeRoundSequence()
  }

  function handleSkipCountdown() {
    clearAutomationTimers()
    clearFeedbackTimeout()
    skipRoundCountdown()
    void revealAfterCountdown()
  }

  async function handleForceNextRound() {
    countdownTransitionTokenRef.current = null
    clearStartRoundTimeout()
    clearAutomationTimers()
    clearFeedbackTimeout()
    await runLock()
    forceNextRoundTechnical()
  }

  function handleEndSequence() {
    const confirmed = window.confirm('Encerrar a sequencia automatica?')
    if (!confirmed) return
    clearAutomationTimers()
    endRoundSequence()
  }

  async function handleStartRound() {
    countdownTransitionTokenRef.current = null
    clearStartRoundTimeout()
    clearAutomationTimers()
    await runLock()
    startRoundSequence()
  }

  function handleMesaInput(group: GroupId) {
    receiveInput(group, 'keyboard')
  }

  async function handleMarkCorrect() {
    clearAutomationTimers()
    markCorrect()
    scheduleFeedbackCompletion()
  }

  async function handleWrong() {
    clearAutomationTimers()
    markWrong()
    scheduleFeedbackCompletion()
  }

  function handleTribunalRisk() {
    tribunalRisk()
  }

  async function handleTribunalPass() {
    clearAutomationTimers()
    tribunalPass()
    scheduleFeedbackCompletion()
  }

  async function handleTribunalResolve(result: 'correct' | 'wrong') {
    clearAutomationTimers()
    resolveTribunalAttempt(result)
    scheduleFeedbackCompletion()
  }

  async function handleCancelTribunal() {
    const confirmed = confirmAction('Cancelar o Desafio do Tribunal e encerrar a rodada sem pontos?')
    if (!confirmed) return
    clearAutomationTimers()
    cancelTribunalChallenge()
    scheduleFeedbackCompletion()
  }

  function handleOpenFinalShow() {
    openFinalShow()
  }

  function handleReplayFinalShow() {
    replayFinalShow()
    window.setTimeout(() => {
      openFinalShow()
    }, 80)
  }

  function handleCloseFinalShow() {
    const confirmed = confirmAction('Encerrar o Final Show na Stage e manter a partida para exportacao?')
    if (!confirmed) return
    closeFinalShow()
  }

  async function handleRestartFinishedGame() {
    const confirmed = confirmAction('Reiniciar a partida inteira e voltar para a espera?')
    if (!confirmed) return
    clearStartRoundTimeout()
    clearAutomationTimers()
    resetGame()
  }

  function handleChoice(choice: ChoiceOption) {
    selectChoice(choice)
  }

  async function handleConfirmChoice() {
    confirmChoice()
    scheduleFeedbackCompletion()
  }

  function handleExportHistory() {
    downloadHistoryCsv(historyEvents)
    appendLog(`Historico exportado em CSV (${historyEvents.length} eventos)`)
  }

  function handleExportMatchSession() {
    const ok = downloadMatchSessionCsv(historyEvents)
    appendLog(ok ? 'CSV da partida exportado' : 'CSV da partida sem eventos suficientes')
  }

  function handleClearHistory() {
    const confirmed = confirmAction('Limpar o historico local desta maquina?')
    if (!confirmed) return
    clearHistory()
  }

  async function handleReopenTurn() {
    await runUnlock()
    reopenTurn()
  }

  async function handleResetRound() {
    const confirmed = confirmAction('Resetar a rodada atual?')
    if (!confirmed) return
    clearStartRoundTimeout()
    clearAutomationTimers()
    clearFeedbackTimeout()
    resetRound()
  }

  async function handleNextRound() {
    countdownTransitionTokenRef.current = null
    clearStartRoundTimeout()
    clearAutomationTimers()
    clearFeedbackTimeout()
    appendLog('ROUND_NEXT_CLICKED: operador solicitou proxima rodada')
    nextRound()
    window.setTimeout(() => {
      const state = useGameStore.getState()
      if (state.phase === 'game_over' || state.phase === 'intro') return
      void runPrepareHardwareForRound()
    }, 0)
  }

  async function handleResetGame() {
    const confirmed = confirmAction('Resetar a partida inteira e voltar para a intro?')
    if (!confirmed) return
    clearStartRoundTimeout()
    clearAutomationTimers()
    clearFeedbackTimeout()
    resetGame()
  }

  function handleToggleMute() {
    setPublicAudioMuted(!publicAudioMuted)
  }

  function handleMasterVolumeChange(value: string) {
    setPublicAudioMasterVolume(Number(value) / 100)
  }

  function handleSkipPreShow() {
    const confirmed = confirmAction('Pular a abertura e ir para a explicacao do pre-show?')
    if (!confirmed) return
    skipPreShow()
  }

  async function handleToggleArduinoConnection() {
    if (serialStatus === 'connected') {
      await disconnect()
      return
    }
    await connect()
  }

  function handleTogglePreShowPause() {
    if (preShowStatus === 'paused') {
      resumePreShow()
      return
    }
    pausePreShow()
  }

  function handleStartPreShowInputCheck() {
    startPreShowInputCheck()
  }

  function handleTogglePreShowInputCheck() {
    if (preShowInputCheckStatus === 'idle' || preShowInputCheckStatus === 'complete') {
      void handleStartPreShowInputCheck()
      return
    }
    resetPreShowInputCheck()
  }

  useEffect(() => {
    const testActive =
      phase === 'intro' &&
      preShowInputCheckStatus !== 'idle' &&
      preShowInputCheckStatus !== 'complete'

    if (!testActive) {
      preShowInputPrepareKeyRef.current = null
      return
    }

    const prepareKey = `${preShowInputCheckStatus}:${preShowInputCheckLastGroup ?? 'none'}:${preShowInputCheckReceivedGroups.join(',')}`
    if (preShowInputPrepareKeyRef.current === prepareKey) return
    preShowInputPrepareKeyRef.current = prepareKey

    appendLog(`PRESHOW_TABLE_TEST_HARDWARE_PREPARE_START status=${preShowInputCheckStatus} lastGroup=${preShowInputCheckLastGroup ?? 'none'}`)
    void (async () => {
      const resetOk = await runResetHardware('Pre-show teste A/B', { force: true })
      const unlockOk = await runUnlock()
      const statusOk = await runStatus()
      appendLog(
        resetOk && unlockOk && statusOk
          ? 'PRESHOW_TABLE_TEST_HARDWARE_PREPARE_OK: mesa resetada e liberada para teste A/B'
          : `PRESHOW_TABLE_TEST_HARDWARE_PREPARE_WARN reset=${resetOk} unlock=${unlockOk} status=${statusOk}; fallback Mesa A/B continua operacional`,
      )
    })()
  }, [
    appendLog,
    phase,
    preShowInputCheckLastGroup,
    preShowInputCheckReceivedGroups,
    preShowInputCheckStatus,
    runResetHardware,
    runStatus,
    runUnlock,
  ])

  function handleToggleTimerPause() {
    if (timerStatus === 'paused') {
      resumeTimer()
      return
    }
    pauseTimer()
  }

  useEffect(() => {
    return () => {
      clearStartRoundTimeout()
      clearAutomationTimers()
      if (timerFrameRef.current) {
        window.clearInterval(timerFrameRef.current)
      }
      if (preShowFrameRef.current) {
        window.clearInterval(preShowFrameRef.current)
      }
      if (feedbackFrameRef.current) {
        window.clearInterval(feedbackFrameRef.current)
      }
      clearFeedbackTimeout()
    }
  }, [clearAutomationTimers, clearFeedbackTimeout, clearStartRoundTimeout])

  useEffect(() => {
    const interval = window.setInterval(() => setAdminClockMs(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    roundIntroRemainingRef.current = roundIntroRemainingMs
  }, [roundIntroRemainingMs])

  useEffect(() => {
    if (timerStatus !== 'running') return undefined

    const interval = window.setInterval(() => {
      const state = useGameStore.getState()
      if (state.timerStatus !== 'running') {
        if (timerFrameRef.current) {
          window.clearInterval(timerFrameRef.current)
        }
        timerFrameRef.current = null
        return
      }
      tickTimer()
    }, 250)
    timerFrameRef.current = interval

    return () => {
      if (timerFrameRef.current) {
        window.clearInterval(timerFrameRef.current)
        timerFrameRef.current = null
      }
    }
  }, [tickTimer, timerStatus])

  useEffect(() => {
    if (preShowStatus !== 'playing') return undefined

    const interval = window.setInterval(() => {
      const state = useGameStore.getState()
      if (state.preShowStatus !== 'playing') {
        if (preShowFrameRef.current) {
          window.clearInterval(preShowFrameRef.current)
        }
        preShowFrameRef.current = null
        return
      }
      tickPreShow()
    }, 100)
    preShowFrameRef.current = interval

    return () => {
      if (preShowFrameRef.current) {
        window.clearInterval(preShowFrameRef.current)
        preShowFrameRef.current = null
      }
    }
  }, [preShowStatus, tickPreShow])

  useEffect(() => {
    if (autoSequenceStatus !== 'running' || phase !== 'round_countdown' || roundIntroStatus !== 'counting') return undefined

    const token = pendingAutomationToken
    clearCountdownTimers()
    const deadlineMs = useGameStore.getState().roundIntroEndsAtMs
    const delayToDeadline = deadlineMs === null ? null : Math.max(0, deadlineMs - Date.now())

    if (delayToDeadline !== null) {
      startRoundTimeoutRef.current = window.setTimeout(() => {
        const state = useGameStore.getState()
        if (state.pendingAutomationToken !== token || state.autoSequenceStatus !== 'running' || state.phase !== 'round_countdown') return
        appendLog(`COUNTDOWN_DEADLINE_REACHED: remainingMs=${Math.round(state.roundIntroRemainingMs)}`)
        void revealAfterCountdown()
      }, delayToDeadline + 20)
    }

    const interval = window.setInterval(() => {
      const state = useGameStore.getState()
      if (state.pendingAutomationToken !== token || state.autoSequenceStatus !== 'running' || state.phase !== 'round_countdown') return
      tickRoundCountdown()
      const nextState = useGameStore.getState()
      const deadlineReached = nextState.roundIntroEndsAtMs !== null && Date.now() >= nextState.roundIntroEndsAtMs
      if (nextState.roundIntroRemainingMs <= 0 || deadlineReached) {
        clearCountdownTimers()
        appendLog(`COUNTDOWN_FINAL_TICK: remainingMs=${Math.round(nextState.roundIntroRemainingMs)}`)
        void revealAfterCountdown()
      }
    }, 100)
    countdownFrameRef.current = interval

    return () => {
      clearCountdownTimers()
      clearStartRoundTimeout()
    }
  }, [
    appendLog,
    autoSequenceStatus,
    clearCountdownTimers,
    clearStartRoundTimeout,
    pendingAutomationToken,
    phase,
    revealAfterCountdown,
    roundIntroStatus,
    tickRoundCountdown,
  ])

  useEffect(() => {
    if (autoSequenceStatus !== 'running' || phase !== 'round_prepare') return
    if (roundIntroStatus === 'counting' || roundIntroStatus === 'finished') return
    void runLock()
    enterRoundCountdown()
  }, [autoSequenceStatus, enterRoundCountdown, phase, roundIntroStatus, runLock])

  useEffect(() => {
    if (roundFeedback === 'none') return undefined
    if (phase !== 'scoring' && phase !== 'answer_locked' && phase !== 'time_up') return undefined

    feedbackFrameRef.current = window.setInterval(() => {
      const state = useGameStore.getState()
      if (state.roundFeedback === 'none' || (state.phase !== 'scoring' && state.phase !== 'answer_locked' && state.phase !== 'time_up')) {
        if (feedbackFrameRef.current) window.clearInterval(feedbackFrameRef.current)
        feedbackFrameRef.current = null
        return
      }
      tickFeedback()
      if (useGameStore.getState().phase === 'round_end') {
        if (feedbackFrameRef.current) window.clearInterval(feedbackFrameRef.current)
        feedbackFrameRef.current = null
      }
    }, 100)

    return () => {
      if (feedbackFrameRef.current) {
        window.clearInterval(feedbackFrameRef.current)
        feedbackFrameRef.current = null
      }
    }
  }, [phase, roundFeedback, tickFeedback])

  useEffect(() => {
    if (phase === 'game_over' && autoSequenceStatus === 'running') {
      clearAutomationTimers()
      completeAutoSequence()
    }
  }, [autoSequenceStatus, clearAutomationTimers, completeAutoSequence, phase])

  useEffect(() => {
    if (!activeGroup) {
      activeGroupRef.current = null
      return
    }

    if (activeGroupRef.current === activeGroup) return
    activeGroupRef.current = activeGroup
    void runLock()
  }, [activeGroup, runLock])

  useEffect(() => {
    if (!serialLastEvent || !activeGroup) return
    if (serialLastEvent !== 'BT1PRESS' && serialLastEvent !== 'BT2PRESS') return

    const resolvedGroup = serialEventToGroup(serialLastEvent)
    if (!resolvedGroup) return

    const publishKey = `${serialLastEvent}:${resolvedGroup}:${currentRound}:${phase}`
    if (publishedSerialEventRef.current === publishKey) return
    publishedSerialEventRef.current = publishKey

    publishSerialEvent({
      raw: serialLastEvent,
      group: resolvedGroup,
      calibrated: true,
    })
  }, [activeGroup, currentRound, phase, publishSerialEvent, serialLastEvent])

  return (
    <AdminShell
      phase={phase}
      roundFeedback={roundFeedback}
      feedbackRemainingMs={feedbackRemainingMs}
      activeSection={activeAdminSection}
      onSectionChange={handleSidebarSectionChange}
    >
      <AdminTopStatusBar>
      <header className={styles.commandTopbar} data-admin-layout-version="harness-7-dark">
        <div>
          <span className={styles.eyebrow}>Dois Pesos, Duas Medidas</span>
          <h1>Admin</h1>
        </div>
        <div className={styles.headerActions}>
          <a href="/stage" target="_blank" rel="noreferrer">
            Abrir Stage
          </a>
          <button ref={helpButtonRef} type="button" onClick={() => setHelpOpen(true)}>
            Ajuda
          </button>
          <button type="button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      <section className={styles.telemetryStrip} aria-label="Estado operacional">
        <div className={styles.telemetryChip}>
          <span>Estado atual</span>
          <strong>{formatPhase(phase)}</strong>
        </div>
        <div className={styles.telemetryChip}>
          <span>Proxima acao</span>
          <strong>{recommendedAction}</strong>
        </div>
        <div className={stageAudioStatus?.unlocked && !publicAudioMuted ? styles.telemetryChipOk : styles.telemetryChipWarn}>
          <span>Audio da TV</span>
          <strong>
            {stageAudioStatus?.unlocked
              ? publicAudioMuted
                ? 'Ativo / mudo'
                : 'Ativo / com som'
              : 'Ativar na Stage'}
          </strong>
        </div>
        <div className={stageStatusLabel === 'Stage online' ? styles.telemetryChipOk : styles.telemetryChipWarn}>
          <span>Stage</span>
          <strong>{stageStatusLabel}</strong>
        </div>
        <div className={serialStatus === 'connected' ? styles.telemetryChipOk : styles.telemetryChipAlert}>
          <span>Mesa</span>
          <strong>{serialStatus === 'connected' ? 'Arduino conectado' : 'Desconectada'}</strong>
        </div>
      </section>
      </AdminTopStatusBar>

      {serialStatus !== 'connected' ? (
        <section className={styles.hardwareWarning} role="alert">
          Mesa/Arduino desconectada. Conecte antes do ensaio ou use fallback de teclado Z/M apenas para teste.
          <button type="button" onClick={() => void handleToggleArduinoConnection()} disabled={!supported || serialStatus === 'connecting'}>
            {serialStatus === 'connecting' ? 'Conectando...' : 'Conectar agora'}
          </button>
        </section>
      ) : null}

      <section className={styles.adminCommandGrid} data-admin-command-grid="true" aria-label="Operacao">
        <div className={styles.adminPrimaryColumn}>
      <AdminMainAction>
      <section className={styles.heroCommand} aria-label="Acao principal do operador" data-primary-action-zone="true">
        <div className={styles.heroCommandCopy}>
          <span>Acao principal</span>
          <strong>{recommendedAction}</strong>
          <small>
            {phase === 'team_answering' || phase === 'answer_locked'
              ? 'Decisao correto/errado continua manual.'
              : phase === 'tribunal_challenge'
                ? 'Tribunal exige escolha do operador.'
            : 'Use quando o proximo passo estiver claro.'}
          </small>
        </div>
        <div className={styles.heroCommandAction}>
          {phase === 'intro' && preShowStatus !== 'finished' ? (
            <button
              className={styles.commandButtonPrimary}
              data-primary-action="true"
              type="button"
              onClick={preShowStatus === 'idle' ? playPreShow : handleTogglePreShowPause}
            >
              {preShowStatus === 'playing' ? 'Pausar pre-show' : preShowStatus === 'paused' ? 'Continuar pre-show' : 'Iniciar pre-show'}
            </button>
          ) : phase === 'intro' ? (
            <button className={styles.commandButtonPrimary} data-primary-action="true" type="button" onClick={startQuiz}>Iniciar quiz</button>
          ) : phase === 'round_prepare' ? (
            <button className={styles.commandButtonPrimary} data-primary-action="true" type="button" onClick={() => void handleStartSequence()}>Iniciar rodada</button>
          ) : phase === 'round_countdown' ? (
            <button className={styles.commandButtonPrimary} data-primary-action="true" type="button" onClick={handleSkipCountdown}>Pular agora</button>
          ) : phase === 'round_end' ? (
            <button className={styles.commandButtonPrimary} data-primary-action="true" type="button" onClick={() => void handleNextRound()}>Proxima rodada</button>
          ) : phase === 'game_over' ? (
            <>
              <button className={styles.commandButtonPrimary} data-primary-action="true" type="button" onClick={handleOpenFinalShow}>Abrir Final Show</button>
              <button type="button" onClick={handleReplayFinalShow}>Repetir</button>
            </>
          ) : (
            <button className={styles.commandButtonPrimary} type="button" disabled>
              Acompanhar estado
            </button>
          )}
          <button
            className={styles.hardwareResetButton}
            type="button"
            onClick={() => void handleManualResetHardware()}
            disabled={serialStatus === 'connecting'}
          >
            Resetar mesa fisica
          </button>
        </div>
      </section>
      </AdminMainAction>

      <AdminOperationPanel>
      <section className={styles.operationConsole} aria-label="Fluxo operacional">
        <div className={styles.flowTimeline} aria-label="Timeline operacional">
          {['Espera', 'Pre-show', 'Quiz', 'Countdown', 'Pergunta', 'Decisao', 'Tribunal', 'Final'].map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        <div className={styles.operationDeck}>
          <div className={styles.phaseReadout}>
            <span>Operacao</span>
            <strong>{formatPhase(phase)}</strong>
            <small>
              {phase === 'intro'
                ? `${PRE_SHOW_SCENE_LABELS[preShowScene.id]} / ${Math.round(preShowElapsedMs / 1000)}s`
                : `Rodada ${currentRound}/${totalRounds} · ${scoreA} x ${scoreB}`}
            </small>
          </div>
          <div className={styles.phaseReadout}>
            <span>Cronometro</span>
            <strong>{phase === 'round_countdown' ? formatCountdown(roundIntroRemainingMs) : `${timerRemaining}s`}</strong>
            <small>{timerStatus} / feedback {Math.ceil(feedbackRemainingMs / 1000)}s</small>
          </div>
          <div className={styles.phaseReadout}>
            <span>Grupo</span>
            <strong>{activeGroup ?? tribunalCalledGroup ?? '--'}</strong>
            <small>Jogador {activeSlot}</small>
          </div>
          <div className={styles.contextActionRail}>
            {phase === 'intro' ? (
              <>
                <button type="button" onClick={() => void handleStartPreShowInputCheck()}>Testar mesa</button>
                <button type="button" onClick={() => handleMesaInput('A')}>Mesa A</button>
                <button type="button" onClick={() => handleMesaInput('B')}>Mesa B</button>
                <button type="button" onClick={requestNextPreShowInputCheck}>Pedir proximo sinal</button>
                <button type="button" onClick={finishPreShow}>Avancar para pronto</button>
                {preShowStatus !== 'finished' ? <button type="button" onClick={startQuiz}>Iniciar quiz</button> : null}
                <button type="button" onClick={handleSkipPreShow}>Ir para explicacao</button>
              </>
            ) : phase === 'round_prepare' ? (
              <>
                <button type="button" disabled>Use a acao principal</button>
              </>
            ) : phase === 'round_countdown' ? (
              <>
                <button className={styles.primaryAction} type="button" onClick={handleSkipCountdown}>Pular countdown</button>
                {autoSequenceStatus === 'paused' ? (
                  <button type="button" onClick={handleResumeSequence}>Continuar sequencia</button>
                ) : (
                  <button type="button" onClick={handlePauseSequence}>Pausar sequencia</button>
                )}
              </>
            ) : phase === 'buzz_open' ? (
              <>
                <button className={styles.primaryAction} type="button" onClick={handleToggleTimerPause}>Pausar rodada</button>
                <button type="button" onClick={() => handleMesaInput('A')}>Mesa A</button>
                <button type="button" onClick={() => handleMesaInput('B')}>Mesa B</button>
                <button type="button" onClick={() => void handleReopenTurn()}>Reabrir botao de vez</button>
              </>
            ) : phase === 'scoring' || phase === 'time_up' || (phase === 'answer_locked' && roundFeedback !== 'none') ? (
              <>
                <button className={styles.primaryAction} type="button" onClick={finishFeedback}>
                  Encerrar feedback
                </button>
                <button type="button" disabled>{Math.ceil(feedbackRemainingMs / 1000)}s</button>
              </>
            ) : phase === 'team_answering' || phase === 'answer_locked' ? (
              <span className={styles.countdownPill}>Use o painel Decisao</span>
            ) : phase === 'tribunal_challenge' ? (
              <span className={styles.countdownPill}>Resolver no painel Decisao</span>
            ) : phase === 'game_over' ? (
              <>
                <button type="button" onClick={handleCloseFinalShow} disabled={finalShowStatus === 'closed'}>Encerrar e voltar para espera</button>
                <button type="button" onClick={() => void handleRestartFinishedGame()}>Reiniciar partida</button>
              </>
            ) : phase === 'round_end' ? (
              <button type="button" disabled>Use a acao principal</button>
            ) : (
              <button className={styles.primaryAction} type="button" disabled>Acompanhar</button>
            )}
          </div>
          <div className={styles.operationAudio}>
            <a className={styles.audioLink} href="/stage" target="_blank" rel="noreferrer">Abrir Stage</a>
            <button type="button" onClick={handleToggleMute}>{publicAudioMuted ? 'Com som' : 'Mudo'}</button>
            <label>
              <span>Volume</span>
              <input
                aria-label="Volume master"
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(publicAudioMasterVolume * 100)}
                onChange={(event) => handleMasterVolumeChange(event.currentTarget.value)}
              />
            </label>
          </div>
        </div>
      </section>
      </AdminOperationPanel>
        </div>

        <div className={styles.adminSideColumn}>
          <AdminStagePreview>
            <div className={styles.previewHeader}>
              <div>
                <span className={styles.eyebrow}>Preview TV</span>
                <strong>{stageStatusLabel}</strong>
              </div>
              <a className={styles.audioLink} href="/stage" target="_blank" rel="noreferrer">Abrir Stage</a>
            </div>
            <div className={styles.tvPreview} aria-label="Preview read-only da Stage">
              <QuestionCard question={currentRoundQuestion} compact />
            </div>
            <dl className={styles.stats}>
              <div><dt>Audio</dt><dd>{stageAudioStatus?.unlocked ? (publicAudioMuted ? 'ativo/mudo' : 'ativo') : 'ativar na TV'}</dd></div>
              <div><dt>Heartbeat</dt><dd>{stageHeartbeatAgeMs === null ? '--' : `${Math.round(stageHeartbeatAgeMs / 1000)}s`}</dd></div>
            </dl>
          </AdminStagePreview>

          <AdminDecisionPanel>
            <h2>Dados da partida</h2>
            <dl className={styles.stats}>
              <div><dt>Rodada</dt><dd>{currentRound}/{totalRounds}</dd></div>
              <div><dt>Jogador</dt><dd>{activeSlot}</dd></div>
              <div><dt>Placar</dt><dd>{scoreA} x {scoreB}</dd></div>
              <div><dt>Grupo</dt><dd>{activeGroup ?? tribunalCalledGroup ?? '--'}</dd></div>
              <div><dt>Cronometro tecnico</dt><dd>{timerStatus} / {timerRemaining}s</dd></div>
              <div><dt>Feedback</dt><dd>{FEEDBACK_LABELS[roundFeedback]}</dd></div>
            </dl>
          </AdminDecisionPanel>

          <AdminDecisionPanel>
            <h2>Decisao</h2>
            <div className={styles.answerBox}>
              <span>{getQuestionKindLabel(currentRoundQuestion)}</span>
              <strong>{getOperatorPrompt(currentRoundQuestion)}</strong>
              <small data-testid="correct-option">Correta: {getCorrectAnswerLabel(currentRoundQuestion)}</small>
              <small data-testid="correct-reference">Referencia: {getCorrectAnswerReference(currentRoundQuestion)}</small>
              {currentRoundQuestion?.type === 'character_image' ? (
                <small>Alias: {currentRoundQuestion.aliases.join(', ') || '--'}</small>
              ) : null}
              <small>
                {phase === 'tribunal_challenge'
                  ? 'Tribunal: correto +20 / errado -10'
                  : 'Normal: correto +10 / erro +5 rival / silencio -10 e rival +10'}
              </small>
            </div>
            <div className={styles.decisionActions}>
              {phase === 'team_answering' || phase === 'answer_locked' ? (
                isChoiceQuestion(currentRoundQuestion) ? (
                  <>
                    <button className={selectedChoice === 'A' ? styles.selectedChoice : styles.commandButton} type="button" onClick={() => handleChoice('A')}>A</button>
                    <button className={selectedChoice === 'B' ? styles.selectedChoice : styles.commandButton} type="button" onClick={() => handleChoice('B')}>B</button>
                    <button className={styles.commandButtonPrimary} type="button" onClick={() => void handleConfirmChoice()} disabled={!activeGroup || !selectedChoice}>Confirmar A/B</button>
                    <button className={styles.commandButtonGhost} type="button" onClick={() => void handleReopenTurn()}>Reabrir vez</button>
                  </>
                ) : (
                  <>
                    <button className={styles.correctButton} type="button" aria-label="Marcar correto" onClick={() => void handleMarkCorrect()}>CORRETO</button>
                    <button className={styles.wrongButton} type="button" onClick={() => void handleWrong()}>ERRADO</button>
                    <button className={styles.commandButtonGhost} type="button" onClick={() => void handleReopenTurn()}>Reabrir vez</button>
                  </>
                )
              ) : phase === 'tribunal_challenge' ? (
                <>
                  <button className={styles.commandButtonPrimary} type="button" onClick={handleTribunalRisk} disabled={tribunalStatus !== 'awaiting_decision'}>Arriscar</button>
                  <button className={styles.commandButton} type="button" onClick={() => void handleTribunalPass()} disabled={tribunalStatus !== 'awaiting_decision'}>Passar</button>
                  <button className={styles.correctButton} type="button" aria-label="Correto (+20)" onClick={() => void handleTribunalResolve('correct')} disabled={tribunalStatus !== 'attempting'}>Correto (+20)</button>
                  <button className={styles.wrongButton} type="button" onClick={() => void handleTribunalResolve('wrong')} disabled={tribunalStatus !== 'attempting'}>Errado (-10)</button>
                </>
              ) : (
                <span className={styles.decisionStandby}>Nada para julgar agora.</span>
              )}
            </div>
            {phase === 'tribunal_challenge' ? (
              <p className={styles.tribunalMeta}>
                Chamado: {tribunalCalledGroup ?? '--'} / Tentando: {tribunalAttemptingGroup ?? '--'} / Passaram: {tribunalPassedGroups.join(', ') || '--'}
              </p>
            ) : null}
          </AdminDecisionPanel>
        </div>
      </section>

      <AdminTechnicalDrawer open={technicalOpen} onToggle={setTechnicalOpen}>
      <section className={styles.grid} aria-label="Controles tecnicos do quiz">
        <section className={styles.panel}>
          <h2>Operacao</h2>
          <dl className={styles.stats}>
            <div><dt>Status</dt><dd>{PRE_SHOW_LABELS[preShowStatus]}</dd></div>
            <div><dt>Etapa</dt><dd>{PRE_SHOW_SCENE_LABELS[preShowScene.id]}</dd></div>
            <div><dt>Progresso</dt><dd>{Math.round(preShowElapsedMs / 1000)}s</dd></div>
            <div><dt>Teste mesa</dt><dd>{preShowInputCheckStatus}</dd></div>
            <div><dt>Mesas OK</dt><dd>{preShowInputCheckReceivedGroups.length ? preShowInputCheckReceivedGroups.join(', ') : '--'}</dd></div>
            <div><dt>Ultimo sinal</dt><dd>{preShowInputCheckLastGroup ?? '--'}</dd></div>
          </dl>
          <div className={styles.actions}>
            <button className={styles.primaryAction} type="button" onClick={playPreShow}>Iniciar pre-show</button>
            <button type="button" onClick={handleTogglePreShowPause}>
              {preShowStatus === 'paused' ? 'Continuar pre-show' : 'Pausar pre-show'}
            </button>
            <button type="button" onClick={handleSkipPreShow}>Pular abertura</button>
            <button type="button" onClick={restartPreShow}>Reiniciar pre-show</button>
            <button type="button" onClick={restartPreShowBriefing}>Reiniciar Como funciona</button>
            <button type="button" onClick={handleTogglePreShowInputCheck}>
              {preShowInputCheckStatus === 'idle' || preShowInputCheckStatus === 'complete' ? 'Liberar teste da mesa' : 'Encerrar teste'}
            </button>
            <button type="button" onClick={requestNextPreShowInputCheck}>Pedir proximo sinal</button>
            <button type="button" onClick={finishPreShow}>Avancar para pronto</button>
            <button className={styles.primaryAction} type="button" onClick={startQuiz}>Iniciar quiz</button>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.audioPanel}`}>
          <h2>Audio da TV</h2>
          <dl className={styles.stats}>
            <div><dt>Stage</dt><dd>{stageAudioStatus?.unlocked ? 'ativa' : 'aguardando toque na TV'}</dd></div>
            <div><dt>Saida</dt><dd>{publicAudioMuted ? 'mudo' : 'com som'}</dd></div>
            <div><dt>Loops</dt><dd>{stageAudioStatus?.activeLoops.length ? stageAudioStatus.activeLoops.join(', ') : '--'}</dd></div>
            <div><dt>Erro</dt><dd>{stageAudioStatus?.lastError ?? '--'}</dd></div>
          </dl>
          <div className={styles.audioControls}>
            <a className={styles.audioLink} href="/stage" target="_blank" rel="noreferrer">
              Abrir Stage
            </a>
            <button type="button" onClick={handleToggleMute}>
              {publicAudioMuted ? 'Com som' : 'Mudo'}
            </button>
            <label>
              <span>Volume</span>
              <input
                aria-label="Volume master"
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(publicAudioMasterVolume * 100)}
                onChange={(event) => handleMasterVolumeChange(event.currentTarget.value)}
              />
            </label>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.previewPanel}`}>
          <h2>Preview TV</h2>
          <div className={styles.tvPreview} aria-label="Preview read-only da Stage">
            <div className={styles.previewPlaceholder}>
              Preview principal fica no painel de operacao para evitar renderizacao duplicada.
            </div>
          </div>
          <dl className={styles.stats}>
            <div><dt>Tipo</dt><dd>{getQuestionKindLabel(currentRoundQuestion)}</dd></div>
            <div><dt>Modo</dt><dd>{quizMode === 'tie_breaker' ? `Veredito ${tieBreakerAttempt + 1}` : 'Principal'}</dd></div>
          </dl>
        </section>

        <section className={styles.panel}>
          <h2>Partida</h2>
          <dl className={styles.stats}>
            <div><dt>Fase</dt><dd>{formatPhase(phase)}</dd></div>
            <div><dt>Rodada</dt><dd>{currentRound}/{totalRounds}</dd></div>
            <div><dt>Jogador</dt><dd>{activeSlot}</dd></div>
            <div><dt>Grupo com a vez</dt><dd>{activeGroup ?? '--'}</dd></div>
            <div><dt>Placar A</dt><dd>{scoreA}</dd></div>
            <div><dt>Placar B</dt><dd>{scoreB}</dd></div>
            <div><dt>Timer</dt><dd>{timerStatus} / {timerRemaining}s</dd></div>
            <div><dt>Feedback</dt><dd>{FEEDBACK_LABELS[roundFeedback]}</dd></div>
            <div><dt>Sequencia</dt><dd>{autoSequenceStatus}</dd></div>
            <div><dt>Countdown</dt><dd>{roundIntroStatus} / {formatCountdown(roundIntroRemainingMs)}</dd></div>
            <div><dt>Delay atual</dt><dd>{roundIntroDelayMs ? `${Math.ceil(roundIntroDelayMs / 1000)}s` : '--'}</dd></div>
            <div><dt>Duracao do feedback</dt><dd>{postFeedbackDelayMs ? `${Math.ceil(postFeedbackDelayMs / 1000)}s` : '--'}</dd></div>
            <div><dt>Ultima pontuacao</dt><dd>{lastScoredGroup ? `Grupo ${lastScoredGroup} +${lastScoreDelta}` : '--'}</dd></div>
            <div><dt>Vencedor</dt><dd>{winner ? `Grupo ${winner}` : '--'}</dd></div>
            <div><dt>Fechamento</dt><dd>{winReason ?? '--'}</dd></div>
            <div><dt>Final Show</dt><dd>{finalShowStatus}</dd></div>
          </dl>
          <div className={styles.actions}>
            {autoSequenceStatus === 'running' ? (
              <button className={styles.primaryAction} type="button" onClick={handlePauseSequence}>Pausar sequencia</button>
            ) : autoSequenceStatus === 'paused' ? (
              <button className={styles.primaryAction} type="button" onClick={handleResumeSequence}>Continuar sequencia</button>
            ) : (
              <button className={styles.primaryAction} type="button" onClick={() => void handleStartSequence()}>Iniciar rodada</button>
            )}
            <button type="button" onClick={() => void handleStartRound()} disabled={autoSequenceStatus === 'running' || autoSequenceStatus === 'paused'}>
              Iniciar rodada manual
            </button>
            <button type="button" onClick={handleToggleTimerPause}>
              {timerStatus === 'paused' ? 'Retomar rodada' : 'Pausar rodada'}
            </button>
            <button type="button" onClick={() => void handleReopenTurn()}>Reabrir botao de vez</button>
            <button type="button" onClick={handleSkipCountdown} disabled={phase !== 'round_countdown'}>Pular countdown</button>
            <button type="button" onClick={() => void handleForceNextRound()}>Forcar proximo round</button>
            <button type="button" onClick={handleEndSequence} disabled={autoSequenceStatus !== 'running' && autoSequenceStatus !== 'paused'}>Encerrar sequencia</button>
            <button type="button" onClick={() => void handleNextRound()}>Proximo round manual</button>
            <button type="button" onClick={() => void handleResetRound()} className={styles.dangerAction}>Reset rodada</button>
            <button type="button" onClick={() => void handleResetGame()} className={styles.dangerAction}>Resetar partida</button>
          </div>
        </section>

        {tribunalPanelVisible ? (
          <section className={`${styles.panel} ${styles.tribunalPanel}`} aria-label="Controles do Desafio do Tribunal">
            <h2>Desafio do Tribunal</h2>
            <dl className={styles.stats}>
              <div><dt>Status</dt><dd>{tribunalStatus}</dd></div>
              <div><dt>Grupo chamado</dt><dd>{tribunalCalledGroup ? `Grupo ${tribunalCalledGroup}` : '--'}</dd></div>
              <div><dt>Arriscando</dt><dd>{tribunalAttemptingGroup ? `Grupo ${tribunalAttemptingGroup}` : '--'}</dd></div>
              <div><dt>Passaram</dt><dd>{tribunalPassedGroups.length ? tribunalPassedGroups.join(', ') : '--'}</dd></div>
              <div><dt>Resultado</dt><dd>{tribunalOutcome ?? '--'}</dd></div>
            </dl>
            <div className={styles.answerBox}>
              <span>Sem pontuacao automatica</span>
              <strong>{tribunalCalledGroup ? `Grupo ${tribunalCalledGroup}: Arriscar ou Passar` : 'Aguardando chamada do tribunal'}</strong>
              <small>Dois passes encerram com: O tribunal registra silêncio nos autos.</small>
            </div>
            <div className={styles.actions}>
              <button className={styles.primaryAction} type="button" onClick={handleTribunalRisk} disabled={phase !== 'tribunal_challenge' || tribunalStatus !== 'awaiting_decision'}>
                Arriscar
              </button>
              <button type="button" onClick={() => void handleTribunalPass()} disabled={phase !== 'tribunal_challenge' || tribunalStatus !== 'awaiting_decision'}>
                Passar
              </button>
              <button className={styles.primaryAction} type="button" onClick={() => void handleTribunalResolve('correct')} disabled={phase !== 'tribunal_challenge' || tribunalStatus !== 'attempting'}>
                Correto (+20)
              </button>
              <button type="button" onClick={() => void handleTribunalResolve('wrong')} disabled={phase !== 'tribunal_challenge' || tribunalStatus !== 'attempting'}>
                Errado (-10)
              </button>
              <button type="button" onClick={() => void handleCancelTribunal()} disabled={phase !== 'tribunal_challenge'}>
                Cancelar desafio
              </button>
            </div>
          </section>
        ) : null}

        {finalShowPanelVisible ? (
          <section className={`${styles.panel} ${styles.finalShowPanel}`} aria-label="Controles do Final Show">
            <h2>Final Show</h2>
            <dl className={styles.stats}>
              <div><dt>Status</dt><dd>{finalShowStatus}</dd></div>
              <div><dt>Vencedor</dt><dd>{winner ? `Grupo ${winner}` : '--'}</dd></div>
              <div><dt>Placar</dt><dd>{scoreA} x {scoreB}</dd></div>
              <div><dt>Diferenca</dt><dd>{Math.abs(scoreA - scoreB)} pontos</dd></div>
            </dl>
            <div className={styles.answerBox}>
              <span>Proxima acao</span>
              <strong>{finalShowStatus === 'closed' ? 'Final Show fechado na Stage' : 'Final Show publico ativo'}</strong>
              <small>Encerramento de evento com card vencedor, placar e diferenca.</small>
            </div>
            <div className={styles.actions}>
              <button className={styles.primaryAction} type="button" onClick={handleOpenFinalShow}>
                Abrir Final Show
              </button>
              <button type="button" onClick={handleReplayFinalShow}>
                Repetir Final Show
              </button>
              <button type="button" onClick={handleCloseFinalShow} disabled={finalShowStatus === 'closed'}>
                Encerrar e voltar para espera
              </button>
              <button type="button" onClick={() => void handleRestartFinishedGame()} className={styles.dangerAction}>
                Reiniciar partida
              </button>
            </div>
          </section>
        ) : null}

        <section className={styles.panel}>
          <h2>Resposta</h2>
          <div className={styles.answerBox}>
            <span>{getQuestionKindLabel(currentRoundQuestion)}</span>
            <strong>{getOperatorPrompt(currentRoundQuestion)}</strong>
            <small data-testid="correct-option">Correta: {getCorrectAnswerLabel(currentRoundQuestion)}</small>
            <small data-testid="correct-reference">Referencia: {getCorrectAnswerReference(currentRoundQuestion)}</small>
            {currentRoundQuestion?.type === 'character_image' ? (
              <small>Alias: {currentRoundQuestion.aliases.join(', ') || '--'}</small>
            ) : null}
            {quizMode === 'tie_breaker' && tieBreakerBlockedGroups.length > 0 ? (
              <small>Bloqueados: {tieBreakerBlockedGroups.join(', ')}</small>
            ) : null}
          </div>
          {isChoiceQuestion(currentRoundQuestion) ? (
            <div className={styles.choiceControls} aria-label="Resposta A/B do operador">
              <button
                className={selectedChoice === 'A' ? styles.selectedChoice : ''}
                type="button"
                onClick={() => handleChoice('A')}
              >
                A
              </button>
              <button
                className={selectedChoice === 'B' ? styles.selectedChoice : ''}
                type="button"
                onClick={() => handleChoice('B')}
              >
                B
              </button>
              <button
                className={styles.primaryAction}
                type="button"
                onClick={() => void handleConfirmChoice()}
                disabled={!activeGroup || !selectedChoice}
              >
                Confirmar A/B
              </button>
              <button type="button" onClick={() => void handleReopenTurn()}>Reabrir vez</button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button className={styles.primaryAction} type="button" onClick={() => void handleMarkCorrect()}>Marcar correto</button>
              <button type="button" onClick={() => void handleWrong()}>Errada</button>
              <button type="button" onClick={() => void handleReopenTurn()}>Reabrir vez</button>
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <h2>Historico</h2>
          <dl className={styles.stats}>
            <div><dt>Eventos</dt><dd>{historyEvents.length}</dd></div>
            <div><dt>Ultimo evento</dt><dd>{historyEvents.at(-1)?.event ?? '--'}</dd></div>
          </dl>
          <div className={styles.actions}>
            <button className={styles.primaryAction} type="button" onClick={handleExportMatchSession} disabled={historyEvents.length === 0}>
              CSV da partida
            </button>
            <button className={styles.primaryAction} type="button" onClick={handleExportHistory} disabled={historyEvents.length === 0}>
              CSV de eventos
            </button>
            <button type="button" onClick={handleClearHistory} disabled={historyEvents.length === 0}>
              Limpar historico
            </button>
          </div>
          <ol className={styles.historyList} aria-label="Ultimos eventos do historico">
            {historyEvents.slice(-6).reverse().map((event) => (
              <li key={event.id}>
                <span>{event.event}</span>
                <small>R{event.round} {event.group ? `G${event.group}` : '--'} {event.result}</small>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.panel}>
          <h2>Mesa/Arduino</h2>
          <dl className={styles.stats}>
            <div><dt>Suporte</dt><dd>{supported ? 'Web Serial OK' : 'sem Web Serial'}</dd></div>
            <div><dt>Status</dt><dd>{serialStatus}</dd></div>
            <div><dt>Evento</dt><dd>{serialLastEvent ?? '--'}</dd></div>
            <div><dt>Comando</dt><dd>{serialLastCommand ?? '--'}</dd></div>
            <div><dt>DFPlayer</dt><dd>{dfPlayerReady === null ? '--' : dfPlayerReady ? 'ready' : 'error'}</dd></div>
            <div><dt>Erro</dt><dd>{serialError ?? '--'}</dd></div>
          </dl>
          <div className={styles.actions}>
            <button type="button" onClick={() => void handleToggleArduinoConnection()} disabled={!supported || serialStatus === 'connecting'}>
              {serialStatus === 'connected' ? 'Desconectar mesa' : 'Conectar mesa'}
            </button>
            <button type="button" onClick={() => void sendSerial('Manual', 'PING', ping)}>Ping</button>
            <button type="button" onClick={() => void sendSerial('Manual', 'STATUS', status)}>Status</button>
            <button type="button" onClick={() => void runUnlock()}>Enviar UNLOCK</button>
            <button type="button" onClick={() => void runLock()}>Enviar LOCK</button>
            <button type="button" className={styles.dangerAction} onClick={() => void handleTechnicalResetHardware()}>Enviar RESET_HW</button>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.logPanel}`}>
          <h2>Log</h2>
          <ol className={styles.logList} aria-label="Log de eventos">
            {gameLog.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ol>
        </section>
      </section>
      </AdminTechnicalDrawer>
      <AdminHelpModal
        open={helpOpen}
        query={helpQuery}
        onQueryChange={setHelpQuery}
        onClose={() => setHelpOpen(false)}
        returnFocusRef={helpButtonRef}
      />
    </AdminShell>
  )
}
