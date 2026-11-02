---
title: "Factories: ok, err, tryCatch"
description: "Create typed Results and Options: ok, err, fromPredicate,
  fromThrowable, tryCatch, fromPromise and friends — the narrowest possible
  return types."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/factories
---

Core constructors — barrel export.

Re-exports all factory/constructor functions for creating Result and Option values.

## Functions

### asyncErr()

Creates a resolved async failure result.

```ts
export function asyncErr<E>(error: E): Promise<IResultOfT<never, E>>;
```

Defined in: [factories/asyncErr.ts](https://github.com/sandlada/result/blob/main/src/factories/asyncErr.ts)

#### Example

```ts
import { asyncErr } from '@sandlada/result/factories';
const r = asyncErr('bad'); // Promise<IResultOfT<never, string>>
```

***

### asyncOk()

Creates a resolved async success result.

```ts
export function asyncOk<T>(value: T): Promise<IResultOfT<T, never>>;
```

Defined in: [factories/asyncOk.ts](https://github.com/sandlada/result/blob/main/src/factories/asyncOk.ts)

#### Example

```ts
import { asyncOk } from '@sandlada/result/factories';
const r = asyncOk(42); // Promise<IResultOfT<number, never>>
```

***

### err()

Creates a failure result carrying an error. The value type is `never` as a failure result has no meaningful value.

The dual-parameter overload (`err<T, E>(error)`) lets consumers widen the
returned type without an explicit cast when the surrounding context already
declares a wider value channel. See `ok.ts` for the symmetric rationale.

F# equivalent: `Error e`

```ts
export function err<E>(error: E): IResultOfT<never, E>;
export function err<T, E>(error: E): IResultOfT<T, E>;
```

Defined in: [factories/err.ts](https://github.com/sandlada/result/blob/main/src/factories/err.ts)

#### Example

```ts
import { err } from '@sandlada/result/factories';
import type { IResultOfT } from '@sandlada/result';
const r = err('something went wrong'); // IResultOfT<never, string>

// Inside a wider context the T parameter widens automatically:
const widen = <T>(): IResultOfT<T, string> => err('boom');
```

***

### fromPredicate()

Tests a value against a predicate and wraps it in a Result. Returns `Ok(value)` if the predicate passes, `Err(errorOnFalse)` otherwise.

F# equivalent: custom `Result.fromPredicate`

```ts
export function fromPredicate<T, E>(
    predicate: (v: T) => boolean,
    errorOnFalse: E,
): (value: T) => IResultOfT<T, E>;
export function fromPredicate<T, E>(
    predicate: (v: T) => boolean,
    errorOnFalse: E,
    value: T,
): IResultOfT<T, E>;
```

Defined in: [factories/fromPredicate.ts](https://github.com/sandlada/result/blob/main/src/factories/fromPredicate.ts)

#### Example

```ts
import { fromPredicate } from '@sandlada/result/factories';

// Direct form
const r1 = fromPredicate((n: number) => n > 0, 'must be positive', 5);
// r1 = Ok(5)

// Curried form
const isPositive = fromPredicate((n: number) => n > 0, 'must be positive');
const r2 = isPositive(5);
// r2 = Ok(5)
```

***

### fromPromise()

Wraps a Promise into an async result, catching rejections.

```ts
export async function fromPromise<T, E = unknown>(
    promise: Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>>;
```

Defined in: [factories/fromPromise.ts](https://github.com/sandlada/result/blob/main/src/factories/fromPromise.ts)

#### Example

```ts
import { fromPromise } from '@sandlada/result/factories';
const r = await fromPromise(fetch('/api/data'));
```

***

### fromSafePromise()

Wraps a Promise into a Result. On resolve returns `ok(value)`;
on reject returns `err(error)`.

Mirrors `fromPromise`: takes an optional `errorFn` factory that maps a
rejection onto the developer's domain error shape. The error type defaults
to `Error` and is widened when an `errorFn` is supplied that returns a
different shape — e.g. `fromSafePromise<T, MyError>(p, e => new MyError(e))`.

```ts
export async function fromSafePromise<T, E = Error>(
    promise: Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>>;
```

Defined in: [factories/fromSafePromise.ts](https://github.com/sandlada/result/blob/main/src/factories/fromSafePromise.ts)

#### Example

```ts
import { fromSafePromise } from '@sandlada/result/factories';

const data = await fromSafePromise(Promise.resolve(42));
// Ok(42)
```

***

### fromThrowable()

Wraps a synchronous throwing function into a Result-returning function. Unlike `tryCatch`, `fromThrowable` returns a new function that returns `Result` — ideal for wrapping at definition time.

FP equivalent: lift a throwing function into the Result world.

```ts
export function fromThrowable<A extends unknown[], T, E = unknown>(
    fn: (...args: A) => T,
    errorFn?: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E>;
```

Defined in: [factories/fromThrowable.ts](https://github.com/sandlada/result/blob/main/src/factories/fromThrowable.ts)

#### Example

```ts
import { fromThrowable } from '@sandlada/result/factories';
const safeParse = fromThrowable(JSON.parse);
const r = safeParse('{"a":1}');
// r = Ok({ a: 1 })
```

***

### ok()

Creates a success result carrying a value. The error type is `never` since a success result has no meaningful error.

The dual-parameter overload (`ok<T, E>(value)`) lets consumers widen the
returned type without an explicit cast when the surrounding context already
declares a wider error channel (e.g. inside an operator that returns
`IResultOfT<B, E2>`). Without the overload, every consumer call site would
need a cast to bridge `IResultOfTSuccess<T>` into the wider channel.

F# equivalent: `Ok value`

```ts
export function ok(): IResult<never>;
export function ok<T>(value: T): IResultOfT<T, never>;
export function ok<T, E>(value: T): IResultOfT<T, E>;
```

Defined in: [factories/ok.ts](https://github.com/sandlada/result/blob/main/src/factories/ok.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import type { IResultOfT } from '@sandlada/result';
const r = ok(42); // IResultOfT<number, never>

// Inside a wider context the E parameter widens automatically:
const widen = <E>(): IResultOfT<number, E> => ok(42);
```

***

### tryCatch()

Executes a synchronous function that may throw, and wraps the result. Unlike `fromThrowable`, `tryCatch` executes the function immediately.

```ts
export function tryCatch<T, E = unknown>(
    fn: () => T,
    errorFn?: (error: unknown) => E,
): IResultOfT<T, E>;
```

Defined in: [factories/tryCatch.ts](https://github.com/sandlada/result/blob/main/src/factories/tryCatch.ts)

#### Example

```ts
import { tryCatch } from '@sandlada/result/factories';
const r = tryCatch(() => JSON.parse('{"a":1}'));
// r = Ok({ a: 1 })
```

***

### tryCatchAsync()

Wraps an async function, catching rejections as failures.

```ts
export async function tryCatchAsync<T, E = unknown>(
    fn: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>>;
```

Defined in: [factories/tryCatchAsync.ts](https://github.com/sandlada/result/blob/main/src/factories/tryCatchAsync.ts)

#### Example

```ts
import { tryCatchAsync } from '@sandlada/result/factories';
const r = await tryCatchAsync(
  () => fetch('/api/data'),
  e => new Error(String(e)),
);
// r = Ok(Response) or Err(Error)
```
