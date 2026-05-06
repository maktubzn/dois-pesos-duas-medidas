import { create } from 'zustand'
import type {
  AutoSequenceStatus,
  ChoiceOption,
  FinalShowStatus,
  GameHistoryEvent,
  GameStateSnapshot,
  GroupId,
  InputSource,
  InputTelemetryEvent,
  PreShowInputCheckStatus,
  QuizMode,
  QuizQuestion,
  QuizPhase,
  RoundIntroStatus,
  RoundFeedback,
  SerialEventName,
  SerialMessage,
  SerialStatus,
  TimerStatus,
  WinReason,
} from '@/types/game.types'
import { buildQuizSession, getCurrentRoundQuestion, getTieBreakerQuestion, isTieAfterMainRounds, selectTribunalCalledGroup } from '@/utils/quizAlgorithm'
import { clearStoredHistoryEvents, loadHistoryEvents, saveHistoryEvents } from '@/utils/historyStorage'
import { buildRoundIntroSchedule, getPostFeedbackDelay, getRoundIntroDelay } from '@/utils/roundSequence'
import { normalizeScore } from '@/utils/score'
import {
  getPreShowScene,
  PRE_SHOW_HOW_TO_PLAY_START_MS,
  PRE_SHOW_INPUT_CHECK_START_MS,
  PRE_SHOW_MAX_AUTO_TICK_MS,
  PRE_SHOW_TRIBUNAL_RULE_START_MS,
  PRE_SHOW_TOTAL_MS,
} from '@/utils/preShowTimeline'
import { serialEventToGroup } from '@/utils/serialEventToGroup'

const INITIAL_QUESTION = 'Pergunta preparada'
const TOTAL_ROUNDS = 10
const ANSWER_TIME_SECONDS = 20
const ANSWER_RESPONSE_SECONDS = 20
const NO_ANSWER_ACTIVE_PENALTY_POINTS = -10
const NO_ANSWER_OPPONENT_BONUS_POINTS = 10
const TRIBUNAL_DECISION_SECONDS = 20
const FEEDBACK_DISPLAY_MS = 3_000
const RESET_HW_DEBOUNCE_MS = 2_000
const MAX_LOG_ITEMS = 80
const NORMAL_CORRECT_POINTS = 10
const WRONG_OPPONENT_BONUS_POINTS = 5
const TRIBUNAL_CORRECT_POINTS = 20
const TRIBUNAL_WRONG_POINTS = -10
const TRIBUNAL_SILENCE_MESSAGE = 'O tribunal registra silêncio nos autos.'

export interface GameState extends GameStateSnapshot {
  timerSeconds: number
  appendLog: (message: string) => void
  playPreShow: () => void
  pausePreShow: () => void
  resumePreShow: () => void
  skipPreShow: () => void
  restartPreShow: () => void
  restartPreShowBriefing: () => void
  finishPreShow: () => void
  tickPreShow: (elapsedMs?: number) => void
  startPreShowInputCheck: () => void
  requestNextPreShowInputCheck: () => void
  resetPreShowInputCheck: () => void
  receivePreShowInputCheck: (group: GroupId, source: InputSource) => void
  startQuiz: () => void
  startNewQuiz: () => void
  nextRound: () => void
  nextQuestion: () => void
  startNewQuestion: () => void
  revealQuestion: () => void
  openBuzz: () => void
  prepareRoundInput: () => void
  markInputReady: () => void
  receiveInput: (group: GroupId, source: InputSource) => void
  receiveBuzz: (group: GroupId) => void
  receiveHardwareBuzz: (eventName: string) => void
  receiveKeyboardBuzz: (group: GroupId) => void
  lockBuzz: () => void
  passQuestion: () => void
  repassQuestion: () => void
  markCorrect: (points?: number) => void
  markWrong: () => void
  awardPoints: (group: GroupId, amount?: number) => void
  addPoints: (group: GroupId, amount: number) => void
  startTribunalChallenge: () => void
  tribunalRisk: () => void
  resolveTribunalAttempt: (result: 'correct' | 'wrong') => void
  tribunalPass: () => void
  cancelTribunalChallenge: () => void
  selectChoice: (choice: ChoiceOption) => void
  confirmChoice: () => void
  reopenTurn: () => void
  finishRound: () => void
  resetRound: () => void
  resetGame: () => void
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  tickTimer: (seconds?: number) => void
  tickFeedback: (elapsedMs?: number) => void
  finishFeedback: () => void
  setSerialStatus: (status: SerialStatus) => void
  setSerialLastCommand: (command: string) => void
  handleSerialMessage: (message: SerialMessage) => void
  clearHistory: () => void
  openFinalShow: () => void
  replayFinalShow: () => void
  closeFinalShow: () => void
  startRoundSequence: () => void
  pauseRoundSequence: () => void
  resumeRoundSequence: () => void
  endRoundSequence: () => void
  enterRoundCountdown: () => void
  tickRoundCountdown: (elapsedMs?: number) => void
  skipRoundCountdown: () => void
  finishRoundCountdown: () => void
  scheduleAutoNextRound: () => void
  forceNextRoundTechnical: () => void
  completeAutoSequence: () => void
  setPublicAudioMuted: (muted: boolean) => void
  setPublicAudioMasterVolume: (volume: number) => void
  applySnapshot: (snapshot: GameStateSnapshot) => void
  getSnapshot: () => GameStateSnapshot
}

function appendLogItem(log: string[], message: string) {
  const previousMessage = log[0]?.replace(/^\d{2}:\d{2}:\d{2}\s+/, '')
  if (previousMessage === message) return log
  const time = new Date().toLocaleTimeString('pt-BR', { hour12: false })
  return [`${time} ${message}`, ...log].slice(0, MAX_LOG_ITEMS)
}

function getOpponentGroup(group: GroupId): GroupId {
  return group === 'A' ? 'B' : 'A'
}

function currentClockMs() {
  // Shared across Admin and Stage windows. performance.now has per-window origins.
  return Date.now()
}

function clampMs(value: number, max: number) {
  return Math.min(Math.max(value, 0), max)
}

function getClockTickNow(lastTickAtMs: number | null, startedAtMs: number | null, elapsedMs?: number) {
  if (typeof elapsedMs === 'number') {
    return (lastTickAtMs ?? startedAtMs ?? currentClockMs()) + Math.max(0, elapsedMs)
  }
  return currentClockMs()
}

function getElapsedFromClock(
  startedAtMs: number | null,
  pausedAtMs: number | null,
  accumulatedPauseMs: number,
  durationMs: number,
  nowMs: number,
) {
  if (startedAtMs === null) return 0
  const effectiveNow = pausedAtMs ?? nowMs
  return clampMs(effectiveNow - startedAtMs - accumulatedPauseMs, durationMs)
}

function getRemainingFromClock(
  startedAtMs: number | null,
  pausedAtMs: number | null,
  accumulatedPauseMs: number,
  durationMs: number,
  nowMs: number,
) {
  return clampMs(durationMs - getElapsedFromClock(startedAtMs, pausedAtMs, accumulatedPauseMs, durationMs, nowMs), durationMs)
}

function preShowClockFields(elapsedMs: number, durationMs = PRE_SHOW_TOTAL_MS) {
  const now = currentClockMs()
  const startedAt = now - clampMs(elapsedMs, durationMs)
  return {
    preShowStartedAtMs: startedAt,
    preShowDurationMs: durationMs,
    preShowEndsAtMs: startedAt + durationMs,
    preShowPausedAtMs: null,
    preShowAccumulatedPauseMs: 0,
    preShowLastTickAtMs: now,
  }
}

function timerClockFields(durationSeconds: number) {
  const now = currentClockMs()
  return {
    timerStartedAtMs: now,
    timerDurationMs: durationSeconds * 1000,
    timerEndsAtMs: now + durationSeconds * 1000,
    timerPausedAtMs: null,
    timerAccumulatedPauseMs: 0,
    timerLastTickAtMs: now,
  }
}

function resetTimerClockFields() {
  return {
    timerStartedAtMs: null,
    timerDurationMs: ANSWER_TIME_SECONDS * 1000,
    timerEndsAtMs: null,
    timerPausedAtMs: null,
    timerAccumulatedPauseMs: 0,
    timerLastTickAtMs: null,
  }
}

function resetInputFields() {
  return {
    inputReady: false,
    inputReadyAtMs: null,
    inputReadyToken: null,
    lastInputEvent: null,
  }
}

function feedbackClockFields(durationMs = FEEDBACK_DISPLAY_MS) {
  const now = currentClockMs()
  return {
    feedbackStartedAtMs: now,
    feedbackDurationMs: durationMs,
    feedbackEndsAtMs: now + durationMs,
    feedbackRemainingMs: durationMs,
    feedbackToken: createId('feedback'),
  }
}

function resetFeedbackClockFields() {
  return {
    feedbackStartedAtMs: null,
    feedbackDurationMs: FEEDBACK_DISPLAY_MS,
    feedbackEndsAtMs: null,
    feedbackRemainingMs: 0,
    feedbackToken: null,
  }
}

function roundIntroClockFields(delayMs: number) {
  const now = currentClockMs()
  return {
    roundIntroStartedAtMs: now,
    roundIntroEndsAtMs: now + delayMs,
    roundIntroPausedAtMs: null,
    roundIntroAccumulatedPauseMs: 0,
    roundIntroLastTickAtMs: now,
    roundIntroDelayMs: delayMs,
    roundIntroRemainingMs: delayMs,
  }
}

function resetRoundIntroClockFields() {
  return {
    roundIntroStartedAtMs: null,
    roundIntroEndsAtMs: null,
    roundIntroPausedAtMs: null,
    roundIntroAccumulatedPauseMs: 0,
    roundIntroLastTickAtMs: null,
  }
}

function createId(prefix: string) {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}-${randomPart}`
}

function getPromptForQuestion(question: QuizQuestion | null) {
  if (!question) return INITIAL_QUESTION
  if (question.type === 'character_image') return 'Quem é este personagem?'
  return question.prompt
}

function getQuestionCorrectAnswer(question: QuizQuestion | null) {
  if (!question) return null
  if (question.type === 'character_image') return question.characterName
  return question.correctOption
}

function getQuestionImage(question: QuizQuestion | null) {
  return question?.type === 'character_image' ? question.imageSrc : null
}

function appendHistoryEvent(
  state: GameState,
  event: GameHistoryEvent['event'],
  result: GameHistoryEvent['result'],
  options: Partial<GameHistoryEvent> = {},
) {
  const question = state.currentRoundQuestion
  const nextEvent: GameHistoryEvent = {
    id: createId('event'),
    matchId: state.matchId ?? 'match-pendente',
    timestamp: new Date().toISOString(),
    seed: state.quizSeed ?? '',
    mode: state.quizMode,
    event,
    round: state.currentRound,
    questionType: question?.type ?? null,
    questionId: question?.id ?? null,
    imageSrc: getQuestionImage(question),
    prompt: getPromptForQuestion(question),
    optionA: question?.type === 'text_choice' || question?.type === 'tie_breaker' ? question.optionA : null,
    optionB: question?.type === 'text_choice' || question?.type === 'tie_breaker' ? question.optionB : null,
    correctAnswer: getQuestionCorrectAnswer(question),
    group: state.activeGroup,
    playerChoice: state.selectedChoice,
    result,
    scoreBeforeA: state.scoreA,
    scoreBeforeB: state.scoreB,
    scoreAfterA: state.scoreA,
    scoreAfterB: state.scoreB,
    timerRemaining: state.timerRemaining,
    source: 'system',
    ...options,
  }
  const historyEvents = [...state.historyEvents, nextEvent]
  saveHistoryEvents(historyEvents)
  return historyEvents
}

function getActiveSlot(round: number) {
  return ((round - 1) % 5) + 1
}

function getTieBreakerFields(state: GameState, attempt = state.tieBreakerAttempt) {
  const question = getTieBreakerQuestion(state.quizSession, attempt)

  return {
    quizMode: 'tie_breaker' as QuizMode,
    currentRoundQuestion: question,
    currentQuestion: getPromptForQuestion(question),
    currentRound: state.totalRounds,
    activeSlot: getActiveSlot(state.totalRounds),
    tieBreakerAttempt: attempt,
    tieBreakerBlockedGroups: [],
    selectedChoice: null,
    phase: 'round_prepare' as QuizPhase,
    timerRemaining: state.answerTimeSeconds,
    timerSeconds: state.answerTimeSeconds,
    timerStatus: 'idle' as TimerStatus,
    timerVisible: false,
    questionVisible: false,
    activeGroup: null,
    lastBuzz: null,
    buzzLocked: false,
    roundFeedback: 'none' as RoundFeedback,
    lastScoredGroup: null,
    lastScoreDelta: 0,
  }
}

function resetRoundFields(state: GameState) {
  return {
    ...resetTribunalFields(),
    ...resetFeedbackClockFields(),
    lastBuzz: null,
    activeGroup: null,
    buzzLocked: false,
    ...resetInputFields(),
    questionVisible: false,
    timerVisible: false,
    timerSeconds: 0,
    timerRemaining: state.answerTimeSeconds,
    ...resetTimerClockFields(),
    timerStatus: 'idle' as TimerStatus,
    roundFeedback: 'none' as RoundFeedback,
    lastScoredGroup: null,
    lastScoreDelta: 0,
    selectedChoice: null,
  }
}

function resetFinalShowFields() {
  return {
    finalShowStatus: 'idle' as FinalShowStatus,
  }
}

function getNextPreShowInputCheckStatus(receivedGroups: GroupId[]): PreShowInputCheckStatus {
  if (!receivedGroups.includes('A')) return 'waitingA'
  if (!receivedGroups.includes('B')) return 'waitingB'
  return 'complete'
}

function resetTribunalFields() {
  return {
    tribunalStatus: 'idle' as const,
    tribunalCalledGroup: null,
    tribunalPassedGroups: [],
    tribunalAttemptingGroup: null,
    tribunalOutcome: null,
    tribunalStartedAt: null,
    tribunalResolvedAt: null,
  }
}

function buildPreShowInputCheckState(state: GameState, group: GroupId) {
  const receivedGroups = Array.from(new Set([...state.preShowInputCheckReceivedGroups, group]))
  const complete = receivedGroups.includes('A') && receivedGroups.includes('B')

  return {
    preShowInputCheckStatus: complete ? ('complete' as const) : (`received${group}` as PreShowInputCheckStatus),
    preShowInputCheckReceivedGroups: receivedGroups,
    preShowInputCheckLastGroup: group,
  }
}

function buildInputEvent(
  state: GameState,
  group: GroupId,
  source: InputSource,
  accepted: boolean,
  reason: string,
): InputTelemetryEvent {
  return {
    id: createId('input'),
    source,
    group,
    timestamp: currentClockMs(),
    phase: state.phase,
    accepted,
    reason,
  }
}

function appendInputEvent(state: GameState, event: InputTelemetryEvent) {
  return [...state.inputEvents, event].slice(-100)
}

function getInputRejectionReason(state: GameState, group: GroupId) {
  if (state.phase === 'intro') return 'intro'
  if (state.phase !== 'buzz_open') return 'ignored_not_ready'
  if (!state.inputReady) return 'input_not_ready'
  if (state.buzzLocked) return 'buzz_locked'
  if (state.timerStatus !== 'running') return 'timer_not_running'
  if (state.quizMode === 'tie_breaker' && state.tieBreakerBlockedGroups.includes(group)) return 'group_blocked_tie_breaker'
  return null
}

function getInputRawLabel(group: GroupId, rawEvent?: string) {
  return rawEvent ?? `Mesa ${group}`
}

function inputStateSummary(state: GameState) {
  return `phase=${state.phase} inputReady=${state.inputReady} buzzLocked=${state.buzzLocked} timerStatus=${state.timerStatus} preShowInputCheckStatus=${state.preShowInputCheckStatus} activeGroup=${state.activeGroup ?? 'none'}`
}

function inputRejectedState(state: GameState, group: GroupId, source: InputSource, reason: string, rawEvent?: string) {
  const event = buildInputEvent(state, group, source, false, reason)
  return {
    lastInputEvent: event,
    inputEvents: appendInputEvent(state, event),
    gameLog: appendLogItem(
      state.gameLog,
      `INPUT_RECEIVED raw=${getInputRawLabel(group, rawEvent)} source=${source} resolvedGroup=${group} ${inputStateSummary(state)} accepted=false reason=${reason} | INPUT_REJECTED raw=${getInputRawLabel(group, rawEvent)} source=${source} resolvedGroup=${group} ${inputStateSummary(state)} reason=${reason}`,
    ),
  }
}

function buzzStateForGroup(state: GameState, group: GroupId, source: InputSource, rawEvent?: string) {
  const rejectionReason = getInputRejectionReason(state, group)
  if (rejectionReason) {
    return inputRejectedState(state, group, source, rejectionReason, rawEvent)
  }

  // When a group takes turn, start a NEW response timer instead of keeping
  // the remaining time from the 20s buzz window.
  const responseTime = ANSWER_RESPONSE_SECONDS
  const event = buildInputEvent(state, group, source, true, 'accepted')

  return {
    phase: 'team_answering' as QuizPhase,
    lastBuzz: group,
    activeGroup: group,
    buzzLocked: true,
    timerVisible: true,
    timerRemaining: responseTime,
    timerSeconds: responseTime,
    ...timerClockFields(responseTime),
    timerStatus: 'running' as TimerStatus,
    roundFeedback: 'none' as RoundFeedback,
    ...resetFeedbackClockFields(),
    selectedChoice: null,
    lastInputEvent: event,
    inputEvents: appendInputEvent(state, event),
    gameLog: appendLogItem(
      state.gameLog,
      `INPUT_RECEIVED raw=${getInputRawLabel(group, rawEvent)} source=${source} resolvedGroup=${group} ${inputStateSummary(state)} accepted=true reason=accepted | INPUT_ACCEPTED raw=${getInputRawLabel(group, rawEvent)} source=${source} resolvedGroup=${group} ${inputStateSummary(state)} reason=accepted | ANSWER_WINDOW_STARTED group=${group} durationSeconds=${responseTime}`,
    ),
  }
}

function snapshotFromState(state: GameState): GameStateSnapshot {
  return {
    phase: state.phase,
    preShowStatus: state.preShowStatus,
    preShowElapsedMs: state.preShowElapsedMs,
    preShowStartedAtMs: state.preShowStartedAtMs,
    preShowDurationMs: state.preShowDurationMs,
    preShowEndsAtMs: state.preShowEndsAtMs,
    preShowPausedAtMs: state.preShowPausedAtMs,
    preShowAccumulatedPauseMs: state.preShowAccumulatedPauseMs,
    preShowLastTickAtMs: state.preShowLastTickAtMs,
    preShowInputCheckStatus: state.preShowInputCheckStatus,
    preShowInputCheckReceivedGroups: state.preShowInputCheckReceivedGroups,
    preShowInputCheckLastGroup: state.preShowInputCheckLastGroup,
    scoreA: state.scoreA,
    scoreB: state.scoreB,
    serialConnected: state.serialConnected,
    serialStatus: state.serialStatus,
    serialLocked: state.serialLocked,
    serialLastEvent: state.serialLastEvent,
    serialLastCommand: state.serialLastCommand,
    serialError: state.serialError,
    serialResetLastAtMs: state.serialResetLastAtMs,
    serialResetCorrelationId: state.serialResetCorrelationId,
    serialResetSource: state.serialResetSource,
    dfPlayerReady: state.dfPlayerReady,
    lastBuzz: state.lastBuzz,
    activeGroup: state.activeGroup,
    buzzLocked: state.buzzLocked,
    inputReady: state.inputReady,
    inputReadyAtMs: state.inputReadyAtMs,
    inputReadyToken: state.inputReadyToken,
    lastInputEvent: state.lastInputEvent,
    inputEvents: state.inputEvents,
    currentQuestion: state.currentQuestion,
    questionVisible: state.questionVisible,
    timerVisible: state.timerVisible,
    currentRound: state.currentRound,
    totalRounds: state.totalRounds,
    activeSlot: state.activeSlot,
    answerTimeSeconds: state.answerTimeSeconds,
    timerRemaining: state.timerRemaining,
    timerStartedAtMs: state.timerStartedAtMs,
    timerDurationMs: state.timerDurationMs,
    timerEndsAtMs: state.timerEndsAtMs,
    timerPausedAtMs: state.timerPausedAtMs,
    timerAccumulatedPauseMs: state.timerAccumulatedPauseMs,
    timerLastTickAtMs: state.timerLastTickAtMs,
    timerStatus: state.timerStatus,
    roundFeedback: state.roundFeedback,
    feedbackStartedAtMs: state.feedbackStartedAtMs,
    feedbackDurationMs: state.feedbackDurationMs,
    feedbackEndsAtMs: state.feedbackEndsAtMs,
    feedbackRemainingMs: state.feedbackRemainingMs,
    feedbackToken: state.feedbackToken,
    lastScoredGroup: state.lastScoredGroup,
    lastScoreDelta: state.lastScoreDelta,
    quizSession: state.quizSession,
    quizSeed: state.quizSeed,
    matchId: state.matchId,
    quizMode: state.quizMode,
    currentRoundQuestion: state.currentRoundQuestion,
    selectedChoice: state.selectedChoice,
    winner: state.winner,
    winReason: state.winReason,
    finalShowStatus: state.finalShowStatus,
    tieBreakerAttempt: state.tieBreakerAttempt,
    tieBreakerBlockedGroups: state.tieBreakerBlockedGroups,
    tribunalStatus: state.tribunalStatus,
    tribunalCalledGroup: state.tribunalCalledGroup,
    tribunalPassedGroups: state.tribunalPassedGroups,
    tribunalAttemptingGroup: state.tribunalAttemptingGroup,
    tribunalOutcome: state.tribunalOutcome,
    tribunalStartedAt: state.tribunalStartedAt,
    tribunalResolvedAt: state.tribunalResolvedAt,
    autoSequenceStatus: state.autoSequenceStatus,
    roundIntroStatus: state.roundIntroStatus,
    roundIntroDelayMs: state.roundIntroDelayMs,
    roundIntroRemainingMs: state.roundIntroRemainingMs,
    roundIntroStartedAtMs: state.roundIntroStartedAtMs,
    roundIntroEndsAtMs: state.roundIntroEndsAtMs,
    roundIntroPausedAtMs: state.roundIntroPausedAtMs,
    roundIntroAccumulatedPauseMs: state.roundIntroAccumulatedPauseMs,
    roundIntroLastTickAtMs: state.roundIntroLastTickAtMs,
    roundIntroSchedule: state.roundIntroSchedule,
    postFeedbackDelayMs: state.postFeedbackDelayMs,
    autoAdvanceEnabled: state.autoAdvanceEnabled,
    pendingAutomationToken: state.pendingAutomationToken,
    historyEvents: state.historyEvents,
    gameLog: state.gameLog,
    publicAudioMuted: state.publicAudioMuted,
    publicAudioMasterVolume: state.publicAudioMasterVolume,
    lastStateSyncedAtMs: currentClockMs(),
  }
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'intro',
  preShowStatus: 'idle',
  preShowElapsedMs: 0,
  preShowStartedAtMs: null,
  preShowDurationMs: PRE_SHOW_TOTAL_MS,
  preShowEndsAtMs: null,
  preShowPausedAtMs: null,
  preShowAccumulatedPauseMs: 0,
  preShowLastTickAtMs: null,
  preShowInputCheckStatus: 'idle',
  preShowInputCheckReceivedGroups: [],
  preShowInputCheckLastGroup: null,
  scoreA: 0,
  scoreB: 0,
  serialConnected: false,
  serialStatus: 'disconnected',
  serialLocked: false,
    serialLastEvent: null,
    serialLastCommand: null,
    serialError: null,
    serialResetLastAtMs: null,
    serialResetCorrelationId: null,
    serialResetSource: null,
    dfPlayerReady: null,
  lastBuzz: null,
  activeGroup: null,
  buzzLocked: false,
  inputReady: false,
  inputReadyAtMs: null,
  inputReadyToken: null,
  lastInputEvent: null,
  inputEvents: [],
  currentQuestion: INITIAL_QUESTION,
  timerSeconds: 0,
  questionVisible: false,
  timerVisible: false,
  currentRound: 1,
  totalRounds: TOTAL_ROUNDS,
  activeSlot: 1,
  answerTimeSeconds: ANSWER_TIME_SECONDS,
  timerRemaining: ANSWER_TIME_SECONDS,
  ...resetTimerClockFields(),
  timerStatus: 'idle',
  roundFeedback: 'none',
  ...resetFeedbackClockFields(),
  lastScoredGroup: null,
  lastScoreDelta: 0,
  quizSession: null,
  quizSeed: null,
  matchId: null,
  quizMode: 'main',
  currentRoundQuestion: null,
  selectedChoice: null,
  winner: null,
  winReason: null,
  ...resetFinalShowFields(),
  tieBreakerAttempt: 0,
  tieBreakerBlockedGroups: [],
  ...resetTribunalFields(),
  autoSequenceStatus: 'idle',
  roundIntroStatus: 'idle',
  roundIntroDelayMs: 0,
  roundIntroRemainingMs: 0,
  ...resetRoundIntroClockFields(),
  roundIntroSchedule: [],
  postFeedbackDelayMs: 0,
  autoAdvanceEnabled: false,
  pendingAutomationToken: null,
  historyEvents: loadHistoryEvents(),
  gameLog: [],
  publicAudioMuted: false,
  publicAudioMasterVolume: 0.82,
  lastStateSyncedAtMs: null,
  appendLog: (message) =>
    set((state) => ({
      gameLog: appendLogItem(state.gameLog, message),
    })),
  playPreShow: () =>
    set((state) => ({
      phase: 'intro',
      preShowStatus: 'playing',
      preShowElapsedMs: 0,
      ...preShowClockFields(0),
      preShowInputCheckStatus: 'idle',
      preShowInputCheckReceivedGroups: [],
      preShowInputCheckLastGroup: null,
      gameLog: appendLogItem(state.gameLog, 'Pre-show iniciado'),
    })),
  pausePreShow: () =>
    set((state) => {
      if (state.preShowStatus !== 'playing') {
        return {
          preShowStatus: state.preShowStatus,
          gameLog: appendLogItem(state.gameLog, 'Pre-show pausado'),
        }
      }
      const now = Math.max(currentClockMs(), state.preShowLastTickAtMs ?? 0)
      const preShowElapsedMs = getElapsedFromClock(
        state.preShowStartedAtMs,
        null,
        state.preShowAccumulatedPauseMs,
        state.preShowDurationMs,
        now,
      )
      return {
        preShowStatus: 'paused' as const,
        preShowElapsedMs,
        preShowPausedAtMs: now,
        preShowLastTickAtMs: now,
        gameLog: appendLogItem(state.gameLog, 'Pre-show pausado'),
      }
    }),
  resumePreShow: () =>
    set((state) => {
      if (state.preShowStatus !== 'paused') {
        return {
          preShowStatus: state.preShowStatus,
          gameLog: appendLogItem(state.gameLog, 'Pre-show retomado'),
        }
      }
      const now = Math.max(currentClockMs(), state.preShowLastTickAtMs ?? 0)
      return {
        preShowStatus: 'playing' as const,
        preShowPausedAtMs: null,
        preShowAccumulatedPauseMs:
          state.preShowAccumulatedPauseMs + (state.preShowPausedAtMs ? now - state.preShowPausedAtMs : 0),
        preShowEndsAtMs:
          state.preShowEndsAtMs === null || state.preShowPausedAtMs === null
            ? state.preShowEndsAtMs
            : state.preShowEndsAtMs + (now - state.preShowPausedAtMs),
        preShowLastTickAtMs: now,
        gameLog: appendLogItem(state.gameLog, 'Pre-show retomado'),
      }
    }),
  skipPreShow: () =>
    set((state) => ({
      phase: 'intro',
      preShowStatus: 'playing',
      preShowElapsedMs: PRE_SHOW_HOW_TO_PLAY_START_MS,
      ...preShowClockFields(PRE_SHOW_HOW_TO_PLAY_START_MS),
      preShowInputCheckStatus: 'idle',
      preShowInputCheckReceivedGroups: [],
      preShowInputCheckLastGroup: null,
      gameLog: appendLogItem(state.gameLog, 'Abertura pulada: como funciona reiniciado'),
    })),
  restartPreShow: () =>
    set((state) => ({
      phase: 'intro',
      preShowStatus: 'playing',
      preShowElapsedMs: 0,
      ...preShowClockFields(0),
      preShowInputCheckStatus: 'idle',
      preShowInputCheckReceivedGroups: [],
      preShowInputCheckLastGroup: null,
      gameLog: appendLogItem(state.gameLog, 'Pre-show reiniciado'),
    })),
  restartPreShowBriefing: () =>
    set((state) => ({
      phase: 'intro',
      preShowStatus: 'playing',
      preShowElapsedMs: PRE_SHOW_HOW_TO_PLAY_START_MS,
      ...preShowClockFields(PRE_SHOW_HOW_TO_PLAY_START_MS),
      preShowInputCheckStatus: 'idle',
      preShowInputCheckReceivedGroups: [],
      preShowInputCheckLastGroup: null,
      gameLog: appendLogItem(state.gameLog, 'Como funciona reiniciado'),
    })),
  finishPreShow: () =>
    set((state) => ({
      phase: 'intro',
      preShowStatus: 'finished',
      preShowElapsedMs: PRE_SHOW_TOTAL_MS,
      ...preShowClockFields(PRE_SHOW_TOTAL_MS),
      gameLog: appendLogItem(state.gameLog, 'Pre-show finalizado'),
    })),
  tickPreShow: (elapsedMs) =>
    set((state) => {
      if (state.preShowStatus !== 'playing') return {}

      const now = getClockTickNow(state.preShowLastTickAtMs, state.preShowStartedAtMs, elapsedMs)
      const rawComputedPreShowElapsedMs =
        state.preShowStartedAtMs === null
          ? Math.min(PRE_SHOW_TOTAL_MS, state.preShowElapsedMs + (elapsedMs ?? 250))
          : getElapsedFromClock(
              state.preShowStartedAtMs,
              state.preShowPausedAtMs,
              state.preShowAccumulatedPauseMs,
              state.preShowDurationMs,
              now,
            )
      const computedPreShowElapsedMs =
        typeof elapsedMs === 'number'
          ? rawComputedPreShowElapsedMs
          : Math.min(rawComputedPreShowElapsedMs, state.preShowElapsedMs + PRE_SHOW_MAX_AUTO_TICK_MS)
      const preShowElapsedMs =
        computedPreShowElapsedMs >= PRE_SHOW_TOTAL_MS - 1 ? PRE_SHOW_TOTAL_MS : computedPreShowElapsedMs
      const preShowInputCheckStatus =
        state.preShowInputCheckStatus === 'idle' && preShowElapsedMs >= PRE_SHOW_INPUT_CHECK_START_MS
          ? getNextPreShowInputCheckStatus(state.preShowInputCheckReceivedGroups)
          : state.preShowInputCheckStatus
      const previousPreShowScene = getPreShowScene(state.preShowStatus, state.preShowElapsedMs).id
      const nextPreShowScene = getPreShowScene('playing', preShowElapsedMs).id
      const sceneChanged = previousPreShowScene !== nextPreShowScene
      const preShowTestStarted = state.preShowInputCheckStatus === 'idle' && preShowInputCheckStatus !== 'idle'
      const preShowGameLog =
        sceneChanged || preShowTestStarted
          ? [
              sceneChanged ? `PRESHOW_SCENE_SHOWN scene=${nextPreShowScene} elapsedMs=${Math.round(preShowElapsedMs)}` : null,
              preShowTestStarted ? `PRESHOW_TEST_STARTED status=${preShowInputCheckStatus} elapsedMs=${Math.round(preShowElapsedMs)}` : null,
            ].reduce((log, message) => (message ? appendLogItem(log, message) : log), state.gameLog)
          : state.gameLog
      if (preShowElapsedMs >= PRE_SHOW_TOTAL_MS) {
        const inputCheckComplete = state.preShowInputCheckReceivedGroups.includes('A') && state.preShowInputCheckReceivedGroups.includes('B')
        if (!inputCheckComplete) {
          return {
            phase: 'intro' as QuizPhase,
            preShowStatus: 'playing' as const,
            preShowElapsedMs,
            preShowLastTickAtMs: now,
            preShowInputCheckStatus,
            gameLog: preShowGameLog,
          }
        }

        return {
          phase: 'intro' as QuizPhase,
          preShowStatus: 'finished' as const,
          preShowElapsedMs,
          preShowLastTickAtMs: now,
          preShowInputCheckStatus,
          gameLog: appendLogItem(preShowGameLog, 'Pre-show finalizado'),
        }
      }

      return {
        preShowElapsedMs,
        preShowLastTickAtMs: now,
        preShowInputCheckStatus,
        ...(preShowGameLog !== state.gameLog ? { gameLog: preShowGameLog } : {}),
      }
    }),
  startPreShowInputCheck: () =>
    set((state) => {
      if (state.preShowElapsedMs < PRE_SHOW_INPUT_CHECK_START_MS) {
        const preShowElapsedMs = Math.max(state.preShowElapsedMs, PRE_SHOW_TRIBUNAL_RULE_START_MS)
        return {
          phase: 'intro' as QuizPhase,
          preShowStatus: 'playing' as const,
          preShowElapsedMs,
          ...preShowClockFields(preShowElapsedMs),
          preShowInputCheckStatus: 'idle' as const,
          gameLog: appendLogItem(
            appendLogItem(state.gameLog, `PRESHOW_SCENE_SHOWN scene=how_to_play_tribunal elapsedMs=${preShowElapsedMs}`),
            'PRE_SHOW_TABLE_TEST_BRIEFING_FIRST: explicacao antes do teste da mesa',
          ),
        }
      }

      const preShowElapsedMs = Math.max(state.preShowElapsedMs, PRE_SHOW_INPUT_CHECK_START_MS)
      return {
        phase: 'intro' as QuizPhase,
        preShowStatus: state.preShowStatus === 'idle' ? ('playing' as const) : state.preShowStatus,
        preShowElapsedMs,
        ...preShowClockFields(preShowElapsedMs),
        preShowInputCheckStatus: getNextPreShowInputCheckStatus(state.preShowInputCheckReceivedGroups),
        gameLog: appendLogItem(
          appendLogItem(state.gameLog, `PRESHOW_SCENE_SHOWN scene=button_check elapsedMs=${preShowElapsedMs}`),
          `PRESHOW_TEST_STARTED status=${getNextPreShowInputCheckStatus(state.preShowInputCheckReceivedGroups)} elapsedMs=${preShowElapsedMs}`,
        ),
      }
    }),
  requestNextPreShowInputCheck: () =>
    set((state) => ({
      preShowInputCheckStatus: getNextPreShowInputCheckStatus(state.preShowInputCheckReceivedGroups),
      gameLog: appendLogItem(state.gameLog, 'Proximo sinal da mesa solicitado'),
    })),
  resetPreShowInputCheck: () =>
    set((state) => ({
      preShowInputCheckStatus: 'idle',
      preShowInputCheckReceivedGroups: [],
      preShowInputCheckLastGroup: null,
      gameLog: appendLogItem(state.gameLog, 'Teste da mesa reiniciado'),
    })),
  receivePreShowInputCheck: (group, source) =>
    set((state) => {
      if (state.phase !== 'intro' || state.preShowInputCheckStatus === 'idle') return {}

      if (state.preShowInputCheckStatus === 'complete') {
        return {
          preShowInputCheckLastGroup: group,
          gameLog: appendLogItem(state.gameLog, `Sinal extra da mesa: Grupo ${group}`),
        }
      }
      const event = buildInputEvent(state, group, source, true, 'preshow_test')

      return {
        ...buildPreShowInputCheckState(state, group),
        lastInputEvent: event,
        inputEvents: appendInputEvent(state, event),
        gameLog: appendLogItem(
          state.gameLog,
          `INPUT_RECEIVED raw=Mesa ${group} source=${source} resolvedGroup=${group} ${inputStateSummary(state)} accepted=true reason=preshow_test | PRESHOW_TEST_INPUT_ACCEPTED Mesa ${group} (${source})`,
        ),
      }
    }),
  startQuiz: () =>
    set((state) => {
      const quizSession = buildQuizSession()
      const currentRoundQuestion = getCurrentRoundQuestion(quizSession, 1)
      const nextState = {
        ...state,
        ...resetRoundFields(state),
        phase: 'round_prepare' as QuizPhase,
        preShowStatus: 'finished' as const,
        preShowElapsedMs: PRE_SHOW_TOTAL_MS,
        preShowInputCheckStatus: 'complete' as const,
        scoreA: 0,
        scoreB: 0,
        currentRound: 1,
        totalRounds: TOTAL_ROUNDS,
        activeSlot: 1,
        currentQuestion: getPromptForQuestion(currentRoundQuestion),
        quizSession,
        quizSeed: quizSession.seed,
        matchId: quizSession.id,
        roundIntroSchedule: buildRoundIntroSchedule(quizSession.seed, TOTAL_ROUNDS),
        autoSequenceStatus: 'idle' as AutoSequenceStatus,
        roundIntroStatus: 'idle' as RoundIntroStatus,
        roundIntroDelayMs: 0,
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
        postFeedbackDelayMs: 0,
        autoAdvanceEnabled: false,
        pendingAutomationToken: null,
        quizMode: 'main' as QuizMode,
        currentRoundQuestion,
        winner: null,
        winReason: null as WinReason,
        ...resetFinalShowFields(),
        tieBreakerAttempt: 0,
        tieBreakerBlockedGroups: [],
        roundFeedback: 'none' as RoundFeedback,
        lastScoredGroup: null,
        lastScoreDelta: 0,
      }
      const historyEvents = appendHistoryEvent(nextState, 'match_started', 'pending', { source: 'admin' })

      return {
        ...nextState,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, `Quiz iniciado: rodada 1/${TOTAL_ROUNDS}`),
      }
    }),
  startNewQuiz: () => get().startQuiz(),
  nextRound: () =>
    set((state) => {
      if (state.phase === 'game_over') {
        return {
          gameLog: appendLogItem(state.gameLog, 'Proxima rodada ignorada: partida ja encerrada'),
        }
      }

      if (state.quizMode === 'tie_breaker') {
        const nextTieBreaker = getTieBreakerFields(state, state.tieBreakerAttempt + 1)
        const nextState = { ...state, ...nextTieBreaker }
        const historyEvents = appendHistoryEvent(nextState, 'tie_breaker_started', 'pending', { source: 'admin' })

        return {
          ...nextTieBreaker,
          historyEvents,
          gameLog: appendLogItem(state.gameLog, `Veredito Final preparado: tentativa ${nextTieBreaker.tieBreakerAttempt + 1}`),
        }
      }

      if (state.currentRound >= state.totalRounds) {
        if (isTieAfterMainRounds(state.scoreA, state.scoreB)) {
          const tieBreaker = getTieBreakerFields(state, 0)
          const nextState = { ...state, ...tieBreaker }
          const historyEvents = appendHistoryEvent(nextState, 'tie_breaker_started', 'pending', { source: 'system' })

          return {
            ...tieBreaker,
            historyEvents,
            gameLog: appendLogItem(state.gameLog, 'Empate apos round 10: Veredito Final iniciado'),
          }
        }

        const winner: GroupId = state.scoreA > state.scoreB ? 'A' : 'B'
        const endedAt = new Date().toISOString()
        const nextState = {
          ...state,
          ...resetRoundFields(state),
          phase: 'game_over' as QuizPhase,
          activeSlot: getActiveSlot(state.totalRounds),
          roundFeedback: 'none' as RoundFeedback,
          winner,
          winReason: 'score' as WinReason,
          finalShowStatus: 'open' as FinalShowStatus,
        }
        const historyEvents = appendHistoryEvent(nextState, 'winner_declared', 'winner', {
          group: winner,
          source: 'system',
          timestamp: endedAt,
        })

        return {
          ...resetRoundFields(state),
          phase: 'game_over',
          activeSlot: getActiveSlot(state.totalRounds),
          roundFeedback: 'none' as RoundFeedback,
          winner,
          winReason: 'score' as WinReason,
          finalShowStatus: 'open',
          historyEvents,
          gameLog: appendLogItem(state.gameLog, `Quiz encerrado: Grupo ${winner} venceu por pontos`),
        }
      }

      const currentRound = state.currentRound + 1
      const currentRoundQuestion = getCurrentRoundQuestion(state.quizSession, currentRound)
      const nextState = {
        ...state,
        ...resetRoundFields(state),
        phase: 'round_prepare' as QuizPhase,
        currentRound,
        activeSlot: getActiveSlot(currentRound),
        currentQuestion: getPromptForQuestion(currentRoundQuestion),
        currentRoundQuestion,
        quizMode: 'main' as QuizMode,
        roundFeedback: 'none' as RoundFeedback,
        lastScoredGroup: null,
        lastScoreDelta: 0,
      }
      const historyEvents = appendHistoryEvent(nextState, 'round_started', 'pending', { source: 'admin' })

      return {
        ...nextState,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, `Rodada ${currentRound}/${TOTAL_ROUNDS} preparada`),
      }
    }),
  nextQuestion: () =>
    set((state) => {
      const currentRoundQuestion =
        state.quizMode === 'tie_breaker'
          ? getTieBreakerQuestion(state.quizSession, state.tieBreakerAttempt)
          : getCurrentRoundQuestion(state.quizSession, state.currentRound)

      return {
        ...resetRoundFields(state),
        phase: 'round_prepare',
        currentQuestion: getPromptForQuestion(currentRoundQuestion),
        currentRoundQuestion,
        activeSlot: getActiveSlot(state.currentRound),
        roundFeedback: 'none',
        selectedChoice: null,
        lastScoredGroup: null,
        lastScoreDelta: 0,
        gameLog: appendLogItem(state.gameLog, `Pergunta preparada para rodada ${state.currentRound}`),
      }
    }),
  startNewQuestion: () => get().nextQuestion(),
  revealQuestion: () =>
    set((state) => {
      const roundTime = state.quizMode === 'tie_breaker' ? 15 : state.answerTimeSeconds
      const currentRoundQuestion =
        state.currentRoundQuestion ??
        (state.quizMode === 'tie_breaker'
          ? getTieBreakerQuestion(state.quizSession, state.tieBreakerAttempt)
          : getCurrentRoundQuestion(state.quizSession, state.currentRound))
      const nextState = {
        ...state,
        phase: 'question_reveal' as QuizPhase,
        questionVisible: true,
        timerVisible: false,
        timerStatus: 'idle' as TimerStatus,
        timerRemaining: roundTime,
        timerSeconds: roundTime,
        ...resetTimerClockFields(),
        timerDurationMs: roundTime * 1000,
        currentRoundQuestion,
        currentQuestion: getPromptForQuestion(currentRoundQuestion),
        roundFeedback: 'none' as RoundFeedback,
        ...resetFeedbackClockFields(),
        lastScoredGroup: null,
        lastScoreDelta: 0,
      }
      const historyEvents = appendHistoryEvent(nextState, state.quizMode === 'tie_breaker' ? 'tie_breaker_started' : 'round_started', 'pending', {
        source: 'admin',
      })

      return {
        ...nextState,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, `QUESTION_VISIBLE rodada ${state.currentRound}`),
      }
    }),
  openBuzz: () =>
    set((state) => {
      if (state.phase === 'game_over') return {}
      if (state.phase === 'tribunal_challenge') return {}
      const roundTime = state.quizMode === 'tie_breaker' ? 15 : state.answerTimeSeconds
      const now = currentClockMs()

      return {
        phase: 'buzz_open',
        inputReady: true,
        inputReadyAtMs: state.inputReadyAtMs ?? now,
        inputReadyToken: state.inputReadyToken ?? createId('input-ready'),
        questionVisible: true,
        timerVisible: true,
        activeGroup: null,
        lastBuzz: null,
        buzzLocked: false,
        timerRemaining: roundTime,
        timerSeconds: roundTime,
        ...timerClockFields(roundTime),
        timerStatus: 'running',
        roundFeedback: 'none',
        ...resetFeedbackClockFields(),
        selectedChoice: null,
        gameLog: appendLogItem(state.gameLog, 'BUZZ_OPEN: botoes de vez liberados'),
      }
    }),
  prepareRoundInput: () =>
    set((state) => {
      if (state.phase === 'game_over' || state.phase === 'tribunal_challenge') return {}
      return {
        phase: 'round_preparing' as QuizPhase,
        inputReady: false,
        inputReadyAtMs: null,
        inputReadyToken: null,
        lastInputEvent: null,
        buzzLocked: true,
        questionVisible: false,
        timerVisible: false,
        gameLog: appendLogItem(state.gameLog, 'ROUND_PREPARE_START: preparando input da mesa'),
      }
    }),
  markInputReady: () =>
    set((state) => {
      if (state.phase === 'game_over' || state.phase === 'tribunal_challenge') return {}
      return {
        phase: 'input_ready' as QuizPhase,
        inputReady: true,
        inputReadyAtMs: currentClockMs(),
        inputReadyToken: createId('input-ready'),
        buzzLocked: false,
        gameLog: appendLogItem(state.gameLog, 'INPUT_READY: mesa/input liberados'),
      }
    }),
  receiveInput: (group, source) =>
    set((state) => {
      if (state.phase === 'intro') {
        if (state.preShowInputCheckStatus !== 'idle') {
          const event = buildInputEvent(state, group, source, true, 'preshow_test')
          return {
            ...buildPreShowInputCheckState(state, group),
            lastInputEvent: event,
            inputEvents: appendInputEvent(state, event),
            gameLog: appendLogItem(
              state.gameLog,
              `INPUT_RECEIVED raw=Mesa ${group} source=${source} resolvedGroup=${group} ${inputStateSummary(state)} accepted=true reason=preshow_test | PRESHOW_TEST_INPUT_ACCEPTED Mesa ${group} (${source})`,
            ),
          }
        }

        return inputRejectedState(state, group, source, 'intro_test_not_started')
      }

      return {
        ...buzzStateForGroup(state, group, source),
      }
    }),
  receiveBuzz: (group) => get().receiveInput(group, 'keyboard'),
  receiveHardwareBuzz: (eventName) =>
    set((state) => {
      const group = serialEventToGroup(eventName as SerialEventName)
      if (!group) {
        return {
          serialLastEvent: eventName,
          gameLog: appendLogItem(state.gameLog, `SERIAL_EVENT_RECEIVED raw=${eventName} phase=${state.phase} resolvedGroup=unknown`),
        }
      }
      const stateWithSerialLog = {
        ...state,
        gameLog: appendLogItem(state.gameLog, `SERIAL_EVENT_RECEIVED raw=${eventName} resolvedGroup=${group} ${inputStateSummary(state)}`),
      }

      if (state.phase === 'intro') {
        if (state.preShowInputCheckStatus !== 'idle') {
          const event = buildInputEvent(state, group, 'serial', true, 'preshow_test')
          return {
            ...buildPreShowInputCheckState(state, group),
            serialLastEvent: eventName,
            lastInputEvent: event,
            inputEvents: appendInputEvent(state, event),
            gameLog: appendLogItem(
              stateWithSerialLog.gameLog,
              `INPUT_RECEIVED raw=${eventName} source=serial resolvedGroup=${group} ${inputStateSummary(state)} accepted=true reason=preshow_test | PRESHOW_TEST_INPUT_ACCEPTED raw=${eventName} source=serial resolvedGroup=${group} ${inputStateSummary(state)}`,
            ),
          }
        }

        return {
          serialLastEvent: eventName,
          ...inputRejectedState(stateWithSerialLog, group, 'serial', 'intro_test_not_started', eventName),
        }
      }

      return {
        ...buzzStateForGroup(stateWithSerialLog, group, 'serial', eventName),
        serialLastEvent: eventName,
      }
    }),
  receiveKeyboardBuzz: (group) => get().receiveInput(group, 'keyboard'),
  lockBuzz: () =>
    set((state) => ({
      buzzLocked: true,
      serialLocked: true,
      gameLog: appendLogItem(state.gameLog, 'Botões de vez bloqueados'),
    })),
  passQuestion: () => set((state) => ({ phase: 'pass_decision', gameLog: appendLogItem(state.gameLog, 'Passa acionado') })),
  repassQuestion: () =>
    set((state) => ({ phase: 'repass_decision', gameLog: appendLogItem(state.gameLog, 'Repassa acionado') })),
  markCorrect: () => {
    const state = get()
    const activeGroup = state.activeGroup
    if (!activeGroup) {
      set((state) => ({
        phase: 'error',
        gameLog: appendLogItem(state.gameLog, 'Tentativa de pontuar sem grupo ativo'),
      }))
      return
    }

    if (state.roundFeedback === 'correct') {
      set((state) => ({
        gameLog: appendLogItem(state.gameLog, 'Pontuacao ja registrada para esta resposta'),
      }))
      return
    }

    get().awardPoints(activeGroup, state.quizMode === 'main' ? NORMAL_CORRECT_POINTS : 100)
  },
  markWrong: () =>
    set((state) => {
      if (state.quizMode === 'tie_breaker' && state.activeGroup) {
        const blockedGroups = Array.from(new Set([...state.tieBreakerBlockedGroups, state.activeGroup]))
        if (blockedGroups.length >= 2) {
          const nextTieBreaker = getTieBreakerFields(state, state.tieBreakerAttempt + 1)
          const nextState = { ...state, ...nextTieBreaker }
          const historyEvents = appendHistoryEvent(nextState, 'tie_breaker_started', 'pending', { source: 'system' })

          return {
            ...nextTieBreaker,
            historyEvents,
            gameLog: appendLogItem(state.gameLog, 'Dois grupos erraram: novo Veredito Final carregado'),
          }
        }

        const nextState = {
          ...state,
          phase: 'answer_locked' as QuizPhase,
          buzzLocked: true,
          timerStatus: 'idle' as TimerStatus,
          roundFeedback: 'wrong' as RoundFeedback,
          ...feedbackClockFields(),
          lastScoredGroup: state.activeGroup,
          lastScoreDelta: 0,
          tieBreakerBlockedGroups: blockedGroups,
        }
        const historyEvents = appendHistoryEvent(nextState, 'wrong', 'wrong', { source: 'admin' })

        return {
          ...nextState,
          historyEvents,
          gameLog: appendLogItem(state.gameLog, 'Resposta de desempate marcada como errada'),
        }
      }

      if (!state.activeGroup) {
        return {
          phase: 'error',
          gameLog: appendLogItem(state.gameLog, 'Tentativa de marcar erro sem grupo ativo'),
        }
      }

      if (state.roundFeedback === 'opponent_bonus') {
        return {
          gameLog: appendLogItem(state.gameLog, 'Bonus de erro ja registrado para esta resposta'),
        }
      }

      const actorGroup = state.activeGroup
      const beneficiaryGroup = getOpponentGroup(actorGroup)
      const nextScoreA = beneficiaryGroup === 'A' ? normalizeScore(state.scoreA + WRONG_OPPONENT_BONUS_POINTS) : state.scoreA
      const nextScoreB = beneficiaryGroup === 'B' ? normalizeScore(state.scoreB + WRONG_OPPONENT_BONUS_POINTS) : state.scoreB
      const nextState = {
        ...state,
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        phase: 'answer_locked' as QuizPhase,
        buzzLocked: true,
        timerStatus: 'idle' as TimerStatus,
        roundFeedback: 'opponent_bonus' as RoundFeedback,
        ...feedbackClockFields(),
        lastScoredGroup: beneficiaryGroup,
        lastScoreDelta: WRONG_OPPONENT_BONUS_POINTS,
      }
      const historyEvents = appendHistoryEvent(state, 'wrong_opponent_bonus', 'wrong', {
        group: actorGroup,
        actorGroup,
        beneficiaryGroup,
        scoreDelta: WRONG_OPPONENT_BONUS_POINTS,
        scoreAfterA: nextScoreA,
        scoreAfterB: nextScoreB,
        source: 'admin',
        operatorAction: 'mark_wrong',
      })

      return {
        ...nextState,
        historyEvents,
        gameLog: appendLogItem(
          state.gameLog,
          `SCORE_UPDATED round=${state.currentRound} reason=wrong_answer actor=${actorGroup} beneficiary=${beneficiaryGroup} delta=${WRONG_OPPONENT_BONUS_POINTS} scoreA=${nextScoreA} scoreB=${nextScoreB}`,
        ),
      }
    }),
  awardPoints: (group, amount = 100) =>
    set((state) => {
      const value = normalizeScore(amount)
      const nextScoreA = group === 'A' ? normalizeScore(state.scoreA + value) : state.scoreA
      const nextScoreB = group === 'B' ? normalizeScore(state.scoreB + value) : state.scoreB
      const historyEvents = appendHistoryEvent(state, 'correct', 'correct', {
        group,
        actorGroup: group,
        beneficiaryGroup: group,
        scoreDelta: value,
        scoreAfterA: nextScoreA,
        scoreAfterB: nextScoreB,
        source: 'admin',
        operatorAction: 'mark_correct',
      })

      return {
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        phase: 'scoring',
        timerStatus: 'idle',
        buzzLocked: true,
        roundFeedback: 'correct' as RoundFeedback,
        ...feedbackClockFields(),
        lastScoredGroup: group,
        lastScoreDelta: value,
        historyEvents,
        gameLog: appendLogItem(
          state.gameLog,
          `SCORE_UPDATED round=${state.currentRound} reason=correct_answer team=${group} delta=${value} scoreA=${nextScoreA} scoreB=${nextScoreB}`,
        ),
      }
    }),
  addPoints: (group, amount) => get().awardPoints(group, amount),
  startTribunalChallenge: () =>
    set((state) => {
      if (state.phase === 'intro' || state.quizMode !== 'main' || state.phase === 'game_over') return {}
      const startedAt = new Date().toISOString()
      const questionId = state.currentRoundQuestion?.id ?? null
      const calledGroup = selectTribunalCalledGroup(state.quizSeed ?? state.matchId ?? 'dpdm', state.currentRound, questionId)
      const nextState = {
        ...state,
        phase: 'tribunal_challenge' as QuizPhase,
        timerRemaining: TRIBUNAL_DECISION_SECONDS,
        timerSeconds: TRIBUNAL_DECISION_SECONDS,
        timerStatus: 'running' as TimerStatus,
        timerVisible: true,
        ...timerClockFields(TRIBUNAL_DECISION_SECONDS),
        activeGroup: null,
        lastBuzz: null,
        buzzLocked: true,
        roundFeedback: 'time_up' as RoundFeedback,
        tribunalStatus: 'awaiting_decision' as const,
        tribunalCalledGroup: calledGroup,
        tribunalPassedGroups: [],
        tribunalAttemptingGroup: null,
        tribunalOutcome: null,
        tribunalStartedAt: startedAt,
        tribunalResolvedAt: null,
      }
      const historyStarted = appendHistoryEvent(state, 'tribunal_started', 'pending', {
        source: 'system',
        tribunalCalledGroup: calledGroup,
        operatorAction: 'time_up_without_turn',
        timerRemaining: 0,
      })
      const historyEvents = appendHistoryEvent(
        { ...nextState, historyEvents: historyStarted },
        'tribunal_group_drawn',
        'pending',
        {
          source: 'system',
          group: calledGroup,
          tribunalCalledGroup: calledGroup,
          operatorAction: 'draw_group',
          timerRemaining: 0,
        },
      )

      return {
        ...nextState,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, `Desafio do Tribunal iniciado: Grupo ${calledGroup} chamado`),
      }
    }),
  tribunalRisk: () =>
    set((state) => {
      if (state.phase !== 'tribunal_challenge' || state.tribunalStatus !== 'awaiting_decision' || !state.tribunalCalledGroup) return {}
      const attemptingGroup = state.tribunalCalledGroup
      const nextState = {
        ...state,
        tribunalStatus: 'attempting' as const,
        tribunalAttemptingGroup: attemptingGroup,
        timerVisible: false,
        timerStatus: 'idle' as TimerStatus,
        ...resetTimerClockFields(),
      }
      const historyEvents = appendHistoryEvent(state, 'tribunal_attempt_started', 'pending', {
        source: 'admin',
        group: attemptingGroup,
        actorGroup: attemptingGroup,
        tribunalCalledGroup: state.tribunalCalledGroup,
        tribunalAttemptingGroup: attemptingGroup,
        tribunalPassedGroups: state.tribunalPassedGroups,
        operatorAction: 'risk',
      })

      return {
        ...nextState,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, `Grupo ${attemptingGroup} arriscou no tribunal`),
      }
    }),
  resolveTribunalAttempt: (result) =>
    set((state) => {
      if (state.phase !== 'tribunal_challenge' || state.tribunalStatus !== 'attempting' || !state.tribunalAttemptingGroup) return {}
      const resolvedAt = new Date().toISOString()
      const group = state.tribunalAttemptingGroup
      const delta = result === 'correct' ? TRIBUNAL_CORRECT_POINTS : TRIBUNAL_WRONG_POINTS
      const nextScoreA = group === 'A' ? normalizeScore(state.scoreA + delta) : state.scoreA
      const nextScoreB = group === 'B' ? normalizeScore(state.scoreB + delta) : state.scoreB
      const event = result === 'correct' ? 'tribunal_attempt_correct' : 'tribunal_attempt_wrong'
      const feedback = result === 'correct' ? 'tribunal_correct' : 'tribunal_wrong'
      const nextState = {
        ...state,
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        phase: 'answer_locked' as QuizPhase,
        timerStatus: 'idle' as TimerStatus,
        buzzLocked: true,
        roundFeedback: feedback as RoundFeedback,
        ...feedbackClockFields(),
        lastScoredGroup: group,
        lastScoreDelta: delta,
        tribunalStatus: 'resolved' as const,
        tribunalOutcome: result,
        tribunalResolvedAt: resolvedAt,
      }
      const historyEvents = appendHistoryEvent(state, event, result, {
        source: 'admin',
        group,
        actorGroup: group,
        beneficiaryGroup: group,
        scoreDelta: delta,
        scoreAfterA: nextScoreA,
        scoreAfterB: nextScoreB,
        tribunalCalledGroup: state.tribunalCalledGroup,
        tribunalAttemptingGroup: group,
        tribunalPassedGroups: state.tribunalPassedGroups,
        tribunalOutcome: result,
        operatorAction: result === 'correct' ? 'tribunal_correct' : 'tribunal_wrong',
      })

      return {
        ...nextState,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, `Tribunal: Grupo ${group} ${result === 'correct' ? 'ganhou +20' : 'perdeu -10'}`),
      }
    }),
  tribunalPass: () =>
    set((state) => {
      if (state.phase !== 'tribunal_challenge' || state.tribunalStatus !== 'awaiting_decision' || !state.tribunalCalledGroup) return {}
      const passingGroup = state.tribunalCalledGroup
      const passedGroups = Array.from(new Set([...state.tribunalPassedGroups, passingGroup]))
      const passHistory = appendHistoryEvent(state, 'tribunal_passed', 'pending', {
        source: 'admin',
        group: passingGroup,
        actorGroup: passingGroup,
        tribunalCalledGroup: state.tribunalCalledGroup,
        tribunalPassedGroups: passedGroups,
        operatorAction: 'pass',
      })

      if (passedGroups.length >= 2) {
        const resolvedAt = new Date().toISOString()
        const silenceState = {
          ...state,
          phase: 'answer_locked' as QuizPhase,
          timerStatus: 'idle' as TimerStatus,
          timerVisible: false,
          buzzLocked: true,
          roundFeedback: 'tribunal_silence' as RoundFeedback,
          ...feedbackClockFields(),
          lastScoredGroup: null,
          lastScoreDelta: 0,
          tribunalStatus: 'resolved' as const,
          tribunalPassedGroups: passedGroups,
          tribunalOutcome: 'silence' as const,
          tribunalResolvedAt: resolvedAt,
        }
        const historyEvents = appendHistoryEvent({ ...silenceState, historyEvents: passHistory }, 'tribunal_silence', 'pending', {
          source: 'admin',
          tribunalCalledGroup: state.tribunalCalledGroup,
          tribunalPassedGroups: passedGroups,
          tribunalOutcome: 'silence',
          operatorAction: 'both_passed',
        })

        return {
          ...silenceState,
          historyEvents,
          gameLog: appendLogItem(state.gameLog, TRIBUNAL_SILENCE_MESSAGE),
        }
      }

      const nextGroup = getOpponentGroup(passingGroup)
      return {
        tribunalStatus: 'awaiting_decision',
        tribunalCalledGroup: nextGroup,
        tribunalPassedGroups: passedGroups,
        tribunalAttemptingGroup: null,
        timerVisible: true,
        timerRemaining: TRIBUNAL_DECISION_SECONDS,
        timerSeconds: TRIBUNAL_DECISION_SECONDS,
        timerStatus: 'running' as TimerStatus,
        ...timerClockFields(TRIBUNAL_DECISION_SECONDS),
        historyEvents: passHistory,
        gameLog: appendLogItem(state.gameLog, `Grupo ${passingGroup} passou; Grupo ${nextGroup} chamado pelo tribunal`),
      }
    }),
  cancelTribunalChallenge: () =>
    set((state) => {
      if (state.phase !== 'tribunal_challenge') return {}
      const resolvedAt = new Date().toISOString()
      const nextState = {
        ...state,
        phase: 'answer_locked' as QuizPhase,
        timerStatus: 'idle' as TimerStatus,
        buzzLocked: true,
        roundFeedback: 'tribunal_silence' as RoundFeedback,
        ...feedbackClockFields(),
        lastScoredGroup: null,
        lastScoreDelta: 0,
        tribunalStatus: 'cancelled' as const,
        tribunalOutcome: 'cancelled' as const,
        tribunalResolvedAt: resolvedAt,
      }
      const historyEvents = appendHistoryEvent(state, 'tribunal_cancelled', 'pending', {
        source: 'admin',
        tribunalCalledGroup: state.tribunalCalledGroup,
        tribunalAttemptingGroup: state.tribunalAttemptingGroup,
        tribunalPassedGroups: state.tribunalPassedGroups,
        tribunalOutcome: 'cancelled',
        operatorAction: 'cancel',
      })

      return {
        ...nextState,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, 'Desafio do Tribunal cancelado pelo operador'),
      }
    }),
  selectChoice: (choice) =>
    set((state) => ({
      selectedChoice: choice,
      gameLog: appendLogItem(state.gameLog, `Escolha ${choice} selecionada no Admin`),
    })),
  confirmChoice: () => {
    const state = get()
    const question = state.currentRoundQuestion

    if (!state.activeGroup || !state.selectedChoice || (question?.type !== 'text_choice' && question?.type !== 'tie_breaker')) {
      set((state) => ({
        phase: 'error',
        gameLog: appendLogItem(state.gameLog, 'Confirmacao A/B incompleta'),
      }))
      return
    }

    const isCorrect = state.selectedChoice === question.correctOption

    if (question.type === 'tie_breaker') {
      if (isCorrect) {
        set((state) => {
          const winner = state.activeGroup
          if (!winner) return {}
          const nextState = {
            ...state,
            phase: 'game_over' as QuizPhase,
            timerStatus: 'idle' as TimerStatus,
            buzzLocked: true,
            roundFeedback: 'correct' as RoundFeedback,
            lastScoredGroup: winner,
            lastScoreDelta: 0,
            winner,
            winReason: 'tie_breaker' as WinReason,
            finalShowStatus: 'open' as FinalShowStatus,
          }
          const historyEvents = appendHistoryEvent(nextState, 'winner_declared', 'winner', {
            group: winner,
            playerChoice: state.selectedChoice,
            source: 'admin',
          })

          return {
            ...nextState,
            historyEvents,
            gameLog: appendLogItem(state.gameLog, `Veredito Final: Grupo ${winner} venceu`),
          }
        })
        return
      }

      get().markWrong()
      return
    }

    if (isCorrect) {
      get().awardPoints(state.activeGroup, NORMAL_CORRECT_POINTS)
      return
    }

    get().markWrong()
  },
  reopenTurn: () =>
    set((state) => {
      if (state.phase === 'tribunal_challenge') {
        return {
          gameLog: appendLogItem(state.gameLog, 'Botão de vez bloqueado durante o Desafio do Tribunal'),
        }
      }

      return {
        phase: 'buzz_open',
        activeGroup: null,
        lastBuzz: null,
        buzzLocked: false,
        inputReady: true,
        inputReadyAtMs: currentClockMs(),
        inputReadyToken: createId('input-ready'),
        questionVisible: true,
        timerVisible: true,
        timerStatus: 'running',
        timerRemaining: state.timerRemaining > 0 ? state.timerRemaining : state.answerTimeSeconds,
        timerSeconds: state.timerRemaining > 0 ? state.timerRemaining : state.answerTimeSeconds,
        ...timerClockFields(state.timerRemaining > 0 ? state.timerRemaining : state.answerTimeSeconds),
        roundFeedback: 'none',
        lastScoredGroup: null,
        lastScoreDelta: 0,
        gameLog: appendLogItem(state.gameLog, 'Botão de vez reaberto'),
      }
    }),
  finishRound: () =>
    set((state) => ({
      phase: 'round_end',
      timerStatus: 'idle',
      buzzLocked: true,
      gameLog: appendLogItem(state.gameLog, `Rodada ${state.currentRound} encerrada`),
    })),
  resetRound: () =>
    set((state) => ({
      ...resetRoundFields(state),
      phase: 'round_prepare',
      gameLog: appendLogItem(state.gameLog, `Rodada ${state.currentRound} resetada`),
    })),
  resetGame: () =>
    set((state) => ({
      ...resetRoundFields(state),
      phase: 'intro',
      preShowStatus: 'idle',
      preShowElapsedMs: 0,
      preShowStartedAtMs: null,
      preShowDurationMs: PRE_SHOW_TOTAL_MS,
      preShowPausedAtMs: null,
      preShowAccumulatedPauseMs: 0,
      preShowLastTickAtMs: null,
      preShowInputCheckStatus: 'idle',
      preShowInputCheckReceivedGroups: [],
      preShowInputCheckLastGroup: null,
      scoreA: 0,
      scoreB: 0,
      currentRound: 1,
      totalRounds: TOTAL_ROUNDS,
      activeSlot: 1,
      currentQuestion: INITIAL_QUESTION,
      quizSession: null,
      quizSeed: null,
      matchId: null,
      quizMode: 'main',
      currentRoundQuestion: null,
      selectedChoice: null,
      winner: null,
      winReason: null,
      ...resetFinalShowFields(),
      tieBreakerAttempt: 0,
      tieBreakerBlockedGroups: [],
      autoSequenceStatus: 'idle',
      roundIntroStatus: 'idle',
      roundIntroDelayMs: 0,
      roundIntroRemainingMs: 0,
      ...resetRoundIntroClockFields(),
      roundIntroSchedule: [],
      postFeedbackDelayMs: 0,
      autoAdvanceEnabled: false,
      pendingAutomationToken: null,
      roundFeedback: 'none',
      lastScoredGroup: null,
      lastScoreDelta: 0,
      inputEvents: [],
      gameLog: appendLogItem(state.gameLog, 'Jogo resetado'),
    })),
  startTimer: () =>
    set((state) => ({
      timerVisible: true,
      timerStatus: 'running',
      timerSeconds: state.timerRemaining,
      ...timerClockFields(state.timerRemaining > 0 ? state.timerRemaining : state.answerTimeSeconds),
      gameLog: appendLogItem(state.gameLog, 'Timer iniciado'),
    })),
  pauseTimer: () =>
    set((state) => {
      if (state.timerStatus !== 'running') {
        return {
          timerStatus: state.timerStatus,
          gameLog: appendLogItem(state.gameLog, 'Timer pausado'),
        }
      }
      const now = Math.max(currentClockMs(), state.timerLastTickAtMs ?? 0)
      const remainingMs = getRemainingFromClock(
        state.timerStartedAtMs,
        null,
        state.timerAccumulatedPauseMs,
        state.timerDurationMs,
        now,
      )
      const timerRemaining = Math.max(0, Math.ceil(remainingMs / 1000))
      return {
        timerStatus: 'paused' as TimerStatus,
        timerRemaining,
        timerSeconds: timerRemaining,
        timerPausedAtMs: now,
        timerLastTickAtMs: now,
        gameLog: appendLogItem(state.gameLog, 'Timer pausado'),
      }
    }),
  resumeTimer: () =>
    set((state) => {
      if (state.timerStatus !== 'paused') {
        return {
          timerStatus: state.timerStatus,
          gameLog: appendLogItem(state.gameLog, 'Timer retomado'),
        }
      }
      const now = Math.max(currentClockMs(), state.timerLastTickAtMs ?? 0)
      return {
        timerStatus: 'running' as TimerStatus,
        timerPausedAtMs: null,
        timerAccumulatedPauseMs: state.timerAccumulatedPauseMs + (state.timerPausedAtMs ? now - state.timerPausedAtMs : 0),
        timerEndsAtMs:
          state.timerEndsAtMs === null || state.timerPausedAtMs === null
            ? state.timerEndsAtMs
            : state.timerEndsAtMs + (now - state.timerPausedAtMs),
        timerLastTickAtMs: now,
        gameLog: appendLogItem(state.gameLog, 'Timer retomado'),
      }
    }),
  resetTimer: () =>
    set((state) => ({
      timerRemaining: state.answerTimeSeconds,
      timerSeconds: state.answerTimeSeconds,
      ...resetTimerClockFields(),
      timerDurationMs: state.answerTimeSeconds * 1000,
      timerStatus: 'idle',
      gameLog: appendLogItem(state.gameLog, 'Timer resetado'),
    })),
  tickTimer: (seconds) =>
    set((state) => {
      if (state.timerStatus !== 'running') return {}
      const now = getClockTickNow(
        state.timerLastTickAtMs,
        state.timerStartedAtMs,
        typeof seconds === 'number' ? seconds * 1000 : undefined,
      )
      const remainingMs =
        state.timerStartedAtMs === null
          ? Math.max(0, (state.timerRemaining - (seconds ?? 1)) * 1000)
          : getRemainingFromClock(
              state.timerStartedAtMs,
              state.timerPausedAtMs,
              state.timerAccumulatedPauseMs,
              state.timerDurationMs,
              now,
            )
      const timerRemaining = Math.max(0, Math.ceil(remainingMs / 1000))

      if (timerRemaining === 0) {
        if (state.phase === 'tribunal_challenge' && state.tribunalStatus === 'awaiting_decision' && state.tribunalCalledGroup) {
          const passingGroup = state.tribunalCalledGroup
          const passedGroups = Array.from(new Set([...state.tribunalPassedGroups, passingGroup]))
          const passHistory = appendHistoryEvent(state, 'tribunal_passed', 'pending', {
            source: 'system',
            group: passingGroup,
            actorGroup: passingGroup,
            tribunalCalledGroup: state.tribunalCalledGroup,
            tribunalPassedGroups: passedGroups,
            operatorAction: 'decision_timeout',
          })

          if (passedGroups.includes('A') && passedGroups.includes('B')) {
            const resolvedAt = new Date().toISOString()
            const silenceState = {
              ...state,
              phase: 'answer_locked' as QuizPhase,
              timerRemaining: 0,
              timerSeconds: 0,
              timerStatus: 'idle' as TimerStatus,
              timerVisible: false,
              ...resetTimerClockFields(),
              buzzLocked: true,
              roundFeedback: 'tribunal_silence' as RoundFeedback,
              ...feedbackClockFields(),
              lastScoredGroup: null,
              lastScoreDelta: 0,
              tribunalStatus: 'resolved' as const,
              tribunalPassedGroups: passedGroups,
              tribunalOutcome: 'silence' as const,
              tribunalResolvedAt: resolvedAt,
            }
            const historyEvents = appendHistoryEvent({ ...silenceState, historyEvents: passHistory }, 'tribunal_silence', 'pending', {
              source: 'system',
              tribunalCalledGroup: state.tribunalCalledGroup,
              tribunalPassedGroups: passedGroups,
              tribunalOutcome: 'silence',
              operatorAction: 'decision_timeout_both_passed',
            })

            return {
              ...silenceState,
              historyEvents,
              gameLog: appendLogItem(state.gameLog, TRIBUNAL_SILENCE_MESSAGE),
            }
          }

          const nextGroup = getOpponentGroup(passingGroup)
          return {
            timerRemaining: TRIBUNAL_DECISION_SECONDS,
            timerSeconds: TRIBUNAL_DECISION_SECONDS,
            timerStatus: 'running' as TimerStatus,
            timerVisible: true,
            ...timerClockFields(TRIBUNAL_DECISION_SECONDS),
            tribunalStatus: 'awaiting_decision' as const,
            tribunalCalledGroup: nextGroup,
            tribunalPassedGroups: passedGroups,
            tribunalAttemptingGroup: null,
            historyEvents: passHistory,
            gameLog: appendLogItem(state.gameLog, `Tempo do tribunal: Grupo ${passingGroup} passou; Grupo ${nextGroup} chamado`),
          }
        }

        if (state.quizMode === 'tie_breaker') {
          const timedOutState = {
            ...state,
            timerRemaining,
            timerSeconds: 0,
            timerStatus: 'time_up' as TimerStatus,
            timerLastTickAtMs: now,
            phase: 'time_up' as QuizPhase,
            buzzLocked: true,
            activeGroup: null,
            lastBuzz: null,
            roundFeedback: 'time_up' as RoundFeedback,
          }
          const historyWithTimeUp = appendHistoryEvent(timedOutState, 'time_up', 'time_up', { source: 'system' })
          const nextTieBreaker = getTieBreakerFields({ ...state, historyEvents: historyWithTimeUp }, state.tieBreakerAttempt + 1)
          const nextState = { ...state, ...nextTieBreaker, historyEvents: historyWithTimeUp }
          const historyEvents = appendHistoryEvent(nextState, 'tie_breaker_started', 'pending', { source: 'system' })

          return {
            ...nextTieBreaker,
            historyEvents,
            gameLog: appendLogItem(state.gameLog, 'Tempo esgotado no Veredito Final: nova pergunta carregada'),
          }
        }

        if (!state.activeGroup) {
          const startedAt = new Date().toISOString()
          const questionId = state.currentRoundQuestion?.id ?? null
          const calledGroup = selectTribunalCalledGroup(state.quizSeed ?? state.matchId ?? 'dpdm', state.currentRound, questionId)
          const nextState = {
            ...state,
            phase: 'tribunal_challenge' as QuizPhase,
            buzzLocked: true,
            activeGroup: null,
            lastBuzz: null,
            roundFeedback: 'time_up' as RoundFeedback,
            tribunalStatus: 'awaiting_decision' as const,
            tribunalCalledGroup: calledGroup,
            tribunalPassedGroups: [],
            tribunalAttemptingGroup: null,
            tribunalOutcome: null,
            tribunalStartedAt: startedAt,
            tribunalResolvedAt: null,
            timerVisible: true,
            timerRemaining: TRIBUNAL_DECISION_SECONDS,
            timerSeconds: TRIBUNAL_DECISION_SECONDS,
            ...timerClockFields(TRIBUNAL_DECISION_SECONDS),
          }
          const historyStarted = appendHistoryEvent(nextState, 'tribunal_started', 'pending', {
            source: 'system',
            tribunalCalledGroup: calledGroup,
            operatorAction: 'time_up_without_turn',
            timerRemaining,
          })
          const historyEvents = appendHistoryEvent(
            { ...nextState, historyEvents: historyStarted },
            'tribunal_group_drawn',
            'pending',
            {
              source: 'system',
              group: calledGroup,
              tribunalCalledGroup: calledGroup,
              operatorAction: 'draw_group',
              timerRemaining,
            },
          )

          return {
            timerStatus: 'running',
            timerVisible: true,
            ...timerClockFields(TRIBUNAL_DECISION_SECONDS),
            timerRemaining: TRIBUNAL_DECISION_SECONDS,
            timerSeconds: TRIBUNAL_DECISION_SECONDS,
            phase: 'tribunal_challenge',
            buzzLocked: true,
            activeGroup: null,
            lastBuzz: null,
            roundFeedback: 'time_up' as RoundFeedback,
            tribunalStatus: 'awaiting_decision',
            tribunalCalledGroup: calledGroup,
            tribunalPassedGroups: [],
            tribunalAttemptingGroup: null,
            tribunalOutcome: null,
            tribunalStartedAt: startedAt,
            tribunalResolvedAt: null,
            historyEvents,
            gameLog: appendLogItem(
              state.gameLog,
              `ANSWER_TIMEOUT round=${state.currentRound} phase=${state.phase} activeGroup=none scoreA=${state.scoreA} scoreB=${state.scoreB} tribunalCalledGroup=${calledGroup}`,
            ),
          }
        }

        const actorGroup = state.activeGroup
        if (actorGroup) {
          const beneficiaryGroup = getOpponentGroup(actorGroup)
          const nextScoreA =
            actorGroup === 'A'
              ? normalizeScore(state.scoreA + NO_ANSWER_ACTIVE_PENALTY_POINTS)
              : beneficiaryGroup === 'A'
                ? normalizeScore(state.scoreA + NO_ANSWER_OPPONENT_BONUS_POINTS)
                : state.scoreA
          const nextScoreB =
            actorGroup === 'B'
              ? normalizeScore(state.scoreB + NO_ANSWER_ACTIVE_PENALTY_POINTS)
              : beneficiaryGroup === 'B'
                ? normalizeScore(state.scoreB + NO_ANSWER_OPPONENT_BONUS_POINTS)
                : state.scoreB
          const penaltyState = {
            ...state,
            scoreA: nextScoreA,
            scoreB: nextScoreB,
            timerRemaining,
            timerSeconds: 0,
            timerStatus: 'time_up' as TimerStatus,
            timerLastTickAtMs: now,
            phase: 'answer_locked' as QuizPhase,
            buzzLocked: true,
            roundFeedback: 'silence_penalty' as RoundFeedback,
            ...feedbackClockFields(),
            lastScoredGroup: beneficiaryGroup,
            lastScoreDelta: NO_ANSWER_OPPONENT_BONUS_POINTS,
          }
          const historyEvents = appendHistoryEvent(penaltyState, 'no_answer_penalty', 'time_up', {
            source: 'system',
            group: actorGroup,
            actorGroup,
            beneficiaryGroup,
            scoreDelta: NO_ANSWER_ACTIVE_PENALTY_POINTS,
            scoreAfterA: nextScoreA,
            scoreAfterB: nextScoreB,
            operatorAction: 'answer_timeout_no_response',
          })

          return {
            scoreA: nextScoreA,
            scoreB: nextScoreB,
            timerRemaining,
            timerSeconds: 0,
            timerStatus: 'time_up',
            timerLastTickAtMs: now,
            phase: 'answer_locked',
            buzzLocked: true,
            roundFeedback: 'silence_penalty' as RoundFeedback,
            ...feedbackClockFields(),
            lastScoredGroup: beneficiaryGroup,
            lastScoreDelta: NO_ANSWER_OPPONENT_BONUS_POINTS,
            historyEvents,
            gameLog: appendLogItem(
              state.gameLog,
              `ANSWER_TIMEOUT round=${state.currentRound} phase=${state.phase} activeGroup=${actorGroup} scoreA=${state.scoreA} scoreB=${state.scoreB} | NO_ANSWER_PENALTY_APPLIED team=${actorGroup} deltaActive=${NO_ANSWER_ACTIVE_PENALTY_POINTS} opponent=${beneficiaryGroup} deltaOpponent=+${NO_ANSWER_OPPONENT_BONUS_POINTS} scoreA=${nextScoreA} scoreB=${nextScoreB}`,
            ),
          }
        }

        const nextState = {
          ...state,
          timerRemaining,
          timerSeconds: 0,
          timerStatus: 'time_up' as TimerStatus,
          timerLastTickAtMs: now,
          phase: 'time_up' as QuizPhase,
          buzzLocked: true,
          activeGroup: null,
          lastBuzz: null,
          roundFeedback: 'time_up' as RoundFeedback,
          ...feedbackClockFields(),
        }
        const historyEvents = appendHistoryEvent(nextState, 'time_up', 'time_up', { source: 'system' })

        return {
          timerRemaining,
          timerSeconds: 0,
          timerStatus: 'time_up',
          timerLastTickAtMs: now,
          phase: 'time_up',
          buzzLocked: true,
          activeGroup: null,
          lastBuzz: null,
          roundFeedback: 'time_up' as RoundFeedback,
          ...feedbackClockFields(),
          historyEvents,
          gameLog: appendLogItem(
            state.gameLog,
            `ANSWER_TIMEOUT round=${state.currentRound} phase=${state.phase} activeGroup=none scoreA=${state.scoreA} scoreB=${state.scoreB}`,
          ),
        }
      }

      return {
        timerRemaining,
        timerSeconds: timerRemaining,
        timerLastTickAtMs: now,
      }
    }),
  tickFeedback: (elapsedMs) =>
    set((state) => {
      if (state.roundFeedback === 'none' || state.feedbackStartedAtMs === null) return {}
      if (state.phase === 'game_over' || state.phase === 'intro' || state.phase === 'tribunal_challenge') return {}

      const now = getClockTickNow(null, state.feedbackStartedAtMs, elapsedMs)
      const feedbackRemainingMs = getRemainingFromClock(
        state.feedbackStartedAtMs,
        null,
        0,
        state.feedbackDurationMs,
        now,
      )

      if (feedbackRemainingMs > 0) {
        return { feedbackRemainingMs }
      }

      return {
        phase: 'round_end' as QuizPhase,
        timerStatus: 'idle' as TimerStatus,
        timerVisible: false,
        autoSequenceStatus: 'completed' as AutoSequenceStatus,
        autoAdvanceEnabled: false,
        pendingAutomationToken: null,
        feedbackRemainingMs: 0,
        gameLog: appendLogItem(state.gameLog, 'Feedback encerrado; aguardando operador para proxima rodada'),
      }
    }),
  finishFeedback: () =>
    set((state) => {
      if (state.roundFeedback === 'none') return {}
      if (state.phase === 'game_over' || state.phase === 'intro' || state.phase === 'tribunal_challenge') return {}

      return {
        phase: 'round_end' as QuizPhase,
        timerStatus: 'idle' as TimerStatus,
        timerVisible: false,
        autoSequenceStatus: 'completed' as AutoSequenceStatus,
        autoAdvanceEnabled: false,
        pendingAutomationToken: null,
        feedbackRemainingMs: 0,
        gameLog: appendLogItem(state.gameLog, 'Feedback encerrado pelo operador'),
      }
    }),
  startRoundSequence: () => {
    const state = get()
    if (!state.quizSession || state.phase === 'game_over') {
      set((state) => ({
        gameLog: appendLogItem(state.gameLog, 'Sequencia nao iniciada: quiz ausente ou encerrado'),
      }))
      return
    }
    if (state.autoSequenceStatus === 'running') return

    set((state) => {
      const nextState = {
        ...state,
        autoSequenceStatus: 'running' as AutoSequenceStatus,
        autoAdvanceEnabled: false,
        pendingAutomationToken: createId('auto'),
      }
      const historyEvents = appendHistoryEvent(nextState, 'auto_sequence_started', 'pending', { source: 'admin' })

      return {
        autoSequenceStatus: 'running',
        autoAdvanceEnabled: false,
        pendingAutomationToken: nextState.pendingAutomationToken,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, 'Rodada iniciada pelo operador'),
      }
    })
    get().enterRoundCountdown()
  },
  pauseRoundSequence: () =>
    set((state) => {
      if (state.autoSequenceStatus !== 'running') return {}
      const now = Math.max(currentClockMs(), state.roundIntroLastTickAtMs ?? 0)
      const roundIntroRemainingMs =
        state.roundIntroStatus === 'counting'
          ? getRemainingFromClock(
              state.roundIntroStartedAtMs,
              null,
              state.roundIntroAccumulatedPauseMs,
              state.roundIntroDelayMs,
              now,
            )
          : state.roundIntroRemainingMs
      const nextState = {
        ...state,
        autoSequenceStatus: 'paused' as AutoSequenceStatus,
        timerStatus: state.timerStatus === 'running' ? ('paused' as TimerStatus) : state.timerStatus,
        roundIntroRemainingMs,
        roundIntroPausedAtMs: state.roundIntroStatus === 'counting' ? now : state.roundIntroPausedAtMs,
        roundIntroLastTickAtMs: now,
      }
      const historyEvents = appendHistoryEvent(nextState, 'auto_sequence_paused', 'pending', { source: 'admin' })

      return {
        autoSequenceStatus: 'paused',
        timerStatus: nextState.timerStatus,
        roundIntroRemainingMs,
        roundIntroPausedAtMs: nextState.roundIntroPausedAtMs,
        roundIntroLastTickAtMs: now,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, 'Sequencia automatica pausada'),
      }
    }),
  resumeRoundSequence: () =>
    set((state) => {
      if (state.autoSequenceStatus !== 'paused') return {}
      const now = Math.max(currentClockMs(), state.roundIntroLastTickAtMs ?? 0)
      const nextState = {
        ...state,
        autoSequenceStatus: 'running' as AutoSequenceStatus,
        timerStatus: state.timerStatus === 'paused' && state.timerVisible ? ('running' as TimerStatus) : state.timerStatus,
        pendingAutomationToken: createId('auto'),
        roundIntroPausedAtMs: null,
        roundIntroAccumulatedPauseMs:
          state.roundIntroAccumulatedPauseMs + (state.roundIntroPausedAtMs ? now - state.roundIntroPausedAtMs : 0),
        roundIntroEndsAtMs:
          state.roundIntroEndsAtMs === null || state.roundIntroPausedAtMs === null
            ? state.roundIntroEndsAtMs
            : state.roundIntroEndsAtMs + (now - state.roundIntroPausedAtMs),
        roundIntroLastTickAtMs: now,
      }
      const historyEvents = appendHistoryEvent(nextState, 'auto_sequence_resumed', 'pending', { source: 'admin' })

      return {
        autoSequenceStatus: 'running',
        timerStatus: nextState.timerStatus,
        pendingAutomationToken: nextState.pendingAutomationToken,
        roundIntroPausedAtMs: null,
        roundIntroAccumulatedPauseMs: nextState.roundIntroAccumulatedPauseMs,
        roundIntroEndsAtMs: nextState.roundIntroEndsAtMs,
        roundIntroLastTickAtMs: now,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, 'Sequencia automatica retomada'),
      }
    }),
  endRoundSequence: () =>
    set((state) => {
      const nextState = {
        ...state,
        autoSequenceStatus: 'completed' as AutoSequenceStatus,
        autoAdvanceEnabled: false,
        roundIntroStatus: 'idle' as RoundIntroStatus,
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
        pendingAutomationToken: null,
        timerStatus: state.timerStatus === 'running' ? ('paused' as TimerStatus) : state.timerStatus,
      }
      const historyEvents = appendHistoryEvent(nextState, 'auto_sequence_completed', 'pending', { source: 'admin' })

      return {
        autoSequenceStatus: 'completed',
        autoAdvanceEnabled: false,
        roundIntroStatus: 'idle',
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
        pendingAutomationToken: null,
        timerStatus: nextState.timerStatus,
        historyEvents,
        gameLog: appendLogItem(state.gameLog, 'Sequencia automatica encerrada'),
      }
    }),
  enterRoundCountdown: () =>
    set((state) => {
      if (state.autoSequenceStatus !== 'running' || state.phase === 'game_over') return {}
      // Guard: do not re-enter countdown if already counting
      if (state.roundIntroStatus === 'counting') return {}
      const delay = getRoundIntroDelay(
        state.roundIntroSchedule,
        state.currentRound,
        state.quizSeed,
        state.quizMode,
        state.tieBreakerAttempt,
      )
      const token = createId('countdown')
      const nextState = {
        ...state,
        phase: 'round_countdown' as QuizPhase,
        roundIntroStatus: 'counting' as RoundIntroStatus,
        ...roundIntroClockFields(delay),
        pendingAutomationToken: token,
        questionVisible: false,
        timerVisible: false,
        activeGroup: null,
        lastBuzz: null,
        buzzLocked: true,
        timerStatus: 'idle' as TimerStatus,
        roundFeedback: 'none' as RoundFeedback,
        selectedChoice: null,
      }
      const historyEvents = appendHistoryEvent(nextState, 'round_countdown_started', 'pending', {
        source: 'system',
        roundIntroDelayMs: delay,
        roundIntroRemainingMs: delay,
        automationToken: token,
      })

      return {
        phase: 'round_countdown',
        roundIntroStatus: 'counting',
        ...roundIntroClockFields(delay),
        pendingAutomationToken: token,
        questionVisible: false,
        timerVisible: false,
        activeGroup: null,
        lastBuzz: null,
        buzzLocked: true,
        timerStatus: 'idle',
        roundFeedback: 'none',
        selectedChoice: null,
        historyEvents,
        gameLog: appendLogItem(
          state.gameLog,
          `COUNTDOWN_STARTED round=${state.currentRound} delayMs=${Math.round(delay)} token=${token} phase=round_countdown`,
        ),
      }
    }),
  tickRoundCountdown: (elapsedMs) =>
    set((state) => {
      if (state.autoSequenceStatus !== 'running' || state.roundIntroStatus !== 'counting') return {}
      const now = getClockTickNow(state.roundIntroLastTickAtMs, state.roundIntroStartedAtMs, elapsedMs)
      const roundIntroRemainingMs =
        state.roundIntroStartedAtMs === null
          ? Math.max(0, state.roundIntroRemainingMs - (elapsedMs ?? 100))
          : getRemainingFromClock(
              state.roundIntroStartedAtMs,
              state.roundIntroPausedAtMs,
              state.roundIntroAccumulatedPauseMs,
              state.roundIntroDelayMs,
              now,
            )
      return { roundIntroRemainingMs, roundIntroLastTickAtMs: now }
    }),
  skipRoundCountdown: () =>
    set((state) => {
      if (state.roundIntroStatus !== 'counting') return {}
      const nextState = {
        ...state,
        roundIntroStatus: 'skipped' as RoundIntroStatus,
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
      }
      const historyEvents = appendHistoryEvent(nextState, 'round_countdown_skipped', 'pending', {
        source: 'admin',
        roundIntroDelayMs: state.roundIntroDelayMs,
        roundIntroRemainingMs: 0,
        automationToken: state.pendingAutomationToken,
      })

      return {
        roundIntroStatus: 'skipped',
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
        historyEvents,
        gameLog: appendLogItem(state.gameLog, 'Countdown pulado pelo operador'),
      }
    }),
  finishRoundCountdown: () =>
    set((state) => {
      if (state.roundIntroStatus !== 'counting' && state.roundIntroStatus !== 'skipped') return {}
      const nextState = {
        ...state,
        roundIntroStatus: 'finished' as RoundIntroStatus,
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
      }
      const historyEvents = appendHistoryEvent(nextState, 'round_countdown_finished', 'pending', {
        source: 'system',
        roundIntroDelayMs: state.roundIntroDelayMs,
        roundIntroRemainingMs: 0,
        automationToken: state.pendingAutomationToken,
      })

      return {
        roundIntroStatus: 'finished',
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
        historyEvents,
        gameLog: appendLogItem(state.gameLog, 'Countdown finalizado'),
      }
    }),
  scheduleAutoNextRound: () =>
    set((state) => {
      if (state.autoSequenceStatus !== 'running' || state.phase === 'game_over') return {}
      const delay = getPostFeedbackDelay(state.quizSeed, state.currentRound, state.tieBreakerAttempt)
      const token = createId('advance')
      const nextState = {
        ...state,
        phase: 'auto_next_round_delay' as QuizPhase,
        postFeedbackDelayMs: delay,
        pendingAutomationToken: token,
        buzzLocked: true,
        timerStatus: 'idle' as TimerStatus,
      }
      const historyEvents = appendHistoryEvent(nextState, 'auto_next_round_scheduled', 'pending', {
        source: 'system',
        postFeedbackDelayMs: delay,
        automationToken: token,
      })

      return {
        phase: 'auto_next_round_delay',
        postFeedbackDelayMs: delay,
        pendingAutomationToken: token,
        buzzLocked: true,
        timerStatus: 'idle',
        historyEvents,
        gameLog: appendLogItem(state.gameLog, `Proximo round automatico em ${Math.ceil(delay / 1000)}s`),
      }
    }),
  forceNextRoundTechnical: () => {
    get().nextRound()
    const state = get()
    if (state.phase !== 'game_over' && state.autoSequenceStatus === 'running') {
      get().enterRoundCountdown()
    }
  },
  completeAutoSequence: () =>
    set((state) => {
      if (state.autoSequenceStatus === 'completed') return {}
      const nextState = {
        ...state,
        autoSequenceStatus: 'completed' as AutoSequenceStatus,
        autoAdvanceEnabled: false,
        pendingAutomationToken: null,
        roundIntroStatus: 'idle' as RoundIntroStatus,
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
      }
      const historyEvents = appendHistoryEvent(nextState, 'auto_sequence_completed', 'winner', { source: 'system' })

      return {
        autoSequenceStatus: 'completed',
        autoAdvanceEnabled: false,
        pendingAutomationToken: null,
        roundIntroStatus: 'idle',
        roundIntroRemainingMs: 0,
        ...resetRoundIntroClockFields(),
        historyEvents,
        gameLog: appendLogItem(state.gameLog, 'Sequencia automatica concluida'),
      }
    }),
  setSerialStatus: (status) =>
    set((state) => ({
      serialStatus: status,
      serialConnected: status === 'connected',
      serialError: status === 'error' ? 'Serial connection error' : null,
      gameLog: appendLogItem(state.gameLog, `SERIAL_STATUS status=${status}`),
    })),
  setSerialLastCommand: (command) =>
    set((state) => ({
      serialLastCommand: command,
      gameLog: appendLogItem(state.gameLog, `SERIAL_COMMAND_SENT command=${command}`),
    })),
  handleSerialMessage: (message) => {
    if (message.type === 'event' && (message.eventName === 'BT1PRESS' || message.eventName === 'BT2PRESS')) {
      get().receiveHardwareBuzz(message.eventName)
      return
    }

    set((state) => {
      if (message.type === 'status') {
        return {
          serialLocked: message.locked,
          serialLastEvent: message.raw,
          gameLog: appendLogItem(state.gameLog, `Status serial: ${message.raw}`),
        }
      }

      if (message.type === 'dfplayer') {
        return {
          dfPlayerReady: message.ready,
          serialLastEvent: message.raw,
          gameLog: appendLogItem(state.gameLog, `DFPlayer: ${message.raw}`),
        }
      }

      if (message.type === 'error') {
        return {
          serialError: message.message,
          serialLastEvent: message.raw,
          gameLog: appendLogItem(state.gameLog, `SERIAL_ERROR raw=${message.raw} message=${message.message}`),
        }
      }

      if (message.type !== 'event') {
        return { serialLastEvent: message.raw }
      }

      if (message.eventName === 'RESET') {
        const now = currentClockMs()
        const repeatedReset = state.serialResetLastAtMs !== null && now - state.serialResetLastAtMs < RESET_HW_DEBOUNCE_MS
        const correlationId = repeatedReset ? state.serialResetCorrelationId : createId('reset')
        return {
          serialLastEvent: message.raw,
          serialResetLastAtMs: now,
          serialResetCorrelationId: correlationId,
          serialResetSource: 'arduino' as const,
          gameLog: repeatedReset ? state.gameLog : appendLogItem(state.gameLog, `RESET ACK recebido do Arduino (${correlationId})`),
        }
      }

      if (message.eventName === 'ARDUINO_READY') {
        return {
          serialLastEvent: message.raw,
          serialError: null,
          gameLog: appendLogItem(state.gameLog, 'Arduino pronto'),
        }
      }

      if (message.eventName === 'DFPLAYER_READY') {
        return {
          dfPlayerReady: true,
          serialLastEvent: message.raw,
          gameLog: appendLogItem(state.gameLog, 'DFPlayer pronto'),
        }
      }

      if (message.eventName === 'DFPLAYER_ERROR') {
        return {
          dfPlayerReady: false,
          serialLastEvent: message.raw,
          gameLog: appendLogItem(state.gameLog, 'DFPlayer com erro'),
        }
      }

      if (message.eventName === 'LOCKED') {
        return {
          serialLocked: true,
          serialLastEvent: message.raw,
          gameLog: appendLogItem(state.gameLog, 'Arduino confirmou LOCKED'),
        }
      }

      if (message.eventName === 'UNLOCKED') {
        return {
          serialLocked: false,
          serialLastEvent: message.raw,
          gameLog: appendLogItem(state.gameLog, 'Arduino confirmou UNLOCKED'),
        }
      }

      return {
        serialLastEvent: message.raw,
        gameLog: appendLogItem(state.gameLog, `Evento serial: ${message.raw}`),
      }
    })
  },
  clearHistory: () =>
    set((state) => {
      clearStoredHistoryEvents()
      return {
        historyEvents: [],
        gameLog: appendLogItem(state.gameLog, 'Historico local limpo'),
      }
    }),
  openFinalShow: () =>
    set((state) => {
      if (state.phase !== 'game_over') return {}
      return {
        finalShowStatus: 'open',
        gameLog: appendLogItem(state.gameLog, 'Final Show aberto na Stage'),
      }
    }),
  replayFinalShow: () =>
    set((state) => {
      if (state.phase !== 'game_over') return {}
      return {
        finalShowStatus: 'replaying',
        gameLog: appendLogItem(state.gameLog, 'Final Show repetido na Stage'),
      }
    }),
  closeFinalShow: () =>
    set((state) => {
      if (state.phase !== 'game_over') return {}
      return {
        finalShowStatus: 'closed',
        gameLog: appendLogItem(state.gameLog, 'Final Show encerrado; partida preservada para exportacao'),
      }
    }),
  setPublicAudioMuted: (muted) =>
    set((state) => ({
      publicAudioMuted: muted,
      gameLog: appendLogItem(state.gameLog, muted ? 'Audio publico da TV mutado' : 'Audio publico da TV liberado'),
    })),
  setPublicAudioMasterVolume: (volume) =>
    set((state) => {
      const publicAudioMasterVolume = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : state.publicAudioMasterVolume))
      return {
        publicAudioMasterVolume,
        gameLog: appendLogItem(state.gameLog, `Volume publico da TV: ${Math.round(publicAudioMasterVolume * 100)}%`),
      }
    }),
  applySnapshot: (snapshot) =>
    set(() => ({
      ...snapshot,
      timerSeconds: snapshot.timerRemaining,
      lastStateSyncedAtMs: currentClockMs(),
    })),
  getSnapshot: () => snapshotFromState(get()),
}))
