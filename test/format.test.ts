import { describe, expect, it } from 'vitest'

import { resolveConfig } from '../src/config.js'
import { formatOrderNumber } from '../src/format.js'

describe('formatOrderNumber', () => {
  it('returns the bare number by default', () => {
    expect(formatOrderNumber(42, resolveConfig())).toBe('42')
  })

  it('applies prefix, padding and suffix', () => {
    const config = resolveConfig({ padding: 5, prefix: 'ORD-', suffix: '/26' })

    expect(formatOrderNumber(42, config)).toBe('ORD-00042/26')
  })

  it('does not truncate a number wider than the padding', () => {
    const config = resolveConfig({ padding: 3 })

    expect(formatOrderNumber(123456, config)).toBe('123456')
  })

  it('pads exactly to the requested width', () => {
    const config = resolveConfig({ padding: 6 })

    expect(formatOrderNumber(7, config)).toBe('000007')
  })
})
