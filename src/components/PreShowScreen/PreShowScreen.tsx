import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { GroupId, PreShowInputCheckStatus, PreShowStatus } from '@/types/game.types'
import {
  getPreShowScene,
  PRE_SHOW_HOW_TO_PLAY_START_MS,
  PRE_SHOW_INPUT_CHECK_START_MS,
  PRE_SHOW_READY_START_MS,
  PRE_SHOW_TITLE_START_MS,
  PRE_SHOW_TOTAL_MS,
  PRE_SHOW_VIDEO_START_MS,
} from '@/utils/preShowTimeline'
import { MEDIA_ASSETS } from '@/utils/mediaAssets'
import styles from './PreShowScreen.module.css'

interface PreShowScreenProps {
  visible: boolean
  status: PreShowStatus
  elapsedMs: number
  inputCheckStatus: PreShowInputCheckStatus
  inputCheckReceivedGroups: GroupId[]
  inputCheckLastGroup: GroupId | null
}

const FALLBACK_VIDEO_SECONDS = 8

const STATUS_LABELS: Record<PreShowStatus, string> = {
  idle: 'Aguardando',
  playing: 'Tocando',
  paused: 'Pausado',
  skipped: 'Pulado',
  finished: 'Finalizado',
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    function handleChange(event: MediaQueryListEvent) {
      setReduced(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reduced
}

function getTitleState(elapsedMs: number) {
  const titleDuration = PRE_SHOW_HOW_TO_PLAY_START_MS - PRE_SHOW_TITLE_START_MS
  const progress = titleDuration > 0 ? (elapsedMs - PRE_SHOW_TITLE_START_MS) / titleDuration : 0

  if (progress >= 0.82) return 'leaving'
  if (progress >= 0.18) return 'full'
  return 'entering'
}

function getInputCheckMessage(
  inputCheckStatus: PreShowInputCheckStatus,
  inputCheckReceivedGroups: GroupId[],
  inputCheckLastGroup: GroupId | null,
) {
  if (inputCheckStatus === 'idle') {
    return {
      title: 'Aguardando liberacao do operador.',
      detail: 'O teste da mesa comeca pelo Admin.',
      stateLabel: 'Em espera',
    }
  }

  if (inputCheckStatus === 'complete') {
    return {
      title: inputCheckLastGroup ? `Mesa ${inputCheckLastGroup} reconhecida` : 'Mesa reconhecida',
      detail: 'Mesas A e B reconhecidas. Aguarde o Admin iniciar o quiz.',
      stateLabel: 'Completo',
    }
  }

  if (inputCheckStatus === 'receivedA' || inputCheckStatus === 'receivedB') {
    const group = inputCheckStatus === 'receivedA' ? 'A' : 'B'
    const missing = inputCheckReceivedGroups.includes('A') ? 'B' : 'A'
    return {
      title: `Mesa ${group} reconhecida`,
      detail: `Agora pressione a Mesa ${missing}.`,
      stateLabel: `Mesa ${group}`,
    }
  }

  return {
    title: inputCheckStatus === 'waitingA' ? 'Mesa A, pressione o botao de vez.' : 'Mesa B, pressione o botao de vez.',
    detail: 'Este teste nao vale ponto e nao inicia o quiz.',
    stateLabel: inputCheckStatus === 'waitingA' ? 'Mesa A' : 'Mesa B',
  }
}

function isTeachingScene(sceneId: ReturnType<typeof getPreShowScene>['id']) {
  return sceneId === 'how_to_play_first' || sceneId === 'how_to_play_score' || sceneId === 'how_to_play_wrong' || sceneId === 'how_to_play_tribunal'
}

export function PreShowScreen({
  visible,
  status,
  elapsedMs,
  inputCheckStatus,
  inputCheckReceivedGroups,
  inputCheckLastGroup,
}: PreShowScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const previousElapsedMs = useRef(elapsedMs)
  const reducedMotion = usePrefersReducedMotion()
  const [logoFailed, setLogoFailed] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoDuration, setVideoDuration] = useState(FALLBACK_VIDEO_SECONDS)

  const timelineScene = getPreShowScene(status, elapsedMs)
  const inputCheckComplete = inputCheckReceivedGroups.includes('A') && inputCheckReceivedGroups.includes('B')
  const scene =
    timelineScene.id === 'ready_to_start' && status === 'playing' && !inputCheckComplete
      ? {
          id: 'button_check' as const,
          startMs: PRE_SHOW_INPUT_CHECK_START_MS,
          endMs: PRE_SHOW_READY_START_MS,
          kicker: 'Teste da mesa',
          title: 'Mesa A, pressione o botao de vez.',
          lines: ['Depois sera a Mesa B. Este teste nao vale ponto.'],
        }
      : timelineScene
  const inputCheckMessage = getInputCheckMessage(inputCheckStatus, inputCheckReceivedGroups, inputCheckLastGroup)
  const videoScene = scene.id !== 'waiting_logo' && scene.id !== 'blackout_to_video'
  const elapsedVideoSeconds = Math.max(0, (elapsedMs - PRE_SHOW_VIDEO_START_MS) / 1000)
  const videoHoldFrame = Math.max(0, videoDuration - 0.08)
  const timelinePastVideo = elapsedVideoSeconds >= videoHoldFrame
  const shouldShowVideo = videoScene && !videoFailed && !reducedMotion
  const shouldPlayVideo = visible && status === 'playing' && shouldShowVideo && !videoEnded && !timelinePastVideo
  const titleState = getTitleState(elapsedMs)
  const progress = status === 'idle' ? 0 : Math.min(100, Math.round((elapsedMs / PRE_SHOW_TOTAL_MS) * 100))

  useEffect(() => {
    if (!visible) return

    if (elapsedMs < previousElapsedMs.current || elapsedMs <= PRE_SHOW_VIDEO_START_MS) {
      setVideoEnded(false)
      setVideoFailed(false)

      const video = videoRef.current
      if (video) {
        video.pause()
        try {
          video.currentTime = 0
        } catch {
          // The metadata may not be loaded yet; the next play attempt will start from the beginning.
        }
      }
    }

    previousElapsedMs.current = elapsedMs
  }, [elapsedMs, visible])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    const videoElement = video

    function handleLoadedMetadata() {
      const duration =
        Number.isFinite(videoElement.duration) && videoElement.duration > 0 ? videoElement.duration : FALLBACK_VIDEO_SECONDS
      setVideoDuration(duration)
    }

    function handleEnded() {
      setVideoEnded(true)
      videoElement.pause()
    }

    function handleError() {
      setVideoFailed(true)
      videoElement.pause()
    }

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    videoElement.addEventListener('ended', handleEnded)
    videoElement.addEventListener('error', handleError)

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      videoElement.removeEventListener('ended', handleEnded)
      videoElement.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!shouldShowVideo || status !== 'playing' || timelinePastVideo || videoEnded) {
      video.pause()
      if ((timelinePastVideo || videoEnded) && Number.isFinite(video.duration) && video.duration > 0) {
        try {
          video.currentTime = Math.max(0, video.duration - 0.08)
        } catch {
          // Keep the browser-selected final frame if seeking is not ready yet.
        }
      }
      return
    }

    video.muted = true
    video.loop = false
    video.playsInline = true

    const playPromise = video.play()
    if (playPromise) {
      void playPromise.catch(() => {
        setVideoFailed(true)
      })
    }
  }, [shouldShowVideo, status, timelinePastVideo, videoEnded])

  if (!visible) return null

  return (
    <section
      className={`${styles.preShow} ${styles[status]} ${styles[scene.id]}`}
      data-preshow-status={status}
      data-preshow-scene={scene.id}
      data-preshow-elapsed-ms={Math.round(elapsedMs)}
      data-video-state={videoFailed ? 'fallback' : videoEnded || timelinePastVideo ? 'held-final-frame' : shouldPlayVideo ? 'playing' : 'idle'}
      data-video-src={MEDIA_ASSETS.preShow.video}
      aria-label="Pre-show de imersao"
      aria-live="polite"
    >
      <div className={styles.blackBase} />

      {scene.id === 'waiting_logo' ? (
        <div className={styles.logoStage}>
          {logoFailed ? (
            <strong className={styles.logoFallback}>INFO</strong>
          ) : (
            <img
              className={styles.logo}
              src={MEDIA_ASSETS.preShow.logo}
              alt="INFO"
              onError={() => setLogoFailed(true)}
              draggable="false"
              decoding="async"
              fetchPriority="high"
            />
          )}
          <span className={styles.waitingText}>Aguardando inicio</span>
        </div>
      ) : null}

      {videoScene ? (
        <div className={styles.videoStage}>
          {shouldShowVideo ? (
            <video
              ref={videoRef}
              className={styles.video}
              muted
              playsInline
              preload={shouldPlayVideo ? 'auto' : 'metadata'}
              poster={MEDIA_ASSETS.preShow.poster}
              aria-label="Video 1 do pre-show"
            >
              <source src={MEDIA_ASSETS.preShow.video} type="video/mp4" />
            </video>
          ) : (
            <div className={styles.videoFallback}>
              {logoFailed ? (
                <strong className={styles.logoFallback}>INFO</strong>
              ) : (
                <img
                  className={styles.fallbackLogo}
                  src={MEDIA_ASSETS.preShow.logo}
                  alt="INFO"
                  onError={() => setLogoFailed(true)}
                  draggable="false"
                  decoding="async"
                  fetchPriority="high"
                />
              )}
            </div>
          )}
          <div className={styles.videoShade} />
          <div className={styles.depthGrid} />
          {scene.id === 'title_over_video' ? (
            <div className={`${styles.titleOverlay} ${styles[titleState]}`} data-title-source="code" data-title-state={titleState}>
              <span>DOIS PESOS,</span>
              <span>DUAS MEDIDAS</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {isTeachingScene(scene.id) ? (
        <div className={styles.briefing}>
          <span className={styles.kicker}>{scene.kicker}</span>
          <h1>{scene.title}</h1>
          <div className={styles.briefingRail}>
            {scene.lines.map((line, index) => (
              <p key={line} style={{ '--item-index': index } as CSSProperties}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {scene.id === 'button_check' ? (
        <div className={styles.buttonCheck}>
          <span className={styles.kicker}>{scene.kicker}</span>
          <h1>{inputCheckMessage.title}</h1>
          <p>{inputCheckMessage.detail}</p>
          <div className={styles.signalBoard} aria-label="Reconhecimento dos botoes da mesa">
            {(['A', 'B'] as const).map((group) => {
              const received = inputCheckReceivedGroups.includes(group)
              const waiting =
                !received &&
                ((group === 'A' && inputCheckStatus === 'waitingA') || (group === 'B' && inputCheckStatus === 'waitingB'))
              return (
                <div
                  className={`${styles.signalTile} ${received ? styles.signalReceived : ''} ${waiting ? styles.signalWaiting : ''}`}
                  key={group}
                >
                  <span>Mesa {group}</span>
                  <strong>{received ? `Mesa ${group} reconhecida` : waiting ? 'Aguardando' : 'Pendente'}</strong>
                </div>
              )
            })}
          </div>
          <small>{inputCheckMessage.stateLabel}</small>
        </div>
      ) : null}

      {scene.id === 'ready_to_start' ? (
        <div className={styles.ready}>
          {logoFailed ? (
            <strong className={styles.logoFallback}>INFO</strong>
          ) : (
            <img
              className={styles.readyLogo}
              src={MEDIA_ASSETS.preShow.logo}
              alt="INFO"
              onError={() => setLogoFailed(true)}
              draggable="false"
              decoding="async"
              fetchPriority="high"
            />
          )}
          <span className={styles.kicker}>{scene.kicker}</span>
          <h1>{scene.title}</h1>
          <p>{scene.lines[0]}</p>
          {inputCheckComplete ? (
            <div className={styles.readySignals} aria-label="Mesas reconhecidas">
              <span>Mesa A reconhecida</span>
              <span>Mesa B reconhecida</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.footer} aria-label={`Status do pre-show: ${STATUS_LABELS[status]}`}>
        <span>{STATUS_LABELS[status]}</span>
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressFill} style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>
    </section>
  )
}
