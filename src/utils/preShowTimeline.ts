import type { PreShowStatus } from '@/types/game.types'

export const PRE_SHOW_BLACKOUT_END_MS = 1_000
export const PRE_SHOW_VIDEO_START_MS = PRE_SHOW_BLACKOUT_END_MS
export const PRE_SHOW_TITLE_START_MS = 8_800
export const PRE_SHOW_HOW_TO_PLAY_START_MS = 16_000
export const PRE_SHOW_SCORE_RULE_START_MS = 26_000
export const PRE_SHOW_ERROR_RULE_START_MS = 36_000
export const PRE_SHOW_TRIBUNAL_RULE_START_MS = 46_000
export const PRE_SHOW_INPUT_CHECK_START_MS = 58_000
export const PRE_SHOW_READY_START_MS = 70_000
export const PRE_SHOW_TOTAL_MS = 80_000
export const PRE_SHOW_TEACHING_MIN_DURATION_MS = 9_000
export const PRE_SHOW_MAX_AUTO_TICK_MS = 1_250

export interface PreShowScene {
  id:
    | 'waiting_logo'
    | 'blackout_to_video'
    | 'cinematic_video'
    | 'title_over_video'
    | 'how_to_play_first'
    | 'how_to_play_score'
    | 'how_to_play_wrong'
    | 'how_to_play_tribunal'
    | 'button_check'
    | 'ready_to_start'
  startMs: number
  endMs: number
  kicker: string
  title: string
  lines: string[]
}

export const PRE_SHOW_SCENES: PreShowScene[] = [
  {
    id: 'blackout_to_video',
    startMs: 0,
    endMs: PRE_SHOW_BLACKOUT_END_MS,
    kicker: '',
    title: '',
    lines: [],
  },
  {
    id: 'cinematic_video',
    startMs: PRE_SHOW_VIDEO_START_MS,
    endMs: PRE_SHOW_TITLE_START_MS,
    kicker: '',
    title: '',
    lines: [],
  },
  {
    id: 'title_over_video',
    startMs: PRE_SHOW_TITLE_START_MS,
    endMs: PRE_SHOW_HOW_TO_PLAY_START_MS,
    kicker: 'Jogo',
    title: 'DOIS PESOS, DUAS MEDIDAS',
    lines: [],
  },
  {
    id: 'how_to_play_first',
    startMs: PRE_SHOW_HOW_TO_PLAY_START_MS,
    endMs: PRE_SHOW_SCORE_RULE_START_MS,
    kicker: 'Como funciona o jogo',
    title: 'Bem-vindos ao tribunal.',
    lines: [
      'A pergunta nao espera coragem.',
      'As mesas disputam o botao de vez.',
    ],
  },
  {
    id: 'how_to_play_score',
    startMs: PRE_SHOW_SCORE_RULE_START_MS,
    endMs: PRE_SHOW_ERROR_RULE_START_MS,
    kicker: 'Pontuacao',
    title: 'Quem aperta primeiro responde.',
    lines: ['Depois da vez, sao 20 segundos.', 'Acertou: +10 para sua mesa.'],
  },
  {
    id: 'how_to_play_wrong',
    startMs: PRE_SHOW_ERROR_RULE_START_MS,
    endMs: PRE_SHOW_TRIBUNAL_RULE_START_MS,
    kicker: 'Atenção',
    title: 'Errou: rival recebe +5.',
    lines: ['Responder no impulso favorece o adversario.', 'Pegou a vez e calou: -10 para sua mesa, +10 para o rival.'],
  },
  {
    id: 'how_to_play_tribunal',
    startMs: PRE_SHOW_TRIBUNAL_RULE_START_MS,
    endMs: PRE_SHOW_INPUT_CHECK_START_MS,
    kicker: 'Tribunal',
    title: 'Antes do julgamento, teste das mesas.',
    lines: ['O teste confirma Mesa A e Mesa B.', 'Nao vale ponto e nao inicia o quiz.'],
  },
  {
    id: 'button_check',
    startMs: PRE_SHOW_INPUT_CHECK_START_MS,
    endMs: PRE_SHOW_READY_START_MS,
    kicker: 'Teste da mesa',
    title: 'Mesa A, pressione o botao de vez.',
    lines: [
      'Depois sera a Mesa B. Este teste nao vale ponto.',
    ],
  },
  {
    id: 'ready_to_start',
    startMs: PRE_SHOW_READY_START_MS,
    endMs: PRE_SHOW_TOTAL_MS,
    kicker: 'Pronto para iniciar',
    title: 'O julgamento pode começar.',
    lines: ['O quiz so comeca no clique do Admin.'],
  },
]

export function getPreShowScene(status: PreShowStatus, elapsedMs: number) {
  if (status === 'idle') {
    return {
      id: 'waiting_logo',
      startMs: 0,
      endMs: 0,
      kicker: 'Aguardando operador',
      title: 'DOIS PESOS, DUAS MEDIDAS',
      lines: ['Pre-show pronto para tocar.'],
    } satisfies PreShowScene
  }

  if (status === 'finished' || status === 'skipped') {
    return PRE_SHOW_SCENES[PRE_SHOW_SCENES.length - 1]
  }

  const clampedElapsed = Math.min(Math.max(elapsedMs, 0), PRE_SHOW_TOTAL_MS)
  return PRE_SHOW_SCENES.find((scene) => clampedElapsed >= scene.startMs && clampedElapsed < scene.endMs) ?? PRE_SHOW_SCENES[PRE_SHOW_SCENES.length - 1]
}
