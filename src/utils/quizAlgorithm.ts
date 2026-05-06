import { questionBank } from '@/data/questionBank'
import type {
  CharacterImageQuestion,
  GroupId,
  QuizQuestion,
  QuizRound,
  QuizSession,
  TextChoiceQuestion,
  TieBreakerQuestion,
} from '@/types/game.types'

function hashSeed(seed: string) {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createPrng(seed: string) {
  let state = hashSeed(seed) || 1
  return () => {
    state = Math.imul(1664525, state) + 1013904223
    return (state >>> 0) / 4294967296
  }
}

export function createQuizSeed(now = Date.now()) {
  return `dpdm-${now.toString(36)}-${Math.floor(Math.random() * 1_000_000).toString(36)}`
}

export function shuffleSeeded<T>(items: readonly T[], seed: string): T[] {
  const random = createPrng(seed)
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = result[index]
    result[index] = result[swapIndex]
    result[swapIndex] = current
  }

  return result
}

export function selectRoundQuestions(seed: string): QuizRound[] {
  const imageQuestions = shuffleSeeded<CharacterImageQuestion>(questionBank.characterImageQuestions, `${seed}:image`).slice(0, 8)
  const textQuestions = shuffleSeeded<TextChoiceQuestion>(questionBank.textChoiceQuestions, `${seed}:text`).slice(0, 2)

  return [
    ...imageQuestions.map((question, index) => ({ round: index + 1, question })),
    ...textQuestions.map((question, index) => ({ round: index + 9, question })),
  ]
}

export function selectTieBreakerQuestions(seed: string): TieBreakerQuestion[] {
  return shuffleSeeded<TieBreakerQuestion>(questionBank.tieBreakerQuestions, `${seed}:tie`)
}

export function buildQuizSession(seed = createQuizSeed()): QuizSession {
  return {
    id: `match-${seed}`,
    seed,
    rounds: selectRoundQuestions(seed),
    tieBreakers: selectTieBreakerQuestions(seed),
    createdAt: new Date().toISOString(),
  }
}

export function getCurrentRoundQuestion(session: QuizSession | null, round: number): QuizQuestion | null {
  return session?.rounds.find((item) => item.round === round)?.question ?? null
}

export function getTieBreakerQuestion(session: QuizSession | null, attempt: number): TieBreakerQuestion | null {
  if (!session || session.tieBreakers.length === 0) return null
  return session.tieBreakers[attempt % session.tieBreakers.length]
}

export function isTieAfterMainRounds(scoreA: number, scoreB: number) {
  return scoreA === scoreB
}

export function selectTribunalCalledGroup(seed: string, round: number, questionId: string | null) {
  const random = createPrng(`${seed || 'dpdm'}:tribunal:${round}:${questionId ?? 'sem-pergunta'}`)
  return (random() < 0.5 ? 'A' : 'B') as GroupId
}

export function validateQuestionBank() {
  const allQuestions: QuizQuestion[] = [
    ...questionBank.characterImageQuestions,
    ...questionBank.textChoiceQuestions,
    ...questionBank.tieBreakerQuestions,
  ]
  const ids = new Set<string>()
  const errors: string[] = []

  for (const question of allQuestions) {
    if (ids.has(question.id)) errors.push(`ID duplicado: ${question.id}`)
    ids.add(question.id)
  }

  if (questionBank.characterImageQuestions.length < 8) errors.push('Banco precisa de 8+ perguntas de imagem')
  if (questionBank.textChoiceQuestions.length < 2) errors.push('Banco precisa de 2+ perguntas textuais')
  if (questionBank.tieBreakerQuestions.length < 3) errors.push('Banco precisa de 3+ perguntas de desempate')

  for (const question of questionBank.characterImageQuestions) {
    if (!question.imageSrc || !question.characterName) errors.push(`Pergunta de imagem incompleta: ${question.id}`)
  }

  for (const question of [...questionBank.textChoiceQuestions, ...questionBank.tieBreakerQuestions]) {
    if (!question.correctOption) errors.push(`Pergunta A/B sem resposta correta: ${question.id}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
