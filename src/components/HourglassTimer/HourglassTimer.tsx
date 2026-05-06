import styles from './HourglassTimer.module.css'
import type { CSSProperties } from 'react'
import type { TimerStatus } from '@/types/game.types'

interface HourglassTimerProps {
  visible: boolean
  remaining?: number
  total?: number
  status?: TimerStatus
}

export function HourglassTimer({ visible, remaining = 20, total = 20, status = 'idle' }: HourglassTimerProps) {
  const progress = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0

  return (
    <div
      className={`${styles.timer} ${visible ? styles.visible : ''} ${status === 'paused' ? styles.paused : ''} ${status === 'time_up' ? styles.timeUp : ''}`}
      style={{ '--timer-scale': progress } as CSSProperties}
      aria-label="Tempo de resposta"
    >
      <div className={styles.track} aria-hidden="true">
        <span className={styles.hourglass} />
      </div>
      <span className={styles.readout}>{remaining}</span>
    </div>
  )
}
