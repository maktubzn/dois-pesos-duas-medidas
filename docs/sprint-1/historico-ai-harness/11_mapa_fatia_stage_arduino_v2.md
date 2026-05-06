# 11 - Mapa Fatia Stage Arduino v2

## Escopo aplicado

- Corrigir `ScoreBar` para voltar a exibir pontos com `PTS`.
- Copiar assets locais de `img/` para `public/img/`.
- Atualizar titulo do Vite.
- Ampliar parser e hook serial para protocolo Arduino v2.
- Criar estado minimo Passa/Repassa no Zustand.
- Compilar e fazer upload do sketch v2 no Arduino Uno em `COM6`.
- Validar protocolo fisico via porta serial local.

## Fora de escopo mantido

- Admin completo.
- Backend realtime.
- Rotas `/stage` e `/admin`.
- Remocao do legado.
- Recriacao dos cards A/B.
- Instalacao de dependencias.

## Ponto de atencao

O teste Web Serial real por navegador ainda exige selecao manual no chooser nativo. A automacao validou suporte a `navigator.serial` e o protocolo fisico via COM6, mas nao selecionou a porta pelo chooser.

