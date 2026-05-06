import styles from './RoundIntroCountdown.module.css'

interface RoundIntroCountdownProps {
  visible: boolean
  round: number
  totalRounds: number
  remainingMs: number
  quizMode: 'main' | 'tie_breaker'
  attempt: number
  status: 'idle' | 'counting' | 'skipped' | 'finished'
}

export function RoundIntroCountdown({
  visible,
  round,
  totalRounds,
  remainingMs,
  quizMode,
  attempt,
  status,
}: RoundIntroCountdownProps) {
  if (!visible) return null

  const isTieBreaker = quizMode === 'tie_breaker'
  const seconds = remainingMs <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((remainingMs + 250) / 1_000)))

  return (
    <section className={styles.overlay} aria-label="Countdown da rodada" data-testid="round-countdown" data-status={status}>
      <div className={styles.scanline} aria-hidden="true" />
      <div className={styles.clockPanel}>
        <span className={styles.kicker}>{isTieBreaker ? `VEREDITO FINAL ${attempt + 1}` : `RODADA ${String(round).padStart(2, '0')} / ${String(totalRounds).padStart(2, '0')}`}</span>
        <strong className={styles.clock}>{seconds}</strong>
        <span className={styles.status}>{isTieBreaker ? 'MORTE SUBITA' : 'PREPARE-SE'}</span>
      </div>
    </section>
  )
}
