---
title: Lazy AsyncResult operators
description: "Operators for lazy AsyncResult<T, E> thunks: mapAsync, bind,
  catchErr, combineWithAllErrors, match and terminal unwrap variants that run
  the thunk."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/async-result
---

AsyncResult — barrel export.

Re-exports all AsyncResult factories and operators.

## Functions

### and()

Returns `res2` if `res1` is `Ok`, otherwise returns the original `Err`.
Short-circuiting — `res2` is not evaluated when `res1` is `Err`.

```ts
export function and<T, U, E>(
    res1: AsyncResult<T, E>,
    res2: AsyncResult<U, E>,
): AsyncResult<U, E>;
```

Defined in: [async-result/and.ts](https://github.com/sandlada/result/blob/main/src/async-result/and.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, and } from '@sandlada/result/async-result';

const r1 = await and(fromResult(ok(1)), fromResult(ok(2))).run(); // Ok(2)
const r2 = await and(fromResult(err<string>('a')), fromResult(ok(2))).run(); // Err('a')
```

***

### andTee()

Side-effect on success (sync or async), ignoring the callback's result.
Calls `fn` with the value on success and passes the original result through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `err(caughtError)` (canonical tap/tee policy — see AGENTS.md).

```ts
export function andTee<T, E>(
    fn: (value: T) => void | unknown | Promise<void | unknown>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function andTee<T, E>(
    fn: (value: T) => void | unknown | Promise<void | unknown>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
```

Defined in: [async-result/andTee.ts](https://github.com/sandlada/result/blob/main/src/async-result/andTee.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, andTee } from '@sandlada/result/async-result';

const ar = andTee((v: number) => { console.log(v); }, fromResult(ok(42)));
const result = await ar.run(); // Ok(42)
```

***

### andThrough()

Side-effect on success that can propagate errors. Calls `fn` with the value on success; if `fn` fails the failure widens into the original error type.

```ts
export function andThrough<T, E, F>(
    fn: (value: T) => AsyncResult<unknown, F> | Promise<IResultOfT<unknown, F>>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>;
export function andThrough<T, E, F>(
    fn: (value: T) => AsyncResult<unknown, F> | Promise<IResultOfT<unknown, F>>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E | F>;
```

Defined in: [async-result/andThrough.ts](https://github.com/sandlada/result/blob/main/src/async-result/andThrough.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, andThrough } from '@sandlada/result/async-result';

const validate = andThrough(
  (v: number) => v > 0 ? fromResult(ok(undefined)) : Promise.reject(new Error('non-positive')),
  fromResult(ok(42)),
);
const result = await validate.run(); // Ok(42)
```

***

### ap()

AsyncResult applicative `ap` — applies a function wrapped in an
AsyncResult to a value wrapped in an AsyncResult. If either is a failure, the
first failure propagates.

The function-result and value-result are allowed to have **different** error
types — the combined error widens to `E | F`. Matches the sync `ap` from
`@sandlada/result/operators`.

Mirrors the sync `ap` for AsyncResult pipelines, matching the fp-ts
`Apply` shape.

**Execution**: both carriers are started when `.run()` is called and run
concurrently - `ap` needs both sides, so it never short-circuits.

**Throw policy**: a throwing applied function is captured as `Err(thrown)`.

```ts
export function ap<A, B, E, F>(
    fnResult: AsyncResult<(a: A) => B, E>,
): (result: AsyncResult<A, F>) => AsyncResult<B, E | F>;
export function ap<A, B, E, F>(
    fnResult: AsyncResult<(a: A) => B, E>,
    result: AsyncResult<A, F>,
): AsyncResult<B, E | F>;
```

Defined in: [async-result/ap.ts](https://github.com/sandlada/result/blob/main/src/async-result/ap.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, ap } from '@sandlada/result/async-result';

const applied = await ap(fromResult(ok((x: number) => x * 2)), fromResult(ok(21))).run();
// Ok(42)
```

***

### bimap()

Simultaneously maps both variants of an AsyncResult.

**Throw policy**: If `onOk` or `onErr` throws (or rejects), the result converts
to `err(caughtError)`. Pass `errorFn` to customise how the thrown/rejected
value maps onto your error union.

```ts
export function bimap<T, E, U, F>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => F | Promise<F>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, F>;
export function bimap<T, E, U, F>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => F | Promise<F>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => F,
): AsyncResult<U, F>;
```

Defined in: [async-result/bimap.ts](https://github.com/sandlada/result/blob/main/src/async-result/bimap.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, bimap } from '@sandlada/result/async-result';

const ar = bimap(
  (v: number) => v.toString(),
  (e: number) => e * 2,
  fromResult(ok(5)),
);
const result = await ar.run(); // Ok('5')
```

***

### bind()

Chains an AsyncResult-returning function on success (monadic bind / flatMap).
Supports interoperability with standard `Promise<IResultOfT>`.
Lazy — returns a new AsyncResult without executing the inner computation.

The outer AsyncResult's error type and the inner callback's returned
AsyncResult error type are independent — the combined result widens to
`E | F`. Mirrors the sync `operators/bind.ts` so heterogeneous-error
pipelines (`AppError`/`DbError`) compose without manual unification.

**Throw policy**: If `fn` throws (sync) or rejects (async), the result
converts to `err(caughtError)`. Pass `errorFn` to customise how the
thrown/rejected value maps onto your error union — e.g.
`bind(fn, thrown => new MyError(String(thrown)))`.

```ts
export function bind<T, U, E, F>(
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E | F>;
export function bind<T, U, E, F>(
    fn: (value: T) => AsyncResult<U, F> | Promise<IResultOfT<U, F>>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E | F,
): AsyncResult<U, E | F>;
```

Defined in: [async-result/bind.ts](https://github.com/sandlada/result/blob/main/src/async-result/bind.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, bind } from '@sandlada/result/async-result';

type AppError = { readonly kind: 'App' };
type DbError = { readonly kind: 'Db' };

// Heterogeneous errors - outer AppError, inner DbError, result widens.
const ar = bind<number, number, AppError, DbError>(
    (id) => fromResult<number, DbError>(ok(id + 1)),
    fromResult<number, AppError>(ok(1)),
);
// AsyncResult<number, AppError | DbError>
```

***

### catchErr()

Async variant of `catchErr` for `AsyncResult`.

Recovers from an error by returning a fallback value `T` (or a Promise resolving to `T`),
keeping the result track alive as a successful `AsyncResult<T, never>`.

**Throw policy**: failures inside `onErr` (sync throw or rejected Promise) are
captured into `Err(thrown)`, mirroring `orElse` / `filterOrElse`. A rejection of
the source `AsyncResult` itself still propagates.

```ts
export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (ar: AsyncResult<A, E>) => AsyncResult<A, never>;
export function catchErr<A, E>(
    onErr: (e: E) => A | Promise<A>,
    ar: AsyncResult<A, E>,
): AsyncResult<A, never>;
```

Defined in: [async-result/catchErr.ts](https://github.com/sandlada/result/blob/main/src/async-result/catchErr.ts)

#### Example

```ts
import { catchErr, fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result/factories';
const r = await catchErr((e: string) => 0, fromResult(err('boom'))).run();
// Ok(0)
```

***

### combine()

Combines an array of AsyncResults into a single AsyncResult of an array.
Short-circuits on the first failure (like `Promise.all`).
Lazy — returns a new AsyncResult without executing the inner computations.

```ts
export function combine<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E>;
```

Defined in: [async-result/combine.ts](https://github.com/sandlada/result/blob/main/src/async-result/combine.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, combine } from '@sandlada/result/async-result';

const ar = combine([fromResult(ok(1)), fromResult(ok(2))]);
const result = await ar.run(); // Ok([1, 2])
```

***

### combineWithAllErrors()

Combines AsyncResults accumulating **all** errors (validation aggregation).
Unlike `combine` (short-circuit on first failure), this collects every error.
Lazy — returns a new AsyncResult without executing the inner computations.

```ts
export function combineWithAllErrors<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], E[]>;
```

Defined in: [async-result/combineWithAllErrors.ts](https://github.com/sandlada/result/blob/main/src/async-result/combineWithAllErrors.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, combineWithAllErrors } from '@sandlada/result/async-result';

const ar = combineWithAllErrors([
    fromResult(ok(1)),
    fromResult(err('a')),
    fromResult(err('b')),
]);
const result = await ar.run(); // Err(['a', 'b'])
```

***

### contains()

Returns a Promise\<boolean> indicating if the AsyncResult is success and contains the given value.

```ts
export function contains<T>(
    value: T,
): <E>(ar: AsyncResult<T, E>) => Promise<boolean>;
export function contains<T, E>(
    value: T,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
```

Defined in: [async-result/contains.ts](https://github.com/sandlada/result/blob/main/src/async-result/contains.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, contains } from '@sandlada/result/async-result';

const r = await contains(42, fromResult(ok(42))); // true
```

***

### containsErr()

Returns `true` if the `AsyncResult` resolves to `Err` and contains the
given value. Strict equality (`===`).

```ts
export function containsErr<T, E>(
    error: E,
): (ar: AsyncResult<T, E>) => Promise<boolean>;
export function containsErr<T, E>(
    error: E,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
```

Defined in: [async-result/containsErr.ts](https://github.com/sandlada/result/blob/main/src/async-result/containsErr.ts)

#### Example

```ts
import { err } from '@sandlada/result/factories';
import { fromResult, containsErr } from '@sandlada/result/async-result';

await containsErr('boom', fromResult(err('boom'))); // true
await containsErr('nope', fromResult(err('boom')));  // false
```

***

### exists()

Returns a Promise\<boolean> indicating if the AsyncResult is success and the predicate holds.

```ts
export function exists<T>(
    predicate: (value: T) => boolean | Promise<boolean>,
): <E>(ar: AsyncResult<T, E>) => Promise<boolean>;
export function exists<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    ar: AsyncResult<T, E>,
): Promise<boolean>;
```

Defined in: [async-result/exists.ts](https://github.com/sandlada/result/blob/main/src/async-result/exists.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, exists } from '@sandlada/result/async-result';

const r = await exists((v: number) => v > 0, fromResult(ok(42))); // true
```

***

### expect()

Like [unwrap](/0.20261102/api/async-result/#unwrap) but throws an `Error` carrying the supplied message.
Useful for marking program-contract violations with a domain-specific
message.

The original error value is preserved as `Error.cause` (and via the
optional `formatErr` hook for custom string shaping), so structured
`E` shapes don't get clobbered to `[object Object]`.

Pass `formatErr` to customise how the original error value is rendered
in the message; pass `throwingFn` to fully replace the thrown `Error`
class — e.g. `expect(msg, ar, info => new MyError(info.message, info.value))`.

```ts
export function expect<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    formatErr?: (error: E) => string,
): Promise<T>;
export function expect<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    formatErr: ((error: E) => string) | undefined,
    throwingFn: (info: { message: string; value: E }) => Error,
): Promise<T>;
```

Defined in: [async-result/expect.ts](https://github.com/sandlada/result/blob/main/src/async-result/expect.ts)

#### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result/factories';
import { expect } from '@sandlada/result/async-result';

await expect('config must be valid', fromResult(err('boom'))); // throws Error
// The thrown Error carries `cause: 'boom'` so the original payload is preserved.
```

***

### expectErr()

Like [unwrapErr](/0.20261102/api/async-result/#unwraperr) but throws an `Error` carrying the supplied message.
Useful when reaching a success path is itself a contract violation.

The original success value is preserved as `Error.cause` (and via the
optional `throwingFn` hook for full customisation), so structured `T`
shapes don't get lost.

```ts
export function expectErr<T, E>(
    message: string,
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E>;
```

Defined in: [async-result/expectErr.ts](https://github.com/sandlada/result/blob/main/src/async-result/expectErr.ts)

#### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
import { expectErr } from '@sandlada/result/async-result';

await expectErr('should have failed', fromResult(ok(42))); // throws Error
// The thrown Error carries `cause: 42` so the original success value is preserved.
```

***

### filterOrElse()

Filters the success value of an AsyncResult with a predicate.
If the predicate holds, the original success passes through. If it fails,
returns `err(errorFn(value))`. Failures pass through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the predicate or `errorFn` throws synchronously or
returns a rejected Promise, the error is caught and the result converts to
`err(caughtError)` (canonical catch+convert policy — see AGENTS.md).

```ts
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function filterOrElse<T, E>(
    predicate: (value: T) => boolean | Promise<boolean>,
    errorFn: (value: T) => E | Promise<E>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
```

Defined in: [async-result/filterOrElse.ts](https://github.com/sandlada/result/blob/main/src/async-result/filterOrElse.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, filterOrElse } from '@sandlada/result/async-result';
const ar = filterOrElse((x: number) => x > 0, (x: number) => `neg: ${x}`, fromResult(ok(42)));
const result = await ar.run(); // Ok(42)
```

***

### flatten()

Flattens a nested AsyncResult.

**Single-step only**: unwraps exactly one layer. Call `flatten` repeatedly
to flatten deeper nests.

```ts
export function flatten<T, E>(
    ar: AsyncResult<AsyncResult<T, E>, E>,
): AsyncResult<T, E>;
```

Defined in: [async-result/flatten.ts](https://github.com/sandlada/result/blob/main/src/async-result/flatten.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, flatten } from '@sandlada/result/async-result';

const nested = fromResult(ok(fromResult(ok(42))));
const ar = flatten(nested);
const result = await ar.run(); // Ok(42)
```

***

### from()

Creates an AsyncResult from a thunk that returns a Result or a
Promise\<Result>. The thunk is lazy - it won't execute until `.run()` is
called.

The carrier's `run()` always returns a Promise: a thunk that returns a plain
Result is awaited, and a thunk that throws synchronously surfaces as a
rejected promise instead of escaping as a raw exception.

```ts
export function from<T, E = unknown>(
    thunk: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
): AsyncResult<T, E>;
```

Defined in: [async-result/from.ts](https://github.com/sandlada/result/blob/main/src/async-result/from.ts)

#### Example

```ts
import type { AsyncResult } from '@sandlada/result';
import { from } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';

const ar: AsyncResult<number, string> = from(() => Promise.resolve(ok(42)));
const result = await ar.run(); // IResultOfT<number, string>
```

***

### fromPromise()

Wraps a `Promise<T>` into an AsyncResult, catching rejections.
The inner Promise is not yet created at construction time; the factory thunk is invoked
lazily when `.run()` is called.

```ts
export function fromPromise<T, E = unknown>(
    thunk: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): AsyncResult<T, E>;
```

Defined in: [async-result/fromPromise.ts](https://github.com/sandlada/result/blob/main/src/async-result/fromPromise.ts)

#### Example

```ts
import { fromPromise } from '@sandlada/result/async-result';
const ar = fromPromise(() => fetch('/api/data').then(r => r.json()));
const result = await ar.run();
```

***

### fromResult()

Wraps a sync `IResultOfT` into an AsyncResult (lifts a sync Result into the async world).
For transforming the success value with an async callback on a sync Result, see
`bridge-result` `map` instead.

```ts
export function fromResult<T, E = unknown>(
    result: IResultOfT<T, E>,
): AsyncResult<T, E>;
```

Defined in: [async-result/fromResult.ts](https://github.com/sandlada/result/blob/main/src/async-result/fromResult.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult } from '@sandlada/result/async-result';

const ar = fromResult(ok(42));
const result = await ar.run(); // IResultOfT<number, never>
```

***

### isErr()

Returns `true` if the `AsyncResult` resolves to `Err`. Mirrors the
`IResultOfT.isFailure` discriminator as a standalone function.

```ts
export function isErr<T, E>(ar: AsyncResult<T, E>): Promise<boolean>;
```

Defined in: [async-result/isErr.ts](https://github.com/sandlada/result/blob/main/src/async-result/isErr.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, isErr } from '@sandlada/result/async-result';

await isErr(fromResult(ok(42)));  // false
await isErr(fromResult(err('x'))); // true
```

***

### isOk()

Returns `true` if the `AsyncResult` resolves to `Ok`. Mirrors the
`IResultOfT.isSuccess` discriminator as a standalone function.

```ts
export function isOk<T, E>(ar: AsyncResult<T, E>): Promise<boolean>;
```

Defined in: [async-result/isOk.ts](https://github.com/sandlada/result/blob/main/src/async-result/isOk.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, isOk } from '@sandlada/result/async-result';

await isOk(fromResult(ok(42)));  // true
await isOk(fromResult(err('x'))); // false
```

***

### map()

Maps the success value of an AsyncResult using a synchronous function.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
Pass `errorFn` to customise how the thrown value maps onto your error union.

```ts
export function map<T, U, E>(
    fn: (value: T) => U,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function map<T, U, E>(
    fn: (value: T) => U,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E>;
```

Defined in: [async-result/map.ts](https://github.com/sandlada/result/blob/main/src/async-result/map.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, map } from '@sandlada/result/async-result';

const ar = map((x: number) => x * 2, fromResult(ok(21)));
const result = await ar.run(); // Ok(42)
```

***

### mapAsync()

Maps the success value of an AsyncResult. The callback may be
sync or async (`U | Promise<U>`); sync results are awaited internally.

Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: a synchronous throw from `fn` propagates as a rejection of
`.run()`; a rejected Promise from `fn` likewise propagates. The optional
`errorFn` only **remaps the rejection payload** — it does NOT convert the
rejection into an `Err`. The thrown value passed to `errorFn` is whatever
`.run()` would otherwise reject with; the returned value replaces that
rejection reason. This matches the canonical AsyncResult "propagates"
policy. For catch-and-convert behaviour (where the rejection becomes
`Err(mapped)`), use `map` (which has different throw semantics) or wrap
the operation in a try/catch.

```ts
export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<U, E>;
export function mapAsync<T, U, E>(
    fn: (value: T) => U | Promise<U>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<U, E>;
```

Defined in: [async-result/mapAsync.ts](https://github.com/sandlada/result/blob/main/src/async-result/mapAsync.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, mapAsync } from '@sandlada/result/async-result';

const ar = mapAsync((x: number) => x * 2, fromResult(ok(21)));
const result = await ar.run(); // Ok(42)
```

***

### mapErr()

Maps the error of an AsyncResult using a synchronous function.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If `fn` throws, the result converts to `err(caughtError)`.
Pass `errorFn` to customise how the thrown value maps onto your error union.

```ts
export function mapErr<T, E, F>(
    fn: (error: E) => F,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<T, F>;
export function mapErr<T, E, F>(
    fn: (error: E) => F,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => F,
): AsyncResult<T, F>;
```

Defined in: [async-result/mapErr.ts](https://github.com/sandlada/result/blob/main/src/async-result/mapErr.ts)

#### Example

```ts
import { err } from '@sandlada/result/factories';
import { fromResult, mapErr } from '@sandlada/result/async-result';

const ar = mapErr((e: string) => e.toUpperCase(), fromResult(err('oops')));
const result = await ar.run(); // Err('OOPS')
```

***

### mapErrAsync()

Maps the error of an AsyncResult using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

```ts
export function mapErrAsync<T, E, F>(
    fn: (error: E) => F | Promise<F>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, F>;
export function mapErrAsync<T, E, F>(
    fn: (error: E) => F | Promise<F>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, F>;
```

Defined in: [async-result/mapErrAsync.ts](https://github.com/sandlada/result/blob/main/src/async-result/mapErrAsync.ts)

#### Example

```ts
import { err } from '@sandlada/result/factories';
import { fromResult, mapErrAsync } from '@sandlada/result/async-result';

const ar = mapErrAsync(async (e: string) => e.toUpperCase(), fromResult(err('oops')));
const result = await ar.run(); // Err('OOPS')
```

***

### mapOr()

Maps the success value of an `AsyncResult`, or returns a default on failure.
The mapper may be sync or async. Sync throws from the mapper are caught
and converted to the default (canonical AsyncResult catch+convert policy).

```ts
export function mapOr<T, U, E>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
): (ar: AsyncResult<T, E>) => Promise<U>;
export function mapOr<T, U, E>(
    defaultValue: U,
    fn: (value: T) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): Promise<U>;
```

Defined in: [async-result/mapOr.ts](https://github.com/sandlada/result/blob/main/src/async-result/mapOr.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, mapOr } from '@sandlada/result/async-result';

const v1 = await mapOr(-1, (x: number) => x * 2, fromResult(ok(21))); // 42
const v2 = await mapOr(-1, (x: number) => x * 2, fromResult(err('x'))); // -1
```

***

### mapOrElse()

Maps the success value of an `AsyncResult`, or computes a default from the
error on failure. Both callbacks may be sync or async. Lazy — `onErr` is
only called on failure.

```ts
export function mapOrElse<T, U, E>(
    onErr: (error: E) => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
): (ar: AsyncResult<T, E>) => Promise<U>;
export function mapOrElse<T, U, E>(
    onErr: (error: E) => U | Promise<U>,
    fn: (value: T) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): Promise<U>;
```

Defined in: [async-result/mapOrElse.ts](https://github.com/sandlada/result/blob/main/src/async-result/mapOrElse.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, mapOrElse } from '@sandlada/result/async-result';

const v1 = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(ok(21))); // 42
const v2 = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(err('x'))); // -1
```

***

### match()

Terminal operator — executes the AsyncResult and applies either the success
handler or the error handler. Returns a `Promise<U>`.

```ts
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
): (ar: AsyncResult<T, E>) => Promise<U>;
export function match<T, E, U>(
    handlers: { ok: (value: T) => U | Promise<U>; err: (error: E) => U | Promise<U> },
    ar: AsyncResult<T, E>,
): Promise<U>;
```

Defined in: [async-result/match.ts](https://github.com/sandlada/result/blob/main/src/async-result/match.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, match } from '@sandlada/result/async-result';

const result = await match({
    ok: (x: number) => `got ${x}`,
    err: (e: string) => `error: ${e}`,
}, fromResult(ok(42))); // 'got 42'
```

***

### or()

Returns `res1` if it is `Ok`, otherwise returns `res2`. Short-circuiting —
`res2` is not evaluated when `res1` is `Ok`.

```ts
export function or<T, E, F>(
    res1: AsyncResult<T, E>,
    res2: AsyncResult<T, F>,
): AsyncResult<T, E | F>;
```

Defined in: [async-result/or.ts](https://github.com/sandlada/result/blob/main/src/async-result/or.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, or } from '@sandlada/result/async-result';

const r1 = await or(fromResult(ok(1)), fromResult(ok(2))).run(); // Ok(1)
const r2 = await or(fromResult(err<string>('a')), fromResult(ok(2))).run(); // Ok(2)
```

***

### orElse()

Recovers from failure by chaining to an alternative AsyncResult or Promise\<IResult>.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If `fn` throws (sync) or rejects (async), the result converts
to `err(caughtError)`. Pass `errorFn` to customise how the thrown value maps
onto your error union.

```ts
export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F> | Promise<IResultOfT<T, F>>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>;
export function orElse<T, E, F>(
    fn: (error: E) => AsyncResult<T, F> | Promise<IResultOfT<T, F>>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E | F,
): AsyncResult<T, E | F>;
```

Defined in: [async-result/orElse.ts](https://github.com/sandlada/result/blob/main/src/async-result/orElse.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, orElse } from '@sandlada/result/async-result';

const ar = orElse((e: string) => fromResult(ok(0)), fromResult(err('fail')));
const result = await ar.run(); // Ok(0)
```

***

### orTee()

Side-effect on failure (sync or async), ignoring the callback's result.
Calls `fn` with the error on failure and passes the original result through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

**Throw policy**: If the side-effect callback throws (or rejects), the result
converts to `err(caughtError)` (canonical tap/tee policy — see AGENTS.md).

```ts
export function orTee<T, E>(
    fn: (error: E) => void | unknown | Promise<void | unknown>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function orTee<T, E>(
    fn: (error: E) => void | unknown | Promise<void | unknown>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
```

Defined in: [async-result/orTee.ts](https://github.com/sandlada/result/blob/main/src/async-result/orTee.ts)

#### Example

```ts
import { err } from '@sandlada/result/factories';
import { fromResult, orTee } from '@sandlada/result/async-result';

const ar = orTee((e: string) => { console.error(e); }, fromResult(err('oops')));
const result = await ar.run(); // Err('oops')
```

***

### swapAsync()

AsyncResult analogue of swap. Swaps the Ok and Err
variants of an AsyncResult. Renamed from `swap` to align with `mapAsync` and
other async-result operators.

```ts
export function swapAsync<T, E>(
    ar: AsyncResult<T, E>,
): AsyncResult<E, T>;
```

Defined in: [async-result/swapAsync.ts](https://github.com/sandlada/result/blob/main/src/async-result/swapAsync.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, swapAsync } from '@sandlada/result/async-result';

const ar = swapAsync(fromResult(ok(5)));
const result = await ar.run(); // Err(5)
```

***

### tap()

Side-effect on the success track. Calls `fn` with the value on success
and passes the original result through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

The callback may be sync or async — `fn` is awaited internally so async
rejections surface before the original result is returned.

**Throw policy**: If `fn` throws or rejects, the result converts to
`err(caughtError)`. Pass `errorFn` to customise how the thrown value maps
onto your error union — e.g. `tap(fn, thrown => new MyError(String(thrown)))`.

```ts
export function tap<T, E>(
    fn: (value: T) => void | Promise<void>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tap<T, E>(
    fn: (value: T) => void | Promise<void>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<T, E>;
```

Defined in: [async-result/tap.ts](https://github.com/sandlada/result/blob/main/src/async-result/tap.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, tap } from '@sandlada/result/async-result';

// Sync callback
const ar = tap((v: number) => console.log('got:', v), fromResult(ok(42)));

// Async callback — also awaited
const ar2 = tap(async (v: number) => { console.log(v); }, fromResult(ok(42)));
```

***

### tapAsync()

Side-effect on the success track using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

```ts
export function tapAsync<T, E>(
    fn: (value: T) => void | Promise<void>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapAsync<T, E>(
    fn: (value: T) => void | Promise<void>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
```

Defined in: [async-result/tapAsync.ts](https://github.com/sandlada/result/blob/main/src/async-result/tapAsync.ts)

#### Example

```ts
import { ok } from '@sandlada/result/factories';
import { fromResult, tapAsync } from '@sandlada/result/async-result';

const ar = tapAsync(async (v: number) => { console.log('saving', v); }, fromResult(ok(42)));
```

***

### tapErr()

Side-effect on the error track. Calls `fn` with the error on failure
and passes the original result through unchanged.
Lazy — returns a new AsyncResult without executing the inner computation.

The callback may be sync or async — `fn` is awaited internally so async
rejections surface before the original result is returned.

**Throw policy**: If `fn` throws or rejects, the result converts to
`err(caughtError)`. Pass `errorFn` to customise how the thrown value maps
onto your error union.

```ts
export function tapErr<T, E>(
    fn: (error: E) => void | Promise<void>,
    errorFn?: (thrown: unknown) => unknown,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapErr<T, E>(
    fn: (error: E) => void | Promise<void>,
    ar: AsyncResult<T, E>,
    errorFn?: (thrown: unknown) => E,
): AsyncResult<T, E>;
```

Defined in: [async-result/tapErr.ts](https://github.com/sandlada/result/blob/main/src/async-result/tapErr.ts)

#### Example

```ts
import { err } from '@sandlada/result/factories';
import { fromResult, tapErr } from '@sandlada/result/async-result';

// Sync callback
const ar = tapErr((e: string) => console.log('err:', e), fromResult(err('oops')));

// Async callback — also supported
const ar2 = tapErr(async (e: string) => { console.log(e); }, fromResult(err('oops')));
```

***

### tapErrAsync()

Side-effect on the error track using an async function.
Lazy — returns a new AsyncResult without executing the inner computation.

```ts
export function tapErrAsync<T, E>(
    fn: (error: E) => void | Promise<void>,
): (ar: AsyncResult<T, E>) => AsyncResult<T, E>;
export function tapErrAsync<T, E>(
    fn: (error: E) => void | Promise<void>,
    ar: AsyncResult<T, E>,
): AsyncResult<T, E>;
```

Defined in: [async-result/tapErrAsync.ts](https://github.com/sandlada/result/blob/main/src/async-result/tapErrAsync.ts)

#### Example

```ts
import { err } from '@sandlada/result/factories';
import { fromResult, tapErrAsync } from '@sandlada/result/async-result';

const ar = tapErrAsync(async (e: string) => { console.log('err:', e); }, fromResult(err('oops')));
```

***

### unwrap()

Extracts the success value from an `AsyncResult`, or throws on failure.
Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.

The original error value is preserved as `Error.cause` (or via the
optional `formatErr` hook), so structured `E` shapes don't get
clobbered to `[object Object]`. Pass `throwingFn` to fully replace the
thrown `Error` class.

```ts
export function unwrap<T, E>(ar: AsyncResult<T, E>): Promise<T>;
export function unwrap<T, E>(
    ar: AsyncResult<T, E>,
    formatErr?: (error: E) => string,
): Promise<T>;
export function unwrap<T, E>(
    ar: AsyncResult<T, E>,
    formatErr: ((error: E) => string) | undefined,
    throwingFn: (info: { message: string; value: E }) => Error,
): Promise<T>;
```

Defined in: [async-result/unwrap.ts](https://github.com/sandlada/result/blob/main/src/async-result/unwrap.ts)

#### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';
import { unwrap } from '@sandlada/result/async-result';

await unwrap(fromResult(ok(42)));    // 42
await unwrap(fromResult(err('boom'))); // throws Error with `cause: 'boom'`
```

***

### unwrapErr()

Extracts the error from a failed `AsyncResult`, or throws on success.
The dual of [unwrap](/0.20261102/api/async-result/#unwrap).

The original success value is preserved as `Error.cause`, so structured
`T` shapes don't get lost. Pass `throwingFn` to fully replace the
thrown `Error` class.

```ts
export function unwrapErr<T, E>(ar: AsyncResult<T, E>): Promise<E>;
export function unwrapErr<T, E>(
    ar: AsyncResult<T, E>,
    throwingFn?: (info: { message: string; value: T }) => Error,
): Promise<E>;
```

Defined in: [async-result/unwrapErr.ts](https://github.com/sandlada/result/blob/main/src/async-result/unwrapErr.ts)

#### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';
import { unwrapErr } from '@sandlada/result/async-result';

await unwrapErr(fromResult(err('boom')));  // 'boom'
await unwrapErr(fromResult(ok(42)));       // throws Error with `cause: 42`
```

***

### unwrapOr()

Terminal operator — executes the AsyncResult and returns the success value,
or a default value on failure. The default value may be sync or a Promise.

```ts
export function unwrapOr<T, E>(
    defaultValue: T | Promise<T>,
): (ar: AsyncResult<T, E>) => Promise<T>;
export function unwrapOr<T, E>(
    defaultValue: T | Promise<T>,
    ar: AsyncResult<T, E>,
): Promise<T>;
```

Defined in: [async-result/unwrapOr.ts](https://github.com/sandlada/result/blob/main/src/async-result/unwrapOr.ts)

#### Example

```ts
import { ok, err } from '@sandlada/result/factories';
import { fromResult, unwrapOr } from '@sandlada/result/async-result';

const result = await unwrapOr(0, fromResult(ok(42))); // 42
const fallback = await unwrapOr(0, fromResult(err('fail'))); // 0
```

***

### unwrapOrElse()

Extracts the success value from an `AsyncResult`, or computes a default from
the error on failure. The handler may be sync or async. Lazy — the handler
is only called on failure.

```ts
export function unwrapOrElse<T = unknown, E = unknown, U = unknown>(
    onErr: (error: E) => U | Promise<U>,
): <T2 extends T>(ar: AsyncResult<T2, E>) => Promise<T2 | U>;
export function unwrapOrElse<T, E, U>(
    onErr: (error: E) => U | Promise<U>,
    ar: AsyncResult<T, E>,
): Promise<T | U>;
```

Defined in: [async-result/unwrapOrElse.ts](https://github.com/sandlada/result/blob/main/src/async-result/unwrapOrElse.ts)

#### Example

```ts
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';
import { unwrapOrElse } from '@sandlada/result/async-result';

const v1 = await unwrapOrElse(() => 0, fromResult(ok(42))); // 42
const v2 = await unwrapOrElse((e: string) => -1, fromResult(err('boom'))); // -1
```
