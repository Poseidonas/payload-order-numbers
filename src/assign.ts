import type { CollectionBeforeChangeHook } from 'payload'

import { formatOrderNumber } from './format.js'
import { reserveSequence } from './reservations.js'
import type { ResolvedConfig } from './types.js'

export const assignOrderNumber =
  (config: ResolvedConfig): CollectionBeforeChangeHook =>
  async ({ data, operation, req }) => {
    if (config.disabled || operation !== 'create') {
      return data
    }

    if (typeof data[config.sequenceFieldName] === 'number') {
      return data
    }

    const sequence = await reserveSequence(config, req.payload)

    if (sequence === null) {
      req.payload.logger.error(
        `payload-order-numbers: no free sequence value after ${config.attempts} attempts`,
      )

      return data
    }

    return {
      ...data,
      [config.fieldName]: formatOrderNumber(sequence, config),
      [config.sequenceFieldName]: sequence,
    }
  }
