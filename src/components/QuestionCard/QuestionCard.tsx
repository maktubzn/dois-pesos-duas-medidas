import type { QuizQuestion } from '@/types/game.types'
import styles from './QuestionCard.module.css'

interface QuestionCardProps {
  question: QuizQuestion | null
  compact?: boolean
}

export function QuestionCard({ question, compact = false }: QuestionCardProps) {
  if (!question) {
    return (
      <article className={`${styles.card} ${compact ? styles.compact : ''}`} data-testid="question-card">
        <span className={styles.kicker}>Pergunta</span>
        <strong className={styles.empty}>Aguardando conteudo</strong>
      </article>
    )
  }

  if (question.type === 'character_image') {
    return (
      <article className={`${styles.card} ${styles.imageMode} ${compact ? styles.compact : ''}`} data-testid="question-card">
        <div className={styles.copyBlock}>
          <span className={styles.kicker}>Rodada de personagem</span>
          <strong className={styles.prompt}>Quem e este personagem?</strong>
        </div>
        <div className={styles.imageFrame} aria-label="Imagem do personagem">
          <img src={question.imageSrc} alt="Personagem da pergunta" loading="eager" decoding="async" />
        </div>
      </article>
    )
  }

  const isTieBreaker = question.type === 'tie_breaker'

  return (
    <article
      className={`${styles.card} ${styles.choiceMode} ${isTieBreaker ? styles.tieBreaker : ''} ${compact ? styles.compact : ''}`}
      data-testid="question-card"
    >
      <span className={styles.kicker}>{isTieBreaker ? 'Veredito Final' : 'Escolha A/B'}</span>
      <strong className={styles.prompt}>{question.prompt}</strong>
      <div className={styles.options} aria-label="Alternativas publicas">
        <p>
          <span>A</span>
          {question.optionA}
        </p>
        <p>
          <span>B</span>
          {question.optionB}
        </p>
      </div>
    </article>
  )
}
