# Prompt 08 — Reconstruir Evento Tribunal como Modal Full-Screen

## Objetivo

Reconstruir Tribunal como modal full-screen com fundo preto.

## Novo visual

- Cobrir toda a tela.
- Fundo preto.
- Foco total.
- Mostrar grupo que arriscou.
- Mostrar tempo disponível.
- Remover UI concorrente.

## Obrigatório

A informação central é o tempo que o grupo tem para arriscar. Também deve ficar claro qual grupo está arriscando.

## Proibições

Não mostrar resposta correta na Stage. Não quebrar timer. Não criar regra nova.

## Implementação

Preferir componente dedicado com:
- role dialog;
- aria-label;
- camada fixa;
- azul Grupo A;
- vermelho Grupo B;
- timer grande.

## Testes

Abrir Tribunal, modal cobre tela, grupo certo, tempo visível, sem spoiler e transição correta.

## Saída

Antes/depois, grupo claro, testes e evidências.
