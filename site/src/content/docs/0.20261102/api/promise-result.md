---
title: Promise Result operators
description: "Eager operators on Promise of Result: map, bind, mapAsync, match,
  combine, filterOrElse and the rejection-aware wrappers built for async
  pipelines."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/promise-result
---

Async operators — barrel export.

Re-exports eager operators for Promise of Result values.

For Promise of Option operators, see `../promise-option/index.js` (subpath `./promise-option`).
For lifting sync Result into Promise of Result, see `../bridge-result/index.js`.

## Functions

### ap()

Applicative `ap` for `Promise<IResultOfT>`. Applies a function
wrapped in a `Promise<IResultOfT>` to a value wrapped in a `Promise<IResultOfT>`.
If either is a failure, the first failure propagates.

Mirrors `async-result/ap` for promise-based pipelines.

**Throw policy**: a throwing applied function is captured as `Err(thrown)`.
A rejection of either operand stays a rejection - the outer `Promise` of
this layer never converts a rejection into `Err`.

```ts
export function ap<A, B, E>(
    fnResult: Promise<IResultOfT<(a: A) => B, E>>,
): (result: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>;
export function ap<A, B, E>(
    fnResult: Promise<IResultOfT<(a: A) => B, E>>,
    result: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>>;
```

Defined in: [promise-result/ap.ts](https://github.com/sandlada/result/blob/main/src/promise-result/ap.ts)

#### Example

```ts
import { ap } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await ap(asyncOk((x: number) => x * 2), asyncOk(21)); // Ok(42)
await ap(asyncOk((x: number) => x * 2), asyncErr('x')); // Err('x')
```

***

### bimapAsync()

Maps both success and failure values of a `Promise<IResultOfT<A, E>>` simultaneously.

```ts
export function bimapAsync<A, E, B, F>(
    onOk: (a: A) => B | Promise<B>,
    onErr: (e: E) => F | Promise<F>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, F>>;
export function bimapAsync<A, E, B, F>(
    onOk: (a: A) => B | Promise<B>,
    onErr: (e: E) => F | Promise<F>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, F>>;
```

Defined in: [promise-result/bimapAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/bimapAsync.ts)

#### Example

```ts
import { bimapAsync } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
const r = await bimapAsync(
  (x: number) => x.toString(),
  (e: number) => e * 2,
  Promise.resolve(ok(5)),
); // Ok('5')
```

***

### bindAsync()

Chains an async result-returning function. `fn` can return `IResultOfT` or `Promise<IResultOfT>`. The error type widens to `E | F`.

**Throw policy**: a synchronous throw from `f` propagates to the caller via
the outer promise rejection (the `.then` handler re-throws). A rejected
Promise from `f` propagates as a rejection. This matches the canonical
AsyncResult throw policy ("sync throws and async rejections propagate").

**Compared to `bridge-result` `bind`**: `bindAsync` works on a `Promise<IResultOfT>` (the
source is async). `bridge-result` `bind` is the inverse — it works on a sync `IResultOfT`
and lifts it into a `Promise<IResultOfT>` (the callback is async).

```ts
export function bindAsync<A, B, F>(
    f: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E | F>>;
export function bindAsync<A, B, E, F>(
    f: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E | F>>;
```

Defined in: [promise-result/bindAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/bindAsync.ts)

#### Example

```ts
import { bindAsync } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await bindAsync(
  (x: number) => x > 0 ? asyncOk(x * 2) : asyncErr('too small'),
  asyncOk(21),
);
```

***

### bindThroughAsync()

Side-effect on success for a `Promise<IResultOfT>` that can propagate errors.

**Throw policy**: through-family catch policy — a synchronous throw and a
rejected Promise from `fn` both converge to `Err(thrown)`, matching
`bridge-result` `bindThrough` and the sync `andThrough`.

```ts
export function bindThroughAsync<A, B, F>(
    fn: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E | F>>;
export function bindThroughAsync<A, B, E, F>(
    fn: (a: A) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E | F>>;
```

Defined in: [promise-result/bindThroughAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/bindThroughAsync.ts)

#### Example

```ts
import { bindThroughAsync } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
const validate = bindThroughAsync(async (x: number) =>
  x > 0 ? ok(x) : Promise.reject(new Error('non-positive')),
);
const r = await validate(Promise.resolve(ok(5))); // Ok(5)
```

***

### catchErrAsync()

Async variant of `catchErr` for `Promise<IResultOfT>`.

Recovers from an error by returning a fallback value `T` (or a Promise resolving to `T`),
automatically wrapping it in a resolved `Ok(T)`.

**Throw policy**: Unlike `tap`/`tapErr` (which catch and convert to `Err`),
`catchErrAsync` deliberately lets sync throws and async rejections from
`onErr` propagate verbatim as `Promise` rejections. The recovery handler is
the only escape hatch for an `Err` source — making it swallow its own
failures would hide bugs that should surface. Wrap your recovery logic in
try/catch locally if you need to swallow.

```ts
export function catchErrAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, never>>;
export function catchErrAsync<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, never>>;
```

Defined in: [promise-result/catchErrAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/catchErrAsync.ts)

#### Example

```ts
import { catchErrAsync } from '@sandlada/result/promise-result';
import { asyncErr } from '@sandlada/result/factories';
await catchErrAsync(async (e: string) => 0, asyncErr('boom')); // Ok(0)
```

***

### combine()

Combines an array of `Promise<IResultOfT>` into a single
`Promise<IResultOfT<T[], E>>`. Short-circuits on the first failure (like
`Promise.all`).

Mirrors `async-result/combine` for promise-based pipelines.

```ts
export function combine<A, E>(
    results: readonly Promise<IResultOfT<A, E>>[],
): Promise<IResultOfT<A[], E>>;
```

Defined in: [promise-result/combine.ts](https://github.com/sandlada/result/blob/main/src/promise-result/combine.ts)

#### Example

```ts
import { combine } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await combine([asyncOk(1), asyncOk(2)]); // Ok([1, 2])
await combine([asyncOk(1), asyncErr('x')]); // Err('x')
```

***

### combineWithAllErrors()

Combines `Promise<IResultOfT>` accumulating **all** errors
(validation aggregation). Unlike [combine](/0.20261102/api/promise-result/#combine), this collects every error
before failing.

Mirrors `async-result/combineWithAllErrors`.

```ts
export function combineWithAllErrors<A, E>(
    results: readonly Promise<IResultOfT<A, E>>[],
): Promise<IResultOfT<A[], E[]>>;
```

Defined in: [promise-result/combineWithAllErrors.ts](https://github.com/sandlada/result/blob/main/src/promise-result/combineWithAllErrors.ts)

#### Example

```ts
import { combineWithAllErrors } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await combineWithAllErrors([asyncOk(1), asyncErr('a'), asyncErr('b')]); // Err(['a', 'b'])
await combineWithAllErrors([asyncOk(1), asyncOk(2)]); // Ok([1, 2])
```

***

### containsAsync()

Returns true if the `Promise<IResultOfT>` is success and contains the given value.

```ts
export function containsAsync<A>(
    value: A,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<boolean>;
export function containsAsync<A, E>(
    value: A,
    r: Promise<IResultOfT<A, E>>,
): Promise<boolean>;
```

Defined in: [promise-result/containsAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/containsAsync.ts)

#### Example

```ts
import { containsAsync } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
const r = await containsAsync(42, Promise.resolve(ok(42))); // true
```

***

### existsAsync()

Returns true if the `Promise<IResultOfT>` is success and the predicate holds.
Returns false on failure or when the predicate does not hold.

**Throw policy**: If the predicate throws synchronously or returns a rejected
Promise, the rejection propagates to the outer Promise (matches the canonical
AsyncResult throw policy — "sync throws and async rejections propagate").
Use `existsAsyncOption` if you want predicate errors to convert to `false`.

```ts
export function existsAsync<A>(
    predicate: (a: A) => boolean | Promise<boolean>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<boolean>;
export function existsAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    r: Promise<IResultOfT<A, E>>,
): Promise<boolean>;
```

Defined in: [promise-result/existsAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/existsAsync.ts)

#### Example

```ts
import { existsAsync } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
const r = await existsAsync(async (x: number) => x > 10, Promise.resolve(ok(42)));
// true
```

***

### filterOrElseAsync()

Filters the success value of a `Promise<IResultOfT<A, E>>` with a predicate.
If the predicate holds, the original success passes through. If it fails,
returns `err(errorFn(value))`. Failures pass through unchanged.

**Throw policy**: A synchronous throw or rejected Promise from `predicate`
or `errorFn` propagates to the outer Promise (matches the canonical
AsyncResult throw policy — "sync throws and async rejections propagate").
The thrown value is propagated as-is, not cast into the `E` channel;
callers that need to capture thrown errors in the `Err` channel should wrap
with `tryCatch` or similar.

```ts
export function filterOrElseAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    errorFn: (a: A) => E | Promise<E>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>;
export function filterOrElseAsync<A, E>(
    predicate: (a: A) => boolean | Promise<boolean>,
    errorFn: (a: A) => E | Promise<E>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>>;
```

Defined in: [promise-result/filterOrElseAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/filterOrElseAsync.ts)

#### Example

```ts
import { filterOrElseAsync } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
const r = await filterOrElseAsync(
  (x: number) => x > 0,
  (x: number) => `${x} is not positive`,
  Promise.resolve(ok(5)),
); // Ok(5)
```

***

### flatten()

Strictly synchronous `flatten` over a `Promise<IResultOfT<IResultOfT>>`.
Unwraps exactly one layer.

```ts
export function flatten<A, E>(
    r: Promise<IResultOfT<IResultOfT<A, E>, E>>,
): Promise<IResultOfT<A, E>>;
```

Defined in: [promise-result/flatten.ts](https://github.com/sandlada/result/blob/main/src/promise-result/flatten.ts)

#### Example

```ts
import { flatten } from '@sandlada/result/promise-result';
import { ok, err } from '@sandlada/result/factories';

await flatten(Promise.resolve(ok(ok(42)))); // Ok(42)
await flatten(Promise.resolve(ok(err('x')))); // Err('x')
```

***

### flattenAsync()

Flattens a nested `Promise<IResultOfT<IResultOfT<A, E>, E>>`.

**Single-step only**: unwraps exactly one layer. Call `flattenAsync`
repeatedly to flatten deeper nests.

```ts
export function flattenAsync<A, E>(
    r: Promise<IResultOfT<IResultOfT<A, E>, E>>,
): Promise<IResultOfT<A, E>>;
```

Defined in: [promise-result/flattenAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/flattenAsync.ts)

#### Example

```ts
import { flattenAsync } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
const r = await flattenAsync(Promise.resolve(ok(ok(42)))); // Ok(42)
const r2 = await flattenAsync(Promise.resolve(ok(ok(ok(7))))); // Ok(ok(7))
```

***

### map()

Strictly synchronous `map` over a `Promise<IResultOfT>`.
The mapper is required to be sync. Sync throws are caught and converted
to `err(caughtError)`. Async results from `fn` are not awaited.

For a callback that may be sync or async, prefer [mapAsync](/0.20261102/api/promise-result/#mapasync).

```ts
export function map<A, B>(
    f: (a: A) => B,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>;
export function map<A, B, E>(
    f: (a: A) => B,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>>;
```

Defined in: [promise-result/map.ts](https://github.com/sandlada/result/blob/main/src/promise-result/map.ts)

#### Example

```ts
import { map } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await map((x: number) => x * 2, asyncOk(21)); // Ok(42)
await map((x: number) => x * 2, asyncErr('boom')); // Err('boom')
```

***

### mapAsync()

Transforms the success value of a `Promise<IResultOfT<A, E>>`. The callback may be sync or async.

```ts
export function mapAsync<A, B>(
    f: (a: A) => B | Promise<B>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, E>>;
export function mapAsync<A, B, E>(
    f: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, E>>;
```

Defined in: [promise-result/mapAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/mapAsync.ts)

#### Example

```ts
import { mapAsync } from '@sandlada/result/promise-result';
import { asyncOk } from '@sandlada/result/factories';
await mapAsync((x: number) => x * 2, asyncOk(21)); // Ok(42)
```

***

### mapErr()

Strictly synchronous `mapErr` over a `Promise<IResultOfT>`.
The mapper is required to be sync. Sync throws are caught and converted
to `err(caughtError)`.

For a callback that may be sync or async, prefer [mapErrAsync](/0.20261102/api/promise-result/#maperrasync).

```ts
export function mapErr<A, E, F>(
    f: (e: E) => F,
): <T>(r: Promise<IResultOfT<T, E>>) => Promise<IResultOfT<T, F>>;
export function mapErr<T, E, F>(
    f: (e: E) => F,
    r: Promise<IResultOfT<T, E>>,
): Promise<IResultOfT<T, F>>;
```

Defined in: [promise-result/mapErr.ts](https://github.com/sandlada/result/blob/main/src/promise-result/mapErr.ts)

#### Example

```ts
import { mapErr } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await mapErr((e: string) => e.toUpperCase(), asyncErr('boom')); // Err('BOOM')
await mapErr((e: string) => e.toUpperCase(), asyncOk(42)); // Ok(42)
```

***

### mapErrAsync()

Transforms the error of a `Promise<IResultOfT<A, E>>`.

```ts
export function mapErrAsync<E, F>(
    f: (e: E) => F | Promise<F>,
): <A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, F>>;
export function mapErrAsync<A, E, F>(
    f: (e: E) => F | Promise<F>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, F>>;
```

Defined in: [promise-result/mapErrAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/mapErrAsync.ts)

#### Example

```ts
import { mapErrAsync } from '@sandlada/result/promise-result';
import { asyncErr } from '@sandlada/result/factories';
await mapErrAsync((e: string) => `[wrapped] ${e}`, asyncErr('boom'));
```

***

### mapOrAsync()

Maps the success value of an async result, or returns `defaultValue` on failure.
The mapping function may be sync or async. Equivalent to `mapAsync(fn).then(unwrapOrAsync(defaultValue))`
but more efficient.

**Throw policy**: if `fn` throws synchronously or its returned `Promise<B>` rejects,
the result is `defaultValue` (not an `Err`). The thrown reason is discarded —
use `mapAsync(fn).then(unwrapOrElse(err))` if you need the reason.

The curried form accepts an optional `onErr` thunk that observes the rejected
reason. Supplying `onErr` makes `E` inferable at the curried site, matching
`mapOrElseAsync`'s inference behaviour. The error is still discarded — `onErr`
exists purely for inference and side-effect observation, not for value substitution.

```ts
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
): <R extends Promise<IResultOfT<A, E>>>(r: R) => Promise<B>;
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    onErr: (e: E) => unknown,
): <R extends Promise<IResultOfT<A, E>>>(r: R) => Promise<B>;
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
): Promise<B>;
export function mapOrAsync<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
    onErr: (e: E) => unknown,
): Promise<B>;
```

Defined in: [promise-result/mapOrAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/mapOrAsync.ts)

#### Example

```ts
import { mapOrAsync } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await mapOrAsync(-1, (x: number) => x * 2, asyncOk(5)); // 10
await mapOrAsync(-1, (x: number) => x * 2, asyncErr('boom')); // -1
```

***

### mapOrElseAsync()

Maps the success value of an async result, or computes a default from the error
on failure. Both callbacks may be sync or async. Equivalent to `mapAsync(fn).then(unwrapOrElseAsync(onErr))`
but more efficient.

```ts
export function mapOrElseAsync<A, B, E>(
    onErr: (e: E) => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
): (r: Promise<IResultOfT<A, E>>) => Promise<B>;
export function mapOrElseAsync<A, B, E>(
    onErr: (e: E) => B | Promise<B>,
    fn: (a: A) => B | Promise<B>,
    r: Promise<IResultOfT<A, E>>,
): Promise<B>;
```

Defined in: [promise-result/mapOrElseAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/mapOrElseAsync.ts)

#### Example

```ts
import { mapOrElseAsync } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await mapOrElseAsync((e: string) => 0, (x: number) => x * 2, asyncOk(5)); // 10
await mapOrElseAsync((e: string) => -1, (x: number) => x * 2, asyncErr('boom')); // -1
```

***

### matchAsync()

Terminal — pattern-matches on both cases of an async result.

```ts
export function matchAsync<A, E, C>(
    onOk: (a: A) => C | Promise<C>,
    onErr: (e: E) => C | Promise<C>,
): (r: Promise<IResultOfT<A, E>>) => Promise<C>;
export function matchAsync<A, E, C>(
    onOk: (a: A) => C | Promise<C>,
    onErr: (e: E) => C | Promise<C>,
    r: Promise<IResultOfT<A, E>>,
): Promise<C>;
```

Defined in: [promise-result/matchAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/matchAsync.ts)

#### Example

```ts
import { matchAsync } from '@sandlada/result/promise-result';
import { asyncOk } from '@sandlada/result/factories';
await matchAsync(
  (v: number) => `success: ${v}`,
  (e: string) => `failure: ${e}`,
  asyncOk(42),
); // "success: 42"
```

***

### orElseAsync()

Error recovery for async results. The success type widens to `A | B`.

**Throw policy**: a synchronous throw from `f` propagates via the outer promise
rejection (the `.then` handler re-throws). A rejected Promise from `f`
propagates as a rejection. Matches the canonical AsyncResult throw policy.

```ts
export function orElseAsync<E, B, F>(
    f: (e: E) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A | B, F>>;
export function orElseAsync<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A | B, F>>;
```

Defined in: [promise-result/orElseAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/orElseAsync.ts)

#### Example

```ts
import { orElseAsync } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await orElseAsync(
  (e: string) => asyncOk('default'),
  asyncErr('boom'),
);
```

***

### swapAsync()

Swaps the success and failure variants of a `Promise<IResultOfT<A, E>>`.

```ts
export function swapAsync<A, E>(
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<E, A>>;
```

Defined in: [promise-result/swapAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/swapAsync.ts)

#### Example

```ts
import { swapAsync } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
const r = await swapAsync(Promise.resolve(ok(5))); // Err(5)
```

***

### tapAsync()

Side-effect on the success track of an async result.

```ts
export function tapAsync<A>(
    fn: (a: A) => void | Promise<void>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>;
export function tapAsync<A, E>(
    fn: (a: A) => void | Promise<void>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>>;
```

Defined in: [promise-result/tapAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/tapAsync.ts)

#### Example

```ts
import { tapAsync } from '@sandlada/result/promise-result';
import { asyncOk } from '@sandlada/result/factories';
await tapAsync((v: string) => console.log('got:', v), asyncOk('hello'));
```

***

### tapErrAsync()

Side-effect on the failure track of an async result.

```ts
export function tapErrAsync<E>(
    fn: (e: E) => void | Promise<void>,
): <A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A, E>>;
export function tapErrAsync<A, E>(
    fn: (e: E) => void | Promise<void>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<A, E>>;
```

Defined in: [promise-result/tapErrAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/tapErrAsync.ts)

#### Example

```ts
import { tapErrAsync } from '@sandlada/result/promise-result';
import { asyncErr } from '@sandlada/result/factories';
await tapErrAsync((e: string) => console.log('err:', e), asyncErr('boom'));
```

***

### unwrapOr()

Strictly synchronous `unwrapOr` over a `Promise<IResultOfT>` —
extracts the success value or returns a default. The default may itself be
a Promise.

Note: returns `Promise<A>`, NOT `Promise<IResultOfT<A, _>>`. The `Async`
suffix on [unwrapOrAsync](/0.20261102/api/promise-result/#unwraporasync) is preserved for naming parity with
`mapAsync`/`mapErrAsync`, but both unwrap the inner value.

```ts
export function unwrapOr<A>(
    defaultValue: A | Promise<A>,
): <E>(r: Promise<IResultOfT<A, E>>) => Promise<A>;
export function unwrapOr<A, E>(
    defaultValue: A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A>;
```

Defined in: [promise-result/unwrapOr.ts](https://github.com/sandlada/result/blob/main/src/promise-result/unwrapOr.ts)

#### Example

```ts
import { unwrapOr } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await unwrapOr(0, asyncOk(42));  // 42
await unwrapOr(0, asyncErr('x')); // 0
```

***

### unwrapOrAsync()

Extracts the success value from `Promise<IResultOfT>`, or returns
a default on failure. The default value may itself be a `Promise<A>`; it is
awaited internally.

Returns `Promise<A>` (just the inner value, not wrapped). The previous
`Promise<IResultOfT<A, unknown>>` signature was a bug — `unwrapOr` semantically
unwraps.

The default value type `D` is independent of the success type `A`, so a wider
or sentinel value can be supplied as a fallback — e.g. `unwrapOrAsync<null>(null)`
for a `Promise<IResultOfT<User, NetworkError>>` resolves to `Promise<User | null>`.

```ts
export function unwrapOrAsync<A = unknown, D = A>(
    defaultValue: D | Promise<D>,
): <A2 extends A, E>(r: Promise<IResultOfT<A2, E>>) => Promise<A2 | D>;
export function unwrapOrAsync<A, E, D = A>(
    defaultValue: D | Promise<D>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A | D>;
```

Defined in: [promise-result/unwrapOrAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/unwrapOrAsync.ts)

#### Example

```ts
import { unwrapOrAsync } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await unwrapOrAsync(0, asyncOk(42));                       // 42
await unwrapOrAsync(0, asyncErr('boom'));                  // 0
await unwrapOrAsync(Promise.resolve(0), asyncErr('boom')); // 0
```

***

### unwrapOrElse()

Strictly lazy `unwrapOrElse` over a `Promise<IResultOfT>` —
extracts the success value or computes a default from the error via a thunk.
Returns `Promise<A>` (just the value).

```ts
export function unwrapOrElse<A, E>(
    onErr: (e: E) => A | Promise<A>,
): (r: Promise<IResultOfT<A, E>>) => Promise<A>;
export function unwrapOrElse<A, E>(
    onErr: (e: E) => A | Promise<A>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A>;
```

Defined in: [promise-result/unwrapOrElse.ts](https://github.com/sandlada/result/blob/main/src/promise-result/unwrapOrElse.ts)

#### Example

```ts
import { unwrapOrElse } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await unwrapOrElse((e: string) => 0, asyncOk(42));    // 42
await unwrapOrElse((e: string) => 0, asyncErr('x'));  // 0
```

***

### unwrapOrElseAsync()

Extracts the success value from `Promise<IResultOfT>`, or computes
a default from the error on failure (lazy). The error handler may return a
value or a Promise.

Returns `Promise<A>` (just the inner value).

The default value type `D` is independent of the success type `A` — the error
handler may project to a different shape (`(e) => null`, `(e) => defaultUser`,
etc.) and the result widens to `A | D`.

```ts
export function unwrapOrElseAsync<A = unknown, E = unknown, D = A>(
    onErr: (e: E) => D | Promise<D>,
): <A2 extends A>(r: Promise<IResultOfT<A2, E>>) => Promise<A2 | D>;
export function unwrapOrElseAsync<A, E, D = A>(
    onErr: (e: E) => D | Promise<D>,
    r: Promise<IResultOfT<A, E>>,
): Promise<A | D>;
```

Defined in: [promise-result/unwrapOrElseAsync.ts](https://github.com/sandlada/result/blob/main/src/promise-result/unwrapOrElseAsync.ts)

#### Example

```ts
import { unwrapOrElseAsync } from '@sandlada/result/promise-result';
import { asyncOk, asyncErr } from '@sandlada/result/factories';
await unwrapOrElseAsync((e: string) => 0, asyncOk(42));    // 42
await unwrapOrElseAsync((e: string) => 0, asyncErr('x'));  // 0
```
