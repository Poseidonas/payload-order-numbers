import type { ResolvedConfig } from './types.js'

export const formatOrderNumber = (sequence: number, config: ResolvedConfig): string => {
  const digits = String(sequence)
  const padded = digits.length >= config.padding ? digits : digits.padStart(config.padding, '0')

  return `${config.prefix}${padded}${config.suffix}`
}
