// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoreBar } from './ScoreBar'

describe('ScoreBar', () => {
  it('renders scores as points, not percentages', () => {
    render(<ScoreBar scoreA={1250} scoreB={980} />)

    const scorebar = screen.getByLabelText('Placar dos grupos')
    expect(scorebar.textContent).toContain('PTS 1250')
    expect(scorebar.textContent).toContain('980 PTS')
  })

  it('renders negative tribunal deltas without hiding the score', () => {
    render(<ScoreBar scoreA={-10} scoreB={20} highlightGroup="A" scoreDelta={-10} />)

    const scorebar = screen.getAllByLabelText('Placar dos grupos').at(-1) as HTMLElement
    expect(scorebar.textContent).toContain('PTS -10')
    expect(scorebar.textContent).toContain('-10')
  })
})
