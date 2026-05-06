import type { GameHistoryEvent } from '@/types/game.types'

export const HISTORY_STORAGE_KEY = 'dois-pesos-history-v1'
const MAX_HISTORY_EVENTS = 500

export function loadHistoryEvents(): GameHistoryEvent[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is GameHistoryEvent => Boolean(item?.id && item?.matchId && item?.event))
  } catch {
    return []
  }
}

export function saveHistoryEvents(events: GameHistoryEvent[]) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(events.slice(-MAX_HISTORY_EVENTS)))
  } catch {
    // localStorage may be unavailable or full; the in-memory history still works.
  }
}

export function clearStoredHistoryEvents() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY)
  } catch {
    // Ignore storage failures during operator cleanup.
  }
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value)
  const needsFormulaGuard = /^[=+\-@]/.test(text.trimStart())
  const safeText = needsFormulaGuard ? `'${text}` : text
  return `"${safeText.replace(/"/g, '""')}"`
}

export function historyEventsToCsv(events: GameHistoryEvent[]) {
  const headers: Array<keyof GameHistoryEvent> = [
    'timestamp',
    'matchId',
    'seed',
    'mode',
    'event',
    'round',
    'questionType',
    'questionId',
    'imageSrc',
    'prompt',
    'optionA',
    'optionB',
    'correctAnswer',
    'group',
    'playerChoice',
    'result',
    'scoreBeforeA',
    'scoreBeforeB',
    'scoreAfterA',
    'scoreAfterB',
    'timerRemaining',
    'actorGroup',
    'beneficiaryGroup',
    'scoreDelta',
    'tribunalCalledGroup',
    'tribunalAttemptingGroup',
    'tribunalPassedGroups',
    'tribunalOutcome',
    'operatorAction',
    'roundIntroDelayMs',
    'roundIntroRemainingMs',
    'postFeedbackDelayMs',
    'automationToken',
    'source',
  ]

  return [
    headers.join(','),
    ...events.map((event) => headers.map((header) => csvCell(event[header])).join(',')),
  ].join('\n')
}

export interface MatchSessionSummary {
  matchId: string
  startedAt: string
  endedAt: string
  durationMs: number
  winner: string
  scoreA: number
  scoreB: number
  scoreDifference: number
  closeMatch: boolean
  roundsTotal: number
  tribunalCount: number
  correctCount: number
  wrongCount: number
  timeouts: number
  roundSummary: string
  importantEvents: string
}

function lastMatchEvents(events: GameHistoryEvent[]) {
  const newestMatchId = [...events].reverse().find((event) => event.matchId)?.matchId
  if (!newestMatchId) return []
  return events.filter((event) => event.matchId === newestMatchId)
}

export function buildMatchSessionSummary(events: GameHistoryEvent[]): MatchSessionSummary | null {
  const matchEvents = lastMatchEvents(events)
  if (matchEvents.length === 0) return null

  const firstEvent = matchEvents[0]
  const lastEvent = matchEvents[matchEvents.length - 1]
  const winnerEvent = [...matchEvents].reverse().find((event) => event.event === 'winner_declared')
  const startedAt = matchEvents.find((event) => event.event === 'match_started')?.timestamp ?? firstEvent.timestamp
  const endedAt = winnerEvent?.timestamp ?? lastEvent.timestamp
  const startedMs = Date.parse(startedAt)
  const endedMs = Date.parse(endedAt)
  const scoreA = lastEvent.scoreAfterA
  const scoreB = lastEvent.scoreAfterB
  const scoreDifference = Math.abs(scoreA - scoreB)
  const rounds = new Map<number, GameHistoryEvent[]>()

  for (const event of matchEvents) {
    if (event.round <= 0) continue
    const bucket = rounds.get(event.round) ?? []
    bucket.push(event)
    rounds.set(event.round, bucket)
  }

  const roundSummary = Array.from(rounds.entries())
    .map(([round, roundEvents]) => {
      const result = [...roundEvents].reverse().find((event) =>
        event.event === 'correct' ||
        event.event === 'wrong' ||
        event.event === 'time_up' ||
        event.event === 'tribunal_attempt_correct' ||
        event.event === 'tribunal_attempt_wrong' ||
        event.event === 'tribunal_silence',
      )
      return `R${round}:${result?.event ?? 'sem_resultado'}:${result?.group ?? result?.actorGroup ?? '--'}`
    })
    .join(' | ')

  const importantEvents = matchEvents
    .filter((event) =>
      event.event === 'match_started' ||
      event.event === 'winner_declared' ||
      event.event === 'tribunal_started' ||
      event.event === 'tribunal_silence' ||
      event.event === 'tie_breaker_started',
    )
    .map((event) => `${event.timestamp}:${event.event}`)
    .join(' | ')

  return {
    matchId: firstEvent.matchId,
    startedAt,
    endedAt,
    durationMs: Number.isFinite(startedMs) && Number.isFinite(endedMs) ? Math.max(0, endedMs - startedMs) : 0,
    winner: winnerEvent?.group ?? (scoreA === scoreB ? 'empate' : scoreA > scoreB ? 'A' : 'B'),
    scoreA,
    scoreB,
    scoreDifference,
    closeMatch: scoreDifference <= 10,
    roundsTotal: rounds.size,
    tribunalCount: matchEvents.filter((event) => event.event === 'tribunal_started').length,
    correctCount: matchEvents.filter((event) => event.event === 'correct' || event.event === 'tribunal_attempt_correct').length,
    wrongCount: matchEvents.filter((event) => event.event === 'wrong' || event.event === 'tribunal_attempt_wrong').length,
    timeouts: matchEvents.filter((event) => event.event === 'time_up').length,
    roundSummary,
    importantEvents,
  }
}

export function matchSessionToCsv(summary: MatchSessionSummary) {
  const headers: Array<keyof MatchSessionSummary> = [
    'matchId',
    'startedAt',
    'endedAt',
    'durationMs',
    'winner',
    'scoreA',
    'scoreB',
    'scoreDifference',
    'closeMatch',
    'roundsTotal',
    'tribunalCount',
    'correctCount',
    'wrongCount',
    'timeouts',
    'roundSummary',
    'importantEvents',
  ]

  return [
    headers.join(','),
    headers.map((header) => csvCell(summary[header])).join(','),
  ].join('\n')
}

export function downloadHistoryCsv(events: GameHistoryEvent[]) {
  const csv = historyEventsToCsv(events)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `historico-dois-pesos-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function downloadMatchSessionCsv(events: GameHistoryEvent[]) {
  const summary = buildMatchSessionSummary(events)
  if (!summary) return false
  const csv = matchSessionToCsv(summary)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `partida-dois-pesos-${summary.matchId}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  return true
}
