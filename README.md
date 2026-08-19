# payload-order-numbers

[![npm](https://img.shields.io/npm/v/payload-order-numbers?style=flat-square&color=0F766E)](https://www.npmjs.com/package/payload-order-numbers) ![node](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square) ![license](https://img.shields.io/badge/license-MIT-6C757D?style=flat-square)

Gives every Payload order a short, human readable number such as `ORD-01042`, assigned in sequence and unique under concurrency, so that a customer and a shop can refer to the same order out loud.

- Works with `@payloadcms/plugin-ecommerce` and with any collection that holds orders
- Verified on Payload 3.88 against both PostgreSQL and MongoDB
- No runtime dependencies
- No admin components, so it survives minor releases

## Install

```bash
pnpm add payload-order-numbers
```

```ts
import { orderNumbersPlugin } from 'payload-order-numbers'

export default buildConfig({
  plugins: [
    orderNumbersPlugin({
      prefix: 'ORD-',
      padding: 5,
      startAt: 1000,
    }),
  ],
})
```

The first order becomes `ORD-01000`, the next `ORD-01001`, and so on.

## What was measured

A Payload document identifier is not something you can read to a customer over the phone. Measured on a live Payload 3.88 install:

| Database | What an order id looks like |
| --- | --- |
| MongoDB | `6a85cce9ce631c0034f52d84`, a 24 character ObjectId |
| PostgreSQL | `1`, `2`, `3`, an auto incrementing integer |

The MongoDB identifier is unusable as an order reference. The PostgreSQL identifier is readable, but it starts at 1, carries no prefix, and tells anyone who sees it exactly how many orders the shop has taken.

### Why the obvious approach does not work

The first design read the highest existing number and added one, inside a `beforeChange` hook. Measured with 25 orders created in the same instant:

| Design | Orders that succeeded | Why |
| --- | --- | --- |
| `beforeChange`, highest plus one | 5 of 25 | every request reads the same highest value inside its own transaction |
| `afterChange` with retry | 3 of 25 | retrying inside the same aborted transaction cannot succeed |
| Reservation committed separately | 25 of 25 | each number is claimed in its own transaction and is immediately visible |

No design ever produced a duplicate. The unique index held in every run. The failures were refusals, not corruption.

### How it works now

Before an order is written, the plugin claims the next free value by inserting it into a small reservations collection. That insert commits on its own, so a second order arriving at the same moment sees the claim and takes the next value. The unique index on the order number is the final guarantee, not the first line of defence.

Verified with 25 orders created simultaneously:

| Database | Orders with a number | Unique | Gaps |
| --- | --- | --- | --- |
| MongoDB | 25 of 25 | 25 of 25 | none |
| PostgreSQL | 25 of 25 | 25 of 25 | none |

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `attempts` | `50` | How many values to try before giving up. Each attempt is one insert |
| `disabled` | `false` | Stops assigning numbers but keeps the fields, so the database keeps its shape |
| `fieldName` | `'orderNumber'` | Field holding the formatted number |
| `ordersSlug` | `'orders'` | Slug of the orders collection |
| `padding` | `0` | Minimum width of the numeric part, left padded with zeros |
| `prefix` | `''` | Text placed before the number |
| `reservationsSlug` | `'order-number-reservations'` | Collection holding claimed values |
| `sequenceFieldName` | `'orderSequence'` | Numeric field the sequence is read from |
| `startAt` | `1` | Value given to the first order |
| `suffix` | `''` | Text placed after the number |

A value that cannot be used is replaced by its default rather than being applied. A negative `padding` becomes `0`, a `startAt` of `0` becomes `1`, and `4.9` becomes `4`. Nothing is silently reinterpreted: `-5` never becomes `5`.

## What it adds to your database

| Collection | Field | Type | Notes |
| --- | --- | --- | --- |
| your orders collection | `orderNumber` | text | unique, indexed, read only in the admin sidebar |
| your orders collection | `orderSequence` | number | unique, indexed, hidden |
| `order-number-reservations` | `sequence` | number | unique, indexed. Collection hidden, no API access |

The reservations collection is closed to create, read, update and delete through the API. It is written only by the plugin.

## Honest limits

**PostgreSQL needs a large enough connection pool.** Claiming a number opens a second connection while the order's own transaction holds the first. With the `pg` default of 10, ten simultaneous orders exhaust the pool and the eleventh waits forever. Measured exactly:

| Simultaneous orders | Result with the default pool of 10 |
| --- | --- |
| 2, 4, 6, 8, 10 | all succeed |
| 15 | 3 succeed, the rest time out |

Set the pool to at least twice the number of orders you expect in the same instant:

```ts
postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URI, max: 60 },
})
```

MongoDB is not affected and needs no change.

**Numbers can have gaps.** A claimed value is not returned if the order then fails to save. The sequence stays ascending and unique, but it is not a gapless accounting series. If you need one for invoices, that is a different guarantee and belongs in a different package.

**Existing orders are not renumbered.** The plugin only assigns a number when an order is created. Orders already in the database keep an empty `orderNumber`.

**Under extreme load the order still saves.** If all `attempts` are exhausted the order is written without a number and an error is logged. Losing a sale is worse than losing a label.

## License

MIT. Copyright George Vasiliades, https://github.com/Poseidonas
