# 31 - Relatorio Correcao Validacao Fisica

## Escopo

Correcao pontual apos validacao fisica no `/admin`, sem alterar sketch Arduino, Admin visual ou Stage visual.

## Onde estava o risco

- Admin: faltava publicar explicitamente o evento serial com grupo ja resolvido.
- Admin: `LOCK` automatico podia falhar se o mesmo grupo buzzasse em rodadas consecutivas, porque a referencia local nao era limpa quando o grupo ativo voltava para `null`.
- Admin: `RESET_HW` automatico nao era enviado ao avancar round/resetar jogo, apenas em pontuacao/erro/reset de rodada.

## Correcao

- Admin agora publica `SERIAL_EVENT` com `{ raw, group, calibrated }`.
- Stage continua renderizando apenas snapshots recebidos, sem interpretar evento bruto.
- Referencia de grupo ativo e limpa quando nao ha grupo ativo, permitindo `LOCK` novamente para o mesmo grupo em nova rodada.
- `Proximo round` e `Reset jogo` agora tambem disparam `RESET_HW`.

## Arquivos

- `src/realtime/broadcastChannel.ts`
- `src/hooks/useRealtimeBridge.ts`
- `src/components/Admin/AdminPage.tsx`

## Arduino

Sketch `.ino` nao foi alterado.
