export function normalizeScore(value: number) {
  const next = Math.trunc(Number(value) || 0)
  return next
}

function normalizeVisualScore(value: number) {
  return Math.max(0, normalizeScore(value))
}

export function getScoreSplit(scoreA: number, scoreB: number) {
  const displayA = normalizeScore(scoreA)
  const displayB = normalizeScore(scoreB)
  const visualA = normalizeVisualScore(scoreA)
  const visualB = normalizeVisualScore(scoreB)
  const total = visualA + visualB
  const percentA = total > 0 ? (visualA / total) * 100 : 50

  return {
    scoreA: displayA,
    scoreB: displayB,
    percentA,
    percentB: 100 - percentA,
  }
}
