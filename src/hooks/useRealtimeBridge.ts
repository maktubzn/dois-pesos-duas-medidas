import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createGameSnapshot,
  createGameStateMessage,
  createOriginId,
  createSerialEventMessage,
  createStageAudioStatusMessage,
  createStageHeartbeatMessage,
  openGameChannel,
} from '@/realtime/broadcastChannel'
import { useGameStore } from '@/store/gameStore'
import type { RealtimeMessage, RealtimeSource, SerialEventPayload, StageAudioStatusPayload, StageHeartbeatPayload } from '@/types/game.types'

export function useAdminRealtime() {
  const originId = useMemo(() => createOriginId('admin'), [])
  const [stageAudioStatus, setStageAudioStatus] = useState<StageAudioStatusPayload | null>(null)
  const [stageHeartbeat, setStageHeartbeat] = useState<(StageHeartbeatPayload & { receivedAt: number }) | null>(null)

  const publishSerialEvent = (payload: SerialEventPayload) => {
    const channel = openGameChannel()
    if (!channel) return
    channel.postMessage(createSerialEventMessage(originId, 'admin', payload))
    channel.close()
  }

  useEffect(() => {
    const channel = openGameChannel()
    if (!channel) return undefined

    const publish = () => {
      channel.postMessage(
        createGameStateMessage(originId, 'admin', createGameSnapshot(useGameStore.getState())),
      )
    }

    function handleMessage(event: MessageEvent<RealtimeMessage>) {
      const message = event.data
      if (!message || message.originId === originId) return
      if (message.type === 'STAGE_AUDIO_STATUS_SYNC') {
        setStageAudioStatus(message.payload)
      }
      if (message.type === 'STAGE_HEARTBEAT') {
        setStageHeartbeat({ ...message.payload, receivedAt: Date.now() })
      }
      if (message.type === 'GAME_STATE_SYNC' && message.source === 'stage') {
        useGameStore.getState().applySnapshot(message.payload)
      }
    }

    channel.addEventListener('message', handleMessage)

    publish()
    const unsubscribe = useGameStore.subscribe(publish)

    return () => {
      unsubscribe()
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [originId])

  return { originId, publishSerialEvent, stageAudioStatus, stageHeartbeat }
}

export function useStageRealtime() {
  const originId = useMemo(() => createOriginId('stage'), [])

  const publishGameState = useCallback(() => {
    const channel = openGameChannel()
    if (!channel) return
    channel.postMessage(
      createGameStateMessage(originId, 'stage', createGameSnapshot(useGameStore.getState())),
    )
    channel.close()
  }, [originId])

  const publishStageAudioStatus = useCallback(
    (payload: StageAudioStatusPayload) => {
      const channel = openGameChannel()
      if (!channel) return
      channel.postMessage(createStageAudioStatusMessage(originId, payload))
      channel.close()
    },
    [originId],
  )

  const publishStageHeartbeat = useCallback(
    (payload: StageHeartbeatPayload) => {
      const channel = openGameChannel()
      if (!channel) return
      channel.postMessage(createStageHeartbeatMessage(originId, payload))
      channel.close()
    },
    [originId],
  )

  useEffect(() => {
    const channel = openGameChannel()
    if (!channel) return undefined

    function handleMessage(event: MessageEvent<RealtimeMessage>) {
      const message = event.data
      if (!message || message.originId === originId) return
      if (message.type === 'GAME_STATE_SYNC') {
        useGameStore.getState().applySnapshot(message.payload)
      }
    }

    channel.addEventListener('message', handleMessage)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [originId])

  return { originId, publishGameState, publishStageAudioStatus, publishStageHeartbeat }
}

export function isRealtimeSource(value: string): value is RealtimeSource {
  return value === 'admin' || value === 'stage'
}
