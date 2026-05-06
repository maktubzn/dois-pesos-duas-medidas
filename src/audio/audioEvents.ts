import type { AudioAssetId, GameAudioState } from './audioTypes'
import type { AudioManager } from './AudioManager'
import { getPreShowScene } from '@/utils/preShowTimeline'

const ANSWER_LOOP_ID: AudioAssetId = 'tempo_resposta_relogio_tenso'
const PRESHOW_THEME_ID: AudioAssetId = 'preshow_theme'
const TRIBUNAL_THEME_ID: AudioAssetId = 'desafio_tribunal_theme'
const COUNTDOWN_INTERVAL_MS = 1_000
const PRESHOW_MUSIC_FADE_MS = 420

export function clampCountdownSeconds(seconds: number) {
  if (!Number.isFinite(seconds)) return 3
  return Math.max(3, Math.min(5, Math.ceil(seconds)))
}

export function getCountdownVoiceSequence(seconds: number): AudioAssetId[] {
  const clamped = clampCountdownSeconds(seconds)
  const ids: AudioAssetId[] = []
  for (let value = clamped; value >= 1; value -= 1) {
    ids.push(`contador_${value}` as AudioAssetId)
  }
  ids.push('contador_0_valendo')
  return ids
}

export class GameAudioController {
  private manager: AudioManager
  private previous: GameAudioState | null = null
  private countdownTimers: ReturnType<typeof window.setTimeout>[] = []
  private preShowMusicTimer: ReturnType<typeof window.setInterval> | null = null
  private lastCountdownKey: string | null = null
  private lastTieBreakerKey: string | null = null
  private lastTribunalKey: string | null = null
  private lastTurnSoundKey: string | null = null
  private preShowMusicStarted = false
  private tribunalMusicStarted = false

  constructor(manager: AudioManager) {
    this.manager = manager
  }

  sync(next: GameAudioState) {
    const previous = this.previous

    if (!previous) {
      this.previous = next
      this.syncPreShowMusic(null, next)
      this.startCurrentContinuousAudio(next)
      return
    }

    this.syncPreShowMusic(previous, next)
    this.syncTribunalMusic(previous, next)
    this.syncCountdown(previous, next)
    this.syncAnswerLoop(previous, next)
    this.syncFeedback(previous, next)
    this.syncTieBreaker(previous, next)
    this.syncGameOver(previous, next)
    this.syncCleanup(previous, next)

    this.previous = next
  }

  reset() {
    this.stopCountdown()
    this.stopPreShowMusic(0)
    this.manager.stopAll()
    this.previous = null
    this.lastCountdownKey = null
    this.lastTieBreakerKey = null
    this.lastTribunalKey = null
    this.lastTurnSoundKey = null
    this.preShowMusicStarted = false
    this.tribunalMusicStarted = false
  }

  private startCurrentContinuousAudio(next: GameAudioState) {
    if (next.phase === 'round_countdown' && next.roundIntroStatus === 'counting') {
      this.lastCountdownKey = `${next.pendingAutomationToken ?? 'manual'}:${next.currentRound}:${next.quizMode}:${next.tieBreakerAttempt}:${next.roundIntroDelayMs}`
      this.playCountdown(next.roundIntroDelayMs / 1000)
    }

    if (next.phase === 'buzz_open' && next.timerStatus === 'running') {
      this.manager.playLoop(ANSWER_LOOP_ID, { restart: false })
    }

    if (next.phase === 'tribunal_challenge') {
      this.startTribunalMusic(next)
    }
  }

  private syncCountdown(previous: GameAudioState, next: GameAudioState) {
    const countdownKey = `${next.pendingAutomationToken ?? 'manual'}:${next.currentRound}:${next.quizMode}:${next.tieBreakerAttempt}:${next.roundIntroDelayMs}`
    const enteredCountdown =
      next.phase === 'round_countdown' &&
      next.roundIntroStatus === 'counting' &&
      (previous.phase !== 'round_countdown' || this.lastCountdownKey !== countdownKey)

    if (enteredCountdown) {
      this.stopCountdown()
      this.lastCountdownKey = countdownKey
      this.playCountdown(next.roundIntroDelayMs / 1000)
      return
    }

    if (previous.phase === 'round_countdown' && next.phase !== 'round_countdown') {
      this.stopCountdown()
    }

    if (next.autoSequenceStatus === 'paused') {
      this.stopCountdown()
    }
  }

  private syncAnswerLoop(previous: GameAudioState, next: GameAudioState) {
    const answerWindowOpened =
      next.phase === 'buzz_open' &&
      next.timerStatus === 'running' &&
      (previous.phase !== 'buzz_open' || previous.timerStatus !== 'running')

    if (answerWindowOpened) {
      this.manager.playLoop(ANSWER_LOOP_ID, { restart: true })
      return
    }

    const turnSoundKey = `${next.currentRound}:${next.quizMode}:${next.tieBreakerAttempt}:${next.activeGroup ?? 'none'}:${next.phase}`
    const groupTookTurn =
      next.phase === 'team_answering' &&
      Boolean(next.activeGroup) &&
      (previous.activeGroup !== next.activeGroup || previous.phase !== 'team_answering') &&
      this.lastTurnSoundKey !== turnSoundKey
    if (groupTookTurn) {
      this.lastTurnSoundKey = turnSoundKey
      this.manager.fadeOut(ANSWER_LOOP_ID)
      this.manager.play('grupo_pegou_vez', { restart: true })
      return
    }

    if (previous.timerStatus === 'running' && next.timerStatus !== 'running') {
      this.manager.fadeOut(ANSWER_LOOP_ID)
    }
  }

  private syncFeedback(previous: GameAudioState, next: GameAudioState) {
    if (previous.roundFeedback === next.roundFeedback || next.roundFeedback === 'none') return

    if (next.roundFeedback === 'correct') {
      this.stopGameLoops()
      this.manager.play('resposta_certa', { restart: true })
      return
    }

    if (next.roundFeedback === 'wrong') {
      this.stopGameLoops()
      this.manager.play('resposta_errada', { restart: true })
      return
    }

    if (next.roundFeedback === 'opponent_bonus' || next.roundFeedback === 'silence_penalty' || next.roundFeedback === 'tribunal_wrong') {
      this.stopGameLoops()
      this.stopTribunalMusic(420)
      this.manager.play('resposta_errada', { restart: true })
      return
    }

    if (next.roundFeedback === 'tribunal_correct') {
      this.stopGameLoops()
      this.stopTribunalMusic(420)
      this.manager.play('resposta_certa', { restart: true })
      return
    }

    if (next.roundFeedback === 'time_up') {
      this.stopGameLoops()
      this.manager.play('tempo_esgotado', { restart: true })
    }
  }

  private syncTieBreaker(previous: GameAudioState, next: GameAudioState) {
    if (next.quizMode !== 'tie_breaker') return
    const tieKey = `${next.currentRound}:${next.tieBreakerAttempt}`
    const enteredTieBreaker = previous.quizMode !== 'tie_breaker' || this.lastTieBreakerKey !== tieKey
    if (!enteredTieBreaker) return

    this.lastTieBreakerKey = tieKey
    this.manager.play('veredito_final', { restart: true })
  }

  private syncGameOver(previous: GameAudioState, next: GameAudioState) {
    if (previous.phase === 'game_over' || next.phase !== 'game_over') return
    this.stopCountdown()
    this.manager.stopAll()
    this.manager.play('fim_de_jogo', { restart: true })
  }

  private syncCleanup(previous: GameAudioState, next: GameAudioState) {
    if (next.phase === 'intro' && previous.phase !== 'intro') {
      this.stopCountdown()
      this.manager.stopAll()
      this.previous = next
      this.preShowMusicStarted = false
      this.syncPreShowMusic(previous, next)
      return
    }

    if (previous.phase === 'tribunal_challenge' && next.phase !== 'tribunal_challenge') {
      this.stopTribunalMusic(520)
    }

    if (next.phase === 'round_prepare' && previous.phase !== 'round_prepare') {
      this.stopGameLoops()
    }
  }

  private playCountdown(seconds: number) {
    getCountdownVoiceSequence(seconds).forEach((id, index) => {
      const timer = window.setTimeout(() => {
        this.manager.play(id, { restart: true })
      }, index * COUNTDOWN_INTERVAL_MS)
      this.countdownTimers.push(timer)
    })
  }

  private stopCountdown() {
    for (const timer of this.countdownTimers) {
      window.clearTimeout(timer)
    }
    this.countdownTimers = []
  }

  private stopGameLoops() {
    this.manager.stop(ANSWER_LOOP_ID)
  }

  private syncTribunalMusic(previous: GameAudioState, next: GameAudioState) {
    if (next.phase === 'tribunal_challenge') {
      const tribunalKey = `${next.currentRound}:${next.tribunalCalledGroup ?? 'none'}:${next.tribunalStatus}`
      const enteredTribunal = previous.phase !== 'tribunal_challenge' || this.lastTribunalKey !== tribunalKey
      if (enteredTribunal) {
        this.lastTribunalKey = tribunalKey
        this.startTribunalMusic(next)
      }
      return
    }

    if (previous.phase === 'tribunal_challenge' || this.tribunalMusicStarted) {
      this.stopTribunalMusic(520)
    }
  }

  private startTribunalMusic(next: GameAudioState) {
    if (next.tribunalStatus === 'resolved' || next.tribunalStatus === 'cancelled') {
      this.stopTribunalMusic(360)
      return
    }

    if (!this.tribunalMusicStarted) {
      this.manager.setCategoryVolume('music', 0.8)
      this.manager.playLoop(TRIBUNAL_THEME_ID, { restart: true })
      this.tribunalMusicStarted = true
    }
  }

  private stopTribunalMusic(durationMs: number) {
    if (!this.tribunalMusicStarted) return
    this.manager.fadeOut(TRIBUNAL_THEME_ID, durationMs)
    this.tribunalMusicStarted = false
    this.lastTribunalKey = null
  }

  private syncPreShowMusic(previous: GameAudioState | null, next: GameAudioState) {
    if (next.phase !== 'intro') {
      if (previous?.phase === 'intro' || this.preShowMusicStarted) {
        this.stopPreShowMusic(320)
      }
      return
    }

    if (next.preShowStatus === 'finished' || next.preShowStatus === 'skipped') {
      this.stopPreShowMusic(520)
      return
    }

    const targetVolume = this.getPreShowMusicVolume(next)
    if (!this.preShowMusicStarted) {
      this.manager.setCategoryVolume('music', 0)
      this.manager.playLoop(PRESHOW_THEME_ID, { restart: true })
      this.preShowMusicStarted = true
    }

    this.fadeMusicCategory(targetVolume, PRESHOW_MUSIC_FADE_MS)
  }

  private getPreShowMusicVolume(next: GameAudioState) {
    if (next.preShowStatus === 'idle') return 0.06
    if (next.preShowStatus === 'paused') return 0.04
    if (next.preShowStatus !== 'playing') return 0

    const scene = getPreShowScene(next.preShowStatus, next.preShowElapsedMs)
    if (scene.id.startsWith('how_to_play')) return 0.09
    if (scene.id === 'button_check') return 0.04
    if (scene.id === 'ready_to_start') return 0
    if (scene.id === 'cinematic_video') return 0.58
    if (scene.id === 'title_over_video') return 0.64
    return 0.46
  }

  private fadeMusicCategory(targetVolume: number, durationMs: number) {
    if (this.preShowMusicTimer) {
      window.clearInterval(this.preShowMusicTimer)
      this.preShowMusicTimer = null
    }

    const startVolume = this.manager.getCategoryVolume('music')
    if (durationMs <= 0 || Math.abs(startVolume - targetVolume) < 0.01) {
      this.manager.setCategoryVolume('music', targetVolume)
      return
    }

    const startedAt = Date.now()
    this.preShowMusicTimer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs)
      const nextVolume = startVolume + (targetVolume - startVolume) * progress
      this.manager.setCategoryVolume('music', nextVolume)
      if (progress >= 1) {
        if (this.preShowMusicTimer) window.clearInterval(this.preShowMusicTimer)
        this.preShowMusicTimer = null
      }
    }, 32)
  }

  private stopPreShowMusic(durationMs: number) {
    if (this.preShowMusicTimer) {
      window.clearInterval(this.preShowMusicTimer)
      this.preShowMusicTimer = null
    }
    if (!this.preShowMusicStarted) return
    this.manager.fadeOut(PRESHOW_THEME_ID, durationMs)
    this.preShowMusicStarted = false
  }
}

export function createGameAudioController(manager: AudioManager) {
  return new GameAudioController(manager)
}
