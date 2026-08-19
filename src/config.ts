import type { OrderNumbersConfig, ResolvedConfig } from './types.js'

const positiveInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  const rounded = Math.trunc(value)

  return rounded > 0 ? rounded : fallback
}

const nonNegativeInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  const rounded = Math.trunc(value)

  return rounded >= 0 ? rounded : fallback
}

const text = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback

export const resolveConfig = (incoming: OrderNumbersConfig = {}): ResolvedConfig => ({
  attempts: positiveInteger(incoming.attempts, 50),
  disabled: incoming.disabled === true,
  fieldName: text(incoming.fieldName, 'orderNumber') || 'orderNumber',
  ordersSlug: text(incoming.ordersSlug, 'orders') || 'orders',
  padding: nonNegativeInteger(incoming.padding, 0),
  prefix: text(incoming.prefix, ''),
  reservationsSlug:
    text(incoming.reservationsSlug, 'order-number-reservations') || 'order-number-reservations',
  sequenceFieldName: text(incoming.sequenceFieldName, 'orderSequence') || 'orderSequence',
  startAt: positiveInteger(incoming.startAt, 1),
  suffix: text(incoming.suffix, ''),
})
