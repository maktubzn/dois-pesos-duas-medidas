export type GroupId = 'A' | 'B'

export type AppRoute = 'stage' | 'admin'

export type QuizPhase =
  | 'intro'
  | 'idle'
  | 'round_preparing'
  | 'round_countdown'
  | 'round_prepare'
  | 'input_ready'
  | 'question_reveal'
  | 'buzz_open'
  | 'team_answering'
  | 'pass_decision'
  | 'repass_decision'
  | 'answer_locked'
  | 'scoring'
  | 'auto_next_round_delay'
  | 'round_end'
  | 'time_up'
  | 'tribunal_challenge'
  | 'game_over'
  | 'error'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'time_up'

export type PreShowStatus = 'idle' | 'playing' | 'paused' | 'skipped' | 'finished'

export type FinalShowStatus = 'idle' | 'open' | 'replaying' | 'closed'

export type PreShowInputCheckStatus =
  | 'idle'
  | 'waitingA'
  | 'receivedA'
  | 'waitingB'
  | 'receivedB'
  | 'complete'

export type RoundFeedback =
  | 'none'
  | 'correct'
  | 'wrong'
  | 'time_up'
  | 'opponent_bonus'
  | 'silence_penalty'
  | 'tribunal_correct'
  | 'tribunal_wrong'
  | 'tribunal_silence'

export type TribunalChallengeStatus = 'idle' | 'calling' | 'awaiting_decision' | 'attempting' | 'resolved' | 'cancelled'

export type TribunalChallengeOutcome = 'correct' | 'wrong' | 'silence' | 'cancelled' | null

export type AutoSequenceStatus = 'idle' | 'running' | 'paused' | 'completed'

export type RoundIntroStatus = 'idle' | 'counting' | 'skipped' | 'finished'

export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export type ChoiceOption = 'A' | 'B'

export type QuizQuestionType = 'character_image' | 'text_choice' | 'tie_breaker'

export type QuizMode = 'main' | 'tie_breaker'

export type WinReason = 'score' | 'tie_breaker' | null

export interface CharacterImageQuestion {
  id: string
  type: 'character_image'
  characterName: string
  aliases: string[]
  imageSrc: string
  imageFile: string
  difficulty: QuestionDifficulty
  points: number
  tags?: string[]
}

export interface TextChoiceQuestion {
  id: string
  type: 'text_choice'
  prompt: string
  optionA: string
  optionB: string
  correctOption: ChoiceOption
  explanation?: string
  difficulty: QuestionDifficulty
  points: number
}

export interface TieBreakerQuestion {
  id: string
  type: 'tie_breaker'
  prompt: string
  optionA: string
  optionB: string
  correctOption: ChoiceOption
  explanation?: string
}

export type QuizQuestion = CharacterImageQuestion | TextChoiceQuestion | TieBreakerQuestion

export interface QuizRound {
  round: number
  question: CharacterImageQuestion | TextChoiceQuestion
}

export interface QuizSession {
  id: string
  seed: string
  rounds: QuizRound[]
  tieBreakers: TieBreakerQuestion[]
  createdAt: string
}

export type AnswerResult = 'pending' | 'correct' | 'wrong' | 'time_up' | 'winner'

export type HistoryEventName =
  | 'match_started'
  | 'auto_sequence_started'
  | 'auto_sequence_paused'
  | 'auto_sequence_resumed'
  | 'auto_sequence_completed'
  | 'round_countdown_started'
  | 'round_countdown_skipped'
  | 'round_countdown_finished'
  | 'auto_next_round_scheduled'
  | 'round_started'
  | 'turn_taken'
  | 'answer_confirmed'
  | 'correct'
  | 'wrong'
  | 'wrong_opponent_bonus'
  | 'no_answer_penalty'
  | 'reopen_turn'
  | 'time_up'
  | 'tribunal_started'
  | 'tribunal_group_drawn'
  | 'tribunal_passed'
  | 'tribunal_attempt_started'
  | 'tribunal_attempt_correct'
  | 'tribunal_attempt_wrong'
  | 'tribunal_silence'
  | 'tribunal_cancelled'
  | 'tie_breaker_started'
  | 'winner_declared'
  | 'match_reset'

export interface GameHistoryEvent {
  id: string
  matchId: string
  timestamp: string
  seed: string
  mode: QuizMode
  event: HistoryEventName
  round: number
  questionType: QuizQuestionType | null
  questionId: string | null
  imageSrc: string | null
  prompt: string | null
  optionA: string | null
  optionB: string | null
  correctAnswer: string | null
  group: GroupId | null
  playerChoice: ChoiceOption | null
  result: AnswerResult
  scoreBeforeA: number
  scoreBeforeB: number
  scoreAfterA: number
  scoreAfterB: number
  timerRemaining: number
  actorGroup?: GroupId | null
  beneficiaryGroup?: GroupId | null
  scoreDelta?: number | null
  tribunalCalledGroup?: GroupId | null
  tribunalAttemptingGroup?: GroupId | null
  tribunalPassedGroups?: GroupId[]
  tribunalOutcome?: TribunalChallengeOutcome
  operatorAction?: string | null
  roundIntroDelayMs?: number
  roundIntroRemainingMs?: number
  postFeedbackDelayMs?: number
  automationToken?: string | null
  source: 'admin' | 'keyboard' | 'arduino' | 'system'
}

export type SerialEventName =
  | 'ARDUINO_READY'
  | 'DFPLAYER_READY'
  | 'DFPLAYER_ERROR'
  | 'BT1PRESS'
  | 'BT2PRESS'
  | 'RESET'
  | 'LOCKED'
  | 'UNLOCKED'
  | 'PONG'

export type SerialMessage =
  | { type: 'event'; eventName: SerialEventName; raw: string }
  | { type: 'status'; locked: boolean; raw: string }
  | { type: 'dfplayer'; ready: boolean; raw: string }
  | { type: 'error'; message: string; raw: string }
  | { type: 'unknown'; raw: string }

export type SerialCommand =
  | 'PING'
  | 'STATUS'
  | 'LOCK'
  | 'UNLOCK'
  | 'RESET_HW'
  | 'LED1_ON'
  | 'LED2_ON'
  | 'LEDS_OFF'
  | 'PLAY_BUZZ'
  | 'STOP_AUDIO'
  | `VOLUME:${number}`

export type SerialStatus =
  | 'unsupported'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'

export type InputSource = 'keyboard' | 'serial' | 'virtual' | 'test'

export interface InputTelemetryEvent {
  id: string
  source: InputSource
  group: GroupId
  timestamp: number
  phase: QuizPhase
  accepted: boolean
  reason: string
}

export interface GroupCardState {
  group: GroupId
  status: 'AGUARDANDO' | 'COM A PALAVRA' | 'BLOQUEADO'
}

export type RealtimeSource = 'admin' | 'stage'

export type AdminCommand =
  | 'START_QUIZ'
  | 'NEXT_ROUND'
  | 'REVEAL_QUESTION'
  | 'OPEN_BUZZ'
  | 'LOCK_BUZZ'
  | 'RESET_ROUND'
  | 'RESET_GAME'
  | 'AWARD_POINTS'
  | 'MARK_WRONG'
  | 'TIMER_START'
  | 'TIMER_PAUSE'
  | 'TIMER_RESUME'
  | 'TIMER_RESET'
  | 'SERIAL_PING'
  | 'SERIAL_STATUS'
  | 'SERIAL_RESET_HW'
  | 'SERIAL_UNLOCK'
  | 'SERIAL_LOCK'

export interface GameStateSnapshot {
  phase: QuizPhase
  preShowStatus: PreShowStatus
  preShowElapsedMs: number
  preShowStartedAtMs: number | null
  preShowDurationMs: number
  preShowEndsAtMs: number | null
  preShowPausedAtMs: number | null
  preShowAccumulatedPauseMs: number
  preShowLastTickAtMs: number | null
  preShowInputCheckStatus: PreShowInputCheckStatus
  preShowInputCheckReceivedGroups: GroupId[]
  preShowInputCheckLastGroup: GroupId | null
  scoreA: number
  scoreB: number
  serialConnected: boolean
  serialStatus: SerialStatus
  serialLocked: boolean
  serialLastEvent: string | null
  serialLastCommand: string | null
  serialError: string | null
  serialResetLastAtMs: number | null
  serialResetCorrelationId: string | null
  serialResetSource: 'arduino' | 'manual' | 'system' | null
  dfPlayerReady: boolean | null
  lastBuzz: GroupId | null
  activeGroup: GroupId | null
  buzzLocked: boolean
  inputReady: boolean
  inputReadyAtMs: number | null
  inputReadyToken: string | null
  lastInputEvent: InputTelemetryEvent | null
  inputEvents: InputTelemetryEvent[]
  currentQuestion: string
  questionVisible: boolean
  timerVisible: boolean
  currentRound: number
  totalRounds: number
  activeSlot: number
  answerTimeSeconds: number
  timerRemaining: number
  timerStartedAtMs: number | null
  timerDurationMs: number
  timerEndsAtMs: number | null
  timerPausedAtMs: number | null
  timerAccumulatedPauseMs: number
  timerLastTickAtMs: number | null
  timerStatus: TimerStatus
  roundFeedback: RoundFeedback
  feedbackStartedAtMs: number | null
  feedbackDurationMs: number
  feedbackEndsAtMs: number | null
  feedbackRemainingMs: number
  feedbackToken: string | null
  lastScoredGroup: GroupId | null
  lastScoreDelta: number
  quizSession: QuizSession | null
  quizSeed: string | null
  matchId: string | null
  quizMode: QuizMode
  currentRoundQuestion: QuizQuestion | null
  selectedChoice: ChoiceOption | null
  winner: GroupId | null
  winReason: WinReason
  finalShowStatus: FinalShowStatus
  tieBreakerAttempt: number
  tieBreakerBlockedGroups: GroupId[]
  tribunalStatus: TribunalChallengeStatus
  tribunalCalledGroup: GroupId | null
  tribunalPassedGroups: GroupId[]
  tribunalAttemptingGroup: GroupId | null
  tribunalOutcome: TribunalChallengeOutcome
  tribunalStartedAt: string | null
  tribunalResolvedAt: string | null
  autoSequenceStatus: AutoSequenceStatus
  roundIntroStatus: RoundIntroStatus
  roundIntroDelayMs: number
  roundIntroRemainingMs: number
  roundIntroStartedAtMs: number | null
  roundIntroEndsAtMs: number | null
  roundIntroPausedAtMs: number | null
  roundIntroAccumulatedPauseMs: number
  roundIntroLastTickAtMs: number | null
  roundIntroSchedule: number[]
  postFeedbackDelayMs: number
  autoAdvanceEnabled: boolean
  pendingAutomationToken: string | null
  historyEvents: GameHistoryEvent[]
  gameLog: string[]
  publicAudioMuted: boolean
  publicAudioMasterVolume: number
  lastStateSyncedAtMs: number | null
}

export interface SerialEventPayload {
  raw: string
  group: GroupId | null
  calibrated: boolean
}

export interface RoundEvent {
  currentRound: number
  totalRounds: number
  activeSlot: number
  phase: QuizPhase
}

export interface ScoreEvent {
  group: GroupId
  amount: number
  scoreA: number
  scoreB: number
}

export interface StageAudioStatusPayload {
  unlocked: boolean
  muted: boolean
  masterVolume: number
  activeLoops: string[]
  lastError: string | null
}

export interface StageHeartbeatPayload {
  visibilityState: DocumentVisibilityState
  phase: QuizPhase
  clockNowMs: number
  lastSnapshotAtMs: number | null
  audioUnlocked: boolean
}

export type RealtimeMessage =
  | {
      type: 'GAME_STATE_SYNC'
      originId: string
      source: RealtimeSource
      sentAt: number
      payload: GameStateSnapshot
    }
  | {
      type: 'ADMIN_COMMAND'
      originId: string
      source: RealtimeSource
      sentAt: number
      payload: { command: AdminCommand; group?: GroupId; amount?: number }
    }
  | {
      type: 'SERIAL_EVENT'
      originId: string
      source: RealtimeSource
      sentAt: number
      payload: SerialEventPayload
    }
  | {
      type: 'ROUND_EVENT'
      originId: string
      source: RealtimeSource
      sentAt: number
      payload: RoundEvent
    }
  | {
      type: 'SCORE_EVENT'
      originId: string
      source: RealtimeSource
      sentAt: number
      payload: ScoreEvent
    }
  | {
      type: 'STAGE_AUDIO_STATUS_SYNC'
      originId: string
      source: 'stage'
      sentAt: number
      payload: StageAudioStatusPayload
    }
  | {
      type: 'STAGE_HEARTBEAT'
      originId: string
      source: 'stage'
      sentAt: number
      payload: StageHeartbeatPayload
    }
