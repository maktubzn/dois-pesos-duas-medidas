import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackgroundStage } from "@/components/BackgroundStage/BackgroundStage";
import { GroupCard } from "@/components/GroupCard/GroupCard";
import { HourglassTimer } from "@/components/HourglassTimer/HourglassTimer";
import { PreShowScreen } from "@/components/PreShowScreen/PreShowScreen";
import { QuestionPanel } from "@/components/QuestionPanel/QuestionPanel";
import { RoundIntroCountdown } from "@/components/RoundIntroCountdown/RoundIntroCountdown";
import { ScoreBar } from "@/components/ScoreBar/ScoreBar";
import { useBackgroundCue } from "@/hooks/useBackgroundCue";
import { useStageRealtime } from "@/hooks/useRealtimeBridge";
import { useStageAudioController } from "@/hooks/useStageAudioController";
import { useGameStore } from "@/store/gameStore";
import styles from "./QuizStage.module.css";

declare global {
  interface Window {
    QuizStageDebug?: {
      startNewQuiz: () => void;
      startNewQuestion: () => Promise<void>;
      showQuestionCard: () => void;
      hideQuestionCard: () => void;
      markCorrect: () => void;
      markWrong: () => void;
      passQuestion: () => void;
      repassQuestion: () => void;
      openAnswerWindow: () => Promise<void>;
      expireTimer: () => void;
      lockGroupA: () => void;
      lockGroupB: () => void;
      selectChoiceA: () => void;
      selectChoiceB: () => void;
      selectCorrectChoice: () => void;
      confirmChoice: () => void;
      nextRound: () => void;
      tribunalRisk: () => void;
      tribunalPass: () => void;
      resolveTribunalCorrect: () => void;
      resolveTribunalWrong: () => void;
      openFinalShow: () => void;
      replayFinalShow: () => void;
      closeFinalShow: () => void;
    };
    StageAudioDebug?: {
      unlock: () => Promise<boolean>;
      getState: () => {
        unlocked: boolean;
        muted: boolean;
        masterVolume: number;
        activeCount: number;
        loopIds: string[];
        lastError: string | null;
      };
    };
  }
}

export function QuizStage() {
  const [clockNowMs, setClockNowMs] = useState(() => Date.now());
  const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState>(() =>
    typeof document === "undefined" ? "visible" : document.visibilityState,
  );
  const phase = useGameStore((state) => state.phase);
  const preShowStatus = useGameStore((state) => state.preShowStatus);
  const preShowElapsedMs = useGameStore((state) => state.preShowElapsedMs);
  const preShowStartedAtMs = useGameStore((state) => state.preShowStartedAtMs);
  const preShowDurationMs = useGameStore((state) => state.preShowDurationMs);
  const preShowEndsAtMs = useGameStore((state) => state.preShowEndsAtMs);
  const preShowPausedAtMs = useGameStore((state) => state.preShowPausedAtMs);
  const preShowAccumulatedPauseMs = useGameStore((state) => state.preShowAccumulatedPauseMs);
  const preShowInputCheckStatus = useGameStore((state) => state.preShowInputCheckStatus);
  const preShowInputCheckReceivedGroups = useGameStore((state) => state.preShowInputCheckReceivedGroups);
  const preShowInputCheckLastGroup = useGameStore((state) => state.preShowInputCheckLastGroup);
  const scoreA = useGameStore((state) => state.scoreA);
  const scoreB = useGameStore((state) => state.scoreB);
  const lastBuzz = useGameStore((state) => state.lastBuzz);
  const activeGroup = useGameStore((state) => state.activeGroup);
  const roundFeedback = useGameStore((state) => state.roundFeedback);
  const lastScoredGroup = useGameStore((state) => state.lastScoredGroup);
  const lastScoreDelta = useGameStore((state) => state.lastScoreDelta);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const currentRoundQuestion = useGameStore((state) => state.currentRoundQuestion);
  const quizMode = useGameStore((state) => state.quizMode);
  const tieBreakerAttempt = useGameStore((state) => state.tieBreakerAttempt);
  const roundIntroStatus = useGameStore((state) => state.roundIntroStatus);
  const roundIntroDelayMs = useGameStore((state) => state.roundIntroDelayMs);
  const roundIntroRemainingMs = useGameStore((state) => state.roundIntroRemainingMs);
  const roundIntroStartedAtMs = useGameStore((state) => state.roundIntroStartedAtMs);
  const roundIntroEndsAtMs = useGameStore((state) => state.roundIntroEndsAtMs);
  const roundIntroPausedAtMs = useGameStore((state) => state.roundIntroPausedAtMs);
  const roundIntroAccumulatedPauseMs = useGameStore((state) => state.roundIntroAccumulatedPauseMs);
  const pendingAutomationToken = useGameStore((state) => state.pendingAutomationToken);
  const autoSequenceStatus = useGameStore((state) => state.autoSequenceStatus);
  const winner = useGameStore((state) => state.winner);
  const winReason = useGameStore((state) => state.winReason);
  const finalShowStatus = useGameStore((state) => state.finalShowStatus);
  const tribunalStatus = useGameStore((state) => state.tribunalStatus);
  const tribunalCalledGroup = useGameStore((state) => state.tribunalCalledGroup);
  const tribunalPassedGroups = useGameStore((state) => state.tribunalPassedGroups);
  const tribunalAttemptingGroup = useGameStore((state) => state.tribunalAttemptingGroup);
  const tribunalOutcome = useGameStore((state) => state.tribunalOutcome);
  const questionVisible = useGameStore((state) => state.questionVisible);
  const timerVisible = useGameStore((state) => state.timerVisible);
  const currentRound = useGameStore((state) => state.currentRound);
  const totalRounds = useGameStore((state) => state.totalRounds);
  const activeSlot = useGameStore((state) => state.activeSlot);
  const answerTimeSeconds = useGameStore((state) => state.answerTimeSeconds);
  const timerRemaining = useGameStore((state) => state.timerRemaining);
  const timerStartedAtMs = useGameStore((state) => state.timerStartedAtMs);
  const timerDurationMs = useGameStore((state) => state.timerDurationMs);
  const timerEndsAtMs = useGameStore((state) => state.timerEndsAtMs);
  const timerPausedAtMs = useGameStore((state) => state.timerPausedAtMs);
  const timerAccumulatedPauseMs = useGameStore((state) => state.timerAccumulatedPauseMs);
  const timerStatus = useGameStore((state) => state.timerStatus);
  const publicAudioMuted = useGameStore((state) => state.publicAudioMuted);
  const publicAudioMasterVolume = useGameStore((state) => state.publicAudioMasterVolume);
  const lastStateSyncedAtMs = useGameStore((state) => state.lastStateSyncedAtMs);
  const startNewQuiz = useGameStore((state) => state.startNewQuiz);
  const startNewQuestionState = useGameStore((state) => state.startNewQuestion);
  const nextRound = useGameStore((state) => state.nextRound);
  const revealQuestion = useGameStore((state) => state.revealQuestion);
  const openBuzz = useGameStore((state) => state.openBuzz);
  const resetRound = useGameStore((state) => state.resetRound);
  const receiveKeyboardBuzz = useGameStore((state) => state.receiveKeyboardBuzz);
  const markCorrect = useGameStore((state) => state.markCorrect);
  const markWrong = useGameStore((state) => state.markWrong);
  const selectChoice = useGameStore((state) => state.selectChoice);
  const confirmChoice = useGameStore((state) => state.confirmChoice);
  const tribunalRisk = useGameStore((state) => state.tribunalRisk);
  const tribunalPass = useGameStore((state) => state.tribunalPass);
  const resolveTribunalAttempt = useGameStore((state) => state.resolveTribunalAttempt);
  const openFinalShow = useGameStore((state) => state.openFinalShow);
  const replayFinalShow = useGameStore((state) => state.replayFinalShow);
  const closeFinalShow = useGameStore((state) => state.closeFinalShow);
  const passQuestion = useGameStore((state) => state.passQuestion);
  const repassQuestion = useGameStore((state) => state.repassQuestion);
  const tickTimer = useGameStore((state) => state.tickTimer);
  const { videoRef, mode, playFromStart } = useBackgroundCue();
  const { publishGameState, publishStageAudioStatus, publishStageHeartbeat } = useStageRealtime();
  const preShowVisible = phase === "intro";
  const mainUiVisible = !preShowVisible;
  const questionRevealTimeoutRef = useRef<number | null>(null);
  const questionRevealResolveRef = useRef<((shouldReveal: boolean) => void) | null>(null);
  const answerTimerVisible =
    timerVisible &&
    (phase === "buzz_open" || phase === "team_answering" || phase === "tribunal_challenge") &&
    (timerStatus === "running" || timerStatus === "paused");
  const timerDisplayTotal = Math.max(1, Math.ceil(timerDurationMs / 1000));
  const finalWinner = winner ?? (scoreA >= scoreB ? "A" : "B");
  const finalScoreDelta = Math.abs(scoreA - scoreB);
  const finalShowVisible = phase === "game_over" && finalShowStatus !== "closed";
  const realtimeAgeMs = lastStateSyncedAtMs === null ? -1 : Math.max(0, clockNowMs - lastStateSyncedAtMs);
  const preShowDisplayElapsedMs = useMemo(() => {
    if (preShowStatus !== "playing" || preShowStartedAtMs === null) return preShowElapsedMs;
    if (preShowPausedAtMs !== null) return preShowElapsedMs;
    if (preShowEndsAtMs !== null) {
      return Math.min(preShowDurationMs, Math.max(0, preShowDurationMs - Math.max(0, preShowEndsAtMs - clockNowMs)));
    }
    const pausedMs = preShowPausedAtMs ? Math.max(0, clockNowMs - preShowPausedAtMs) : 0;
    return Math.min(preShowDurationMs, Math.max(0, clockNowMs - preShowStartedAtMs - preShowAccumulatedPauseMs - pausedMs));
  }, [
    clockNowMs,
    preShowAccumulatedPauseMs,
    preShowDurationMs,
    preShowElapsedMs,
    preShowEndsAtMs,
    preShowPausedAtMs,
    preShowStartedAtMs,
    preShowStatus,
  ]);
  const timerDisplayRemaining = useMemo(() => {
    if (timerStatus !== "running" || timerStartedAtMs === null) return timerRemaining;
    if (timerPausedAtMs !== null) return timerRemaining;
    if (timerEndsAtMs !== null) {
      return Math.max(0, Math.ceil(Math.max(0, timerEndsAtMs - clockNowMs) / 1000));
    }
    const pausedMs = timerPausedAtMs ? Math.max(0, clockNowMs - timerPausedAtMs) : 0;
    const remainingMs = Math.max(0, timerDurationMs - (clockNowMs - timerStartedAtMs - timerAccumulatedPauseMs - pausedMs));
    return Math.ceil(remainingMs / 1000);
  }, [clockNowMs, timerAccumulatedPauseMs, timerDurationMs, timerEndsAtMs, timerPausedAtMs, timerRemaining, timerStartedAtMs, timerStatus]);
  const roundIntroDisplayRemainingMs = useMemo(() => {
    if (roundIntroStatus !== "counting" || roundIntroStartedAtMs === null) return roundIntroRemainingMs;
    if (roundIntroPausedAtMs !== null) return roundIntroRemainingMs;
    if (roundIntroEndsAtMs !== null) {
      return Math.max(0, roundIntroEndsAtMs - clockNowMs);
    }
    const pausedMs = roundIntroPausedAtMs ? Math.max(0, clockNowMs - roundIntroPausedAtMs) : 0;
    return Math.max(0, roundIntroDelayMs - (clockNowMs - roundIntroStartedAtMs - roundIntroAccumulatedPauseMs - pausedMs));
  }, [
    clockNowMs,
    roundIntroAccumulatedPauseMs,
    roundIntroDelayMs,
    roundIntroEndsAtMs,
    roundIntroPausedAtMs,
    roundIntroRemainingMs,
    roundIntroStartedAtMs,
    roundIntroStatus,
  ]);
  const gameAudioState = useMemo(
    () => ({
      phase,
      timerStatus,
      roundFeedback,
      activeGroup,
      quizMode,
      currentRound,
      tieBreakerAttempt,
      roundIntroStatus,
      roundIntroDelayMs,
      pendingAutomationToken,
      autoSequenceStatus,
      winner,
      preShowStatus,
      preShowElapsedMs: preShowDisplayElapsedMs,
      tribunalStatus,
      tribunalCalledGroup,
      tribunalOutcome,
    }),
    [
      activeGroup,
      autoSequenceStatus,
      currentRound,
      pendingAutomationToken,
      phase,
      preShowDisplayElapsedMs,
      preShowStatus,
      quizMode,
      roundFeedback,
      roundIntroDelayMs,
      roundIntroStatus,
      tieBreakerAttempt,
      timerStatus,
      tribunalCalledGroup,
      tribunalOutcome,
      tribunalStatus,
      winner,
    ],
  );
  const {
    unlocked: stageAudioUnlocked,
    lastError: stageAudioError,
    unlockStageAudio,
    getDebugState: getStageAudioDebugState,
  } = useStageAudioController({
    gameAudioState,
    muted: publicAudioMuted,
    masterVolume: publicAudioMasterVolume,
    publishStatus: publishStageAudioStatus,
  });

  const clearQuestionRevealTimeout = useCallback(() => {
    if (questionRevealTimeoutRef.current !== null) {
      window.clearTimeout(questionRevealTimeoutRef.current);
      questionRevealTimeoutRef.current = null;
    }

    if (questionRevealResolveRef.current) {
      questionRevealResolveRef.current(false);
      questionRevealResolveRef.current = null;
    }
  }, []);

  const waitForQuestionRevealCue = useCallback(() => new Promise<boolean>((resolve) => {
    clearQuestionRevealTimeout();
    questionRevealResolveRef.current = resolve;
    questionRevealTimeoutRef.current = window.setTimeout(() => {
      questionRevealTimeoutRef.current = null;
      questionRevealResolveRef.current = null;
      resolve(true);
    }, 820);
  }), [clearQuestionRevealTimeout]);

  const hideQuestionCard = useCallback(() => {
    clearQuestionRevealTimeout();
    resetRound();
  }, [clearQuestionRevealTimeout, resetRound]);

  const startNewQuestion = useCallback(async () => {
    startNewQuestionState();
    await playFromStart();
    const shouldReveal = await waitForQuestionRevealCue();
    if (!shouldReveal) return;
    revealQuestion();
    openBuzz();
  }, [openBuzz, playFromStart, revealQuestion, startNewQuestionState, waitForQuestionRevealCue]);

  const tribunalVisible = phase === "tribunal_challenge" || roundFeedback === "tribunal_silence";
  const feedbackLabel =
    roundFeedback === "correct"
      ? `Grupo ${lastScoredGroup ?? activeGroup ?? ""} marcou ponto`
      : roundFeedback === "wrong"
        ? `Grupo ${lastScoredGroup ?? activeGroup ?? ""} errou`
        : roundFeedback === "opponent_bonus"
          ? `Erro confirmado. Grupo ${lastScoredGroup ?? ""} recebeu +${lastScoreDelta}`
          : roundFeedback === "silence_penalty"
            ? `Silencio punido. Grupo ${activeGroup ?? ""} -10; Grupo ${lastScoredGroup ?? ""} +${lastScoreDelta}`
          : roundFeedback === "tribunal_correct"
            ? `Tribunal aceitou: Grupo ${lastScoredGroup ?? ""} recebeu +${lastScoreDelta}`
            : roundFeedback === "tribunal_wrong"
              ? `Tribunal negou: Grupo ${lastScoredGroup ?? ""} perdeu ${Math.abs(lastScoreDelta)}`
              : roundFeedback === "tribunal_silence"
                ? "O tribunal registra silêncio nos autos."
                : "Tempo esgotado";

  useEffect(() => {
    window.QuizStageDebug = {
      startNewQuiz,
      startNewQuestion,
      showQuestionCard: revealQuestion,
      hideQuestionCard,
      markCorrect: () => markCorrect(),
      markWrong,
      passQuestion,
      repassQuestion,
      openAnswerWindow: startNewQuestion,
      expireTimer: () => tickTimer(answerTimeSeconds),
      lockGroupA: () => receiveKeyboardBuzz("A"),
      lockGroupB: () => receiveKeyboardBuzz("B"),
      selectChoiceA: () => selectChoice("A"),
      selectChoiceB: () => selectChoice("B"),
      selectCorrectChoice: () => {
        const question = useGameStore.getState().currentRoundQuestion;
        if (question?.type === "text_choice" || question?.type === "tie_breaker") {
          selectChoice(question.correctOption);
        }
      },
      confirmChoice,
      nextRound,
      tribunalRisk,
      tribunalPass,
      resolveTribunalCorrect: () => resolveTribunalAttempt("correct"),
      resolveTribunalWrong: () => resolveTribunalAttempt("wrong"),
      openFinalShow,
      replayFinalShow,
      closeFinalShow,
    };

    return () => {
      clearQuestionRevealTimeout();
      delete window.QuizStageDebug;
    };
  }, [
    clearQuestionRevealTimeout,
    hideQuestionCard,
    revealQuestion,
    markCorrect,
    markWrong,
    nextRound,
    passQuestion,
    receiveKeyboardBuzz,
    repassQuestion,
    selectChoice,
    startNewQuestion,
    startNewQuiz,
    tickTimer,
    tribunalPass,
    tribunalRisk,
    resolveTribunalAttempt,
    openFinalShow,
    replayFinalShow,
    closeFinalShow,
    answerTimeSeconds,
    confirmChoice,
  ]);

  useEffect(() => {
    window.StageAudioDebug = {
      unlock: unlockStageAudio,
      getState: getStageAudioDebugState,
    };

    return () => {
      delete window.StageAudioDebug;
    };
  }, [getStageAudioDebugState, unlockStageAudio]);

  useEffect(() => {
    const shouldTick =
      preShowStatus === "playing" ||
      timerStatus === "running" ||
      (phase === "round_countdown" && roundIntroStatus === "counting");
    if (!shouldTick) return undefined;

    let frameId: number | null = null;
    let intervalId: number | null = null;
    const tick = () => setClockNowMs(Date.now());
    const frame = () => {
      tick();
      frameId = window.requestAnimationFrame(frame);
    };

    if (document.visibilityState === "visible") {
      frameId = window.requestAnimationFrame(frame);
      intervalId = window.setInterval(tick, 500);
    } else {
      intervalId = window.setInterval(tick, 1000);
    }

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [phase, preShowStatus, roundIntroStatus, timerStatus, visibilityState]);

  useEffect(() => {
    const syncClock = () => {
      setVisibilityState(document.visibilityState);
      setClockNowMs(Date.now());
    };

    document.addEventListener("visibilitychange", syncClock);
    window.addEventListener("focus", syncClock);
    window.addEventListener("pageshow", syncClock);

    return () => {
      document.removeEventListener("visibilitychange", syncClock);
      window.removeEventListener("focus", syncClock);
      window.removeEventListener("pageshow", syncClock);
    };
  }, []);

  useEffect(() => {
    const publish = () => {
      publishStageHeartbeat({
        visibilityState,
        phase,
        clockNowMs: Date.now(),
        lastSnapshotAtMs: lastStateSyncedAtMs,
        audioUnlocked: stageAudioUnlocked,
      });
    };

    publish();
    const interval = window.setInterval(publish, 1000);
    return () => window.clearInterval(interval);
  }, [lastStateSyncedAtMs, phase, publishStageHeartbeat, stageAudioUnlocked, visibilityState]);

  useEffect(() => {
    if (timerStatus !== "running") return undefined;

    const interval = window.setInterval(() => {
      const before = useGameStore.getState();
      const beforeKey = [
        before.phase,
        before.timerStatus,
        before.timerRemaining,
        before.roundFeedback,
        before.tribunalStatus,
        before.tribunalCalledGroup ?? "",
      ].join("|");

      tickTimer();

      const after = useGameStore.getState();
      const afterKey = [
        after.phase,
        after.timerStatus,
        after.timerRemaining,
        after.roundFeedback,
        after.tribunalStatus,
        after.tribunalCalledGroup ?? "",
      ].join("|");

      if (afterKey !== beforeKey) {
        publishGameState();
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [publishGameState, tickTimer, timerStatus]);

  return (
    <main
      className={styles.stage}
      data-phase={phase}
      data-visibility-state={visibilityState}
      data-realtime-age-ms={Math.round(realtimeAgeMs)}
      data-stage-clock-ms={clockNowMs}
      aria-label="Cena principal do quiz"
    >
      {visibilityState !== "visible" ? (
        <aside className={styles.visibilityWarning} role="status">
          Stage em aba oculta. Abra em janela separada/fullscreen.
        </aside>
      ) : null}
      {mainUiVisible ? (
        <BackgroundStage
          phase={phase}
          videoRef={videoRef}
          videoVisible={mode === "playing" || mode === "paused"}
        />
      ) : null}
      {mainUiVisible ? (
      <section className={styles.ui} aria-label="Interface principal do quiz">
        <ScoreBar scoreA={scoreA} scoreB={scoreB} highlightGroup={lastScoredGroup} scoreDelta={lastScoreDelta} />
        <div className={`${styles.cardZone} ${styles.cardZoneA}`}>
          <GroupCard group="A" activeGroup={lastBuzz} activeSlot={activeSlot} />
        </div>
        <div className={`${styles.cardZone} ${styles.cardZoneB}`}>
          <GroupCard group="B" activeGroup={lastBuzz} activeSlot={activeSlot} />
        </div>
        <QuestionPanel
          visible={questionVisible && phase !== "tribunal_challenge"}
          question={currentQuestion}
          currentRoundQuestion={currentRoundQuestion}
          phase={phase}
          activeGroup={activeGroup}
          feedback={roundFeedback}
        />
        <div
          data-timer-ends-at-ms={timerEndsAtMs ?? ""}
          data-timer-display={timerDisplayRemaining}
        >
          <HourglassTimer visible={answerTimerVisible} remaining={timerDisplayRemaining} total={timerDisplayTotal} status={timerStatus} />
        </div>
        <section
          className={`${styles.tribunalOverlay} ${tribunalVisible ? styles.tribunalOverlayVisible : ""}`}
          hidden={!tribunalVisible}
          role="dialog"
          aria-modal="true"
          aria-label="Desafio do Tribunal"
          data-tribunal-group={tribunalAttemptingGroup ?? tribunalCalledGroup ?? ""}
          data-tribunal-image-state="public-img"
        >
          <div className={styles.tribunalCopy}>
            <span>DESAFIO DO TRIBUNAL</span>
            <h2>
              {roundFeedback === "tribunal_silence"
                ? "Silêncio nos autos"
                : tribunalStatus === "attempting"
                  ? `Grupo ${tribunalAttemptingGroup ?? tribunalCalledGroup ?? ""} arriscou`
                  : `Grupo ${tribunalCalledGroup ?? ""}, o tribunal chama`}
            </h2>
            <p>
              {roundFeedback === "tribunal_silence"
                ? "O tribunal registra silêncio nos autos."
                : tribunalStatus === "attempting"
                  ? "O operador confirma se a tentativa vale +20 ou -10."
                  : "20 segundos para arriscar ou passar a chamada ao outro grupo."}
            </p>
          </div>
          <div className={styles.tribunalTimer} aria-label={`Tempo do tribunal: ${timerDisplayRemaining} segundos`}>
            <span>Tempo</span>
            <strong>{timerDisplayRemaining}</strong>
            <small>segundos</small>
          </div>
          <div className={styles.tribunalMeta}>
            <span>Grupo: {tribunalAttemptingGroup ?? tribunalCalledGroup ?? "--"}</span>
            <span>Passaram: {tribunalPassedGroups.length ? tribunalPassedGroups.join(" e ") : "--"}</span>
          </div>
        </section>
        <div
          className={`${styles.feedback} ${roundFeedback !== "none" ? styles.feedbackVisible : ""} ${roundFeedback === "correct" || roundFeedback === "tribunal_correct" ? styles.feedbackCorrect : ""} ${roundFeedback === "wrong" || roundFeedback === "opponent_bonus" || roundFeedback === "silence_penalty" || roundFeedback === "tribunal_wrong" ? styles.feedbackWrong : ""} ${roundFeedback === "time_up" || roundFeedback === "tribunal_silence" ? styles.feedbackTimeUp : ""}`}
          aria-label="Feedback da rodada"
        >
          {roundFeedback !== "none" ? feedbackLabel : ""}
        </div>
        <div className={styles.roundHud} aria-label="Estado da rodada">
          <span>Rodada {currentRound}/{totalRounds}</span>
          <span>Jogador {activeSlot}</span>
          <span>Timer {timerStatus === "idle" ? "--" : timerDisplayRemaining}</span>
        </div>
        <section
          className={`${styles.gameOver} ${finalShowVisible ? styles.gameOverVisible : ""}`}
          aria-label="Fim do jogo"
          data-final-show-status={finalShowStatus}
          data-winner={finalWinner}
        >
          <div className={styles.finalBlackout} aria-hidden="true" />
          <div className={styles.winnerCard} data-final-winner-card={finalWinner} aria-label={`Card vencedor Grupo ${finalWinner}`}>
            {finalShowVisible ? <GroupCard group={finalWinner} activeGroup={finalWinner} activeSlot={activeSlot} statusOverride="VENCEDOR" /> : null}
          </div>
          <div className={styles.finalCopy}>
            <span className={styles.finalEventLabel}>Final Show</span>
            <strong>Grupo {finalWinner} vence</strong>
            <em>{winReason === "tie_breaker" ? "Veredito Final" : "Vitoria por pontos"}</em>
            <div className={styles.finalScore} aria-label="Placar final">
              <span className={styles.finalScoreLabel}>Placar final: {scoreA} x {scoreB}</span>
              <span>Grupo A {scoreA}</span>
              <b>x</b>
              <span>{scoreB} Grupo B</span>
            </div>
            <small>Diferenca: {finalScoreDelta} pontos</small>
            <p className={styles.finalSentence}>Veredito registrado. A vitoria tem peso. O julgamento esta encerrado.</p>
          </div>
          <div className={styles.finalRest} aria-hidden="true">DECISAO FINAL</div>
        </section>
      </section>
      ) : null}
      <PreShowScreen
        visible={preShowVisible}
        status={preShowStatus}
        elapsedMs={preShowDisplayElapsedMs}
        inputCheckStatus={preShowInputCheckStatus}
        inputCheckReceivedGroups={preShowInputCheckReceivedGroups}
        inputCheckLastGroup={preShowInputCheckLastGroup}
      />
      <RoundIntroCountdown
        visible={phase === "round_countdown"}
        round={currentRound}
        totalRounds={totalRounds}
        remainingMs={roundIntroDisplayRemainingMs}
        quizMode={quizMode}
        attempt={tieBreakerAttempt}
        status={roundIntroStatus}
      />
      {!finalShowVisible ? (
      <aside className={`${styles.stageAudioGate} ${stageAudioUnlocked ? styles.stageAudioGateReady : ""}`} aria-label="Audio da TV">
        <button type="button" onClick={() => void unlockStageAudio()}>
          {stageAudioUnlocked ? "Audio da TV ativo" : "Ativar audio da TV"}
        </button>
        <span>
          {stageAudioError
            ? "Audio bloqueado; jogo visual continua."
            : publicAudioMuted
              ? "TV em mudo pelo Admin"
              : stageAudioUnlocked
                ? "Som publico na Stage"
                : "Toque uma vez antes da apresentacao"}
        </span>
      </aside>
      ) : null}
    </main>
  );
}
