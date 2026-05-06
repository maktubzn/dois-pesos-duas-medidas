# Harness 4.8 - Relatorio Pre-show Real

## Problemas atacados

- O ensino do 4.7 ainda era denso e parecia tela de regra, nao abertura de evento.
- O teste da mesa nao segurava a narrativa publica com clareza suficiente.
- Controles de pre-show continuavam duplicados entre acao principal e Operacao.
- A validacao visual anterior nao gravava frames a cada segundo nem comprovava o teste A/B.
- O titulo ficava visualmente travado no ponto mostrado pelo usuario porque o estado visual do titulo era derivado do progresso do video. Como o video ja estava no fim, o titulo nascia em estado de saida, acinzentado, sobre um frame parado por tempo demais.

## Alteracoes

- `preShowTimeline` agora usa cenas curtas e previsiveis dentro dos mesmos 42s.
- `PreShowScreen` mantem o video como camada visual persistente e usa overlays para titulo, ensino, teste e pronto.
- O titulo agora usa o tempo local da propria cena, entra, chega em estado cheio e sai rapidamente para o ensino. O frame final do video continua segurado, mas recebe uma deriva leve por transform para nao parecer uma tela congelada.
- A cena `ready_to_start` so aparece automaticamente quando A e B foram reconhecidas; sem isso, a Stage continua no teste da mesa. O Admin ainda pode avancar manualmente.
- O Admin deixou comandos tecnicos de pular/reiniciar no modo avancado e manteve visiveis os comandos centrais de pre-show.
- A musica segue as cenas de pre-show e continua com fallback silencioso se o audio nao estiver disponivel.

## Arquivos principais

- `src/utils/preShowTimeline.ts`
- `src/components/PreShowScreen/`
- `src/components/Admin/AdminPage.tsx`
- `src/audio/audioEvents.ts`
- `tests/e2e/visual/harness-4.8-preshow-real.spec.ts`
