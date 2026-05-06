import { describe, expect, it } from 'vitest'
import type { GameHistoryEvent } from '@/types/game.types'
import { buildMatchSessionSummary, historyEventsToCsv, matchSessionToCsv } from './historyStorage'

const baseEvent: GameHistoryEvent = {
  id: 'event-1',
  matchId: 'match-1',
  timestamp: '2026-04-30T00:00:00.000Z',
  seed: 'seed',
  mode: 'main',
  event: 'answer_confirmed',
  round: 9,
  questionType: 'text_choice',
  questionId: 'text-1',
  imageSrc: null,
  prompt: 'Pergunta com vírgula, aspas "e" quebra\nlinha',
  optionA: 'A',
  optionB: 'B',
  correctAnswer: 'A',
  group: 'A',
  playerChoice: 'A',
  result: 'correct',
  scoreBeforeA: 0,
  scoreBeforeB: 0,
  scoreAfterA: 150,
  scoreAfterB: 0,
  timerRemaining: 12,
  source: 'admin',
}

describe('history csv export', () => {
  it('exports headers and escapes CSV cells', () => {
    const csv = historyEventsToCsv([baseEvent])

    expect(csv.split('\n')[0]).toContain('timestamp,matchId,seed')
    expect(csv).toContain('"Pergunta com vírgula, aspas ""e"" quebra\nlinha"')
    expect(csv).toContain('"answer_confirmed"')
  })

  it('guards against spreadsheet formula injection', () => {
    const csv = historyEventsToCsv([
      {
        ...baseEvent,
        prompt: '=HYPERLINK("https://example.com","click")',
        optionA: '+1',
        optionB: '-1',
        correctAnswer: '@cmd',
      },
    ])

    expect(csv).toContain(`"'=HYPERLINK(""https://example.com"",""click"")"`)
    expect(csv).toContain(`"'+1"`)
    expect(csv).toContain(`"'-1"`)
    expect(csv).toContain(`"'@cmd"`)
  })

  it('exports tribunal fields in stable CSV columns', () => {
    const csv = historyEventsToCsv([
      {
        ...baseEvent,
        event: 'tribunal_attempt_wrong',
        actorGroup: 'B',
        beneficiaryGroup: 'B',
        scoreDelta: -10,
        tribunalCalledGroup: 'B',
        tribunalAttemptingGroup: 'B',
        tribunalPassedGroups: ['A'],
        tribunalOutcome: 'wrong',
        operatorAction: 'tribunal_wrong',
      },
    ])

    const headers = csv.split('\n')[0]
    expect(headers).toContain('actorGroup,beneficiaryGroup,scoreDelta')
    expect(headers).toContain('tribunalCalledGroup,tribunalAttemptingGroup,tribunalPassedGroups,tribunalOutcome,operatorAction')
    expect(csv).toContain('"tribunal_attempt_wrong"')
    expect(csv).toContain(`"'-10"`)
    expect(csv).toContain('"A"')
  })

  it('exports a match/session summary CSV with winner and protected cells', () => {
    const events: GameHistoryEvent[] = [
      {
        ...baseEvent,
        id: 'start',
        event: 'match_started',
        round: 0,
        timestamp: '2026-04-30T00:00:00.000Z',
        scoreAfterA: 0,
        scoreAfterB: 0,
      },
      {
        ...baseEvent,
        id: 'correct',
        event: 'correct',
        round: 1,
        timestamp: '2026-04-30T00:00:10.000Z',
        scoreBeforeA: 0,
        scoreAfterA: 10,
        scoreAfterB: 0,
        prompt: '+placar perigoso',
      },
      {
        ...baseEvent,
        id: 'winner',
        event: 'winner_declared',
        round: 1,
        timestamp: '2026-04-30T00:00:30.000Z',
        group: 'A',
        scoreBeforeA: 10,
        scoreAfterA: 10,
        scoreAfterB: 0,
      },
    ]

    const summary = buildMatchSessionSummary(events)
    expect(summary).toMatchObject({
      matchId: 'match-1',
      winner: 'A',
      durationMs: 30_000,
      scoreA: 10,
      scoreB: 0,
      scoreDifference: 10,
      closeMatch: true,
      correctCount: 1,
    })

    const csv = matchSessionToCsv(summary!)
    expect(csv.split('\n')[0]).toContain('matchId,startedAt,endedAt,durationMs,winner')
    expect(csv).toContain('"A"')
    expect(csv).toContain('"R1:correct:A"')
  })
})
