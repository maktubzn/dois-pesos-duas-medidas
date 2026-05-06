# Mapa Completo de Áudio e Efeitos Sonoros

## 1. Objetivo

Este arquivo e o mapa-mestre de audio antes da implementacao. Ele define onde entram efeitos sonoros, vinhetas, ambiencias, stingers e easter eggs no jogo "Dois Pesos, Duas Medidas", sem baixar arquivos e sem implementar audio ainda.

O mapa foi criado a partir do fluxo atual do projeto: pre-show cinematografico, Admin, Stage, Arduino fisico, Arduino virtual externo, Web Serial real, BroadcastChannel, countdown variavel, 10 rounds, perguntas de imagem, perguntas A/B, Veredito Final, feedback, game over, historico e CSV.

Direcao sonora: quiz sombrio, tribunal urbano, arena de julgamento, noite chuvosa, confronto entre grupos, comic noir, tensao divertida e show de feira com acabamento premium.

## 2. Regras de licenca e seguranca

| Fonte | Link | Licenca resumida | Exige atribuicao? | Observacao de risco | Quando usar | Quando evitar |
| --- | --- | --- | --- | --- | --- | --- |
| Pixabay Sound Effects | https://pixabay.com/service/license-summary/ | A Content License permite uso gratuito, modificacao/adaptacao e uso sem atribuicao, respeitando usos proibidos como redistribuicao standalone e marcas reconheciveis. | Geralmente nao, mas credito e apreciado. | Conferir a pagina do item; evitar sons com marcas, vozes reconheciveis ou Content ID sensivel. | UI, impactos, whoosh, ticks, atmosferas simples. | Quando o som parecer trilha registrada, contem marca, voz, fan asset ou referencia evidente a franquias. |
| Mixkit Sound Effects | https://mixkit.co/license/ | Mixkit lista Sound Effects sob Free License; cada tipo de item tem licenca propria. | Em geral nao para SFX, mas confirmar no item. | Conferir se o item e realmente Sound Effect e nao Music/Template com licenca diferente. | Sons curtos de UI, transicoes, hits, risers e stingers leves. | Quando o asset estiver em outra categoria Mixkit ou tiver restricao especifica no item. |
| Freesound | https://freesound.org/help/faq/ | Usa Creative Commons por item: CC0, Attribution ou Attribution Noncommercial. | Depende do item; CC BY exige credito, CC BY-NC restringe uso comercial. | Alto risco operacional se a licenca individual nao for checada; evitar NC se houver qualquer uso publico/comercial. | Field recordings especificos: chuva, cidade distante, radio, page flip, metal, ambience. | Quando nao houver tempo para conferir licenca/autoria/atribuicao, ou quando for CC BY-NC. |
| ZapSplat | https://www.zapsplat.com/faq/ | Biblioteca royalty-free; maioria em Standard License, alguns sons CC0. | Plano Basic normalmente exige atribuicao; Gold remove atribuicao conforme termos. CC0 nao exige. | Conferir licenca por som; Basic exige credito; pode haver Content ID eventual. | Biblioteca de apoio para sons tecnicos, Foley e ambiencias se houver controle de creditos. | Quando nao for possivel manter `CREDITS_AUDIO.md` ou quando o cliente nao aceitar atribuicao. |

Regras fixas:

- Proibido usar audio oficial/copyrightado de DC, Batman, Superman, filmes, series, jogos, trailers ou fan packs.
- Proibido usar samples reconheciveis de trilhas, logos sonoros ou personagens protegidos.
- Usar apenas efeitos originais, royalty-free ou gravacoes proprias.
- No proximo harness, manter `CREDITS_AUDIO.md` se qualquer fonte exigir credito.
- Conferir licenca no item final antes de baixar, importar ou commitar.
- Nomear sons com linguagem original do projeto, sem nomes de marcas/personagens protegidos.

## 3. Mapa de eventos sonoros do jogo

| ID do evento | Tela/fluxo | Momento exato | O que o jogador ve | Som recomendado | Descricao do som | Duracao ideal | Volume sugerido | Loop? sim/nao | Prioridade | Fonte sugerida | Termos de busca | Nome de arquivo sugerido | Observacoes tecnicas | Risco de ficar cafona |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| audio.preshow.idle_black | Pre-show | Stage em `intro` com `preShowStatus=idle` | Tela escura esperando operador | Ambiencia baixa | Cidade noturna distante, vento leve e sala grande | 20-60s | 18% | sim | importante | Pixabay/Mixkit | dark city ambience, distant rain, noir ambience | `ambience_noir_city_bed_01.mp3` | Loop com fade; deve parar ao iniciar quiz | Medio se parecer terror generico |
| audio.preshow.logo_waiting | Pre-show | Cena `waiting_logo` aparece | Logo INFO na espera | Pulse de logo | Baixo subgrave com brilho metalico curto | 1.0s | 35% | nao | importante | Mixkit/Pixabay | logo reveal dark hit, cinematic soft impact | `preshow_logo_pulse_dark_01.mp3` | Tocar uma vez por entrada na cena | Medio se virar trailer exagerado |
| audio.preshow.logo_drift | Pre-show | Logo permanece em espera | Logo respirando | Textura sutil | Rumble quase inaudivel com ar noturno | 6-10s | 12% | sim | opcional | Freesound CC0/Pixabay | low rumble ambience, room tone dark | `ambience_logo_room_tone_01.mp3` | Nao conflitar com stingers | Baixo |
| audio.preshow.blackout | Pre-show | Cena `blackout_to_video` | Tela preta de transicao | Blackout whoosh | Sopro reverso curto para queda no preto | 0.8s | 42% | nao | obrigatoria | Mixkit/Pixabay | reverse whoosh dark, cinematic blackout | `preshow_blackout_whoosh_01.mp3` | Sincronizar com classe visual de blackout | Alto se for riser EDM |
| audio.preshow.video_start | Pre-show | Cena `cinematic_video`, video comeca | Video 1 entra | Projetor/ignicao | Clique de projetor + grave macio | 0.7s | 38% | nao | importante | Pixabay/Mixkit | projector start, cinematic video start | `preshow_video_projector_start_01.mp3` | Tocar apos `play()` resolvido | Medio |
| audio.preshow.video_bed | Pre-show | Durante video | Video em tela cheia | Ambiencia cinematica | Drone urbano com chuva distante, sem melodia famosa | 8s | 20% | sim | opcional | Pixabay/Freesound CC0 | dark urban drone, distant rain ambience | `ambience_preshow_video_noir_01.mp3` | Ducking abaixo do video se o video tiver audio | Medio |
| audio.preshow.title_enter | Pre-show | Titulo entra por codigo | "DOIS PESOS, DUAS MEDIDAS" aparece | Stinger titulo | Martelo abafado + whoosh de capa original | 1.2s | 50% | nao | obrigatoria | Mixkit/Pixabay | gavel hit cinematic, cloak whoosh | `preshow_title_gavel_whoosh_01.mp3` | Nao usar qualquer assinatura heroica conhecida | Medio |
| audio.preshow.title_full | Pre-show | Titulo em estado `full` | Titulo central forte | Sustentacao curta | Grave segurado com shimmer discreto | 1.5s | 28% | nao | opcional | Pixabay | cinematic tension drone short | `preshow_title_hold_tension_01.mp3` | Pode ser omitido se poluir | Medio |
| audio.preshow.title_exit | Pre-show | Titulo sai `leaving` | Titulo perde presenca | Whoosh de saida | Ar passando, papel metalico leve | 0.8s | 35% | nao | importante | Mixkit/Pixabay | soft whoosh, paper whoosh dark | `preshow_title_exit_whoosh_01.mp3` | Fade rapido | Baixo |
| audio.preshow.briefing_enter | Pre-show | Cena `how_to_play` | Briefing "Como funciona" | Page snap | Pagina de HQ virando com tick seco | 0.5s | 36% | nao | importante | Freesound CC0/Mixkit | comic page turn, paper snap | `briefing_comic_page_snap_01.mp3` | Tocar na entrada do bloco | Medio |
| audio.preshow.briefing_item | Pre-show | Cada linha do briefing aparece | Cards de instrucao entram | Tick de dossie | Pequeno carimbo/tecla mecanica | 0.15s | 24% | nao | opcional | Pixabay/Mixkit | typewriter tick, dossier stamp soft | `briefing_dossier_tick_01.mp3` | Limitar polifonia; no max 1 por item | Medio |
| audio.preshow.finished | Pre-show | `preShowStatus=finished` | Pre-show concluido | Fechamento de vinheta | Acorde grave curto sem melodia reconhecivel | 1.0s | 42% | nao | importante | Pixabay/Mixkit | cinematic end hit dark | `preshow_complete_stinger_01.mp3` | Prepara silencio operacional | Medio |
| audio.preshow.ready | Pre-show | Cena `ready_to_start` | Pronto para iniciar quiz | Suspense leve | Relogio distante + ar parado | 4-8s | 16% | sim | opcional | Freesound CC0/Pixabay | distant clock tension, room tone suspense | `ready_to_start_clock_bed_01.mp3` | Loop curto com fade | Medio |
| audio.preshow.operator_start_quiz | Admin/Pre-show | Operador clica `Iniciar quiz` | Stage sai da espera para rodada | Confirmacao teatral | Campainha de tribunal distorcida curta | 0.7s | 45% | nao | obrigatoria | Mixkit/Pixabay | court bell hit, dark bell | `quiz_start_court_bell_01.mp3` | Disparar por gesto do Admin; pode desbloquear AudioContext | Baixo |
| audio.admin.login_success | Admin | Login aceito | Dashboard aparece | UI confirm | Clique premium seco | 0.18s | 22% | nao | importante | Mixkit | interface confirm click soft | `ui_admin_login_success_01.mp3` | Som apenas no Admin | Baixo |
| audio.admin.login_error | Admin | Credencial invalida | Erro visivel | UI erro | Bip baixo, sem sirene | 0.25s | 24% | nao | importante | Mixkit/Pixabay | error beep low soft | `ui_admin_login_error_01.mp3` | Nao repetir em loop | Medio |
| audio.admin.connect_serial_click | Admin | Clique `Conectar Arduino` | Picker Web Serial abre | UI acao tecnica | Clique relay discreto | 0.2s | 20% | nao | opcional | Mixkit | relay click, tech click | `ui_serial_connect_click_01.mp3` | Pode falhar se audio ainda bloqueado | Baixo |
| audio.admin.serial_connected | Admin/Arduino | `serialStatus=connected` | Status conectado | Confirmacao serial | Duplo bip tecnico macio | 0.45s | 26% | nao | obrigatoria | Mixkit/Pixabay | device connected beep, tech confirm | `serial_connected_tech_01.mp3` | Som Admin; Stage nao precisa ouvir | Baixo |
| audio.admin.serial_error | Admin/Arduino | `serialStatus=error` ou `serialError` | Erro serial | Alerta tecnico | Buzz grave curto, sem alarme irritante | 0.5s | 28% | nao | obrigatoria | Mixkit/Pixabay | low error buzz, system error soft | `serial_error_low_buzz_01.mp3` | Evitar assustar plateia | Medio |
| audio.admin.serial_disconnect | Admin/Arduino | Desconectar ou queda | Status disconnected | Desligamento | Click de relé caindo | 0.35s | 22% | nao | importante | Mixkit | relay off, power down small | `serial_disconnected_relay_01.mp3` | Apenas operador | Baixo |
| audio.admin.ping_send | Admin/Arduino | Botao Ping | Comando enviado | Ping seco | Tick digital curto | 0.12s | 18% | nao | opcional | Mixkit | digital blip short | `serial_ping_send_01.mp3` | Som local Admin | Baixo |
| audio.admin.pong_receive | Admin/Arduino | `PONG` recebido | Evento PONG | Pong tecnico | Bip de retorno mais claro | 0.16s | 20% | nao | importante | Mixkit | data received beep | `serial_pong_receive_01.mp3` | Mapear em `handleSerialMessage` | Baixo |
| audio.admin.status_locked | Admin/Arduino | `STATUS:LOCKED` | Serial travado | Status lock | Fechadura/relay seco | 0.22s | 22% | nao | importante | Pixabay/Mixkit | lock click, relay lock | `serial_status_locked_01.mp3` | Som tecnico, sem cadeado cartoon | Medio |
| audio.admin.status_unlocked | Admin/Arduino | `STATUS:UNLOCKED` | Serial destravado | Status unlock | Relay abre + ar curto | 0.25s | 22% | nao | importante | Pixabay/Mixkit | unlock click, relay unlock | `serial_status_unlocked_01.mp3` | Usar variação de locked | Baixo |
| audio.admin.start_quiz | Admin | Botao `Iniciar quiz` | Rodada 1 preparada | Start UI | Gavel leve + confirmacao | 0.6s | 34% | nao | obrigatoria | Pixabay/Mixkit | gavel light, game start dark | `admin_start_quiz_01.mp3` | Tambem pode disparar Stage stinger | Medio |
| audio.admin.start_sequence | Admin | Botao `Iniciar rodadas` | Sequencia automatica roda | Arm sequence | Relogio digital armando | 0.8s | 30% | nao | obrigatoria | Mixkit/Pixabay | digital countdown arm, timer start | `admin_sequence_arm_01.mp3` | Nao confundir com countdown publico | Baixo |
| audio.admin.pause_sequence | Admin | `Pausar sequencia` | Sequencia pausada | Pause soft | Tape stop muito curto e sutil | 0.25s | 20% | nao | importante | Mixkit | soft pause click, tape stop short | `admin_sequence_pause_01.mp3` | Evitar efeito comico | Medio |
| audio.admin.resume_sequence | Admin | `Continuar sequencia` | Sequencia retoma | Resume soft | Motor pequeno retomando | 0.3s | 20% | nao | importante | Mixkit/Pixabay | engine resume soft, digital resume | `admin_sequence_resume_01.mp3` | Admin only | Baixo |
| audio.admin.skip_countdown | Admin | `Pular countdown` | Countdown pula | Skip | Swipe digital rapido | 0.25s | 24% | nao | importante | Mixkit | digital swipe, skip transition | `admin_skip_countdown_01.mp3` | Pode tocar na Stage como transicao se desejado | Medio |
| audio.admin.force_next_round | Admin | `Forcar proximo round` | Proxima rodada entra | Corte tecnico | Thump seco + click | 0.35s | 25% | nao | importante | Pixabay | short thump click | `admin_force_next_round_01.mp3` | Som operador; baixo volume | Medio |
| audio.admin.reset_match | Admin | `Resetar partida` confirmado | Volta para intro | Reset | Queda de energia suave | 0.8s | 30% | nao | obrigatoria | Mixkit/Pixabay | power down soft, system reset | `admin_reset_match_01.mp3` | Parar loops antes de tocar | Baixo |
| audio.admin.export_csv | Admin/Historico | `Exportar CSV` | Download historico | Export confirm | Carimbo de arquivo digital | 0.25s | 20% | nao | importante | Mixkit | file export, digital confirm | `history_csv_export_01.mp3` | Apenas Admin | Baixo |
| audio.admin.clear_history | Admin/Historico | Limpeza confirmada | Historico zerado | Paper shred soft | Papel/arquivo sendo arquivado | 0.45s | 20% | nao | importante | Freesound CC0/Pixabay | paper archive, file delete soft | `history_clear_archive_01.mp3` | Nao soar destrutivo demais | Medio |
| audio.admin.operational_error | Admin | Fase `error` ou confirmacao incompleta | Erro operacional | Alerta baixo | Dois tons baixos curtos | 0.35s | 24% | nao | obrigatoria | Mixkit | low warning beep two tone | `admin_operational_error_01.mp3` | Sem sirene | Medio |
| audio.countdown.enter_black | Countdown | `phase=round_countdown` | Tela preta com relogio digital | Entrada clock | Sala desce para silencio + click | 0.5s | 35% | nao | obrigatoria | Pixabay/Mixkit | digital clock enter, dark transition | `round_countdown_enter_black_01.mp3` | Parar ambience anterior com ducking | Baixo |
| audio.countdown.tick_05 | Countdown | Numero 00:05 | Relogio central | Tick grave | Tick digital seco com sub leve | 0.15s | 30% | nao | obrigatoria | Mixkit/Pixabay | digital countdown tick dark | `round_countdown_tick_dark_01.mp3` | Reusar 5-2 com pitch leve opcional | Baixo |
| audio.countdown.tick_04 | Countdown | Numero 00:04 | Relogio central | Tick grave | Igual ao 05, variação minima | 0.15s | 30% | nao | obrigatoria | Mixkit/Pixabay | digital countdown tick dark | `round_countdown_tick_dark_02.mp3` | Evitar cinco arquivos se usar pitch programatico | Baixo |
| audio.countdown.tick_03 | Countdown | Numero 00:03 | Relogio central | Tick grave | Tick com pressao maior | 0.15s | 32% | nao | obrigatoria | Mixkit/Pixabay | clock tick tense | `round_countdown_tick_dark_03.mp3` | Pode aumentar filtro | Baixo |
| audio.countdown.tick_02 | Countdown | Numero 00:02 | Relogio central | Tick tenso | Tick com cauda metalica | 0.18s | 34% | nao | obrigatoria | Mixkit/Pixabay | tense clock tick | `round_countdown_tick_dark_04.mp3` | Nao acelerar demais | Medio |
| audio.countdown.tick_01 | Countdown | Numero 00:01 | Ultimo segundo | Ultimo tick | Tick mais grave + ar | 0.25s | 38% | nao | obrigatoria | Mixkit/Pixabay | final countdown tick cinematic | `round_countdown_last_tick_01.mp3` | Deve preparar pergunta | Baixo |
| audio.countdown.pre_reveal | Countdown | 300ms antes da pergunta | Tela preta prestes a abrir | Pre-reveal | Riser curtissimo, seco | 0.3s | 34% | nao | importante | Mixkit | short riser, reveal build | `round_question_pre_reveal_01.mp3` | Sem crescendo longo | Medio |
| audio.countdown.to_question | Countdown/Stage | `finishRoundCountdown` + `revealQuestion` | Pergunta aparece | Transicao pergunta | Whoosh noir + papel de dossie | 0.7s | 44% | nao | obrigatoria | Pixabay/Mixkit | noir whoosh, dossier reveal | `round_reveal_whoosh_noir_01.mp3` | Sincronizar com card | Baixo |
| audio.image.question_revealed | Round imagem | `question_reveal` | Card temporario entra | Reveal card | Selo de dossie | 0.45s | 38% | nao | obrigatoria | Mixkit/Pixabay | dossier stamp, evidence reveal | `image_question_reveal_dossier_01.mp3` | Usar para perguntas de personagem | Baixo |
| audio.image.image_loaded | Round imagem | Imagem do personagem aparece | Foto/personagem no card | Scanner | Scan curto de arquivo | 0.6s | 30% | nao | importante | Pixabay/Mixkit | document scanner, sci fi scan soft | `character_image_scanner_01.mp3` | Evitar laser sci-fi exagerado | Medio |
| audio.image.timer_start | Round imagem | `openBuzz` inicia timer | Timer visivel | Timer start | Relogio inicia com click mecanico | 0.35s | 32% | nao | obrigatoria | Mixkit/Pixabay | timer start click, stopwatch start | `timer_start_clock_arm_01.mp3` | Dispara ao abrir botao de vez | Baixo |
| audio.image.buzz_open | Round imagem | `phase=buzz_open` | Botao de vez liberado | Libera vez | Pequeno gate abrindo | 0.3s | 36% | nao | obrigatoria | Mixkit | gate open, unlock game | `turn_button_open_gate_01.mp3` | Deve ser audivel na Stage | Baixo |
| audio.image.group_a_turn | Round imagem | `BT2PRESS` serial ou tecla mapeada para Grupo A | Grupo A destacado | Energia azul | Whoosh curto, grave limpo | 0.45s | 45% | nao | obrigatoria | Pixabay/Mixkit | blue energy whoosh, clean impact | `turn_group_a_blue_energy_01.mp3` | Nao usar som heroico reconhecivel | Medio |
| audio.image.group_b_turn | Round imagem | `BT1PRESS` serial ou tecla mapeada para Grupo B | Grupo B destacado | Energia vermelha | Whoosh mais seco e baixo | 0.45s | 45% | nao | obrigatoria | Pixabay/Mixkit | red energy whoosh, dark impact | `turn_group_b_red_energy_01.mp3` | Diferenciar timbre, nao qualidade | Medio |
| audio.image.timer_lock | Round imagem | Timer pausa ao pegar vez | Timer travado | Lock clock | Click de relogio travando | 0.25s | 34% | nao | obrigatoria | Mixkit | clock stop click, lock click | `timer_lock_on_turn_01.mp3` | Pode tocar junto do grupo em volume menor | Baixo |
| audio.image.correct | Round imagem | Operador marca correto | Feedback correto | Acerto tribunal | Martelo leve + brilho curto | 0.8s | 50% | nao | obrigatoria | Pixabay/Mixkit | gavel hit success, correct impact | `answer_correct_gavel_light_01.mp3` | Nao virar fanfarra infantil | Medio |
| audio.image.wrong | Round imagem | Operador marca errado | Feedback errado | Erro grave | Boom baixo seco, sem buzzer | 0.55s | 44% | nao | obrigatoria | Pixabay/Mixkit | low boom wrong, dark fail hit | `answer_wrong_low_boom_01.mp3` | Evitar humilhacao sonora | Baixo |
| audio.image.reopen_turn | Round imagem | `Reabrir botao de vez` | Vez liberada de novo | Reopen | Relay abre + tick timer | 0.35s | 34% | nao | importante | Mixkit/Pixabay | relay unlock, timer restart | `turn_reopen_relay_01.mp3` | Resetar lock antes | Baixo |
| audio.image.no_answer | Round imagem | Ninguem pega vez e operador avanca | Sem grupo ativo | Vazio | Whoosh oco curto | 0.5s | 28% | nao | opcional | Pixabay | hollow whoosh, empty hit | `round_no_answer_empty_01.mp3` | Pode ser usado em rodada sem ponto | Medio |
| audio.image.time_up | Round imagem | `timerRemaining=0` | Tempo esgotado | Time up | Relogio cai + impacto seco | 0.8s | 48% | nao | obrigatoria | Mixkit/Pixabay | clock drop, time up dark | `time_up_clock_drop_01.mp3` | Deve bloquear outros sons de timer | Baixo |
| audio.image.auto_next | Round imagem | `auto_next_round_delay` | Aguarda proximo round | Auto advance | Sopro curto de transicao | 0.5s | 30% | nao | importante | Mixkit | short transition whoosh dark | `round_auto_next_whoosh_01.mp3` | Tocar no delay, nao a cada tick | Baixo |
| audio.image.pass_decision | Round imagem | `passQuestion` se usado | Passa/Repassa | Pass token | Card flip seco | 0.35s | 28% | nao | opcional | Freesound CC0/Mixkit | card flip, paper pass | `round_pass_card_flip_01.mp3` | Reservado se UI expuser passa | Medio |
| audio.image.round_prepare | Round imagem | `round_prepare` manual | Rodada pronta | Preparacao | Baixo sub-hit discreto | 0.4s | 26% | nao | opcional | Pixabay | short dark prep hit | `round_prepare_dark_hit_01.mp3` | Evitar repeticao excessiva | Medio |
| audio.image.round_end | Round imagem | `round_end` | Rodada encerrada | Round close | Carimbo/fechamento de pasta | 0.5s | 30% | nao | importante | Mixkit/Pixabay | file close, stamp close | `round_end_case_closed_01.mp3` | Pode ser substituido por auto_next | Baixo |
| audio.ab.question_text | Round A/B | Pergunta textual aparece | Card A/B | Text reveal | Type hit + papel | 0.5s | 36% | nao | obrigatoria | Mixkit/Pixabay | text reveal, typewriter hit | `ab_question_text_reveal_01.mp3` | Diferenciar de imagem | Baixo |
| audio.ab.option_a_enter | Round A/B | Alternativa A aparece | Opcao A no card | Option A | Tick azul suave | 0.18s | 26% | nao | importante | Mixkit | ui tick soft, option select | `ab_option_a_enter_01.mp3` | Panning leve esquerda opcional | Medio |
| audio.ab.option_b_enter | Round A/B | Alternativa B aparece | Opcao B no card | Option B | Tick vermelho suave | 0.18s | 26% | nao | importante | Mixkit | ui tick soft, option select low | `ab_option_b_enter_01.mp3` | Panning leve direita opcional | Medio |
| audio.ab.player_choose_a | Round A/B | Jogador escolhe A; Admin seleciona A | Botao A selecionado | Select A | Clique de ficha premium | 0.2s | 24% | nao | obrigatoria | Mixkit | premium select click | `ab_choice_a_select_01.mp3` | Admin; Stage opcional | Baixo |
| audio.ab.player_choose_b | Round A/B | Jogador escolhe B; Admin seleciona B | Botao B selecionado | Select B | Clique mais grave | 0.2s | 24% | nao | obrigatoria | Mixkit | premium select click low | `ab_choice_b_select_01.mp3` | Consistente com A | Baixo |
| audio.ab.operator_confirm | Round A/B | `Confirmar A/B` | Resposta confirmada | Confirm locked | Carimbo digital | 0.35s | 30% | nao | obrigatoria | Mixkit/Pixabay | digital stamp, confirm lock | `ab_confirm_choice_stamp_01.mp3` | Antes de correto/errado | Baixo |
| audio.ab.correct | Round A/B | Escolha correta | Feedback correto | Acerto A/B | Martelo + shimmer contido | 0.8s | 50% | nao | obrigatoria | Pixabay/Mixkit | correct cinematic hit, gavel success | `ab_answer_correct_01.mp3` | Pode reusar correto geral | Medio |
| audio.ab.wrong | Round A/B | Escolha errada | Feedback errado | Erro A/B | Baixo impacto + ar | 0.6s | 44% | nao | obrigatoria | Pixabay/Mixkit | wrong answer boom soft | `ab_answer_wrong_01.mp3` | Sem buzzer de programa infantil | Alto |
| audio.ab.explanation | Round A/B | Explicacao aparece no Admin ou futuro Stage | Texto explicativo | Reveal explicacao | Papel abrindo pequeno | 0.3s | 20% | nao | opcional | Freesound CC0/Mixkit | paper slide, note reveal | `ab_explanation_note_01.mp3` | Usar se explicacao for exibida | Baixo |
| audio.ab.no_choice_error | Round A/B | Confirmar sem grupo/escolha | Erro operacional | Error soft | Dois bips discretos | 0.3s | 22% | nao | importante | Mixkit | soft error beep | `ab_confirm_incomplete_error_01.mp3` | Admin only | Baixo |
| audio.arduino.bt1_received | Arduino/hardware | Linha `BT1PRESS` recebida | Grupo calibrado correspondente pega vez | Entrada BT1 | Impacto grupo calibrado | 0.45s | 45% | nao | obrigatoria | Mixkit/Pixabay | button press impact, arcade button dark | `serial_bt1press_received_01.mp3` | No jogo real BT1 mapeia Grupo B via calibracao | Medio |
| audio.arduino.bt2_received | Arduino/hardware | Linha `BT2PRESS` recebida | Grupo calibrado correspondente pega vez | Entrada BT2 | Impacto grupo calibrado | 0.45s | 45% | nao | obrigatoria | Mixkit/Pixabay | button press impact, arcade button dark low | `serial_bt2press_received_01.mp3` | No jogo real BT2 mapeia Grupo A via calibracao | Medio |
| audio.arduino.reset_received | Arduino/hardware | Linha `RESET` recebida | Rodada reseta/prepara | Reset recebido | Queda curta + click | 0.5s | 30% | nao | obrigatoria | Mixkit | reset click, power cycle | `serial_reset_received_01.mp3` | Parar sons de rodada | Baixo |
| audio.arduino.lock_sent | Arduino/hardware | Admin envia `LOCK` | Hardware bloqueia | Lock enviado | Relay fechado | 0.22s | 20% | nao | importante | Mixkit/Pixabay | relay lock click | `serial_lock_sent_01.mp3` | Admin baixo volume | Baixo |
| audio.arduino.unlock_sent | Arduino/hardware | Admin envia `UNLOCK` | Hardware libera | Unlock enviado | Relay aberto | 0.22s | 20% | nao | importante | Mixkit/Pixabay | relay unlock click | `serial_unlock_sent_01.mp3` | Admin baixo volume | Baixo |
| audio.arduino.reset_hw_sent | Arduino/hardware | Admin envia `RESET_HW` | Hardware reseta | Reset hardware | Relay duplo | 0.35s | 22% | nao | importante | Mixkit | relay reset double click | `serial_reset_hw_sent_01.mp3` | Pode tocar antes do RESET recebido | Baixo |
| audio.arduino.disconnected | Arduino/hardware | Porta fecha/erro | Serial desconectado | Disconnect | Cabo solto/queda digital | 0.45s | 25% | nao | importante | Pixabay/Mixkit | cable disconnect, device disconnect | `serial_port_disconnected_01.mp3` | Admin only | Medio |
| audio.arduino.reconnected | Arduino/hardware | Reconexao apos erro | Serial conectado | Reconnect | Dois tons ascendentes | 0.45s | 26% | nao | importante | Mixkit | device reconnect, tech success | `serial_reconnected_01.mp3` | Admin only | Baixo |
| audio.arduino.conflict | Arduino/hardware | Comando desconhecido/conflito lock | Erro serial/log | Conflito | Glitch curto abafado | 0.35s | 24% | nao | importante | Mixkit/Pixabay | short glitch error, data conflict | `serial_conflict_glitch_01.mp3` | Nunca alto na Stage | Medio |
| audio.arduino.dfplayer_ready | Arduino/hardware | `DFPLAYER_READY` | DFPlayer ready | Audio device ready | Pluck tecnico | 0.25s | 18% | nao | opcional | Mixkit | device ready beep | `dfplayer_ready_01.mp3` | Se audio fisico entrar futuramente | Baixo |
| audio.arduino.dfplayer_error | Arduino/hardware | `DFPLAYER_ERROR` | DFPlayer error | Device error | Low blip | 0.3s | 20% | nao | importante | Mixkit | device error low beep | `dfplayer_error_01.mp3` | Admin only | Baixo |
| audio.score.group_a_point | Placar | Grupo A pontua | Placar A sobe, +delta | Score A | Energia azul + moeda seca nao cassino | 0.7s | 45% | nao | obrigatoria | Mixkit/Pixabay | score point blue, energy score | `score_group_a_point_01.mp3` | Evitar som de moeda/cassino | Alto |
| audio.score.group_b_point | Placar | Grupo B pontua | Placar B sobe, +delta | Score B | Energia vermelha grave | 0.7s | 45% | nao | obrigatoria | Mixkit/Pixabay | score point red, dark energy score | `score_group_b_point_01.mp3` | Mesmo peso de A | Alto |
| audio.score.bar_moves | Placar | Segmentos da barra mudam | Barra A/B anima | Barra desloca | Swipe de metal/energia | 0.45s | 28% | nao | importante | Mixkit | energy meter move, power bar | `score_bar_shift_01.mp3` | Duck se tocar junto de acerto | Medio |
| audio.score.lead_change | Placar | Lideranca troca | Grupo passa na frente | Lead change | Hit de virada competitivo | 0.8s | 48% | nao | importante | Pixabay/Mixkit | lead change stinger, dramatic turn | `score_lead_change_01.mp3` | Nao tocar em todo ponto | Medio |
| audio.score.tie_detected | Placar | Empate detectado antes/após round 10 | Placar igual | Empate | Dois tons se encontrando | 0.7s | 38% | nao | importante | Mixkit/Pixabay | tension hit two tones, tie game | `score_tie_detected_01.mp3` | Especialmente antes do Veredito | Baixo |
| audio.score.no_point | Placar | Rodada sem ponto | Placar igual | Sem ponto | Stamp vazio | 0.35s | 25% | nao | opcional | Pixabay | empty stamp, no score | `score_no_point_stamp_01.mp3` | Usar com moderacao | Medio |
| audio.score.final_total | Placar | Game over calcula final | Placar final | Total final | Fechamento de placar | 0.8s | 38% | nao | importante | Mixkit/Pixabay | final score hit, scoreboard reveal | `score_final_total_01.mp3` | Antes do game over stinger | Medio |
| audio.tie.enter_after_round10 | Veredito Final | Empate apos round 10 | Veredito Final inicia | Thunder curto | Trovao curto distante + martelo | 1.2s | 55% | nao | obrigatoria | Pixabay/Freesound CC0 | distant thunder short, gavel dark | `veredito_final_thunder_01.mp3` | Sem jumpscare | Medio |
| audio.tie.screen_enter | Veredito Final | Tela/estado tie_breaker entra | Visual de desempate | Stinger veredito | Drone grave e campainha distorcida | 1.5s | 50% | nao | obrigatoria | Pixabay/Mixkit | dark verdict stinger, court bell distorted | `tie_breaker_verdict_stinger_01.mp3` | Nao usar melodia | Medio |
| audio.tie.countdown_enter | Veredito Final | Countdown do desempate | Relogio do Veredito | Countdown especial | Relogio mais grave | 0.6s | 38% | nao | obrigatoria | Mixkit | heavy digital countdown, dark timer | `tie_breaker_countdown_enter_01.mp3` | Varia do countdown normal | Baixo |
| audio.tie.countdown_tick | Veredito Final | Cada segundo do countdown | Relogio central | Tick veredito | Tick com cauda de sino abafado | 0.2s | 34% | nao | importante | Mixkit/Pixabay | bell clock tick dark | `tie_breaker_countdown_tick_01.mp3` | Sem sino de igreja obvio | Medio |
| audio.tie.question_reveal | Veredito Final | Pergunta desempate aparece | Card A/B Veredito | Reveal final | Dossie + impacto grave | 0.8s | 48% | nao | obrigatoria | Pixabay/Mixkit | final question reveal, dossier impact | `tie_breaker_question_reveal_01.mp3` | Mais pesado que A/B normal | Baixo |
| audio.tie.group_turn | Veredito Final | Grupo pega vez | Grupo destacado | Vez final | Whoosh grupo + subgrave | 0.55s | 48% | nao | obrigatoria | Mixkit/Pixabay | final turn whoosh, energy impact | `tie_breaker_group_turn_01.mp3` | Pode combinar variações A/B | Medio |
| audio.tie.correct_win | Veredito Final | Resposta correta no desempate | Vencedor declarado | Vitoria veredito | Martelo forte + sala abre | 1.5s | 60% | nao | obrigatoria | Pixabay/Mixkit | gavel big hit, verdict win cinematic | `tie_breaker_correct_win_01.mp3` | Grande, mas nao fanfarra infantil | Medio |
| audio.tie.wrong | Veredito Final | Resposta errada desempate | Grupo bloqueado/errou | Erro final | Impacto oco + ar pesado | 0.7s | 48% | nao | obrigatoria | Pixabay | hollow boom wrong, dark fail | `tie_breaker_wrong_01.mp3` | Nao humilhar | Baixo |
| audio.tie.both_wrong | Veredito Final | Dois grupos erram | Nova pergunta sera carregada | Ambos erram | Campainha distorcida baixa | 0.8s | 42% | nao | importante | ZapSplat/Pixabay | distorted court bell, failure bell | `tie_breaker_both_wrong_01.mp3` | Evitar som comico | Medio |
| audio.tie.new_question | Veredito Final | Nova pergunta desempate | Outra pergunta entra | Reload dossie | Folhas rapidas + click | 0.55s | 34% | nao | importante | Freesound CC0/Mixkit | papers shuffle, dossier reload | `tie_breaker_new_question_01.mp3` | Limitar repeticao | Baixo |
| audio.tie.winner_declared | Veredito Final | `winner_declared` por tie_breaker | Grupo vencedor | Declaracao | Veredito final stinger | 2.0s | 58% | nao | obrigatoria | Pixabay/Mixkit | final verdict cinematic hit | `game_over_verdict_01.mp3` | Pode ser mesmo do game over final | Medio |
| audio.tie.no_tie_after_round10 | Veredito Final | Round 10 termina sem empate | Vai game over por pontos | Sem veredito | Corte limpo para final | 0.45s | 30% | nao | opcional | Mixkit | final transition short | `score_win_transition_01.mp3` | Nao sugerir tie breaker | Baixo |
| audio.gameover.winner_a | Game Over | Vencedor Grupo A | "Grupo A vence" | Vitoria A | Energia azul + martelo final | 1.6s | 58% | nao | obrigatoria | Pixabay/Mixkit | victory hit blue, cinematic success | `game_over_group_a_win_01.mp3` | Sem fanfarra escolar | Medio |
| audio.gameover.winner_b | Game Over | Vencedor Grupo B | "Grupo B vence" | Vitoria B | Energia vermelha + martelo final | 1.6s | 58% | nao | obrigatoria | Pixabay/Mixkit | victory hit red, dark success | `game_over_group_b_win_01.mp3` | Mesmo peso de A | Medio |
| audio.gameover.by_score | Game Over | `winReason=score` | Vitoria por pontos | Pontos final | Fechamento de placar | 1.0s | 44% | nao | importante | Mixkit/Pixabay | scoreboard final, game result | `game_over_score_win_01.mp3` | Antes ou junto do vencedor | Baixo |
| audio.gameover.by_verdict | Game Over | `winReason=tie_breaker` | Veredito Final | Veredito final | Martelo grande + cauda grave | 2.0s | 60% | nao | obrigatoria | Pixabay/Mixkit | final gavel hit cinematic | `game_over_verdict_01.mp3` | Evitar trilha heroica | Medio |
| audio.gameover.screen_enter | Game Over | `phase=game_over` | Tela final aparece | Tela final | Sweep descendente e sala abre | 1.0s | 42% | nao | importante | Mixkit | final screen sweep | `game_over_screen_enter_01.mp3` | Pode tocar apos winner | Medio |
| audio.gameover.history_saved | Game Over/Historico | Evento final salvo | Historico atualizado | Save | Carimbo seco em pasta | 0.3s | 18% | nao | opcional | Mixkit/Pixabay | file saved stamp, archive click | `history_saved_stamp_01.mp3` | Admin only | Baixo |
| audio.gameover.csv_exported | Game Over/Historico | CSV exportado | Download CSV | Export | Confirmacao arquivo | 0.25s | 20% | nao | importante | Mixkit | file export success | `csv_export_success_01.mp3` | Pode reusar export Admin | Baixo |
| audio.gameover.return_wait | Game Over | Resetar para espera | Volta ao logo/intro | Return idle | Fade de sala para cidade | 1.2s | 30% | nao | importante | Pixabay/Freesound CC0 | room fade city ambience | `return_to_waiting_ambience_fade_01.mp3` | Reiniciar loops corretamente | Baixo |

## Easter eggs sonoros

| Nome | Onde toca | Chance de tocar | Descricao | Fonte/termos de busca | Risco | Habilitar/desabilitar no Admin? |
| --- | --- | --- | --- | --- | --- | --- |
| `noir_rooftop_whoosh_01` | Entre countdown e pergunta | 3% | Sopro de capa original passando no alto de um predio | Pixabay/Mixkit: cloak whoosh, fabric whoosh dark | Medio; pode soar como copia heroica se exagerar | Sim |
| `tribunal_gavel_hit_dark_01` | Antes de Veredito Final | 8% | Martelo mais grave e distante que o normal | Pixabay: gavel dark, courtroom hit | Baixo | Sim |
| `comic_page_snap_01` | Briefing ou troca de pergunta A/B | 6% | Pagina de HQ virando com snap seco | Freesound CC0/Mixkit: comic page turn | Medio se for cartunesco | Sim |
| `city_siren_distant_01` | Ambiencia de espera | 4% por minuto | Sirene distante abafada, quase imperceptivel | Freesound CC0/Pixabay: distant city siren | Alto se alta ou irritante | Sim |
| `veredito_final_thunder_rare_01` | Empate apos round 10 | 12% | Trovao curto extra antes do stinger | Pixabay: distant thunder short | Medio se jumpscare | Sim |
| `dossier_scanner_glitch_01` | Imagem de personagem revelada | 5% | Scanner com falha de transmissao | Mixkit/Pixabay: scanner glitch, data scan | Medio se sci-fi demais | Sim |
| `radio_police_far_01` | Tela ready/pre-show idle | 3% por minuto | Radio policial distante indecifravel, sem fala clara | Freesound CC0: police radio static no speech | Alto se tiver fala/licenca incerta | Sim |
| `court_bell_distorted_01` | Erro operacional raro | 5% | Campainha de tribunal distorcida curta | ZapSplat/Pixabay: distorted bell court | Medio | Sim |
| `rain_on_metal_roof_01` | Espera do pre-show | 6% por minuto | Chuva curta em telhado metalico | Freesound CC0/Pixabay: rain metal roof | Baixo | Sim |
| `alley_catwalk_steps_01` | Auto next round delay | 3% | Passos distantes em beco, sem personagem | Freesound CC0: distant footsteps alley | Medio se assustador | Sim |
| `evidence_stamp_rare_01` | Historico salvo/CSV | 8% | Carimbo pesado de evidencia | Mixkit/Pixabay: evidence stamp, office stamp | Baixo | Sim |
| `old_tv_sync_pop_01` | Glitch de BroadcastChannel/preview | 4% | Pop de transmissao analogica discreto | Pixabay/Mixkit: tv static pop, sync glitch | Medio | Sim |
| `neon_transformer_hum_01` | Placar empatado | 5% | Hum eletrico urbano curto | Freesound CC0/Pixabay: neon hum short | Baixo | Sim |
| `subway_far_rumble_01` | Tela preta countdown | 3% | Trem/metrô distante como subgrave | Freesound CC0/Pixabay: distant subway rumble | Baixo | Sim |
| `paper_casefile_shuffle_01` | Nova pergunta de desempate | 10% | Pasta de caso sendo folheada | Freesound CC0/Mixkit: paper shuffle folder | Baixo | Sim |
| `clock_mechanism_secret_01` | Ultimo segundo de countdown | 4% | Engrenagem de relogio armando | Pixabay/Mixkit: clock mechanism wind | Medio se steampunk demais | Sim |
| `crowd_breath_low_01` | Game over antes do vencedor | 5% | Suspiro coletivo abstrato, sem vozes reconheciveis | Freesound CC0: crowd breath ambience no speech | Alto se tiver voz identificavel | Sim |

Regra para easter eggs: todos devem ser desligaveis no Admin, ter volume proprio baixo, nunca bloquear som obrigatorio e nunca conter fala/frase protegida.

## 4. Biblioteca de arquivos sugerida

Estrutura futura:

```text
public/audio/sfx/
public/audio/ui/
public/audio/ambience/
public/audio/stingers/
public/audio/easter-eggs/
```

Lista inicial de arquivos sugeridos:

- `public/audio/ui/ui_confirm_soft_01.mp3`
- `public/audio/ui/ui_admin_login_success_01.mp3`
- `public/audio/ui/ui_admin_login_error_01.mp3`
- `public/audio/ui/admin_operational_error_01.mp3`
- `public/audio/ui/history_csv_export_01.mp3`
- `public/audio/ui/history_clear_archive_01.mp3`
- `public/audio/sfx/serial_connected_tech_01.mp3`
- `public/audio/sfx/serial_error_low_buzz_01.mp3`
- `public/audio/sfx/serial_ping_send_01.mp3`
- `public/audio/sfx/serial_pong_receive_01.mp3`
- `public/audio/sfx/serial_status_locked_01.mp3`
- `public/audio/sfx/serial_status_unlocked_01.mp3`
- `public/audio/sfx/serial_bt1press_received_01.mp3`
- `public/audio/sfx/serial_bt2press_received_01.mp3`
- `public/audio/sfx/serial_reset_received_01.mp3`
- `public/audio/sfx/round_countdown_tick_dark_01.mp3`
- `public/audio/sfx/round_countdown_last_tick_01.mp3`
- `public/audio/sfx/timer_start_clock_arm_01.mp3`
- `public/audio/sfx/timer_lock_on_turn_01.mp3`
- `public/audio/sfx/time_up_clock_drop_01.mp3`
- `public/audio/sfx/turn_group_a_blue_energy_01.mp3`
- `public/audio/sfx/turn_group_b_red_energy_01.mp3`
- `public/audio/sfx/ab_choice_a_select_01.mp3`
- `public/audio/sfx/ab_choice_b_select_01.mp3`
- `public/audio/sfx/ab_confirm_choice_stamp_01.mp3`
- `public/audio/sfx/score_group_a_point_01.mp3`
- `public/audio/sfx/score_group_b_point_01.mp3`
- `public/audio/sfx/score_bar_shift_01.mp3`
- `public/audio/stingers/preshow_blackout_whoosh_01.mp3`
- `public/audio/stingers/preshow_title_gavel_whoosh_01.mp3`
- `public/audio/stingers/quiz_start_court_bell_01.mp3`
- `public/audio/stingers/round_reveal_whoosh_noir_01.mp3`
- `public/audio/stingers/answer_correct_gavel_light_01.mp3`
- `public/audio/stingers/answer_wrong_low_boom_01.mp3`
- `public/audio/stingers/tie_breaker_thunder_01.mp3`
- `public/audio/stingers/tie_breaker_correct_win_01.mp3`
- `public/audio/stingers/game_over_verdict_01.mp3`
- `public/audio/stingers/game_over_group_a_win_01.mp3`
- `public/audio/stingers/game_over_group_b_win_01.mp3`
- `public/audio/ambience/ambience_noir_city_bed_01.mp3`
- `public/audio/ambience/ambience_preshow_video_noir_01.mp3`
- `public/audio/ambience/ready_to_start_clock_bed_01.mp3`
- `public/audio/easter-eggs/noir_rooftop_whoosh_01.mp3`
- `public/audio/easter-eggs/tribunal_gavel_hit_dark_01.mp3`
- `public/audio/easter-eggs/comic_page_snap_01.mp3`
- `public/audio/easter-eggs/city_siren_distant_01.mp3`
- `public/audio/easter-eggs/dossier_scanner_glitch_01.mp3`
- `public/audio/easter-eggs/radio_police_far_01.mp3`

## 5. Camadas de audio

- UI curta: cliques, confirmacoes, erro operacional, login, export CSV, limpar historico.
- Efeitos de jogo: countdown, reveal, timer, botao de vez, acerto, erro, time up, pontuacao.
- Ambiencia: cidade noturna, sala/tribunal urbano, chuva distante, hum eletrico baixo.
- Stingers cinematograficos: pre-show, titulo, Veredito Final, game over, vencedor.
- Easter eggs: sons raros, contextuais e sempre desativaveis.
- Alertas tecnicos do Admin: serial, PING/PONG, LOCK/UNLOCK, RESET_HW, erro serial.

O proximo harness deve criar um mixer simples:

- volume master;
- volume musica/ambiencia;
- volume efeitos;
- mute;
- reduced audio mode;
- limite de sons simultaneos;
- ducking de ambiencia durante stingers;
- cleanup de loops em troca de tela;
- protecao contra clips estourando quando varios eventos acontecem juntos.

## 6. Prioridade de implementacao

Fase 1 - obrigatorios:

- Unlock de audio por gesto do Admin.
- Acerto, erro, time up.
- Countdown tick e ultimo segundo.
- Botao de vez liberado.
- Grupo A/B pegando vez.
- Serial conectado/erro.
- Start quiz/start sequence.
- Game over/vencedor.

Fase 2 - imersao:

- Pre-show completo: logo, blackout, video, titulo, briefing, pronto.
- Round reveal e image scanner.
- A/B select/confirm.
- Score bar, lead change e tie detected.
- Veredito Final com thunder/stinger proprio.

Fase 3 - easter eggs:

- Sons raros, contextuais, sempre desativaveis no Admin.
- Chance configuravel e limite por partida.
- Nenhum easter egg pode tocar por cima de acerto/time up/game over.

Fase 4 - polish:

- Variações de pitch/volume por repeticao.
- Mixer com ducking.
- Preload inteligente.
- Crossfade de loops.
- Ajuste fino por caixa de som real do evento.

## 7. Riscos e inconsistencias

- Excesso de som pode poluir e cansar a plateia.
- Som errado pode deixar o jogo cafona, infantil ou com cara de cassino.
- Sons longos podem atrasar o ritmo da partida.
- Loops podem vazar entre pre-show, Stage e game over se nao houver cleanup.
- O navegador exige gesto do usuario antes de tocar audio; o Admin deve desbloquear o AudioContext.
- Licencas precisam ser conferidas no item final, nao apenas na plataforma.
- Nunca usar som protegido, trilha oficial, fan sample, marca sonora ou referencia audivel a DC/Batman/Superman.
- O Admin nao deve ficar barulhento demais; alertas tecnicos precisam ser discretos.
- Freesound CC BY exige credito; Freesound CC BY-NC deve ser evitado.
- ZapSplat Basic pode exigir atribuicao; se usado, manter `CREDITS_AUDIO.md`.
- Audio simultaneo de Stage + Admin pode embolar se ambos estiverem no mesmo PA.
- Arduino fisico e virtual devem gerar os mesmos eventos sonoros, sem bifurcar regra.

## 8. Checklist para o proximo harness de implementacao

- [ ] Criar `AudioManager` sem alterar regras do jogo.
- [ ] Implementar unlock de audio por gesto do Admin.
- [ ] Criar mixer: master, efeitos, ambiencia, stingers, mute e reduced audio mode.
- [ ] Mapear `event -> sound` com IDs deste documento.
- [ ] Nao tocar audio na Stage antes do Admin permitir.
- [ ] Definir onde o som toca: Admin local, Stage publico ou ambos.
- [ ] Preload controlado dos sons obrigatorios.
- [ ] Lazy-load de easter eggs e sons opcionais.
- [ ] Impedir sobreposicao exagerada e clipping.
- [ ] Aplicar ducking de ambiencia durante stingers.
- [ ] Testar mute e volumes.
- [ ] Testar cleanup de loops no reset, game over e troca de pre-show.
- [ ] Testar fluxo completo: pre-show -> quiz -> rounds -> Veredito Final -> game over.
- [ ] Testar Arduino virtual com `BT1PRESS`, `BT2PRESS`, `RESET`, `LOCK`, `UNLOCK`, `RESET_HW`.
- [ ] Testar Web Serial real preservado.
- [ ] Testar sem audio carregado.
- [ ] Testar erro 404 de arquivo de audio.
- [ ] Criar `CREDITS_AUDIO.md` se qualquer item exigir atribuicao.
- [ ] Registrar licenca, URL e autor de cada arquivo usado.
- [ ] Confirmar que nenhum audio oficial/copyrightado foi importado.
