import type { CollectionConfig, Payload } from 'payload'

import type { ResolvedConfig } from './types.js'

export const reservationsCollection = (config: ResolvedConfig): CollectionConfig => ({
  slug: config.reservationsSlug,
  access: {
    create: () => false,
    delete: () => false,
    read: () => false,
    update: () => false,
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'sequence',
      type: 'number',
      index: true,
      required: true,
      unique: true,
    },
  ],
})

const highestReserved = async (
  config: ResolvedConfig,
  payload: Payload,
): Promise<null | number> => {
  const result = await payload.find({
    collection: config.reservationsSlug,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    sort: '-sequence',
  })

  const top = result.docs[0] as undefined | { sequence?: unknown }
  const value = top?.sequence

  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : null
}

export const reserveSequence = async (
  config: ResolvedConfig,
  payload: Payload,
): Promise<null | number> => {
  const highest = await highestReserved(config, payload)
  let candidate = highest === null ? config.startAt : highest + 1

  if (candidate < config.startAt) {
    candidate = config.startAt
  }

  for (let attempt = 0; attempt < config.attempts; attempt += 1) {
    try {
      await payload.create({
        collection: config.reservationsSlug,
        data: { sequence: candidate },
        depth: 0,
        overrideAccess: true,
      })

      return candidate
    } catch {
      candidate += 1

      if (attempt > 0 && attempt % 10 === 0) {
        const latest = await highestReserved(config, payload)

        if (latest !== null && latest >= candidate) {
          candidate = latest + 1
        }
      }
    }
  }

  return null
}
