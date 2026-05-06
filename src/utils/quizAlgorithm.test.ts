import { describe, expect, it } from 'vitest'
import { questionBank } from '@/data/questionBank'
import { buildQuizSession, getTieBreakerQuestion, selectTribunalCalledGroup, shuffleSeeded, validateQuestionBank } from './quizAlgorithm'

describe('quiz algorithm', () => {
  it('builds 10 main rounds with image rounds first and text choices last', () => {
    const session = buildQuizSession('fixed-seed')

    expect(session.rounds).toHaveLength(10)
    expect(session.rounds.slice(0, 8).every((round) => round.question.type === 'character_image')).toBe(true)
    expect(session.rounds.slice(8).every((round) => round.question.type === 'text_choice')).toBe(true)
    expect(new Set(session.rounds.map((round) => round.question.id)).size).toBe(10)
  })

  it('is deterministic for the same seed and different for another seed', () => {
    const a = buildQuizSession('seed-a').rounds.map((round) => round.question.id)
    const b = buildQuizSession('seed-a').rounds.map((round) => round.question.id)
    const c = buildQuizSession('seed-c').rounds.map((round) => round.question.id)

    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
  })

  it('uses Fisher-Yates seeded shuffle without losing values', () => {
    const shuffled = shuffleSeeded([1, 2, 3, 4, 5], 'shuffle-test')

    expect([...shuffled].sort()).toEqual([1, 2, 3, 4, 5])
    expect(shuffled).toEqual(shuffleSeeded([1, 2, 3, 4, 5], 'shuffle-test'))
  })

  it('cycles tie breaker questions if attempts exceed the bank', () => {
    const session = buildQuizSession('tie-seed')

    expect(getTieBreakerQuestion(session, 0)?.type).toBe('tie_breaker')
    expect(getTieBreakerQuestion(session, session.tieBreakers.length)?.id).toBe(session.tieBreakers[0].id)
  })

  it('selects tribunal called group deterministically from seed, round and question', () => {
    expect(selectTribunalCalledGroup('tribunal-seed', 4, 'question-a')).toBe(
      selectTribunalCalledGroup('tribunal-seed', 4, 'question-a'),
    )
    expect(['A', 'B']).toContain(selectTribunalCalledGroup('tribunal-seed', 4, 'question-a'))
  })

  it('validates the initial question bank', () => {
    expect(validateQuestionBank()).toMatchObject({ valid: true, errors: [] })
  })

  it('uses the curated Harness 9.1 character image bank', () => {
    expect(questionBank.characterImageQuestions).toHaveLength(17)
    for (const question of questionBank.characterImageQuestions) {
      expect(question.imageSrc).toContain('/img%20das%20perguntas/')
      expect(question.imageFile).toMatch(/^WhatsApp Image 2026-05-04/)
      expect(question.characterName).not.toMatch(/WhatsApp|removebg/i)
    }
  })
})
