import styles from './IntroScreen.module.css'

interface IntroScreenProps {
  visible: boolean
  onSkip: () => void
}

export function IntroScreen({ visible, onSkip }: IntroScreenProps) {
  return (
    <section className={`${styles.intro} ${visible ? styles.visible : styles.hidden}`} aria-label="Abertura do quiz">
      <div className={styles.content}>
        <div className={styles.riddle} aria-hidden="true">?</div>
        <p className={styles.copy}>
          OS ALUNOS DA ETEC DR. EMILIO HERNANDEZ AGUILAR
          <br />
          DO CURSO MTEC INFORMATICA PARA INTERNET - 2 ANO
          <br />
          APRESENTAM
        </p>
        <img className={styles.logo} src="/img/brasao dc.png" alt="Logo temporaria DC" draggable="false" />
      </div>
      <button className={styles.skip} type="button" onClick={onSkip}>
        Pular intro
      </button>
    </section>
  )
}

