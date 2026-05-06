import type { GameState } from '@/store/gameStore'
import type {
  AdminCommand,
  GameStateSnapshot,
  GroupId,
  RealtimeMessage,
  RealtimeSource,
  SerialEventPayload,
  StageAudioStatusPayload,
  StageHeartbeatPayload,
} from '@/types/game.types'

export const GAME_CHANNEL_NAME = 'dois-pesos-game-channel'

export function createOriginId(source: RealtimeSource) {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${source}-${randomPart}`
}

export function createGameSnapshot(state: GameState): GameStateSnapshot {
  return state.getSnapshot()
}

export function createGameStateMessage(
  originId: string,
  source: RealtimeSource,
  payload: GameStateSnapshot,
): RealtimeMessage {
  return {
    type: 'GAME_STATE_SYNC',
    originId,
    source,
    sentAt: Date.now(),
    payload,
  }
}

export function createAdminCommandMessage(
  originId: string,
  command: AdminCommand,
  payload: { group?: GroupId; amount?: number } = {},
): RealtimeMessage {
  return {
    type: 'ADMIN_COMMAND',
    originId,
    source: 'admin',
    sentAt: Date.now(),
    payload: { command, ...payload },
  }
}

export function createSerialEventMessage(
  originId: string,
  source: RealtimeSource,
  payload: SerialEventPayload,
): RealtimeMessage {
  return {
    type: 'SERIAL_EVENT',
    originId,
    source,
    sentAt: Date.now(),
    payload,
  }
}

export function createStageAudioStatusMessage(
  originId: string,
  payload: StageAudioStatusPayload,
): RealtimeMessage {
  return {
    type: 'STAGE_AUDIO_STATUS_SYNC',
    originId,
    source: 'stage',
    sentAt: Date.now(),
    payload,
  }
}

export function createStageHeartbeatMessage(
  originId: string,
  payload: StageHeartbeatPayload,
): RealtimeMessage {
  return {
    type: 'STAGE_HEARTBEAT',
    originId,
    source: 'stage',
    sentAt: Date.now(),
    payload,
  }
}

export function openGameChannel() {
  if (typeof BroadcastChannel === 'undefined') return null
  return new BroadcastChannel(GAME_CHANNEL_NAME)
}
