import { describe, expect, it } from 'vitest'

import { resolveConfig } from '../src/config.js'

describe('resolveConfig', () => {
  it('fills in the documented defaults', () => {
    expect(resolveConfig()).toEqual({
      attempts: 50,
      disabled: false,
      fieldName: 'orderNumber',
      ordersSlug: 'orders',
      padding: 0,
      prefix: '',
      reservationsSlug: 'order-number-reservations',
      sequenceFieldName: 'orderSequence',
      startAt: 1,
      suffix: '',
    })
  })

  it('rejects a negative padding rather than flipping its sign', () => {
    expect(resolveConfig({ padding: -5 }).padding).toBe(0)
  })

  it('rejects a zero or negative startAt', () => {
    expect(resolveConfig({ startAt: 0 }).startAt).toBe(1)
    expect(resolveConfig({ startAt: -10 }).startAt).toBe(1)
  })

  it('rejects a zero or negative attempts', () => {
    expect(resolveConfig({ attempts: 0 }).attempts).toBe(50)
  })

  it('truncates fractional values instead of storing them', () => {
    expect(resolveConfig({ padding: 4.9, startAt: 10.7 })).toMatchObject({
      padding: 4,
      startAt: 10,
    })
  })

  it('falls back when a name is given as an empty string', () => {
    expect(resolveConfig({ fieldName: '', ordersSlug: '' })).toMatchObject({
      fieldName: 'orderNumber',
      ordersSlug: 'orders',
    })
  })

  it('keeps an empty prefix and suffix as empty', () => {
    expect(resolveConfig({ prefix: '', suffix: '' })).toMatchObject({ prefix: '', suffix: '' })
  })
})
