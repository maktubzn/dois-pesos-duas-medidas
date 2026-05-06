// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AudioManager } from './AudioManager'
import { audioManifest } from './audioManifest'
import type { AudioAssetId } from './audioTypes'

class MockAudioElement {
  src: string
  preload = ''
  loop = false
  volume = 1
  currentTime = 0
  paused = true
  play = vi.fn(() => {
    this.paused = false
    return Promise.resolve()
  })
  pause = vi.fn(() => {
    this.paused = true
  })
  load = vi.fn()
  addEventListener = vi.fn()

  constructor(src: string) {
    this.src = src
  }
}

function createManager(options: { throwFor?: AudioAssetId } = {}) {
  const created: MockAudioElement[] = []
  const manager = new AudioManager({
    dev: false,
    createAudio: (src) => {
      const id = Object.values(audioManifest).find((item) => item.path === src)?.id
      if (id && id === options.throwFor) throw new Error('missing audio file')
      const audio = new MockAudioElement(src)
      created.push(audio)
      return audio as unknown as HTMLAudioElement
    },
  })
  return { manager, created }
}

describe('AudioManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('nao quebra se arquivo faltar', async () => {
    const { manager } = createManager({ throwFor: 'resposta_certa' })
    await manager.unlock()

    expect(() => manager.play('resposta_certa')).not.toThrow()
    expect(manager.getState().activeCount).toBe(0)
  })

  it('mute impede audio', async () => {
    const { manager } = createManager()
    await manager.unlock()
    manager.setMuted(true)

    expect(manager.play('resposta_certa')).toBeNull()
    expect(manager.getState().activeCount).toBe(0)
  })

  it('nao toca musica antes do unlock', () => {
    const { manager } = createManager()

    expect(manager.playLoop('preshow_theme')).toBeNull()
    expect(manager.getState().activeCount).toBe(0)
  })

  it('volume master funciona', async () => {
    const { manager, created } = createManager()
    await manager.unlock()
    manager.setMasterVolume(0.5)
    manager.play('resposta_certa')

    const played = created.at(-1)
    expect(played?.volume).toBeCloseTo(audioManifest.resposta_certa.defaultVolume * 0.5)
  })

  it('volume por categoria funciona', async () => {
    const { manager, created } = createManager()
    await manager.unlock()
    manager.setCategoryVolume('sfx', 0.25)
    manager.play('resposta_errada')

    const played = created.at(-1)
    expect(played?.volume).toBeCloseTo(audioManifest.resposta_errada.defaultVolume * 0.25)
  })

  it('volume de musica funciona separado dos efeitos', async () => {
    const { manager, created } = createManager()
    await manager.unlock()
    manager.setCategoryVolume('music', 0.25)
    manager.playLoop('preshow_theme')

    const played = created.at(-1)
    expect(played?.volume).toBeCloseTo(audioManifest.preshow_theme.defaultVolume * 0.25)
  })

  it('loop pode ser iniciado e parado', async () => {
    const { manager, created } = createManager()
    await manager.unlock()
    manager.playLoop('tempo_resposta_relogio_tenso')

    expect(manager.getState().loopIds).toEqual(['tempo_resposta_relogio_tenso'])
    expect(created.at(-1)?.loop).toBe(true)

    manager.stop('tempo_resposta_relogio_tenso')
    expect(manager.getState().loopIds).toEqual([])
    expect(created.at(-1)?.pause).toHaveBeenCalled()
  })
})
