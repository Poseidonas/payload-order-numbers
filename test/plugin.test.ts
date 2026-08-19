import type { CollectionConfig, Config } from 'payload'

import { describe, expect, it } from 'vitest'

import { orderNumbersPlugin } from '../src/index.js'

const ordersCollection: CollectionConfig = {
  slug: 'orders',
  fields: [{ name: 'customerEmail', type: 'email' }],
}

const baseConfig = (collections: CollectionConfig[]): Config => ({ collections }) as Config

const fieldNames = (config: Config, slug: string): string[] => {
  const collection = config.collections?.find((entry) => entry.slug === slug)

  return (collection?.fields ?? []).map((field) =>
    'name' in field && typeof field.name === 'string' ? field.name : '',
  )
}

describe('orderNumbersPlugin', () => {
  it('adds both fields to the orders collection', () => {
    const result = orderNumbersPlugin()(baseConfig([ordersCollection]))

    expect(fieldNames(result, 'orders')).toEqual([
      'customerEmail',
      'orderNumber',
      'orderSequence',
    ])
  })

  it('honours custom field names', () => {
    const result = orderNumbersPlugin({
      fieldName: 'reference',
      sequenceFieldName: 'referenceSequence',
    })(baseConfig([ordersCollection]))

    expect(fieldNames(result, 'orders')).toContain('reference')
    expect(fieldNames(result, 'orders')).toContain('referenceSequence')
  })

  it('adds the reservations collection', () => {
    const result = orderNumbersPlugin()(baseConfig([ordersCollection]))

    expect(result.collections?.map((entry) => entry.slug)).toContain('order-number-reservations')
  })

  it('leaves other collections untouched', () => {
    const other: CollectionConfig = { slug: 'products', fields: [{ name: 'title', type: 'text' }] }
    const result = orderNumbersPlugin()(baseConfig([ordersCollection, other]))

    expect(fieldNames(result, 'products')).toEqual(['title'])
  })

  it('returns the config unchanged when the orders collection is absent', () => {
    const input = baseConfig([{ slug: 'products', fields: [] }])
    const result = orderNumbersPlugin()(input)

    expect(result).toBe(input)
  })

  it('keeps existing hooks on the orders collection', () => {
    const existing = (): null => null
    const withHook: CollectionConfig = {
      ...ordersCollection,
      hooks: { beforeChange: [existing as never] },
    }
    const result = orderNumbersPlugin()(baseConfig([withHook]))
    const hooks = result.collections?.find((entry) => entry.slug === 'orders')?.hooks?.beforeChange

    expect(hooks).toHaveLength(2)
    expect(hooks?.[0]).toBe(existing)
  })

  it('still adds the fields when disabled, so the database keeps its shape', () => {
    const result = orderNumbersPlugin({ disabled: true })(baseConfig([ordersCollection]))

    expect(fieldNames(result, 'orders')).toContain('orderNumber')
  })

  it('marks both fields unique so the database enforces it', () => {
    const result = orderNumbersPlugin()(baseConfig([ordersCollection]))
    const collection = result.collections?.find((entry) => entry.slug === 'orders')
    const added = (collection?.fields ?? []).filter(
      (field) => 'name' in field && ['orderNumber', 'orderSequence'].includes(String(field.name)),
    )

    expect(added).toHaveLength(2)
    added.forEach((field) => {
      expect(field).toMatchObject({ index: true, unique: true })
    })
  })
})
