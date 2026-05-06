# Harness 5 FINAL - Relatorio de requisitos de maquina

Data: 2026-05-05

## Configuracao recomendada

- Notebook ou desktop com CPU 4 nucleos reais ou superior.
- 8 GB RAM minimo; 16 GB recomendado para rodar Admin, Stage, navegador e ferramentas ao mesmo tempo.
- Chrome/Edge atualizado com suporte a BroadcastChannel, Web Serial e autoplay desbloqueado por gesto na Stage.
- Saida HDMI para TV/projetor em modo estendido, nao aba escondida.
- Stage aberta em janela separada/fullscreen.
- Admin aberto na tela do operador.

## Operacao ideal

1. Abrir `/stage` na TV e ativar audio da TV uma vez.
2. Abrir `/admin` no computador do operador.
3. Conectar Arduino pela Web Serial antes do pre-show.
4. Se Arduino nao conectar, usar fallback de teclado apenas como contingencia/teste.
5. Rodar teste Mesa A/B no pre-show.
6. Evitar minimizar a janela da Stage.

## Riscos de sessao longa

- Abas ocultas sofrem throttling de timers e `requestAnimationFrame`.
- Listeners de teclado, BroadcastChannel e Web Serial devem permanecer em uma unica janela de Admin.
- Logs sao limitados no store para reduzir crescimento de memoria.
- Historico e salvo no localStorage com limite de eventos.
- Videos e audio sao carregados por fase; ainda assim, manter o navegador aberto por horas pede smoke antes do evento.

## Build e assets

- Build final observado: JS em torno de 335 kB bruto e CSS em torno de 58 kB bruto.
- Assets grandes protegidos continuam em `public/`, principalmente audio e `public/img/mesa-tribunal.png`.
- Para rodar o dia todo, preferir build/preview local ou Vite dev em maquina ligada na tomada.

## Recomendacoes

- Fazer ensaio de 20 a 30 minutos com Admin e Stage em janelas separadas.
- Conferir audio da TV antes da plateia entrar.
- Nao trocar a Stage para outra aba durante a partida.
- Se o Arduino reconectar, repetir teste Mesa A/B antes do quiz.
- Exportar CSV da partida ao final, antes de limpar historico.

