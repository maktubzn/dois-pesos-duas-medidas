import { getScoreSplit } from '@/utils/score'
import styles from './ScoreBar.module.css'
import type { GroupId } from '@/types/game.types'

interface ScoreBarProps {
  scoreA: number
  scoreB: number
  highlightGroup?: GroupId | null
  scoreDelta?: number
}

export function ScoreBar({ scoreA, scoreB, highlightGroup = null, scoreDelta = 0 }: ScoreBarProps) {
  const split = getScoreSplit(scoreA, scoreB)
  const deltaLabel = scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta < 0 ? String(scoreDelta) : null

  return (
    <div className={styles.zone} aria-label="Placar dos grupos">
      <div className={styles.wrapper}>
        <img className={styles.frame} src="/img/barraMoldura.png" alt="" draggable="false" aria-hidden="true" />
        <div className={styles.track}>
          <div className={styles.bar} aria-hidden="true">
            <div className={styles.segmentA} style={{ width: `${split.percentA}%` }} />
            <div className={styles.segmentB} style={{ width: `${split.percentB}%` }} />
          </div>
        </div>
        <div className={styles.labels}>
          <span className={`${styles.label} ${highlightGroup === 'A' ? styles.highlight : ''}`}>
            <span className={styles.unit}>PTS </span>
            <strong>{split.scoreA}</strong>
            {highlightGroup === 'A' && deltaLabel ? <em>{deltaLabel}</em> : null}
          </span>
          <span className={`${styles.label} ${highlightGroup === 'B' ? styles.highlight : ''}`}>
            <strong>{split.scoreB}</strong>
            <span className={styles.unit}> PTS</span>
            {highlightGroup === 'B' && deltaLabel ? <em>{deltaLabel}</em> : null}
          </span>
        </div>
      </div>
    </div>
  )
}
