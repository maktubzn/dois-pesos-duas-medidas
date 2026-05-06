import { audioManifest } from './audioManifest'
import type { AudioAssetId, AudioCategory, AudioManagerOptions, AudioManifest, AudioPlaybackOptions, AudioRuntimeState, CategoryVolumes } from './audioTypes'

interface ActiveAudio {
  id: AudioAssetId
  element: HTMLAudioElement
  loop: boolean
}

const DEFAULT_CATEGORY_VOLUMES: CategoryVolumes = {
  voice: 1,
  sfx: 1,
  stinger: 1,
  ui: 1,
  music: 1,
}

function clampVolume(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.max(0, Math.min(1, value))
}

export class AudioManager {
  private manifest: AudioManifest
  private createAudio: (src: string) => HTMLAudioElement
  private logger: Pick<Console, 'debug' | 'warn'>
  private dev: boolean
  private maxSimultaneous: number
  private unlocked = false
  private muted = false
  private masterVolume = 1
  private categoryVolumes: CategoryVolumes = { ...DEFAULT_CATEGORY_VOLUMES }
  private active: ActiveAudio[] = []
  private loops = new Map<AudioAssetId, HTMLAudioElement>()
  private fadeTimers = new WeakMap<HTMLAudioElement, ReturnType<typeof window.setInterval>>()

  constructor(options: AudioManagerOptions = {}) {
    this.manifest = options.manifest ?? audioManifest
    this.createAudio = options.createAudio ?? ((src) => new Audio(src))
    this.logger = options.logger ?? console
    this.dev = options.dev ?? import.meta.env.DEV
    this.maxSimultaneous = options.maxSimultaneous ?? 6
  }

  async unlock() {
    this.unlocked = true
    this.preload()
    return true
  }

  preload(ids: AudioAssetId[] = Object.values(this.manifest).filter((item) => item.preload).map((item) => item.id)) {
    for (const id of ids) {
      const item = this.manifest[id]
      if (!item) continue
      try {
        const audio = this.createAudio(item.path)
        audio.preload = 'auto'
        audio.load?.()
      } catch (error) {
        this.logMissing(id, error)
      }
    }
  }

  play(id: AudioAssetId, options: AudioPlaybackOptions = {}) {
    return this.start(id, { ...options, loop: options.loop ?? false })
  }

  playLoop(id: AudioAssetId, options: AudioPlaybackOptions = {}) {
    return this.start(id, { ...options, loop: true, restart: options.restart ?? true })
  }

  stop(id: AudioAssetId) {
    for (const item of [...this.active]) {
      if (item.id === id) this.stopElement(item)
    }
    this.loops.delete(id)
  }

  stopAll() {
    for (const item of [...this.active]) {
      this.stopElement(item)
    }
    this.loops.clear()
  }

  fadeOut(id: AudioAssetId, durationMs = 220) {
    const targets = this.active.filter((item) => item.id === id)
    if (durationMs <= 0) {
      this.stop(id)
      return
    }

    for (const item of targets) {
      this.clearFade(item.element)
      const startVolume = item.element.volume
      const startedAt = Date.now()
      const timer = window.setInterval(() => {
        const progress = Math.min(1, (Date.now() - startedAt) / durationMs)
        item.element.volume = startVolume * (1 - progress)
        if (progress >= 1) {
          this.clearFade(item.element)
          this.stopElement(item)
        }
      }, 32)
      this.fadeTimers.set(item.element, timer)
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (muted) this.stopAll()
  }

  isMuted() {
    return this.muted
  }

  setMasterVolume(volume: number) {
    this.masterVolume = clampVolume(volume)
    this.applyVolumes()
  }

  getMasterVolume() {
    return this.masterVolume
  }

  setCategoryVolume(category: AudioCategory, volume: number) {
    this.categoryVolumes[category] = clampVolume(volume)
    this.applyVolumes()
  }

  getCategoryVolume(category: AudioCategory) {
    return this.categoryVolumes[category]
  }

  getState(): AudioRuntimeState {
    return {
      unlocked: this.unlocked,
      muted: this.muted,
      masterVolume: this.masterVolume,
      categoryVolumes: { ...this.categoryVolumes },
      activeCount: this.active.length,
      loopIds: [...this.loops.keys()],
    }
  }

  dispose() {
    this.stopAll()
    this.unlocked = false
  }

  private start(id: AudioAssetId, options: AudioPlaybackOptions) {
    const item = this.manifest[id]
    if (!item || this.muted || !this.unlocked) return null

    if (options.loop && this.loops.has(id) && !options.restart) {
      return this.loops.get(id) ?? null
    }

    if (options.restart) this.stop(id)
    this.enforceLimit()

    let audio: HTMLAudioElement
    try {
      audio = this.createAudio(item.path)
    } catch (error) {
      this.logMissing(id, error)
      return null
    }

    audio.preload = 'auto'
    audio.loop = options.loop ?? item.loop
    audio.volume = this.resolveVolume(id, options.volume)
    if (options.restart) {
      try {
        audio.currentTime = 0
      } catch (error) {
        this.logMissing(id, error)
      }
    }

    const activeItem: ActiveAudio = { id, element: audio, loop: audio.loop }
    this.active.push(activeItem)
    if (audio.loop) this.loops.set(id, audio)

    const cleanup = () => this.removeActive(activeItem)
    audio.addEventListener?.('ended', cleanup, { once: true })

    try {
      const result = audio.play()
      if (result && typeof result.catch === 'function') {
        result.catch((error) => {
          this.logMissing(id, error)
          cleanup()
        })
      }
    } catch (error) {
      this.logMissing(id, error)
      cleanup()
      return null
    }

    return audio
  }

  private enforceLimit() {
    while (this.active.length >= this.maxSimultaneous) {
      const victim = this.active.find((item) => !item.loop) ?? this.active[0]
      if (!victim) return
      this.stopElement(victim)
    }
  }

  private resolveVolume(id: AudioAssetId, volume = 1) {
    const item = this.manifest[id]
    return clampVolume(this.masterVolume * this.categoryVolumes[item.category] * item.defaultVolume * volume)
  }

  private applyVolumes() {
    for (const item of this.active) {
      item.element.volume = this.resolveVolume(item.id)
    }
  }

  private stopElement(item: ActiveAudio) {
    this.clearFade(item.element)
    try {
      item.element.pause()
      item.element.currentTime = 0
    } catch (error) {
      this.logMissing(item.id, error)
    }
    this.removeActive(item)
  }

  private removeActive(item: ActiveAudio) {
    this.active = this.active.filter((candidate) => candidate !== item)
    if (this.loops.get(item.id) === item.element) this.loops.delete(item.id)
  }

  private clearFade(element: HTMLAudioElement) {
    const timer = this.fadeTimers.get(element)
    if (!timer) return
    window.clearInterval(timer)
    this.fadeTimers.delete(element)
  }

  private logMissing(id: AudioAssetId, error: unknown) {
    if (!this.dev) return
    this.logger.warn?.(`[audio] ${id} indisponivel; seguindo em silencio`, error)
  }
}

export const audioManager = new AudioManager()
