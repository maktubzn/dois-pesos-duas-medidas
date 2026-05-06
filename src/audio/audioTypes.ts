import type { AutoSequenceStatus, GroupId, PreShowStatus, QuizMode, QuizPhase, RoundFeedback, RoundIntroStatus, TimerStatus, TribunalChallengeOutcome, TribunalChallengeStatus } from '@/types/game.types'

export type AudioCategory = 'voice' | 'sfx' | 'stinger' | 'ui' | 'music'

export type AudioAssetId =
  | 'contador_5'
  | 'contador_4'
  | 'contador_3'
  | 'contador_2'
  | 'contador_1'
  | 'contador_0_valendo'
  | 'tempo_resposta_relogio_tenso'
  | 'grupo_pegou_vez'
  | 'resposta_certa'
  | 'resposta_errada'
  | 'tempo_esgotado'
  | 'veredito_final'
  | 'fim_de_jogo'
  | 'preshow_theme'
  | 'desafio_tribunal_theme'

export interface AudioManifestItem {
  id: AudioAssetId
  path: string
  category: AudioCategory
  defaultVolume: number
  loop: boolean
  preload: boolean
  required: boolean
  description: string
}

export type AudioManifest = Record<AudioAssetId, AudioManifestItem>

export type CategoryVolumes = Record<AudioCategory, number>

export interface AudioPlaybackOptions {
  volume?: number
  loop?: boolean
  restart?: boolean
}

export interface AudioManagerOptions {
  manifest?: AudioManifest
  maxSimultaneous?: number
  createAudio?: (src: string) => HTMLAudioElement
  logger?: Pick<Console, 'debug' | 'warn'>
  dev?: boolean
}

export interface AudioRuntimeState {
  unlocked: boolean
  muted: boolean
  masterVolume: number
  categoryVolumes: CategoryVolumes
  activeCount: number
  loopIds: AudioAssetId[]
}

export interface GameAudioState {
  phase: QuizPhase
  timerStatus: TimerStatus
  roundFeedback: RoundFeedback
  activeGroup: GroupId | null
  quizMode: QuizMode
  currentRound: number
  tieBreakerAttempt: number
  roundIntroStatus: RoundIntroStatus
  roundIntroDelayMs: number
  pendingAutomationToken: string | null
  autoSequenceStatus: AutoSequenceStatus
  winner: GroupId | null
  preShowStatus: PreShowStatus
  preShowElapsedMs: number
  tribunalStatus: TribunalChallengeStatus
  tribunalCalledGroup: GroupId | null
  tribunalOutcome: TribunalChallengeOutcome
}
