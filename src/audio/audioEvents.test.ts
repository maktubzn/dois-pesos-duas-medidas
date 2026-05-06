// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AudioManager } from './AudioManager'
import { GameAudioController, getCountdownVoiceSequence } from './audioEvents'
import type { GameAudioState } from './audioTypes'

function createState(overrides: Partial<GameAudioState> = {}): GameAudioState {
  return {
    phase: 'round_prepare',
    timerStatus: 'idle',
    roundFeedback: 'none',
    activeGroup: null,
    quizMode: 'main',
    currentRound: 1,
    tieBreakerAttempt: 0,
    roundIntroStatus: 'idle',
    roundIntroDelayMs: 0,
    pendingAutomationToken: null,
    autoSequenceStatus: 'idle',
    winner: null,
    preShowStatus: 'idle',
    preShowElapsedMs: 0,
    tribunalStatus: 'idle',
    tribunalCalledGroup: null,
    tribunalOutcome: null,
    ...overrides,
  }
}

function createManagerMock() {
  return {
    play: vi.fn(),
    playLoop: vi.fn(),
    stop: vi.fn(),
    stopAll: vi.fn(),
    fadeOut: vi.fn(),
    setCategoryVolume: vi.fn(),
    getCategoryVolume: vi.fn(() => 0),
  } as unknown as AudioManager
}

describe('audio event mapping', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('countdown minimo e 3', () => {
    expect(getCountdownVoiceSequence(1)).toEqual(['contador_3', 'contador_2', 'contador_1', 'contador_0_valendo'])
  })

  it('countdown 3 toca 3,2,1,0_valendo', () => {
    expect(getCountdownVoiceSequence(3)).toEqual(['contador_3', 'contador_2', 'contador_1', 'contador_0_valendo'])
  })

  it('countdown 4 toca 4,3,2,1,0_valendo', () => {
    expect(getCountdownVoiceSequence(4)).toEqual(['contador_4', 'contador_3', 'contador_2', 'contador_1', 'contador_0_valendo'])
  })

  it('countdown 5 toca 5,4,3,2,1,0_valendo', () => {
    expect(getCountdownVoiceSequence(5)).toEqual(['contador_5', 'contador_4', 'contador_3', 'contador_2', 'contador_1', 'contador_0_valendo'])
  })

  it('loop do tempo comeca em answer_window', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState())
    controller.sync(createState({ phase: 'buzz_open', timerStatus: 'running' }))

    expect(manager.playLoop).toHaveBeenCalledWith('tempo_resposta_relogio_tenso', { restart: true })
  })

  it('loop para quando grupo pega vez', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'buzz_open', timerStatus: 'running' }))
    controller.sync(createState({ phase: 'team_answering', timerStatus: 'paused', activeGroup: 'A' }))

    expect(manager.fadeOut).toHaveBeenCalledWith('tempo_resposta_relogio_tenso')
    expect(manager.play).toHaveBeenCalledWith('grupo_pegou_vez', { restart: true })
  })

  it('nao duplica som de vez em re-render do mesmo grupo', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'buzz_open', timerStatus: 'running' }))
    controller.sync(createState({ phase: 'team_answering', timerStatus: 'paused', activeGroup: 'A' }))
    controller.sync(createState({ phase: 'team_answering', timerStatus: 'paused', activeGroup: 'A' }))

    expect(manager.play).toHaveBeenCalledTimes(1)
    expect(manager.play).toHaveBeenCalledWith('grupo_pegou_vez', { restart: true })
  })

  it('loop para com resposta certa', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'team_answering', timerStatus: 'paused', activeGroup: 'A' }))
    controller.sync(createState({ phase: 'scoring', timerStatus: 'idle', activeGroup: 'A', roundFeedback: 'correct' }))

    expect(manager.stop).toHaveBeenCalledWith('tempo_resposta_relogio_tenso')
    expect(manager.play).toHaveBeenCalledWith('resposta_certa', { restart: true })
  })

  it('loop para com resposta errada', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'team_answering', timerStatus: 'paused', activeGroup: 'A' }))
    controller.sync(createState({ phase: 'answer_locked', timerStatus: 'idle', activeGroup: 'A', roundFeedback: 'wrong' }))

    expect(manager.stop).toHaveBeenCalledWith('tempo_resposta_relogio_tenso')
    expect(manager.play).toHaveBeenCalledWith('resposta_errada', { restart: true })
  })

  it('loop para com tempo esgotado', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'buzz_open', timerStatus: 'running' }))
    controller.sync(createState({ phase: 'time_up', timerStatus: 'time_up', roundFeedback: 'time_up' }))

    expect(manager.stop).toHaveBeenCalledWith('tempo_resposta_relogio_tenso')
    expect(manager.play).toHaveBeenCalledWith('tempo_esgotado', { restart: true })
  })

  it('loop para ao pausar e volta ao retomar o timer', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'buzz_open', timerStatus: 'running' }))
    controller.sync(createState({ phase: 'buzz_open', timerStatus: 'paused' }))
    controller.sync(createState({ phase: 'buzz_open', timerStatus: 'running' }))

    expect(manager.fadeOut).toHaveBeenCalledWith('tempo_resposta_relogio_tenso')
    expect(manager.playLoop).toHaveBeenLastCalledWith('tempo_resposta_relogio_tenso', { restart: true })
  })

  it('manifest usa os SFX finais do harness 4.3', async () => {
    const { audioManifest } = await import('./audioManifest')

    expect(audioManifest.resposta_certa.path).toBe('/audio/sfx/resposta_certa.mp3')
    expect(audioManifest.resposta_errada.path).toBe('/audio/sfx/resposta_errada.mp3')
    expect(audioManifest.tempo_esgotado.path).toBe('/audio/sfx/tempo_esgotado.mp3')
    expect(audioManifest.tempo_resposta_relogio_tenso.path).toBe('/audio/sfx/tempo_resposta_relogio_tenso.mp3')
    expect(audioManifest.grupo_pegou_vez.path).toBe('/audio/Buzzer sound effect - Sound Meme (youtube).mp3')
    expect(audioManifest.desafio_tribunal_theme.path).toBe('/audio/music/desafio_tribunal_theme.mp3')
    expect(audioManifest.desafio_tribunal_theme.required).toBe(false)
  })

  it('reset limpa audio', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'buzz_open', timerStatus: 'running' }))
    controller.sync(createState({ phase: 'intro' }))

    expect(manager.stopAll).toHaveBeenCalled()
  })

  it('trilha do pre-show toca somente em intro e para ao iniciar quiz', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'intro', preShowStatus: 'playing', preShowElapsedMs: 9_000 }))
    controller.sync(createState({ phase: 'round_prepare', preShowStatus: 'finished', preShowElapsedMs: 42_000 }))

    expect(manager.playLoop).toHaveBeenCalledWith('preshow_theme', { restart: true })
    expect(manager.fadeOut).toHaveBeenCalledWith('preshow_theme', 320)
  })

  it('trilha do pre-show faz ducking no ensino', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'intro', preShowStatus: 'playing', preShowElapsedMs: 20_000 }))
    vi.advanceTimersByTime(500)

    expect(manager.setCategoryVolume).toHaveBeenCalledWith('music', 0.09)
  })

  it('game over limpa loops e toca fim de jogo', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'scoring', roundFeedback: 'correct' }))
    controller.sync(createState({ phase: 'game_over', winner: 'A' }))

    expect(manager.stopAll).toHaveBeenCalled()
    expect(manager.play).toHaveBeenCalledWith('fim_de_jogo', { restart: true })
  })

  it('toca musica do tribunal apenas durante o desafio', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState())
    controller.sync(createState({ phase: 'tribunal_challenge', tribunalStatus: 'awaiting_decision', tribunalCalledGroup: 'A' }))

    expect(manager.playLoop).toHaveBeenCalledWith('desafio_tribunal_theme', { restart: true })

    controller.sync(createState({ phase: 'answer_locked', roundFeedback: 'tribunal_silence', tribunalStatus: 'resolved', tribunalOutcome: 'silence' }))
    expect(manager.fadeOut).toHaveBeenCalledWith('desafio_tribunal_theme', 520)
  })

  it('usa SFX existentes para resultados do tribunal e bonus do adversario', () => {
    const manager = createManagerMock()
    const controller = new GameAudioController(manager)
    controller.sync(createState({ phase: 'tribunal_challenge', tribunalStatus: 'attempting', tribunalCalledGroup: 'A' }))
    controller.sync(createState({ phase: 'answer_locked', roundFeedback: 'tribunal_correct', tribunalStatus: 'resolved', tribunalOutcome: 'correct' }))
    expect(manager.play).toHaveBeenCalledWith('resposta_certa', { restart: true })

    controller.sync(createState({ phase: 'answer_locked', roundFeedback: 'opponent_bonus' }))
    expect(manager.play).toHaveBeenCalledWith('resposta_errada', { restart: true })
  })

  it('arquivo faltando nao quebra o fluxo de eventos', () => {
    const manager = new AudioManager({
      dev: false,
      createAudio: () => {
        throw new Error('missing')
      },
    })
    void manager.unlock()
    const controller = new GameAudioController(manager)
    controller.sync(createState())

    expect(() => controller.sync(createState({ phase: 'answer_locked', roundFeedback: 'wrong' }))).not.toThrow()
  })
})
