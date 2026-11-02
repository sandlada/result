---
title: "Composition: pipe, composeK, safeTry"
description: "Kleisli composition and generator syntax for typed pipelines:
  pipe, pipeAsync, composeK, composeKAsync, safeTry and safeTryAsync."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/composition
---

Composition utilities — barrel export.

Re-exports Kleisli composition and pipe utilities for Result pipelines.

## Functions

### composeK()

Kleisli composition — composes N switch functions into one. Each function returns a Result, and the composed function chains them. Short-circuits on the first failure.

F# equivalent: `f1 >=> f2 >=> f3`

**Compared to `composeKAsync`**: this is the **sync** variant — each function
must return `IResultOfT` synchronously. For async-compatible composition
(callbacks may return `Promise<IResultOfT>`), use `composeKAsync` from
`@sandlada/result/composition`.

**Empty input guard**: calling `composeK()` with zero functions throws
`TypeError` at construction time. The async variant has the same policy.

**Synchronous throw policy**: if any function in the chain throws
synchronously, the catch block funnels the unknown rejection through
`as unknown as IResultOfT<unknown, unknown>` - the same honesty trade-off
the sync `composeK` and the `retry` module make. The composed function's
declared error type `E` is therefore a structural claim only: a synchronous
throw at runtime can produce an arbitrary `unknown` value. If you need
precise error-type narrowing, wrap each step in `tryCatch` with an
`errorFn` that maps to your `E` before composing.

```ts
export function composeK<A, B, E>(
    f1: (a: A) => IResultOfT<B, E>,
): (a: A) => IResultOfT<B, E>;
export function composeK<A, B, C, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
): (a: A) => IResultOfT<C, E>;
export function composeK<A, B, C, D, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
    f3: (c: C) => IResultOfT<D, E>,
): (a: A) => IResultOfT<D, E>;
export function composeK<A, B, C, D, F, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
    f3: (c: C) => IResultOfT<D, E>,
    f4: (d: D) => IResultOfT<F, E>,
): (a: A) => IResultOfT<F, E>;
export function composeK<A, B, C, D, F, G, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
    f3: (c: C) => IResultOfT<D, E>,
    f4: (d: D) => IResultOfT<F, E>,
    f5: (f: F) => IResultOfT<G, E>,
): (a: A) => IResultOfT<G, E>;
export function composeK<A, B, C, D, F, G, H, E>(
    f1: (a: A) => IResultOfT<B, E>,
    f2: (b: B) => IResultOfT<C, E>,
    f3: (c: C) => IResultOfT<D, E>,
    f4: (d: D) => IResultOfT<F, E>,
    f5: (f: F) => IResultOfT<G, E>,
    f6: (g: G) => IResultOfT<H, E>,
): (a: A) => IResultOfT<H, E>;
```

Defined in: [composition/composeK.ts](https://github.com/sandlada/result/blob/main/src/composition/composeK.ts)

#### Example

```ts
import { composeK } from '@sandlada/result/composition';
import { ok, err } from '@sandlada/result/factories';
const p = composeK(
  (x: number) => ok(x * 2),
  (x: number) => x > 50 ? ok(x) : err('too small'),
);
p(30); // Ok(60)
```

#### Throws

If called with zero functions.

#### Throws

If any composed step throws synchronously, the thrown value
is captured into the returned failure's `error` field — but
its static type widens to `unknown`, not the declared `E`.
Use `tryCatch(..., errorFn)` per step if you need typed errors.

***

### composeKAsync()

Kleisli composition for async switch functions. Each function can return `IResultOfT` or `Promise<IResultOfT>`.

F# equivalent: `f1 >=> f2 >=> f3` (async)

**Synchronous throw policy**: if any function in the chain throws
synchronously, the catch block funnels the unknown rejection through
`as unknown as IResultOfT<unknown, unknown>` - the same honesty trade-off
the sync `composeK` and the `retry` module make. The composed function's
declared error type `E` is therefore a structural claim only:
a synchronous throw at runtime can produce an arbitrary `unknown` value.

```ts
export function composeKAsync<A, B, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
): (a: A) => Promise<IResultOfT<B, E>>;
export function composeKAsync<A, B, C, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
): (a: A) => Promise<IResultOfT<C, E>>;
export function composeKAsync<A, B, C, D, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
    f3: (c: C) => IResultOfT<D, E> | Promise<IResultOfT<D, E>>,
): (a: A) => Promise<IResultOfT<D, E>>;
export function composeKAsync<A, B, C, D, F, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
    f3: (c: C) => IResultOfT<D, E> | Promise<IResultOfT<D, E>>,
    f4: (d: D) => IResultOfT<F, E> | Promise<IResultOfT<F, E>>,
): (a: A) => Promise<IResultOfT<F, E>>;
export function composeKAsync<A, B, C, D, F, G, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
    f3: (c: C) => IResultOfT<D, E> | Promise<IResultOfT<D, E>>,
    f4: (d: D) => IResultOfT<F, E> | Promise<IResultOfT<F, E>>,
    f5: (f: F) => IResultOfT<G, E> | Promise<IResultOfT<G, E>>,
): (a: A) => Promise<IResultOfT<G, E>>;
export function composeKAsync<A, B, C, D, F, G, H, E>(
    f1: (a: A) => IResultOfT<B, E> | Promise<IResultOfT<B, E>>,
    f2: (b: B) => IResultOfT<C, E> | Promise<IResultOfT<C, E>>,
    f3: (c: C) => IResultOfT<D, E> | Promise<IResultOfT<D, E>>,
    f4: (d: D) => IResultOfT<F, E> | Promise<IResultOfT<F, E>>,
    f5: (f: F) => IResultOfT<G, E> | Promise<IResultOfT<G, E>>,
    f6: (g: G) => IResultOfT<H, E> | Promise<IResultOfT<H, E>>,
): (a: A) => Promise<IResultOfT<H, E>>;
```

Defined in: [composition/composeKAsync.ts](https://github.com/sandlada/result/blob/main/src/composition/composeKAsync.ts)

#### Example

```ts
import { composeKAsync } from '@sandlada/result/composition';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
const p = composeKAsync(
  (x: number) => asyncOk(x * 2),
  (x: number) => x > 50 ? asyncOk(x) : asyncErr('too small'),
);
await p(30); // Ok(60)
```

#### Throws

If called with zero functions.

#### Throws

If any composed step throws synchronously or rejects
asynchronously, the thrown/rejected value is captured
into the returned failure's `error` field — but its
static type widens to `unknown`, not the declared `E`.
Use `tryCatchAsync(..., errorFn)` per step if you need
typed errors.

***

### fromSafeTry()

Evaluates a generator function that uses `yield* safeTry(...)` and
collects the final `IResultOfT`.

* If the generator **returns** a value: the value is wrapped in `ok()`.
* If the generator **returns** a Result: that Result is used as-is, so the
  documented `return ok(undefined)` workaround yields `Ok(undefined)`
  instead of a doubly wrapped Result.
* If the generator **yields** a value: that yield is treated as a propagated
  failure and returned as-is. The yielded value must be a Result - a yield
  that is not one throws a `TypeError`, because the runner would otherwise
  hand back a value that is not a Result at all.

A generator that yields twice throws - the runner probes a raw yield for a
second one before reporting the failure.

```ts
export function fromSafeTry<T, E>(
    gen: () => Generator<IResultOfT<never, E>, IResultOfT<T, E>, unknown>,
): IResultOfT<T, E>;
export function fromSafeTry<T, E>(
    gen: () => Generator<IResultOfT<never, E>, T | undefined, unknown>,
): IResultOfT<T, E>;
```

Defined in: [composition/safeTry.ts](https://github.com/sandlada/result/blob/main/src/composition/safeTry.ts)

#### Example

```ts
import { fromSafeTry, safeTry } from '@sandlada/result/composition';
import { ok } from '@sandlada/result/factories';

const result = fromSafeTry(function* () {
  const value = yield* safeTry(ok(42));
  return value;
});
// Ok(42)
```

***

### fromSafeTryAsync()

Runs an async generator that uses `yield* safeTryAsync(...)` and returns a
lazy `AsyncResult` collecting the final `IResultOfT`.

* If the generator **returns** a value: the value is wrapped in `Ok` when
  `.run()` is called.
* If the generator **returns** a Result: that Result is used as-is, so the
  documented `return asyncOk(undefined)` workaround yields `Ok(undefined)`
  instead of a doubly wrapped Result.
* If the generator **yields** a value: that yield is treated as a propagated
  failure and returned as-is. The yielded value must be a Result - a yield
  that is not one throws a `TypeError`, because the runner would otherwise
  hand back a value that is not a Result at all.

Throws when the generator returns `undefined` without yielding, or yields
more than once.

***

```ts
export function fromSafeTryAsync<T, E>(
    gen: () => AsyncGenerator<IResultOfT<never, E>, IResultOfT<T, E>, unknown>,
): AsyncResult<T, E>;
export function fromSafeTryAsync<T, E>(
    gen: () => AsyncGenerator<IResultOfT<never, E>, T | undefined, unknown>,
): AsyncResult<T, E>;
```

Defined in: [composition/safeTryAsync.ts](https://github.com/sandlada/result/blob/main/src/composition/safeTryAsync.ts)

### pipe()

Pipes a value through a sequence of functions (left-to-right composition). Each function receives the output of the previous one.

F# equivalent: `value |> fn1 |> fn2 |> fn3`

```ts
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
export function pipe<A, B, C, D, E>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F,
): F;
export function pipe<A, B, C, D, E, F, G>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H,
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J,
): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J, fn10: (j: J) => K,
): K;
```

Defined in: [composition/pipe.ts](https://github.com/sandlada/result/blob/main/src/composition/pipe.ts)

#### Example

```ts
import { pipe } from '@sandlada/result/composition';
import { map, bind, match } from '@sandlada/result/operators';
import { ok, err } from '@sandlada/result/factories';
pipe(
  ok(42),
  map(x => x * 2),
  bind(x => x > 50 ? ok(x) : err('too small')),
  match(v => `OK: ${v}`, e => `Error: ${e}`),
); // "OK: 84"
```

***

### pipeAsync()

Async version of `pipe`. Pipes a value through a sequence of async functions. Each function receives the output of the previous one.

```ts
export function pipeAsync<A>(value: A): Promise<A>;
export function pipeAsync<A, B>(value: A, fn1: (a: A) => B): Promise<B>;
export function pipeAsync<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): Promise<C>;
export function pipeAsync<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): Promise<D>;
export function pipeAsync<A, B, C, D, E>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E,
): Promise<E>;
export function pipeAsync<A, B, C, D, E, F>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F,
): Promise<F>;
export function pipeAsync<A, B, C, D, E, F, G>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G,
): Promise<G>;
export function pipeAsync<A, B, C, D, E, F, G, H>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H,
): Promise<H>;
export function pipeAsync<A, B, C, D, E, F, G, H, I>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
): Promise<I>;
export function pipeAsync<A, B, C, D, E, F, G, H, I, J>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J,
): Promise<J>;
export function pipeAsync<A, B, C, D, E, F, G, H, I, J, K>(
    value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D,
    fn4: (d: D) => E, fn5: (e: E) => F, fn6: (f: F) => G, fn7: (g: G) => H, fn8: (h: H) => I,
    fn9: (i: I) => J, fn10: (j: J) => K,
): Promise<K>;
```

Defined in: [composition/pipeAsync.ts](https://github.com/sandlada/result/blob/main/src/composition/pipeAsync.ts)

#### Example

```ts
import { pipeAsync } from '@sandlada/result/composition';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
import { mapAsync, bindAsync, matchAsync } from '@sandlada/result/promise-result';
await pipeAsync(
  asyncOk(42),
  mapAsync((x: number) => x * 2),
  bindAsync((x: number) => x > 50 ? asyncOk(x) : asyncErr('too small')),
  matchAsync(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

***

### safeTry()

Generator-based `yield*` error propagation for Result pipelines.

`safeTry` wraps a Result into a Generator. On success it returns the value;
on failure it yields the error, propagating it up to a `fromSafeTry` runner.
This enables flat, non-nested error handling in complex sequential logic.

Wraps a `IResultOfT<T, E>` into a generator for use with `yield*`:

* On **success**: the generator returns the value — `yield*` evaluates to it.
* On **failure**: the generator yields the error result — `fromSafeTry` catches it.

Returns `T` when the inner result is `Ok`, otherwise yields the failure to be
collected by `fromSafeTry`. The Generator's return type is `T | undefined`:
the success path returns `T`, and the failure path's unreachable tail
explicitly returns `undefined` (matches JS semantics when a generator
exhausts after a yield without a top-level `return`).

The failure is yielded, and the generator **throws** when it is resumed
past that yield. A runner that resumes a delegation therefore ends the
generator instead of running the body after the failed `yield*` - the
short-circuit contract holds without any bookkeeping that would have to be
attributed to one specific run.

```ts
export function* safeTry<T, E>(
    result: IResultOfT<T, E>,
): Generator<IResultOfT<never, E>, T | undefined, unknown>;
```

Defined in: [composition/safeTry.ts](https://github.com/sandlada/result/blob/main/src/composition/safeTry.ts)

#### Example

```ts
import { safeTry } from '@sandlada/result/composition';
import { ok } from '@sandlada/result/factories';

function* pipeline() {
  const value = yield* safeTry(ok(42));
  return value;
}
```

***

### safeTryAsync()

Async Generator-based `yield*` error propagation for AsyncResult pipelines.

`safeTryAsync` wraps an `AsyncResult` (or a `Promise<IResultOfT>`) into an
`AsyncGenerator`. On success it returns the value; on failure it yields the
error so that `fromSafeTryAsync` can short-circuit the pipeline and return
the error result.

Returns `T` when the inner result is `Ok`, otherwise yields the failure to be
collected by `fromSafeTryAsync`. The AsyncGenerator's return type is
`T | undefined`: the success path returns `T`, and the failure path's
unreachable tail returns `undefined` (matches JS semantics when a generator
exhausts after a yield without a top-level `return`).

The failure is yielded, and the generator **throws** when it is resumed
past that yield. A runner that resumes a delegation therefore ends the
generator instead of running the body after the failed `yield*` - the
short-circuit contract holds without any bookkeeping that would have to be
attributed to one specific run, which matters when several runs are in
flight at the same time.

```ts
export async function* safeTryAsync<T, E>(
    result: AsyncResult<T, E> | Promise<IResultOfT<T, E>>,
): AsyncGenerator<IResultOfT<never, E>, T | undefined, unknown>;
```

Defined in: [composition/safeTryAsync.ts](https://github.com/sandlada/result/blob/main/src/composition/safeTryAsync.ts)

#### Example

```ts
import { safeTryAsync, fromSafeTryAsync } from '@sandlada/result/composition';
import { asyncOk, asyncErr } from '@sandlada/result/factories';

const ok = await fromSafeTryAsync(async function* () {
    const a = yield* safeTryAsync(asyncOk(40));
    const b = yield* safeTryAsync(asyncOk(2));
    return Number(a) + Number(b);
}).run();
// Ok(42)

const failure = await fromSafeTryAsync(async function* () {
    yield* safeTryAsync(asyncErr('boom'));
    return 0;
}).run();
// Err('boom')
```
