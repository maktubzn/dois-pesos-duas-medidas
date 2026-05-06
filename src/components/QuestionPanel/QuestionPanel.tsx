import styles from './QuestionPanel.module.css'
import { QuestionCard } from '@/components/QuestionCard/QuestionCard'
import type { GroupId, QuizPhase, QuizQuestion, RoundFeedback } from '@/types/game.types'

interface QuestionPanelProps {
  visible: boolean
  question?: string
  currentRoundQuestion?: QuizQuestion | null
  phase?: QuizPhase
  activeGroup?: GroupId | null
  feedback?: RoundFeedback
}

function getLabel(phase: QuizPhase = 'round_prepare', activeGroup: GroupId | null = null, feedback: RoundFeedback = 'none') {
  if (feedback === 'correct') return 'Resposta correta'
  if (feedback === 'wrong') return 'Resposta errada'
  if (feedback === 'silence_penalty') return 'Silencio punido'
  if (feedback === 'time_up') return 'Tempo esgotado'
  if (phase === 'buzz_open') return 'Botao de vez liberado'
  if (phase === 'team_answering' && activeGroup) return `Grupo ${activeGroup} com a vez`
  if (phase === 'question_reveal') return 'Pergunta'
  return 'Pergunta preparada'
}

export function QuestionPanel({
  visible,
  question = 'Aguardando impacto do martelo',
  currentRoundQuestion = null,
  phase = 'round_prepare',
  activeGroup = null,
  feedback = 'none',
}: QuestionPanelProps) {
  return (
    <section className={`${styles.panel} ${visible ? styles.visible : ''}`} aria-label="Area temporaria da pergunta">
      <div className={styles.shell}>
        <span className={styles.label}>{getLabel(phase, activeGroup, feedback)}</span>
        {currentRoundQuestion ? <QuestionCard question={currentRoundQuestion} /> : <p className={styles.copy}>{question}</p>}
      </div>
    </section>
  )
}
