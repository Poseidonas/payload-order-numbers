import type { Field } from 'payload'

import type { ResolvedConfig } from './types.js'

export const orderNumberField = (config: ResolvedConfig): Field => ({
  name: config.fieldName,
  type: 'text',
  admin: {
    position: 'sidebar',
    readOnly: true,
  },
  index: true,
  label: 'Order number',
  unique: true,
})

export const orderSequenceField = (config: ResolvedConfig): Field => ({
  name: config.sequenceFieldName,
  type: 'number',
  admin: {
    hidden: true,
  },
  index: true,
  unique: true,
})
