# 01 - Plano de Execucao - Harness 9.1

## Regra de execucao

Seguir os prompts em ordem. Nao avancar para codigo funcional antes de cumprir SPEC, plano, diagnostico e backup.

## Ordem planejada

1. `01_backup_spec_sdd_diagnostico_sem_codigo.md`
   - backup, SPEC, plano, diagnostico inicial.
2. `02_diagnostico_arduino_preshow_round1_reset.md`
   - provar origem dos problemas de botoes, reset e round 1.
3. `03_reset_manual_admin_e_recuperacao_operacional.md`
   - adicionar reset manual visivel no Admin.
4. `04_audio_botao_de_vez_e_eventos_interativos.md`
   - corrigir audio de jogador que pega a vez.
5. `05_brasoes_cards_grupo_ab.md`
   - substituir brasoes genericos dos cards A/B.
6. `06_banco_imagens_personagens_quarentena_assets.md`
   - mapear imagens, aprovar ou quarentenar.
7. `07_admin_css_limpeza_e_info_operador.md`
   - limpar CSS do Admin e mostrar personagem/referencia.
8. `08_tribunal_modal_fullscreen.md`
   - transformar Tribunal em modal full-screen preto.
9. `09_area_ajuda_admin_atualizada.md`
   - atualizar ajuda operacional.
10. `10_bat_iniciar_jogo_seguro_windows.md`
    - criar `.bat` seguro apos diagnostico de gerenciador de pacotes.
11. `11_testes_regressao_e_evidencias.md`
    - rodar regressao obrigatoria e coletar evidencias.
12. `12_fechamento_relatorio_checklist_ensaio.md`
    - relatorio final e checklist fisico.

## Estrategia tecnica

- Fazer diffs pequenos por area.
- Priorizar diagnostico via logs/store/testes antes de alterar fluxo.
- Preservar fallback Mesa A/B.
- Nao alterar `.ino` sem evidencia fisica ou simulada.
- Usar constantes existentes quando houver.
- Evitar redesenho; fazer apenas limpeza operacional.
- Qualquer residuo gerado deve ir para `_residuos/`.

## Riscos conhecidos

- O prompt pede `.bat` com `yarn dev`, mas o repo tem `package-lock.json` e nao tem `yarn.lock`; isso precisa ser tratado no diagnostico de infra.
- Assets novos podem ter nomes ou fundo inadequado; imagens duvidosas nao entram no banco ativo.
- Audio pode estar configurado mas bloqueado por timing, permissao do navegador ou evento nao emitido.
- Pre-show e round 1 podem compartilhar caminho de buzz; alterar um sem teste pode quebrar o outro.

## Gates

- Gate 01: backup e docs iniciais existem.
- Gate 02: diagnostico de Arduino/pre-show/round 1 registrado.
- Gate 03: implementacoes pequenas com teste associado.
- Gate 04: testes obrigatorios finais executados.
- Gate 05: relatorio final e checklist fisico criados.
