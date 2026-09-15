import { describe, expect, it } from 'vitest'
import { clampQuality, computeTargetSize } from './dimensions'

describe('clampQuality', () => {
  it('clamps to 1–100', () => {
    expect(clampQuality(0)).toBe(1)
    expect(clampQuality(140)).toBe(100)
    expect(clampQuality(80.4)).toBe(80)
  })
})

describe('computeTargetSize', () => {
  it('does not upscale', () => {
    expect(computeTargetSize(100, 50, 400, 400)).toEqual({ width: 100, height: 50 })
  })

  it('fits both max constraints', () => {
    expect(computeTargetSize(1920, 1080, 1280, 720)).toEqual({
      width: 1280,
      height: 720,
    })
  })

  it('keeps aspect ratio when only maxWidth is set', () => {
    expect(computeTargetSize(2000, 1000, 1000, undefined)).toEqual({
      width: 1000,
      height: 500,
    })
  })
})
