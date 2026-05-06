import { useCallback, useEffect, useRef, useState } from 'react'

type BackgroundMode = 'idle' | 'playing' | 'paused' | 'ended'

export function useBackgroundCue() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [mode, setMode] = useState<BackgroundMode>('idle')

  const resetVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()

    try {
      video.currentTime = 0
    } catch {
      // Metadata may not be ready yet; the static image remains visible.
    }
  }, [])

  const playFromStart = useCallback(async () => {
    const video = videoRef.current
    if (!video) return false

    video.muted = true
    video.loop = false
    video.playsInline = true
    resetVideo()
    setMode('playing')

    try {
      await video.play()
      return true
    } catch {
      setMode('idle')
      return false
    }
  }, [resetVideo])

  const pause = useCallback(() => {
    videoRef.current?.pause()
    setMode('paused')
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    function handleEnded() {
      resetVideo()
      setMode('ended')
    }

    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [resetVideo])

  return {
    videoRef,
    mode,
    playFromStart,
    pause,
    resetVideo,
  }
}

