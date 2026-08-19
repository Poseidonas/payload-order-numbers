import type { Config } from 'payload'

import { assignOrderNumber } from './assign.js'
import { resolveConfig } from './config.js'
import { orderNumberField, orderSequenceField } from './fields.js'
import { reservationsCollection } from './reservations.js'
import type { OrderNumbersConfig } from './types.js'

export { formatOrderNumber } from './format.js'
export type { OrderNumbersConfig } from './types.js'

export const orderNumbersPlugin =
  (incoming: OrderNumbersConfig = {}) =>
  (incomingConfig: Config): Config => {
    const config = resolveConfig(incoming)
    const collections = incomingConfig.collections ?? []
    const orders = collections.find((collection) => collection.slug === config.ordersSlug)

    if (!orders) {
      return incomingConfig
    }

    const hooks = orders.hooks ?? {}

    return {
      ...incomingConfig,
      collections: [
        ...collections.map((collection) =>
          collection.slug === config.ordersSlug
            ? {
                ...collection,
                fields: [
                  ...collection.fields,
                  orderNumberField(config),
                  orderSequenceField(config),
                ],
                hooks: {
                  ...hooks,
                  beforeChange: [...(hooks.beforeChange ?? []), assignOrderNumber(config)],
                },
              }
            : collection,
        ),
        reservationsCollection(config),
      ],
    }
  }
