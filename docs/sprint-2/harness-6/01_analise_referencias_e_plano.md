# Harness 6 - Analise de referencias e plano

Data: 2026-05-05

## Analise das referencias

As referencias indicam painel operacional profissional, nao uma tela de formulario. A estrutura comum e: uma area lateral fixa para modo/contexto, um bloco central dominante para a operacao principal, cards laterais de status e um preview escuro controlado. O uso de contraste e forte: preto/grafite para navegacao e preview, branco/quase branco para area de trabalho, chips claros para estado, botoes primarios pretos e alertas pontuais.

Na tipografia, os paineis usam textos curtos, pesos fortes para o que exige acao e labels pequenos para dados. A hierarquia vem de escala, espacamento e agrupamento, nao de muitas cores. Os componentes recorrentes sao sidebar, topbar, cards de status, painel principal, preview e bloco tecnico separado.

O que foi adaptado: sidebar preta e compacta, barra superior branca com chips operacionais, acao principal dominante, preview Stage em card escuro e tecnico recolhido. O que foi descartado: cockpit dark completo, instrumentos decorativos, mapa/drone/carro literais e excesso de controles simultaneos.

## Plano aplicado

1. Redesenhar o Admin com `AdminShell`, `AdminSidebar`, `AdminTopStatusBar`, `AdminMainAction`, `AdminStagePreview`, `AdminOperationPanel`, `AdminDecisionPanel` e `AdminTechnicalDrawer`.
2. Manter fundo geral claro, sidebar grafite, botoes principais pretos, cards brancos e preview TV escuro.
3. Trocar Tribunal para 20 segundos sem alterar pontuacao.
4. Ajustar pre-show apenas em pacing e volume: leitura mais lenta, impacto mais alto e ducking preservado na explicacao.
5. Corrigir slots dos cards: manter numero grande e trocar texto visual para `JOGADOR`.
6. Refinar profundidade dos cards com perspectiva sutil, sombra lateral e glow controlado.
7. Refinar Final Show para colocar o card vencedor como protagonista e reduzir frase longa/cafona.
8. Criar validacao visual Harness 6 com screenshots, JSON e checks que falham se o layout voltar ao antigo.

