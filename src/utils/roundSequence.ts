const DEFAULT_INTRO_DELAY_MS = 4_000
const FEEDBACK_DISPLAY_MS = 3_000

function hashText(input: string) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function buildRoundIntroSchedule(seed: string, totalRounds: number) {
  hashText(seed)
  return Array.from({ length: totalRounds }, () => DEFAULT_INTRO_DELAY_MS)
}

export function getRoundIntroDelay(
  schedule: number[],
  roundNumber: number,
  seed: string | null,
  quizMode: 'main' | 'tie_breaker',
  attempt = 0,
) {
  if (quizMode === 'tie_breaker') {
    hashText(`${seed ?? 'tie-breaker'}:${attempt + 1}`)
    return DEFAULT_INTRO_DELAY_MS
  }

  return schedule[roundNumber - 1] ?? DEFAULT_INTRO_DELAY_MS
}

export function getPostFeedbackDelay(seed: string | null, roundNumber: number, attempt = 0) {
  hashText(`${seed ?? 'feedback'}:${roundNumber}:${attempt}`)
  return FEEDBACK_DISPLAY_MS
}

export function formatCountdown(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1_000))
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
