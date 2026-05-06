import type { GroupId, SerialEventName } from '@/types/game.types'

export const SERIAL_EVENT_TO_GROUP: Partial<Record<SerialEventName, GroupId>> = {
  BT1PRESS: 'A',
  BT2PRESS: 'B',
}

export const KEYBOARD_EVENT_TO_GROUP: Partial<Record<SerialEventName, GroupId>> = {
  BT1PRESS: 'A',
  BT2PRESS: 'B',
}

export function serialEventToGroup(eventName: SerialEventName) {
  return SERIAL_EVENT_TO_GROUP[eventName] ?? null
}

export function keyboardEventToGroup(eventName: SerialEventName) {
  return KEYBOARD_EVENT_TO_GROUP[eventName] ?? null
}
