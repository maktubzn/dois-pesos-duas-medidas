import { describe, expect, it } from 'vitest'
import { keyboardEventToGroup, serialEventToGroup } from './serialEventToGroup'

describe('serial event calibration', () => {
  it('maps real Arduino events directly to the physical table groups', () => {
    expect(serialEventToGroup('BT1PRESS')).toBe('A')
    expect(serialEventToGroup('BT2PRESS')).toBe('B')
  })

  it('keeps keyboard fallback direct', () => {
    expect(keyboardEventToGroup('BT1PRESS')).toBe('A')
    expect(keyboardEventToGroup('BT2PRESS')).toBe('B')
  })
})
