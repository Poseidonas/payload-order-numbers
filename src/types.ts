export type OrderNumbersConfig = {
  /**
   * How many times to look for a free sequence value before giving up.
   * Each attempt is one insert into the reservations collection.
   * Defaults to 50, which covers 50 orders arriving in the same instant.
   */
  attempts?: number
  /**
   * Disables the plugin while leaving the fields in place, so that an
   * existing database keeps its shape.
   */
  disabled?: boolean
  /**
   * Name of the field holding the formatted number. Defaults to 'orderNumber'.
   */
  fieldName?: string
  /**
   * Slug of the orders collection. Defaults to 'orders'.
   */
  ordersSlug?: string
  /**
   * Minimum width of the numeric part, left padded with zeros.
   * 5 turns 42 into 00042. Defaults to 0, meaning no padding.
   */
  padding?: number
  /**
   * Text placed before the number. Defaults to an empty string.
   */
  prefix?: string
  /**
   * Slug of the collection that holds reserved sequence values.
   * Defaults to 'order-number-reservations'.
   */
  reservationsSlug?: string
  /**
   * Name of the numeric field the sequence is read from. Defaults to 'orderSequence'.
   */
  sequenceFieldName?: string
  /**
   * Value given to the first order. Defaults to 1.
   */
  startAt?: number
  /**
   * Text placed after the number. Defaults to an empty string.
   */
  suffix?: string
}

export type ResolvedConfig = Required<Omit<OrderNumbersConfig, 'disabled'>> & {
  disabled: boolean
}
