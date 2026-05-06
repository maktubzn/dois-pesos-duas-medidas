import { useCallback, useEffect, useRef, useState } from 'react'
import { audioManager } from '@/audio/AudioManager'
import { createGameAudioController } from '@/audio/audioEvents'
import type { GameAudioState } from '@/audio/audioTypes'
import type { StageAudioStatusPayload } from '@/types/game.types'

interface UseStageAudioControllerOptions {
  gameAudioState: GameAudioState
  muted: boolean
  masterVolume: number
  publishStatus: (payload: StageAudioStatusPayload) => void
}

export function useStageAudioController({
  gameAudioState,
  muted,
  masterVolume,
  publishStatus,
}: UseStageAudioControllerOptions) {
  const controllerRef = useRef(createGameAudioController(audioManager))
  const [unlocked, setUnlocked] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const publishCurrentStatus = useCallback(
    (override: Partial<StageAudioStatusPayload> = {}) => {
      const runtime = audioManager.getState()
      publishStatus({
        unlocked,
        muted: runtime.muted,
        masterVolume: runtime.masterVolume,
        activeLoops: runtime.loopIds,
        lastError,
        ...override,
      })
    },
    [lastError, publishStatus, unlocked],
  )

  const unlockStageAudio = useCallback(async () => {
    try {
      await audioManager.unlock()
      audioManager.setMasterVolume(masterVolume)
      audioManager.setMuted(muted)
      controllerRef.current.reset()
      if (!muted) {
        controllerRef.current.sync(gameAudioState)
      }
      setUnlocked(true)
      setLastError(null)
      publishCurrentStatus({ unlocked: true, lastError: null })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao ativar audio da TV'
      setLastError(message)
      publishCurrentStatus({ unlocked: false, lastError: message })
      return false
    }
  }, [gameAudioState, masterVolume, muted, publishCurrentStatus])

  useEffect(() => {
    publishCurrentStatus()
  }, [publishCurrentStatus])

  useEffect(() => {
    if (!unlocked) return

    const wasMuted = audioManager.isMuted()
    audioManager.setMasterVolume(masterVolume)
    audioManager.setMuted(muted)

    if (muted) {
      controllerRef.current.reset()
      publishCurrentStatus({ muted: true })
      return
    }

    if (wasMuted) {
      controllerRef.current.reset()
    }

    controllerRef.current.sync(gameAudioState)
    publishCurrentStatus({ muted: false })
  }, [gameAudioState, masterVolume, muted, publishCurrentStatus, unlocked])

  useEffect(
    () => () => {
      controllerRef.current.reset()
      audioManager.dispose()
    },
    [],
  )

  return {
    unlocked,
    lastError,
    unlockStageAudio,
    audioRuntime: audioManager.getState(),
    getDebugState: () => ({
      ...audioManager.getState(),
      unlocked,
      lastError,
    }),
  }
}
