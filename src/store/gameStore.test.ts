import { beforeEach, describe, expect, it } from 'vitest'
import {
  PRE_SHOW_HOW_TO_PLAY_START_MS,
  PRE_SHOW_INPUT_CHECK_START_MS,
  PRE_SHOW_SCENES,
  PRE_SHOW_TEACHING_MIN_DURATION_MS,
  PRE_SHOW_TOTAL_MS,
  PRE_SHOW_TRIBUNAL_RULE_START_MS,
} from '@/utils/preShowTimeline'
import { selectTribunalCalledGroup } from '@/utils/quizAlgorithm'
import { useGameStore } from './gameStore'

describe('game store quiz core', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    useGameStore.getState().startQuiz()
  })

  it('opens a question and locks the first group that pressed the turn button', () => {
    const store = useGameStore.getState()

    store.nextQuestion()
    store.revealQuestion()
    store.openBuzz()
    store.receiveBuzz('A')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'team_answering',
      activeGroup: 'A',
      lastBuzz: 'A',
      buzzLocked: true,
      timerVisible: true,
    })
  })

  it('scores the active group with the official +10 and resets the round', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('B')
    useGameStore.getState().markCorrect(150)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'scoring',
      scoreB: 10,
    })
    expect(useGameStore.getState().gameLog.some((item) => item.includes('SCORE_UPDATED round=1 reason=correct_answer team=B delta=10'))).toBe(true)

    useGameStore.getState().resetRound()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'round_prepare',
      activeGroup: null,
      buzzLocked: false,
      questionVisible: false,
    })
  })

  it('scores round 1 for Mesa A and Mesa B from a fresh match', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('A')
    useGameStore.getState().markCorrect()

    expect(useGameStore.getState()).toMatchObject({
      currentRound: 1,
      scoreA: 10,
      scoreB: 0,
      lastScoredGroup: 'A',
      lastScoreDelta: 10,
    })

    useGameStore.getState().resetGame()
    useGameStore.getState().startQuiz()
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('B')
    useGameStore.getState().markCorrect()

    expect(useGameStore.getState()).toMatchObject({
      currentRound: 1,
      scoreA: 0,
      scoreB: 10,
      lastScoredGroup: 'B',
      lastScoreDelta: 10,
    })
  })

  it('keeps round 2 scoring after round 1 was completed', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('A')
    useGameStore.getState().markCorrect()
    useGameStore.getState().nextRound()
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('B')
    useGameStore.getState().markCorrect()

    expect(useGameStore.getState()).toMatchObject({
      currentRound: 2,
      scoreA: 10,
      scoreB: 10,
      lastScoredGroup: 'B',
      lastScoreDelta: 10,
    })
  })

  it('maps calibrated hardware serial messages to turn button and hardware status state', () => {
    useGameStore.getState().markInputReady()
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().handleSerialMessage({
      type: 'event',
      eventName: 'BT1PRESS',
      raw: 'BT1PRESS',
    })
    useGameStore.getState().handleSerialMessage({
      type: 'status',
      locked: true,
      raw: 'STATUS:LOCKED',
    })

    expect(useGameStore.getState()).toMatchObject({
      activeGroup: 'A',
      serialLocked: true,
      serialLastEvent: 'STATUS:LOCKED',
    })
    expect(useGameStore.getState().gameLog.some((item) => item.includes('raw=BT1PRESS source=serial resolvedGroup=A'))).toBe(true)
    expect(useGameStore.getState().gameLog.some((item) => item.includes('SERIAL_EVENT_RECEIVED raw=BT1PRESS'))).toBe(true)
    expect(useGameStore.getState().gameLog.some((item) => item.includes('inputReady=true buzzLocked=false timerStatus=running'))).toBe(true)
  })

  it('computes round 1 when the blue physical button arrives as BT2PRESS', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().handleSerialMessage({
      type: 'event',
      eventName: 'BT2PRESS',
      raw: 'BT2PRESS',
    })
    useGameStore.getState().markCorrect()

    expect(useGameStore.getState()).toMatchObject({
      currentRound: 1,
      phase: 'scoring',
      activeGroup: 'B',
      scoreA: 0,
      scoreB: 10,
      lastScoredGroup: 'B',
      lastScoreDelta: 10,
      lastInputEvent: {
        group: 'B',
        source: 'serial',
        accepted: true,
        reason: 'accepted',
      },
    })
  })

  it('keeps keyboard fallback mapping direct', () => {
    useGameStore.getState().markInputReady()
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveKeyboardBuzz('A')

    expect(useGameStore.getState()).toMatchObject({
      activeGroup: 'A',
      lastBuzz: 'A',
    })
  })

  it('starts automatic sequence with countdown and blocks input before the answer window', () => {
    useGameStore.getState().startRoundSequence()

    expect(useGameStore.getState()).toMatchObject({
      autoSequenceStatus: 'running',
      phase: 'round_countdown',
      roundIntroStatus: 'counting',
      questionVisible: false,
      buzzLocked: true,
    })
    expect(useGameStore.getState().roundIntroDelayMs).toBeGreaterThanOrEqual(1_000)
    expect(useGameStore.getState().roundIntroDelayMs).toBeLessThanOrEqual(5_000)
    expect(useGameStore.getState().gameLog.some((item) => item.includes('COUNTDOWN_STARTED round=1'))).toBe(true)

    useGameStore.getState().receiveKeyboardBuzz('A')
    expect(useGameStore.getState().activeGroup).toBeNull()

    useGameStore.getState().tickRoundCountdown(500)
    expect(useGameStore.getState().roundIntroRemainingMs).toBe(useGameStore.getState().roundIntroDelayMs - 500)

    useGameStore.getState().skipRoundCountdown()
    expect(useGameStore.getState()).toMatchObject({
      roundIntroStatus: 'skipped',
      roundIntroRemainingMs: 0,
    })
  })

  it('rejects input before input_ready and accepts it only in buzz_open', () => {
    useGameStore.getState().startRoundSequence()
    useGameStore.getState().receiveKeyboardBuzz('A')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'round_countdown',
      activeGroup: null,
      lastInputEvent: {
        group: 'A',
        source: 'keyboard',
        accepted: false,
        reason: 'ignored_not_ready',
      },
    })
    expect(useGameStore.getState().gameLog.some((item) => item.includes('INPUT_RECEIVED') && item.includes('accepted=false') && item.includes('reason=ignored_not_ready'))).toBe(true)

    useGameStore.getState().finishRoundCountdown()
    useGameStore.getState().prepareRoundInput()
    useGameStore.getState().receiveKeyboardBuzz('B')
    expect(useGameStore.getState()).toMatchObject({
      phase: 'round_preparing',
      activeGroup: null,
      lastInputEvent: {
        group: 'B',
        accepted: false,
        reason: 'ignored_not_ready',
      },
    })

    useGameStore.getState().markInputReady()
    expect(useGameStore.getState()).toMatchObject({
      phase: 'input_ready',
      inputReady: true,
      questionVisible: false,
    })

    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveKeyboardBuzz('B')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'team_answering',
      activeGroup: 'B',
      lastInputEvent: {
        group: 'B',
        source: 'keyboard',
        accepted: true,
        reason: 'accepted',
      },
    })
    expect(useGameStore.getState().gameLog.some((item) => item.includes('ANSWER_WINDOW_STARTED group=B durationSeconds=20'))).toBe(true)
  })

  it('records dynamic pre-show A/B test inputs without score or quiz start', () => {
    useGameStore.getState().resetGame()
    useGameStore.getState().startPreShowInputCheck()
    expect(useGameStore.getState()).toMatchObject({
      preShowElapsedMs: PRE_SHOW_TRIBUNAL_RULE_START_MS,
      preShowInputCheckStatus: 'idle',
    })
    expect(useGameStore.getState().gameLog.some((item) => item.includes('PRESHOW_SCENE_SHOWN scene=how_to_play_tribunal'))).toBe(true)

    useGameStore.getState().tickPreShow(PRE_SHOW_INPUT_CHECK_START_MS - PRE_SHOW_TRIBUNAL_RULE_START_MS)
    expect(useGameStore.getState().gameLog.some((item) => item.includes('PRESHOW_TEST_STARTED status=waitingA'))).toBe(true)
    useGameStore.getState().receiveInput('A', 'test')
    useGameStore.getState().requestNextPreShowInputCheck()
    useGameStore.getState().receiveInput('B', 'test')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      preShowInputCheckStatus: 'complete',
      preShowInputCheckReceivedGroups: ['A', 'B'],
      scoreA: 0,
      scoreB: 0,
      quizSession: null,
      activeGroup: null,
      lastInputEvent: {
        group: 'B',
        source: 'test',
        accepted: true,
        reason: 'preshow_test',
      },
    })
  })

  it('pauses and resumes the automatic sequence without losing countdown remaining time', () => {
    useGameStore.getState().startRoundSequence()
    useGameStore.getState().tickRoundCountdown(700)
    const remaining = useGameStore.getState().roundIntroRemainingMs

    useGameStore.getState().pauseRoundSequence()
    useGameStore.getState().tickRoundCountdown(700)
    expect(useGameStore.getState()).toMatchObject({
      autoSequenceStatus: 'paused',
      roundIntroRemainingMs: remaining,
    })

    useGameStore.getState().resumeRoundSequence()
    useGameStore.getState().tickRoundCountdown(300)
    expect(useGameStore.getState()).toMatchObject({
      autoSequenceStatus: 'running',
      roundIntroRemainingMs: remaining - 300,
    })
  })

  it('does not auto-advance after feedback and waits for the operator', () => {
    useGameStore.getState().startRoundSequence()
    useGameStore.getState().finishRoundCountdown()
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('A')
    useGameStore.getState().markCorrect()
    useGameStore.getState().tickFeedback(3_000)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'round_end',
      autoSequenceStatus: 'completed',
      autoAdvanceEnabled: false,
      buzzLocked: true,
    })
  })

  it('advances ten main rounds and finishes by score', () => {
    const store = useGameStore.getState()

    expect(store.currentRound).toBe(1)
    expect(store.activeSlot).toBe(1)
    useGameStore.getState().awardPoints('A', 100)

    for (let round = 2; round <= 10; round += 1) {
      useGameStore.getState().nextRound()
      expect(useGameStore.getState()).toMatchObject({
        currentRound: round,
        activeSlot: ((round - 1) % 5) + 1,
        phase: 'round_prepare',
      })
    }

    useGameStore.getState().nextRound()
    expect(useGameStore.getState()).toMatchObject({
      currentRound: 10,
      activeSlot: 5,
      phase: 'game_over',
      winner: 'A',
      winReason: 'score',
      finalShowStatus: 'open',
    })
  })

  it('uses text A/B questions in rounds nine and ten and scores by selected choice', () => {
    for (let round = 2; round <= 9; round += 1) {
      useGameStore.getState().nextRound()
    }

    const question = useGameStore.getState().currentRoundQuestion
    expect(question?.type).toBe('text_choice')

    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('A')
    if (question?.type === 'text_choice') {
      useGameStore.getState().selectChoice(question.correctOption)
    }
    useGameStore.getState().confirmChoice()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'scoring',
      scoreA: question?.type === 'text_choice' ? 10 : 0,
      roundFeedback: 'correct',
    })
  })

  it('enters Veredito Final on tied score and never declares a tie', () => {
    for (let round = 2; round <= 10; round += 1) {
      useGameStore.getState().nextRound()
    }

    useGameStore.getState().nextRound()
    expect(useGameStore.getState()).toMatchObject({
      quizMode: 'tie_breaker',
      phase: 'round_prepare',
      winner: null,
    })

    const question = useGameStore.getState().currentRoundQuestion
    expect(question?.type).toBe('tie_breaker')

    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('B')
    if (question?.type === 'tie_breaker') {
      useGameStore.getState().selectChoice(question.correctOption)
    }
    useGameStore.getState().confirmChoice()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'game_over',
      winner: 'B',
      winReason: 'tie_breaker',
      finalShowStatus: 'open',
      scoreA: 0,
      scoreB: 0,
    })
  })

  it('opens, replays and closes the Final Show without changing the finished match', () => {
    useGameStore.getState().awardPoints('A', 100)
    for (let round = 2; round <= 10; round += 1) {
      useGameStore.getState().nextRound()
    }
    useGameStore.getState().nextRound()

    const scoreA = useGameStore.getState().scoreA
    const scoreB = useGameStore.getState().scoreB
    const historyCount = useGameStore.getState().historyEvents.length

    useGameStore.getState().closeFinalShow()
    expect(useGameStore.getState()).toMatchObject({
      phase: 'game_over',
      finalShowStatus: 'closed',
      winner: 'A',
      scoreA,
      scoreB,
    })

    useGameStore.getState().openFinalShow()
    expect(useGameStore.getState().finalShowStatus).toBe('open')

    useGameStore.getState().replayFinalShow()
    expect(useGameStore.getState()).toMatchObject({
      finalShowStatus: 'replaying',
      winner: 'A',
      scoreA,
      scoreB,
    })
    expect(useGameStore.getState().historyEvents).toHaveLength(historyCount)

    const winnerDeclaredCount = useGameStore.getState().historyEvents.filter((event) => event.event === 'winner_declared').length
    useGameStore.getState().nextRound()
    expect(useGameStore.getState()).toMatchObject({
      phase: 'game_over',
      winner: 'A',
      scoreA,
      scoreB,
    })
    expect(useGameStore.getState().historyEvents.filter((event) => event.event === 'winner_declared')).toHaveLength(winnerDeclaredCount)

    useGameStore.getState().resetGame()
    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      finalShowStatus: 'idle',
      winner: null,
    })
  })

  it('holds the pre-show at the table check without starting the quiz', () => {
    useGameStore.getState().resetGame()
    useGameStore.getState().playPreShow()
    useGameStore.getState().tickPreShow(PRE_SHOW_TOTAL_MS)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      preShowStatus: 'playing',
      preShowElapsedMs: PRE_SHOW_TOTAL_MS,
      preShowInputCheckStatus: 'waitingA',
      currentRound: 1,
    })
  })

  it('finishes the pre-show after both tables are recognized', () => {
    useGameStore.getState().resetGame()
    useGameStore.getState().playPreShow()
    useGameStore.getState().tickPreShow(PRE_SHOW_TOTAL_MS)
    useGameStore.getState().receiveKeyboardBuzz('A')
    useGameStore.getState().receiveKeyboardBuzz('B')
    useGameStore.getState().tickPreShow(250)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      preShowStatus: 'finished',
      preShowInputCheckStatus: 'complete',
      preShowInputCheckReceivedGroups: ['A', 'B'],
      currentRound: 1,
    })
  })

  it('keeps the pre-show teaching readable and aligned with the scoring rules', () => {
    const teaching = PRE_SHOW_SCENES.filter((scene) => scene.id.startsWith('how_to_play'))
    const teachingText = teaching.map((scene) => `${scene.title} ${scene.lines.join(' ')}`).join(' ').toLowerCase()
    expect(teaching).toHaveLength(4)
    expect(teaching.every((scene) => scene.endMs - scene.startMs >= PRE_SHOW_TEACHING_MIN_DURATION_MS)).toBe(true)
    expect(teachingText).toContain('tribunal')
    expect(teachingText).toContain('botao de vez')
    expect(teachingText).toContain('20 segundos')
    expect(teachingText).toContain('acertou: +10')
    expect(teachingText).toContain('rival recebe +5')
    expect(teachingText).toContain('-10 para sua mesa')
    expect(teachingText).toContain('+10 para o rival')
    expect(teachingText).toContain('teste confirma mesa a e mesa b')
  })

  it('publishes public audio controls in the snapshot', () => {
    useGameStore.getState().setPublicAudioMuted(true)
    useGameStore.getState().setPublicAudioMasterVolume(0.35)

    expect(useGameStore.getState().getSnapshot()).toMatchObject({
      publicAudioMuted: true,
      publicAudioMasterVolume: 0.35,
    })
  })

  it('keeps turn button signals inert during intro when mesa test is not active', () => {
    useGameStore.getState().resetGame()
    const penaltiesBefore = useGameStore.getState().historyEvents.filter((event) => event.event === 'no_answer_penalty').length
    useGameStore.getState().handleSerialMessage({
      type: 'event',
      eventName: 'BT2PRESS',
      raw: 'BT2PRESS',
    })
    useGameStore.getState().receiveKeyboardBuzz('A')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      scoreA: 0,
      scoreB: 0,
      currentRound: 1,
      activeGroup: null,
      lastBuzz: null,
      quizSession: null,
      matchId: null,
    })
    expect(useGameStore.getState().historyEvents.filter((event) => event.event === 'no_answer_penalty')).toHaveLength(penaltiesBefore)
  })

  it('runs mesa test during pre-show without scoring or starting quiz', () => {
    useGameStore.getState().resetGame()
    const penaltiesBefore = useGameStore.getState().historyEvents.filter((event) => event.event === 'no_answer_penalty').length
    useGameStore.getState().playPreShow()
    useGameStore.getState().startPreShowInputCheck()
    useGameStore.getState().tickPreShow(PRE_SHOW_INPUT_CHECK_START_MS - PRE_SHOW_TRIBUNAL_RULE_START_MS)
    useGameStore.getState().receiveKeyboardBuzz('A')
    useGameStore.getState().requestNextPreShowInputCheck()
    useGameStore.getState().handleSerialMessage({
      type: 'event',
      eventName: 'BT2PRESS',
      raw: 'BT2PRESS',
    })

    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      preShowInputCheckStatus: 'complete',
      preShowInputCheckReceivedGroups: ['A', 'B'],
      preShowInputCheckLastGroup: 'B',
      scoreA: 0,
      scoreB: 0,
      currentRound: 1,
      activeGroup: null,
      lastBuzz: null,
      quizSession: null,
      matchId: null,
    })
    expect(useGameStore.getState().historyEvents.filter((event) => event.event === 'no_answer_penalty')).toHaveLength(penaltiesBefore)
  })

  it('can pause, resume, skip opening and restart the pre-show', () => {
    useGameStore.getState().resetGame()
    useGameStore.getState().playPreShow()
    useGameStore.getState().tickPreShow(1_000)
    useGameStore.getState().pausePreShow()
    useGameStore.getState().tickPreShow(5_000)

    expect(useGameStore.getState()).toMatchObject({
      preShowStatus: 'paused',
      preShowElapsedMs: 1_000,
    })

    useGameStore.getState().resumePreShow()
    useGameStore.getState().skipPreShow()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      preShowStatus: 'playing',
      preShowElapsedMs: PRE_SHOW_HOW_TO_PLAY_START_MS,
    })

    useGameStore.getState().restartPreShowBriefing()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      preShowStatus: 'playing',
      preShowElapsedMs: PRE_SHOW_HOW_TO_PLAY_START_MS,
    })

    useGameStore.getState().restartPreShow()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'intro',
      preShowStatus: 'playing',
      preShowElapsedMs: 0,
    })
  })

  it('enters the tribunal challenge when timer reaches zero without a group', () => {
    const penaltiesBefore = useGameStore.getState().historyEvents.filter((event) => event.event === 'no_answer_penalty').length
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().tickTimer(20)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'tribunal_challenge',
      scoreA: 0,
      scoreB: 0,
      timerRemaining: 20,
      timerStatus: 'running',
      buzzLocked: true,
      roundFeedback: 'time_up',
      tribunalStatus: 'awaiting_decision',
    })
    expect(useGameStore.getState().historyEvents.filter((event) => event.event === 'no_answer_penalty')).toHaveLength(penaltiesBefore)
  })

  it('starts, pauses, resumes and expires the automatic round timer', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().tickTimer(4)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'buzz_open',
      timerRemaining: 16,
      timerStatus: 'running',
    })

    useGameStore.getState().pauseTimer()
    useGameStore.getState().tickTimer(5)

    expect(useGameStore.getState()).toMatchObject({
      timerRemaining: 16,
      timerStatus: 'paused',
    })

    useGameStore.getState().resumeTimer()
    useGameStore.getState().tickTimer(16)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'tribunal_challenge',
      timerRemaining: 20,
      timerStatus: 'running',
      activeGroup: null,
    })
  })

  it('starts a 20s response timer when a group gets the turn', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().tickTimer(6)
    useGameStore.getState().receiveBuzz('A')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'team_answering',
      activeGroup: 'A',
      timerRemaining: 20,
      timerStatus: 'running',
    })

    useGameStore.getState().markWrong()
    useGameStore.getState().reopenTurn()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'buzz_open',
      activeGroup: null,
      buzzLocked: false,
      timerRemaining: 20,
      timerStatus: 'running',
      roundFeedback: 'none',
    })
  })

  it('applies silence penalty once when Mesa A gets the turn and does not answer', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('A')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'team_answering',
      activeGroup: 'A',
      timerRemaining: 20,
    })

    useGameStore.getState().tickTimer(20)

    const penalizedState = useGameStore.getState()
    expect(penalizedState).toMatchObject({
      phase: 'answer_locked',
      activeGroup: 'A',
      scoreA: -10,
      scoreB: 10,
      timerStatus: 'time_up',
      roundFeedback: 'silence_penalty',
      lastScoredGroup: 'B',
      lastScoreDelta: 10,
    })
    expect(penalizedState.historyEvents.at(-1)).toMatchObject({
      event: 'no_answer_penalty',
      actorGroup: 'A',
      beneficiaryGroup: 'B',
      scoreDelta: -10,
      scoreAfterA: -10,
      scoreAfterB: 10,
    })
    expect(penalizedState.gameLog.filter((item) => item.includes('NO_ANSWER_PENALTY_APPLIED team=A'))).toHaveLength(1)
    expect(penalizedState.gameLog.some((item) => item.includes('ANSWER_TIMEOUT') && item.includes('activeGroup=A'))).toBe(true)

    const historyCount = penalizedState.historyEvents.length
    useGameStore.getState().tickTimer(20)

    expect(useGameStore.getState()).toMatchObject({
      scoreA: -10,
      scoreB: 10,
      roundFeedback: 'silence_penalty',
    })
    expect(useGameStore.getState().historyEvents).toHaveLength(historyCount)
    expect(useGameStore.getState().gameLog.filter((item) => item.includes('NO_ANSWER_PENALTY_APPLIED team=A'))).toHaveLength(1)
  })

  it('applies silence penalty once when Mesa B gets the turn and does not answer', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('B')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'team_answering',
      activeGroup: 'B',
      timerRemaining: 20,
    })

    useGameStore.getState().tickTimer(20)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'answer_locked',
      activeGroup: 'B',
      scoreA: 10,
      scoreB: -10,
      timerStatus: 'time_up',
      roundFeedback: 'silence_penalty',
      lastScoredGroup: 'A',
      lastScoreDelta: 10,
    })
    expect(useGameStore.getState().historyEvents.at(-1)).toMatchObject({
      event: 'no_answer_penalty',
      actorGroup: 'B',
      beneficiaryGroup: 'A',
      scoreDelta: -10,
      scoreAfterA: 10,
      scoreAfterB: -10,
    })
  })

  it('holds feedback for 3s and then waits for the operator at round_end', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('B')
    useGameStore.getState().markCorrect()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'scoring',
      roundFeedback: 'correct',
      feedbackRemainingMs: 3_000,
    })

    useGameStore.getState().tickFeedback(2_000)
    expect(useGameStore.getState()).toMatchObject({
      phase: 'scoring',
      feedbackRemainingMs: 1_000,
    })

    useGameStore.getState().tickFeedback(3_000)
    expect(useGameStore.getState()).toMatchObject({
      phase: 'round_end',
      autoSequenceStatus: 'completed',
      autoAdvanceEnabled: false,
    })
  })

  it('does not duplicate score for the same locked answer', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('B')
    useGameStore.getState().markCorrect()
    useGameStore.getState().markCorrect()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'scoring',
      scoreB: 10,
      lastScoredGroup: 'B',
      lastScoreDelta: 10,
      roundFeedback: 'correct',
    })
  })

  it('does not apply silence penalty after the active group answers before timeout', () => {
    const penaltiesBefore = useGameStore.getState().historyEvents.filter((event) => event.event === 'no_answer_penalty').length
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('A')
    useGameStore.getState().tickTimer(19)
    useGameStore.getState().markCorrect()
    useGameStore.getState().tickTimer(20)

    expect(useGameStore.getState()).toMatchObject({
      phase: 'scoring',
      scoreA: 10,
      scoreB: 0,
      roundFeedback: 'correct',
    })
    expect(useGameStore.getState().historyEvents.filter((event) => event.event === 'no_answer_penalty')).toHaveLength(penaltiesBefore)
  })

  it('awards +5 to the opponent when a normal answer is wrong', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('A')
    useGameStore.getState().markWrong()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'answer_locked',
      scoreA: 0,
      scoreB: 5,
      activeGroup: 'A',
      lastScoredGroup: 'B',
      lastScoreDelta: 5,
      roundFeedback: 'opponent_bonus',
    })
    expect(useGameStore.getState().historyEvents.at(-1)).toMatchObject({
      event: 'wrong_opponent_bonus',
      actorGroup: 'A',
      beneficiaryGroup: 'B',
      scoreDelta: 5,
    })
  })

  it('sorts the tribunal called group deterministically', () => {
    expect(selectTribunalCalledGroup('seed-a', 3, 'question-1')).toBe(selectTribunalCalledGroup('seed-a', 3, 'question-1'))
  })

  it('resolves tribunal risk as correct and wrong with official deltas', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().tickTimer(20)
    const calledGroup = useGameStore.getState().tribunalCalledGroup

    useGameStore.getState().tribunalRisk()
    useGameStore.getState().resolveTribunalAttempt('correct')

    expect(useGameStore.getState()).toMatchObject({
      phase: 'answer_locked',
      tribunalStatus: 'resolved',
      tribunalOutcome: 'correct',
      lastScoredGroup: calledGroup,
      lastScoreDelta: 20,
      roundFeedback: 'tribunal_correct',
    })

    useGameStore.getState().nextRound()
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().tickTimer(20)
    const wrongGroup = useGameStore.getState().tribunalCalledGroup
    const before = wrongGroup === 'A' ? useGameStore.getState().scoreA : useGameStore.getState().scoreB
    useGameStore.getState().tribunalRisk()
    useGameStore.getState().resolveTribunalAttempt('wrong')

    expect(wrongGroup === 'A' ? useGameStore.getState().scoreA : useGameStore.getState().scoreB).toBe(before - 10)
    expect(useGameStore.getState()).toMatchObject({
      tribunalOutcome: 'wrong',
      lastScoredGroup: wrongGroup,
      lastScoreDelta: -10,
      roundFeedback: 'tribunal_wrong',
    })
  })

  it('transfers tribunal call on pass and closes with silence after two passes', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().tickTimer(20)
    const firstGroup = useGameStore.getState().tribunalCalledGroup

    useGameStore.getState().tribunalPass()
    expect(useGameStore.getState()).toMatchObject({
      phase: 'tribunal_challenge',
      tribunalPassedGroups: [firstGroup],
      tribunalCalledGroup: firstGroup === 'A' ? 'B' : 'A',
    })

    useGameStore.getState().tribunalPass()
    expect(useGameStore.getState()).toMatchObject({
      phase: 'answer_locked',
      tribunalStatus: 'resolved',
      tribunalOutcome: 'silence',
      roundFeedback: 'tribunal_silence',
      scoreA: 0,
      scoreB: 0,
    })
    expect(useGameStore.getState().historyEvents.at(-1)).toMatchObject({
      event: 'tribunal_silence',
      tribunalOutcome: 'silence',
    })
  })

  it('auto-passes tribunal decision after 20s and closes with silence after both expire', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().tickTimer(20)
    const firstGroup = useGameStore.getState().tribunalCalledGroup

    useGameStore.getState().tickTimer(20)
    expect(useGameStore.getState()).toMatchObject({
      phase: 'tribunal_challenge',
      tribunalPassedGroups: [firstGroup],
      tribunalCalledGroup: firstGroup === 'A' ? 'B' : 'A',
      timerRemaining: 20,
      timerStatus: 'running',
    })

    useGameStore.getState().tickTimer(20)
    expect(useGameStore.getState()).toMatchObject({
      phase: 'answer_locked',
      tribunalStatus: 'resolved',
      tribunalOutcome: 'silence',
      roundFeedback: 'tribunal_silence',
      feedbackRemainingMs: 3_000,
    })
  })

  it('treats repeated RESET as ACK without changing phase or spamming logs', () => {
    useGameStore.getState().startRoundSequence()
    const beforePhase = useGameStore.getState().phase

    useGameStore.getState().handleSerialMessage({ type: 'event', eventName: 'RESET', raw: 'RESET' })
    useGameStore.getState().handleSerialMessage({ type: 'event', eventName: 'RESET', raw: 'RESET' })
    useGameStore.getState().handleSerialMessage({ type: 'event', eventName: 'RESET', raw: 'RESET' })

    const resetLogs = useGameStore.getState().gameLog.filter((item) => item.includes('RESET ACK recebido'))
    expect(useGameStore.getState().phase).toBe(beforePhase)
    expect(resetLogs).toHaveLength(1)
    expect(useGameStore.getState().serialResetCorrelationId).toMatch(/^reset-/)
  })

  it('blocks hardware and keyboard turn buttons during tribunal challenge', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().tickTimer(20)
    const calledGroup = useGameStore.getState().tribunalCalledGroup

    useGameStore.getState().receiveKeyboardBuzz('A')
    useGameStore.getState().handleSerialMessage({ type: 'event', eventName: 'BT2PRESS', raw: 'BT2PRESS' })

    expect(useGameStore.getState()).toMatchObject({
      phase: 'tribunal_challenge',
      activeGroup: null,
      tribunalCalledGroup: calledGroup,
    })
  })

  it('clears feedback and previous turn state on the next round', () => {
    useGameStore.getState().revealQuestion()
    useGameStore.getState().openBuzz()
    useGameStore.getState().receiveBuzz('A')
    useGameStore.getState().markCorrect()
    useGameStore.getState().nextRound()

    expect(useGameStore.getState()).toMatchObject({
      phase: 'round_prepare',
      currentRound: 2,
      activeGroup: null,
      lastBuzz: null,
      roundFeedback: 'none',
      lastScoredGroup: null,
      lastScoreDelta: 0,
    })
  })
})
