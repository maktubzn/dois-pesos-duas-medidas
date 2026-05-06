# PROMPT MESTRE — SDD HARNESS 9.1
## Operação Real, Admin, Visual, Assets e Infra

Você é o **ORQUESTRADOR TÉCNICO SÊNIOR** do Harness 9.1 do projeto **Dois Pesos, Duas Medidas**.

O jogo será usado em contexto público, com operador, Stage, Admin e Arduino real. Trabalhe como se estivesse preparando uma atração para abrir amanhã: sem chute, sem gambiarra invisível, sem “funcionou aqui” sem prova.

---

# 1. Contexto herdado

O Harness 9 corrigiu:
- mapeamento serial A/B;
- reset/preparo no fluxo de próxima rodada;
- countdown sem dependência de ACK;
- pontuação da primeira rodada;
- tempo de resposta de 20s;
- penalidade por silêncio `-10/+10`;
- texto do pré-show antes do teste das mesas;
- logs e telemetria.

Após testes reais, surgiram novas correções e melhorias para o **Harness 9.1**.

---

# 2. Objetivo do Harness 9.1

## Bugs

1. Teste de mesa no pré-show ainda apresenta falhas nos botões.
2. Suspeita: não ocorre reset/preparo correto depois do clique no botão A.
3. Primeira rodada: botão azul foi reconhecido, mas não processado/computado corretamente.
4. Adicionar botão manual de reset do Arduino bem visível no Admin.
5. Corrigir áudio ausente quando jogador aperta o botão de vez para falar.

## Melhorias visuais e operacionais

6. Substituir brasões genéricos dos cards pelos novos:
   - `public/img/brasao-groupA.png`
   - `public/img/brasao-groupB.png`
7. Mapear novo banco de imagens/personagens.
8. Conferir se imagens possuem fundo transparente ou fundo aceitável.
9. Se imagem tiver fundo problemático, não adicionar às perguntas, renomear/copy com prefixo `anal_` e registrar em análise/quarentena.
10. Mostrar no Admin nome do personagem exibido e referência da resposta correta.
11. Limpar CSS e ruídos do Admin, especialmente áreas brancas.
12. Reconstruir evento Tribunal como modal full-screen com fundo preto.
13. Melhorar área de ajuda do Admin.

## Infra

14. Criar `.bat` seguro na raiz para:
   - verificar dependências;
   - instalar dependências se faltar;
   - subir `yarn dev`;
   - abrir `/admin` no navegador padrão.

---

# 3. Método obrigatório: SDD + Harness

Antes de editar código, criar:

- `docs/sprint-2/harness-9.1/00_spec_sdd_harness_9_1.md`
- `docs/sprint-2/harness-9.1/01_plano_execucao.md`
- `docs/sprint-2/harness-9.1/02_relatorio_diagnostico.md`
- `docs/sprint-2/harness-9.1/04_manifesto_backup.md`

Só depois implementar.

---

# 4. Backup obrigatório

Antes de editar qualquer arquivo:

Criar:

`_backups/harness-9.1/YYYYMMDD-HHMMSS/`

Preservar:
- `src/`
- `tests/`
- `automacao/`
- `public/`
- `tools/arduino-virtual/`
- `hardware/`, se existir
- `package.json`
- `yarn.lock`, se existir
- configs Vite, Playwright e TypeScript
- `.bat` existentes, se houver

Excluir:
- `node_modules`
- `dist`
- backups antigos
- evidências antigas pesadas

---

# 5. Regra especial do banco de imagens

Ao mapear novas imagens de personagens:

1. Verificar se a imagem é adequada para uso no jogo.
2. Verificar se tem fundo transparente real ou fundo compatível com os cards.
3. Se tiver fundo problemático, preto chapado indesejado, borda suja, fundo visível ou recorte ruim:
   - não adicionar ao banco de perguntas;
   - renomear/copiar com prefixo `anal_` antes do nome original;
   - registrar em `docs/sprint-2/harness-9.1/assets_para_analise.md`;
   - se existir pasta de análise/quarentena, usar; se não existir, criar uma pasta segura como `public/img/_analise/`;
   - nunca apagar a imagem original sem backup.
4. Apenas imagens aprovadas entram no banco ativo.
5. Listar aprovadas, rejeitadas/quarentenadas e motivo.

Importante:
- Não inventar nome de personagem.
- Se não tiver confiança, marcar para análise.
- Não usar imagem errada só para preencher espaço.

---

# 6. Fora de escopo

Não fazer:
- não refazer o jogo;
- não recriar Admin do zero;
- não recriar Stage do zero;
- não trocar BroadcastChannel;
- não criar backend;
- não mexer no `.ino` sem diagnóstico real;
- não remover fallback Mesa A/B;
- não adicionar imagem com fundo problemático ao banco de perguntas;
- não fazer script `.bat` perigoso;
- não quebrar Harness 9.

---

# 7. Testes obrigatórios

```bash
rtk npm run typecheck
rtk npm run test -- --run
rtk npm run lint
rtk npm run build
rtk npm run test:e2e
rtk npm run arduino:virtual:self-test
```

Se mexer em automação:

```bash
rtk npx playwright test -c automacao/playwright.config.ts --project=chromium
```

---

# 8. Entregáveis finais

Criar:
- `docs/sprint-2/harness-9.1/03_validacao_testes.md`
- `docs/sprint-2/harness-9.1/05_relatorio_final.md`
- `docs/sprint-2/harness-9.1/checklist_ensaio_fisico.md`
- `docs/sprint-2/harness-9.1/assets_para_analise.md`, se houver imagens problemáticas
- `.bat` na raiz, se aprovado pelo diagnóstico

Comece pelo Prompt 01.
