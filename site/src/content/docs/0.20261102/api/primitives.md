---
title: "Primitives: cond, sequence, reduce"
description: "High-frequency building blocks: cond, condErr, sequence,
  sequenceAsyncResult, reduce, partitionOption and lift."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/primitives
---

Primitives — barrel export.

Re-exports small but commonly-missing helpers: `cond`, `condErr`, `sequence`,
`sequenceAsyncResult`, `reduce`, `partitionOption`, `lift`.

## Interfaces

### Partitioned

Defined in: [primitives/partitionOption.ts:22](https://github.com/sandlada/result/blob/main/src/primitives/partitionOption.ts#L22)

`partitionOption` — splits an array of `IOption<T>` into its `Some`
values and the **indices** of `None`s. The index array is preserved so callers
can match the original list (useful when validating a fixed-shape schema).

Unlike separate, which partitions `IResultOfT` into `Ok`/`Err` values,
`partitionOption` returns only `Some` values plus the **indices** of `None`s
(because `None` carries no payload to preserve). If you need the `None`
indices for `IResultOfT`, use `combineWithAllErrors` instead.

#### Example

```ts
import { partitionOption } from '@sandlada/result/primitives';
import { ofSome, ofNone } from '@sandlada/result/option';

partitionOption([ofSome(1), ofNone(), ofSome(3), ofNone()]);
// { some: [1, 3], noneIndices: [1, 3] }
```

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-noneindices" /> `noneIndices` | `readonly` | readonly `number`\[] |
| <a id="property-some" /> `some` | `readonly` | readonly `T`\[] |

## Functions

### cond()

`cond` — the value-aware form of `fromPredicate`. Returns `Ok(value)`
when the predicate passes, otherwise `Err(errorOnFalse)`.

Unlike `fromPredicate`, `cond` always carries the original value through, so it
is the natural choice when the failure branch also needs the value (e.g. "value
not in allowed set" → `Err({ value, allowed })`).

If `predicate(value)` returns `true`, yields `Ok(value)`; otherwise yields
`Err(errorOnFalse)`.

```ts
export function cond<T, E>(
    predicate: (value: T) => boolean,
    errorOnFalse: E,
    value: T,
): IResultOfT<T, E>;
```

Defined in: [primitives/cond.ts](https://github.com/sandlada/result/blob/main/src/primitives/cond.ts)

#### Example

```ts
import { cond } from '@sandlada/result/primitives';

const r1 = cond(n => n > 0, 'must be positive', 5); // Ok(5)
const r2 = cond(n => n > 0, 'must be positive', -1); // Err('must be positive')
```

***

### condErr()

`condErr` — the inverse of [cond](/0.20261102/api/primitives/#cond). When the predicate passes,
returns `Err(errorOnTrue)`; otherwise returns `Ok(okValue)`.

Use it when a *presence* condition should fail (e.g. "found a forbidden character
→ Err").

```ts
export function condErr<T, E>(
    predicate: (value: T) => boolean,
    okValue: T,
    errorOnTrue: E,
): IResultOfT<T, E>;
```

Defined in: [primitives/condErr.ts](https://github.com/sandlada/result/blob/main/src/primitives/condErr.ts)

#### Example

```ts
import { condErr } from '@sandlada/result/primitives';

const r1 = condErr(s => s.includes('@'), 'alice@x', 'invalid email'); // Err('invalid email')
const r2 = condErr(s => s.includes('@'), 'no-at',    'invalid email'); // Ok('no-at')
```

***

### lift()

`lift` — lift a (possibly throwing) function into the
`IResultOfT` context. This is the `fromThrowable` cousin that **never** marks
the failure channel: use it for synchronous, total functions where you want the
`Result` shape for pipeline uniformity without an error type.

If `fn` throws, the error is captured under the supplied `errorFn`. If no
`errorFn` is given, thrown errors propagate out of `lift(...)` itself (matching
`unwrapOr`'s documented throw policy).

**Note on `E = never`**: the single-argument overload has default error type
`never`. This reflects the **type-level** guarantee that the function never
produces an `Err` when no `errorFn` is supplied — but the function itself can
still throw at runtime, in which case the throw propagates synchronously to
the caller. If you want all errors funneled into the `Err` channel, supply
an `errorFn`.

```ts
export function lift<A extends unknown[], T, E = never>(
    fn: (...args: A) => T,
): (...args: A) => IResultOfT<T, E>;
export function lift<A extends unknown[], T, E>(
    fn: (...args: A) => T,
    errorFn: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E>;
```

Defined in: [primitives/lift.ts](https://github.com/sandlada/result/blob/main/src/primitives/lift.ts)

#### Example

```ts
import { lift } from '@sandlada/result/primitives';

const safeParseInt = lift((s: string) => Number.parseInt(s, 10), (e) => new Error(String(e)));
safeParseInt('21');   // Ok(21)
safeParseInt('xx');   // Err(Error('...'))

const double = lift((n: number) => n * 2); // E = never; cannot produce Err.
double(21); // Ok(42) - but if the function throws, the throw escapes.
```

***

### partitionOption()

Single pass over `opts`, accumulating `Some` values and the indices of `None`s.

***

```ts
export function partitionOption<T>(opts: readonly IOption<T>[]): Partitioned<T>;
```

Defined in: [primitives/partitionOption.ts](https://github.com/sandlada/result/blob/main/src/primitives/partitionOption.ts)

### reduce()

`reduce` — fold a list of `IResultOfT<T, E>` into a single
`IResultOfT<Acc, E>` via a `(acc, value, index) => IResultOfT<Acc, E>` step.
Short-circuits on the first failure returned by either the source list or the
step function.

Folds `items` left-to-right. If any item is `Err`, the reducer is skipped and the
failure is returned. If the reducer itself returns `Err`, processing stops.

```ts
export function reduce<T, E, Acc>(
    reducer: (acc: Acc, value: T, index: number) => IResultOfT<Acc, E>,
    initial: Acc,
    items: readonly IResultOfT<T, E>[],
): IResultOfT<Acc, E>;
```

Defined in: [primitives/reduce.ts](https://github.com/sandlada/result/blob/main/src/primitives/reduce.ts)

#### Example

```ts
import { reduce } from '@sandlada/result/primitives';
import { ok, err } from '@sandlada/result/factories';

// Sum a list of validated numbers, accumulating their domain errors otherwise.
const r = reduce<number, string, number>(
  (sum, n) => n === 0 ? err('zero not allowed') : ok(sum + n),
  0,
  [ok(1), ok(2), ok(3)],
); // Ok(6)
```

***

### sequence()

`sequence` — alias of [combine](/0.20261102/api/combine/#combine). Provided for readers familiar
with Rust/Haskell where "sequence" means turning `[Result<T, E>]` into
`Result<T[], E>`. The behaviour is identical to `combine`; pick whichever name
matches your codebase's vocabulary.

Converts `[IResultOfT<T, E>]` into `IResultOfT<readonly T[], E>`,
short-circuiting on the first failure. The `readonly` modifier matches
`combine`'s tuple-overload output for runtime-sized `readonly` arrays.

```ts
export function sequence<T, E>(
    results: readonly IResultOfT<T, E>[],
): IResultOfT<readonly T[], E>;
```

Defined in: [primitives/sequence.ts](https://github.com/sandlada/result/blob/main/src/primitives/sequence.ts)

#### Example

```ts
import { sequence } from '@sandlada/result/primitives';
import { ok, err } from '@sandlada/result/factories';

sequence([ok(1), ok(2), ok(3)]); // Ok([1, 2, 3])
sequence([ok(1), err('a')]);    // Err('a')
```

***

### sequenceAsyncResult()

Lazy analogue of [sequence](/0.20261102/api/primitives/#sequence). Converts `AsyncResult<T, E>[]`
into `AsyncResult<T[], E>` without executing any inner `run()`. The returned
thunk short-circuits on the first failure when finally awaited.

Equivalent to `combine` from `@sandlada/result/async-result`, exposed under a
name familiar to ROP practitioners.

```ts
export function sequenceAsyncResult<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E>;
```

Defined in: [primitives/sequenceAsyncResult.ts](https://github.com/sandlada/result/blob/main/src/primitives/sequenceAsyncResult.ts)

#### Example

```ts
import { sequenceAsyncResult } from '@sandlada/result/primitives';
import { fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';

const ar = sequenceAsyncResult([fromResult(ok(1)), fromResult(ok(2))]);
const r = await ar.run(); // Ok([1, 2])
```
