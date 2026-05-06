# Prompt 06 — Banco de Imagens, Nomes dos Personagens e Quarentena de Assets

## Objetivo

Mapear novo banco de imagens, nomear personagens corretamente e expor no Admin:
- nome do personagem exibido;
- referência da resposta correta.

## Regra especial: `anal_`

Imagem só entra no banco ativo se:
- representa personagem certo;
- tem fundo transparente real ou fundo compatível;
- não tem fundo preto problemático;
- não tem borda suja;
- não tem recorte quebrado;
- não tem baixa qualidade gritante;
- não tem nome duvidoso.

Se houver fundo problemático, fundo preto indesejado, recorte ruim, dúvida ou qualidade suspeita:

1. Não adicionar ao banco de perguntas.
2. Não usar na Stage.
3. Não usar como ativa no Admin.
4. Copiar/renomear com prefixo `anal_`.
5. Registrar em `docs/sprint-2/harness-9.1/assets_para_analise.md`.
6. Usar/criar `public/img/_analise/`, se seguro.
7. Nunca apagar original sem backup.

Exemplo:
- `batman_fundo_preto.png` vira `anal_batman_fundo_preto.png`.

## Diagnóstico

Mapear pasta antiga, pasta nova, formatos, banco atual e campos disponíveis.

## Identificação

Não inventar nome. Usar nome de arquivo, dados existentes, pergunta, resposta, metadados e assets antigos. Se houver dúvida, marcar para análise.

## Verificação de fundo

Se possível, criar verificação programática:
- canal alpha;
- pixels transparentes;
- fundo preto dominante nas bordas;
- amostragem dos cantos;
- relatório por arquivo.

## Admin

Exibir personagem e referência correta apenas no Admin. Não mostrar spoiler na Stage.

## Documentos

Criar:
- `assets_personagens_mapeados.md`
- `assets_para_analise.md`, se houver.

## Testes

- Mapeamento.
- Quarentena.
- Build paths.
- Admin mostra referência.
- Stage não mostra spoiler.

## Saída

Quantidade encontrada, aprovada, `anal_`, relatórios, Admin e testes.
