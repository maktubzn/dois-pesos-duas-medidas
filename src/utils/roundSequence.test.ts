import { describe, expect, it } from 'vitest'
import { buildRoundIntroSchedule, formatCountdown, getPostFeedbackDelay, getRoundIntroDelay } from './roundSequence'

describe('round sequence helpers', () => {
  it('builds the official fixed 4s countdown schedule', () => {
    const first = buildRoundIntroSchedule('seed-a', 10)
    const second = buildRoundIntroSchedule('seed-a', 10)
    const third = buildRoundIntroSchedule('seed-b', 10)

    expect(first).toEqual(second)
    expect(first).toEqual(third)
    expect(first).toHaveLength(10)
    expect(first.every((delay) => delay === 4_000)).toBe(true)
  })

  it('derives tie breaker delays without depending on the main round schedule', () => {
    const schedule = buildRoundIntroSchedule('seed-a', 10)
    const first = getRoundIntroDelay(schedule, 10, 'seed-a', 'tie_breaker', 0)
    const second = getRoundIntroDelay(schedule, 10, 'seed-a', 'tie_breaker', 1)

    expect(first).toBe(4_000)
    expect(second).toBe(4_000)
  })

  it('formats countdown and feedback delays', () => {
    expect(formatCountdown(4_100)).toBe('00:05')
    expect(formatCountdown(0)).toBe('00:00')
    expect(getPostFeedbackDelay('seed-a', 1)).toBe(3_000)
  })
})
