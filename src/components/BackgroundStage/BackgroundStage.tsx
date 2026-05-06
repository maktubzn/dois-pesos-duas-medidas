import type { RefObject } from 'react'
import type { QuizPhase } from '@/types/game.types'
import { MEDIA_ASSETS } from '@/utils/mediaAssets'
import styles from './BackgroundStage.module.css'

interface BackgroundStageProps {
  phase: QuizPhase
  videoRef: RefObject<HTMLVideoElement | null>
  videoVisible: boolean
}

type StageBackgroundMode = 'idle' | 'game'

function getStageBackgroundMode(phase: QuizPhase): StageBackgroundMode {
  if (phase === 'intro' || phase === 'idle') return 'idle'
  return 'game'
}

export function BackgroundStage({ phase, videoRef, videoVisible }: BackgroundStageProps) {
  const backgroundMode = getStageBackgroundMode(phase)
  const gameBackgroundVisible = backgroundMode === 'game'

  return (
    <div className={styles.backdrop} data-background-mode={backgroundMode} aria-hidden="true">
      <img
        className={`${styles.image} ${styles.imageIdle}`}
        src={MEDIA_ASSETS.background.idleImage}
        alt=""
        draggable="false"
        decoding="async"
        fetchPriority="high"
      />
      <img
        className={`${styles.image} ${styles.imageGame} ${gameBackgroundVisible ? styles.imageVisible : ''}`}
        src={MEDIA_ASSETS.background.gameImage}
        alt=""
        draggable="false"
        decoding="async"
        fetchPriority="low"
      />
      <div className={`${styles.blackout} ${gameBackgroundVisible ? styles.blackoutGame : ''}`} />
      <video
        ref={videoRef}
        className={`${styles.video} ${videoVisible ? styles.videoVisible : ''}`}
        muted
        playsInline
        preload={videoVisible ? 'auto' : 'metadata'}
        aria-hidden="true"
      >
        <source src={MEDIA_ASSETS.background.video} type="video/mp4" />
      </video>
    </div>
  )
}
