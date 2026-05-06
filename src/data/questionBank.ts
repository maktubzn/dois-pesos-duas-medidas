import type { CharacterImageQuestion, TextChoiceQuestion, TieBreakerQuestion } from '@/types/game.types'

export function makeQuestionImageSrc(fileName: string) {
  return encodeURI(`/img das perguntas/${fileName}`)
}

const characterFiles = [
  ['capitao-frio', 'WhatsApp Image 2026-05-04 at 09.57.51.jpeg', 'Capitao Frio', ['Captain Cold', 'Leonard Snart', 'Capitao Frio']],
  ['shazam', 'WhatsApp Image 2026-05-04 at 09.57.52 (1).jpeg', 'Shazam', ['Billy Batson', 'Shazam']],
  ['supergirl', 'WhatsApp Image 2026-05-04 at 09.57.52 (2).jpeg', 'Supergirl', ['Kara Zor-El', 'Supergirl']],
  ['zatanna', 'WhatsApp Image 2026-05-04 at 09.57.52.jpeg', 'Zatanna', ['Zatanna', 'Zatana']],
  ['lex', 'WhatsApp Image 2026-05-04 at 20.51.50.jpeg', 'Lex Luthor', ['Lex', 'Lex Luthor']],
  ['bane', 'WhatsApp Image 2026-05-04 at 20.51.51 (1).jpeg', 'Bane', ['Bane']],
  ['exterminador', 'WhatsApp Image 2026-05-04 at 20.51.51 (2).jpeg', 'Exterminador', ['Slade Wilson', 'Exterminador', 'Deathstroke']],
  ['aquaman', 'WhatsApp Image 2026-05-04 at 20.51.51.jpeg', 'Aquaman', ['Arthur Curry', 'Aquaman']],
  ['siniestro', 'WhatsApp Image 2026-05-04 at 20.51.52 (1).jpeg', 'Sinestro', ['Thaal Sinestro', 'Sinestro']],
  ['espantalho', 'WhatsApp Image 2026-05-04 at 20.51.52 (2).jpeg', 'Espantalho', ['Jonathan Crane', 'Espantalho', 'Scarecrow']],
  ['cyborg', 'WhatsApp Image 2026-05-04 at 20.51.52.jpeg', 'Cyborg', ['Victor Stone', 'Cyborg']],
  ['adao-negro', 'WhatsApp Image 2026-05-04 at 20.51.53 (1).jpeg', 'Adao Negro', ['Black Adam', 'Adao Negro']],
  ['asa-noturna', 'WhatsApp Image 2026-05-04 at 20.51.53 (2).jpeg', 'Asa Noturna', ['Dick Grayson', 'Asa Noturna', 'Nightwing']],
  ['darkseid', 'WhatsApp Image 2026-05-04 at 20.51.53 (3).jpeg', 'Darkseid', ['Darkseid']],
  ['mutano', 'WhatsApp Image 2026-05-04 at 20.51.53.jpeg', 'Mutano', ['Beast Boy', 'Garfield Logan', 'Mutano']],
  ['alfred', 'WhatsApp Image 2026-05-04 at 20.51.54 (1).jpeg', 'Alfred Pennyworth', ['Alfred', 'Alfred Pennyworth']],
  ['arqueiro-verde', 'WhatsApp Image 2026-05-04 at 20.51.54.jpeg', 'Arqueiro Verde', ['Oliver Queen', 'Arqueiro Verde', 'Green Arrow']],
] as const

export const characterImageQuestions: CharacterImageQuestion[] = characterFiles.map(
  ([id, fileName, characterName, aliases]) => ({
    id: `char-${id}`,
    type: 'character_image',
    characterName,
    aliases: [...aliases],
    imageSrc: makeQuestionImageSrc(fileName),
    imageFile: fileName,
    difficulty: 'medium',
    points: 100,
    tags: ['dc', 'personagem', 'harness-9.1'],
  }),
)

export const textChoiceQuestions: TextChoiceQuestion[] = [
  {
    id: 'text-justice-01',
    type: 'text_choice',
    prompt: 'Qual destes personagens e conhecido por ser o alter ego de Bruce Wayne?',
    optionA: 'Batman',
    optionB: 'Flash',
    correctOption: 'A',
    explanation: 'Bruce Wayne e o Batman.',
    difficulty: 'easy',
    points: 150,
  },
  {
    id: 'text-justice-02',
    type: 'text_choice',
    prompt: 'Qual destes grupos e liderado com frequencia por viloes contra a Liga da Justica?',
    optionA: 'Sociedade da Justica',
    optionB: 'Legiao do Mal',
    correctOption: 'B',
    explanation: 'A Legiao do Mal e tradicionalmente associada aos viloes.',
    difficulty: 'medium',
    points: 150,
  },
  {
    id: 'text-justice-03',
    type: 'text_choice',
    prompt: 'Qual destes personagens usa um anel de poder como arma principal?',
    optionA: 'Lanterna Verde',
    optionB: 'Aquaman',
    correctOption: 'A',
    explanation: 'O Lanterna Verde usa um anel de poder.',
    difficulty: 'easy',
    points: 150,
  },
  {
    id: 'text-justice-04',
    type: 'text_choice',
    prompt: 'Qual destes personagens e associado a Apokolips?',
    optionA: 'Darkseid',
    optionB: 'Alfred',
    correctOption: 'A',
    explanation: 'Darkseid governa Apokolips.',
    difficulty: 'medium',
    points: 150,
  },
]

export const tieBreakerQuestions: TieBreakerQuestion[] = [
  {
    id: 'tie-01',
    type: 'tie_breaker',
    prompt: 'Veredito Final: quem e conhecido como o Cavaleiro das Trevas?',
    optionA: 'Batman',
    optionB: 'Aquaman',
    correctOption: 'A',
    explanation: 'Batman e conhecido como Cavaleiro das Trevas.',
  },
  {
    id: 'tie-02',
    type: 'tie_breaker',
    prompt: 'Veredito Final: qual personagem costuma usar laco da verdade?',
    optionA: 'Mulher-Maravilha',
    optionB: 'Cheetah',
    correctOption: 'A',
    explanation: 'O laco da verdade e associado a Mulher-Maravilha.',
  },
  {
    id: 'tie-03',
    type: 'tie_breaker',
    prompt: 'Veredito Final: qual destes e um vilao de Krypton?',
    optionA: 'General Zod',
    optionB: 'Alfred',
    correctOption: 'A',
    explanation: 'General Zod e um vilao kryptoniano.',
  },
  {
    id: 'tie-04',
    type: 'tie_breaker',
    prompt: 'Veredito Final: qual destes personagens e associado a velocidade?',
    optionA: 'Flash',
    optionB: 'Lex Luthor',
    correctOption: 'A',
    explanation: 'Flash e associado a supervelocidade.',
  },
]

export const questionBank = {
  characterImageQuestions,
  textChoiceQuestions,
  tieBreakerQuestions,
}
