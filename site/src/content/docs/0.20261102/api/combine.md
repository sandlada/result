---
title: "Combine Results: combine, all"
description: "Combine several Results into one: combine and all fail fast on the
  first Err, combineWithAllErrors accumulates every error in input order."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/combine
---

Combine utilities — barrel export.

Re-exports result aggregation utilities for combining multiple Result values.

## Type Aliases

### AllResult

> **AllResult**\<`T`> = \{ `isFailure`: `false`; `isSuccess`: `true`; `value`: `TupleValues`\<`T`>; } | \{ `error`: `TupleErrors`\<`T`>; `isFailure`: `true`; `isSuccess`: `false`; }

Defined in: [combine/all.ts:15](https://github.com/sandlada/result/blob/main/src/combine/all.ts#L15)

Public return shape - split so the failure branch honestly carries no value:
the failure branch of the union has no `value` property at all, so the type
cannot claim a success tuple it never constructed.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* readonly [`IResultOfT`](/0.20261102/api/types/#iresultoft)\<`unknown`, `unknown`>\[] |

## Functions

### all()

Combines a tuple of results, preserving heterogeneous types. Returns the first
failure (with no projected success tuple) or a success tuple.

Like `Promise.all` but for Result.

**Cross-module divergence (intentional).** `combine/all` accepts an empty
tuple (`readonly IResultOfT<unknown, unknown>[]`) and returns `Ok([])`. The
sibling `option/all` has the same two-overload shape: its tuple overload
keeps the stricter `readonly [IOption<unknown>, ...IOption<unknown>[]]`
constraint, but its array overload accepts a runtime-sized list - so
`option/all([])` typechecks there as well and returns `Some([])`. The
`combine/all` constraint was relaxed so that `all([])` typechecks; the
`option/all` tuple constraint is left as-is because its tests pin the
stricter contract. See `combine/all.type-spec.ts` for the regression
test.

```ts
export function all<T extends readonly [IResultOfT<unknown, unknown>, ...IResultOfT<unknown, unknown>[]]>(
    results: readonly [...T],
): AllResult<T>;
export function all<T extends readonly IResultOfT<unknown, unknown>[]>(
    results: T,
): AllResult<T>;
```

Defined in: [combine/all.ts](https://github.com/sandlada/result/blob/main/src/combine/all.ts)

##### Example

```ts
import { all } from '@sandlada/result/combine';
import { ok } from '@sandlada/result/factories';
all([ok(1), ok('hi'), ok(true)]);
// Ok([1, 'hi', true])
```

Combines a tuple of results, preserving heterogeneous types. Returns the first
failure (with no projected success tuple) or a success tuple.

Like `Promise.all` but for Result.

**Cross-module divergence (intentional).** `combine/all` accepts an empty
tuple (`readonly IResultOfT<unknown, unknown>[]`) and returns `Ok([])`. The
sibling `option/all` has the same two-overload shape: its tuple overload
keeps the stricter `readonly [IOption<unknown>, ...IOption<unknown>[]]`
constraint, but its array overload accepts a runtime-sized list - so
`option/all([])` typechecks there as well and returns `Some([])`. The
`combine/all` constraint was relaxed so that `all([])` typechecks; the
`option/all` tuple constraint is left as-is because its tests pin the
stricter contract. See `combine/all.type-spec.ts` for the regression
test.

##### Example

```ts
import { all } from '@sandlada/result/combine';
import { ok } from '@sandlada/result/factories';
all([ok(1), ok('hi'), ok(true)]);
// Ok([1, 'hi', true])
```

***

### combine()

Combines an array of results. Returns the first failure, or a success with all values.

Rust equivalent: `Iterator::collect::<Result<Vec<_>, _>>()`

Two overloads:

* Tuple overload (`readonly IResultOfT<unknown, unknown>[]`): preserves
  per-position heterogeneous types — `combine([ok(1), ok('hi')])` yields
  `IResultOfT<[number, string], never>`.
* Homogeneous array overload (`readonly IResultOfT<A, E>[]`): collapses to
  `IResultOfT<A[], E>`. Useful when the input is a runtime-sized typed array
  that shares `A` and `E`.

```ts
export function combine<T extends readonly IResultOfT<unknown, unknown>[]>(
    results: readonly [...T],
): IResultOfT<
    { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
    T[number] extends IResultOfT<unknown, infer E> ? E : never
>;
export function combine<A, E>(
    results: readonly IResultOfT<A, E>[],
): IResultOfT<A[], E>;
```

Defined in: [combine/combine.ts](https://github.com/sandlada/result/blob/main/src/combine/combine.ts)

#### Example

```ts
import { combine } from '@sandlada/result/combine';
import { ok, err } from '@sandlada/result/factories';
import type { IResultOfT } from '@sandlada/result';

// Heterogeneous tuple — each position keeps its own type.
combine([ok(1), ok('a')]); // Ok([1, 'a'])

// Homogeneous array.
const arr: IResultOfT<number, string>[] = [ok(1), ok(2), ok(3)];
combine(arr); // Ok([1, 2, 3])

combine([ok(1), err('fail'), ok(3)]); // Err('fail')
```

***

### combineWithAllErrors()

Combines results accumulating **all** errors (validation aggregation). Unlike `combine` (short-circuit on first failure), this collects every error.

Wlaschin equivalent: `&&&` (parallel AND in the ROP model)

```ts
export function combineWithAllErrors<A, E>(
    results: readonly IResultOfT<A, E>[],
): IResultOfT<A[], E[]>;
```

Defined in: [combine/combineWithAllErrors.ts](https://github.com/sandlada/result/blob/main/src/combine/combineWithAllErrors.ts)

#### Example

```ts
import { combineWithAllErrors } from '@sandlada/result/combine';
import { ok, err } from '@sandlada/result/factories';
combineWithAllErrors([ok(1), err('a'), err('b')]);
// Err(['a', 'b'])
```
