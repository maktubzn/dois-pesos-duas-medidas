import { describe, expect, it } from 'vitest'
import { getScoreSplit, normalizeScore } from './score'

describe('score utils', () => {
  it('normalizes invalid scores and preserves negative tribunal totals', () => {
    expect(normalizeScore(-10)).toBe(-10)
    expect(normalizeScore(Number.NaN)).toBe(0)
    expect(normalizeScore(12.8)).toBe(12)
  })

  it('keeps a balanced split when both scores are zero', () => {
    expect(getScoreSplit(0, 0)).toMatchObject({
      scoreA: 0,
      scoreB: 0,
      percentA: 50,
      percentB: 50,
    })
  })

  it('keeps negative scores visible while using safe visual percentages', () => {
    expect(getScoreSplit(-10, 20)).toMatchObject({
      scoreA: -10,
      scoreB: 20,
      percentA: 0,
      percentB: 100,
    })
  })
})
