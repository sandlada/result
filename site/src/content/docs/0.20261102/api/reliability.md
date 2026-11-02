---
title: "Reliability: retry, timeout, race"
description: "Never-rejecting async helpers: retry, retryLazy, timeout,
  timeoutEager, race, any and allSettled — every throw and rejection becomes
  Err."
editUrl: false
next: false
prev: false
slug: 0.20261102/api/reliability
---

Reliability — barrel export.

Re-exports all retry/timeout/concurrency helpers for production-grade ROP pipelines.

## Interfaces

### AbortedError

Defined in: [reliability/retry.ts:80](https://github.com/sandlada/result/blob/main/src/reliability/retry.ts#L80)

Default shape of the error produced when the retry loop never invokes `fn`
(pre-aborted signal, or a non-finite / negative `times`).

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-kind" /> `kind` | `readonly` | `"Aborted"` |
| <a id="property-reason" /> `reason` | `readonly` | `unknown` |
| <a id="property-times" /> `times` | `readonly` | `number` |

***

### EmptyInputsError

Defined in: [reliability/race.ts:10](https://github.com/sandlada/result/blob/main/src/reliability/race.ts#L10)

Default shape of the error produced by [race](/0.20261102/api/reliability/#race) when the input array is empty.
Library consumers can extend, narrow, or replace it via the `onEmpty` hook.

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-kind-1" /> `kind` | `readonly` | `"EmptyInputs"` |

***

### RetryOptions

Defined in: [reliability/retry.ts:17](https://github.com/sandlada/result/blob/main/src/reliability/retry.ts#L17)

Options for [retry](/0.20261102/api/reliability/#retry) and [retryLazy](/0.20261102/api/reliability/#retrylazy).

Each field has a sensible default; only set the knobs you actually need.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `E` | `unknown` | — the error type your `fn` returns in its `Err`. |
| `TE` | [`ThrownError`](/0.20261102/api/reliability/#thrownerror) | — the error produced when `fn` (or one of these hooks) *throws*. Defaults to [ThrownError](/0.20261102/api/reliability/#thrownerror); override with `onThrow`. |
| `AE` | [`AbortedError`](/0.20261102/api/reliability/#abortederror) | — the error produced when the loop never runs `fn` at all. Defaults to [AbortedError](/0.20261102/api/reliability/#abortederror); override with `onAborted`. |

#### Properties

| Property | Modifier | Type | Description |
| ------ | ------ | ------ | ------ |
| <a id="property-delayms" /> `delayMs?` | `readonly` | `number` | ((`attempt`, `error`) => `number`) | Delay between attempts in milliseconds. Either a fixed number or a function of (zero-based attempt index, last error). Default `0` (no delay). Negative values are clamped to `0`. |
| <a id="property-onaborted" /> `onAborted?` | `readonly` | (`reason`, `times`) => `AE` | Optional factory invoked when the retry loop exits without ever calling `fn` (pre-aborted signal or non-finite / negative `times`). The returned value becomes the `error` of the resolved `Err`. Without it the library falls back to [AbortedError](/0.20261102/api/reliability/#abortederror). |
| <a id="property-onretry" /> `onRetry?` | `readonly` | (`error`, `attempt`) => `void` | Optional hook invoked **after** `shouldRetry` approves a retry and **before** the backoff delay begins. Useful for logging or metrics ("will retry in Nms"); the value it returns is ignored. |
| <a id="property-onthrow" /> `onThrow?` | `readonly` | (`thrown`) => `TE` | Optional factory that converts a value thrown by `fn` (or by one of the hooks above) into your own error type, collapsing `E | TE` back to `E`. Without it the library preserves the thrown value verbatim inside a [ThrownError](/0.20261102/api/reliability/#thrownerror). |
| <a id="property-shouldretry" /> `shouldRetry?` | `readonly` | (`error`, `attempt`) => `boolean` | Predicate that decides whether to retry after a given failure. Return `false` to stop retrying immediately and return the last result. Default: always retry. Receives `E | TE` because a throw from `fn` is a real failure your policy has to classify — supply `onThrow` to collapse both into one shape. |
| <a id="property-signal" /> `signal?` | `readonly` | `AbortSignal` | Abort signal. If `signal.aborted` becomes `true` during the delay window, the loop exits and the last result is returned (the supplied function is never re-invoked past that point). |
| <a id="property-times-1" /> `times?` | `readonly` | `number` | Maximum retry attempts (excluding the first attempt). Default `3`. Fractional values are floored — `times: 2.7` performs 3 attempts total. |

***

### ThrownError

Defined in: [reliability/retry.ts:71](https://github.com/sandlada/result/blob/main/src/reliability/retry.ts#L71)

Default shape of the error produced when `fn` throws instead of returning an
`Err`. The original thrown value is preserved verbatim in `thrown`, so the
`Error` instance, its `stack` and its `cause` all survive.

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-kind-2" /> `kind` | `readonly` | `"Thrown"` |
| <a id="property-thrown" /> `thrown` | `readonly` | `unknown` |

***

### TimeoutError

Defined in: [reliability/timeout.ts:11](https://github.com/sandlada/result/blob/main/src/reliability/timeout.ts#L11)

Default shape of the error produced by [timeout](/0.20261102/api/reliability/#timeout) when no factory is given.
Library consumers can extend, narrow, or replace it via the `onTimeout` hook.

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-kind-3" /> `kind` | `readonly` | `"Timeout"` |
| <a id="property-ms" /> `ms` | `readonly` | `number` |

## Type Aliases

### AnyError

> **AnyError**\<`E`> = `E` | \{ `error`: `unknown`; `kind`: `"Rejected"`; }

Defined in: [reliability/any.ts:13](https://github.com/sandlada/result/blob/main/src/reliability/any.ts#L13)

Tagged envelope for an inner `.run()` Promise rejection. `any` collects
these alongside `Err` values so the rejection's actual shape (which can be
`string`, `undefined`, …) is preserved as `unknown` instead of being
forced into the caller's `E` union.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` |

***

### Settled

> **Settled**\<`T`, `E`> = \{ `error?`: `never`; `ok`: `true`; `value`: `T`; } | \{ `error`: `E`; `kind?`: `never`; `ok`: `false`; `value?`: `never`; } | \{ `error`: `unknown`; `kind`: `"Rejected"`; `ok`: `false`; `value?`: `never`; }

Defined in: [reliability/allSettled.ts:22](https://github.com/sandlada/result/blob/main/src/reliability/allSettled.ts#L22)

Discriminated outcome of a single thunk in an `allSettled` batch.

Three variants - discriminated by `ok` and, for the rejection case, by the
`kind` tag:

* `{ ok: true, value: T }` - the thunk resolved with `Ok`.
* `{ ok: false, error: E }` - the thunk resolved with `Err`. No `kind` tag is
  set for this variant - `kind` is reserved for the rejection envelope.
* `{ ok: false, kind: 'Rejected', error: unknown }` - the inner `.run()`
  **rejected** the Promise (an upstream contract violation that
  `allSettled` defends against). The rejection value is preserved
  verbatim as `unknown` so consumers can narrow on `kind` before
  reading `error`. This avoids the type lie where rejection values
  (which can be `string`, `undefined`, or anything else) were cast
  into the user's `E` union.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

## Functions

### allSettled()

`allSettled` — never short-circuits. Collects every thunk's outcome into a
discriminated array that mirrors the input order. Always returns `Ok` with the
collected list, so observability and batch coordination layers can log
everything without losing partial successes.

Run every thunk; the result is **always** `Ok([...settled, ...in input order])`.
Unhandled rejections are captured as `{ ok: false, error: rejection }` rather than
propagated.

```ts
export function allSettled<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<Settled<T, E>[], never>;
```

Defined in: [reliability/allSettled.ts](https://github.com/sandlada/result/blob/main/src/reliability/allSettled.ts)

#### Example

```ts
import { allSettled } from '@sandlada/result/reliability';
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';

const ar = allSettled([fromResult(ok(1)), fromResult(err('a')), fromResult(ok(2))]);
const r = await ar.run();
// Ok([
//   { ok: true,  value: 1 },
//   { ok: false, error: 'a' },
//   { ok: true,  value: 2 },
// ])
```

***

### any()

Promise.any-style combination: succeeds with **all** collected successes
(in completion order), or fails with every collected error (in completion order).

* If at least one thunk resolves with `Ok`, the final result is `Ok([...all-successes])`.
* If every thunk resolves with `Err`, the final result is `Err([...all-errors])`.

`any` is **lazy** and does **not** short-circuit — all thunks are guaranteed to run.

**Order**: `successes` and `errors` are populated in the order their underlying
runs settle (microtask scheduling), not input order. Use `allSettled` if input
order matters.

```ts
export function any<T, E>(
    results: readonly AsyncResult<T, E>[],
): AsyncResult<T[], AnyError<E>[]>;
```

Defined in: [reliability/any.ts](https://github.com/sandlada/result/blob/main/src/reliability/any.ts)

#### Example

```ts
import { any } from '@sandlada/result/reliability';
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';

const ar = any([fromResult(ok(1)), fromResult(err('a')), fromResult(ok(2))]);
const r = await ar.run(); // Ok([1, 2]) — partial success collected.
```

***

### race()

First-success-wins combination of `AsyncResult`s. Returns the first thunk to
resolve with `Ok`; if every thunk resolves with `Err`, returns the first error
(in input order). Lazy — none of the inputs run until `.run()` is called.

**Empty input**: if `results` is empty, there is no input value *or* input error to
propagate, so `race` produces an error of its own. Rather than fabricating a value
of the caller's `E` (which would be a type lie), the error type is widened to
`E | EE`, where `EE` defaults to [EmptyInputsError](/0.20261102/api/reliability/#emptyinputserror). Supply `onEmpty` to
substitute a domain-specific error instead.

That widening is charged only where it can actually happen: passing a literal
non-empty array proves the empty branch unreachable, so the caller keeps a clean
`AsyncResult<T, E>`. Only a dynamically-sized array pays the `| EE`.

**Selection policy** — total and deterministic, independent of arrival order except
where a race inherently depends on it:

* The first run to resolve `Ok` wins, regardless of input order.
* If no run succeeds, a genuine `Err` always outranks a Promise rejection: a
  rejection breaks the `AsyncResult` contract (which requires resolving to
  `Ok`/`Err`) and therefore signals an upstream bug, not a domain outcome.
* Among `Err`s, the **lowest input index** wins, even if it settles last.
* If *every* run rejected, the earliest-arriving rejection wins.
* For "first to settle, whatever it is" semantics, use a separate primitive.

**Type lie**: when every run rejected, the resulting `Err.error` is the
`unknown` rejection reason (cast to `E` in the implementation). The
static type still says `E | EE`. Consumers that need to distinguish an
upstream rejection from a domain `Err` should narrow at runtime
(e.g. `(r.error as { message?: unknown }).message !== undefined` or
`instanceof Error`). The cast is intentional: a true `unknown` here
would erase all type information from the success path's `E`.

```ts
export function race<T, E>(
    results: readonly [AsyncResult<T, E>, ...AsyncResult<T, E>[]],
): AsyncResult<T, E>;
export function race<T, E, EE = EmptyInputsError>(
    results: readonly AsyncResult<T, E>[],
    onEmpty?: () => EE,
): AsyncResult<T, E | EE>;
```

Defined in: [reliability/race.ts](https://github.com/sandlada/result/blob/main/src/reliability/race.ts)

#### Examples

```ts
import { race } from '@sandlada/result/reliability';
import { fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';

const ar = race([fromResult(ok(1)), fromResult(err('a'))]);
const r = await ar.run(); // Ok(1) — first success wins.
```

**Discriminating the empty-input case**

```ts
import { race } from '@sandlada/result/reliability';
import { fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';

const single = await race([fromResult(ok(1))]).run(); // Ok(1)

// …or map the empty-input case onto your own error union:
const custom = await race<number, Error, { readonly tag: 'NoCandidates' }>(
    [],
    () => ({ tag: 'NoCandidates' }),
).run();
```

***

### retry()

Retries a fallible function with configurable attempts, backoff, and predicate
gating.

`retry` is **eager**: it returns `Promise<IResultOfT<T, E>>` and runs the supplied
function up to `times + 1` times. Use `shouldRetry` to filter transient errors
(timeouts, network blips) and `signal` to abort the retry loop.

Synchronous throws AND promise rejections from `fn` are converted to `Err`,
as are throws escaping `shouldRetry`, `onRetry`, `delayMs`, `onThrow` and
`onAborted`. The returned promise therefore never rejects — matching the
AsyncResult contract used elsewhere in the library.

The retry loop respects `AbortSignal` between attempts only; it cannot
interrupt an in-flight invocation.

**Error identity**: a value thrown by `fn` is preserved **verbatim** inside a
[ThrownError](/0.20261102/api/reliability/#thrownerror) (`{ kind: 'Thrown', thrown }`), so the original `Error`
instance, its `stack` and its `cause` all survive. Pass `onThrow` to map the
throw onto your own error type instead.

**Aborted / no-attempt cases**: when the loop never invokes `fn` (a
pre-aborted `signal` or a non-finite / negative `times`), the resolved `Err`
carries an [AbortedError](/0.20261102/api/reliability/#abortederror) (`{ kind: 'Aborted', reason, times }`).
Pass `onAborted` to substitute your own shape.

**Error channels** — the resolved error is `E | TE | AE`, where each arm is
separately discriminable and separately collapsible:

* `E` — an `Err` your `fn` returned.
* `TE` — something *threw*. Defaults to [ThrownError](/0.20261102/api/reliability/#thrownerror), which keeps the
  thrown value verbatim; pass `onThrow` to fold it into `E`.
* `AE` — the loop never ran `fn` at all. Defaults to [AbortedError](/0.20261102/api/reliability/#abortederror);
  pass `onAborted` to fold it into `E`.

If a caller-supplied `onThrow` / `onAborted` factory itself throws, the
library falls back to the corresponding default sentinel rather than
rejecting — a broken factory must not take the whole contract down.

```ts
export async function retry<T, E, TE = ThrownError, AE = AbortedError>(
    fn: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
    options: RetryOptions<E, TE, AE> = {},
): Promise<IResultOfT<T, E | TE | AE>>;
```

Defined in: [reliability/retry.ts](https://github.com/sandlada/result/blob/main/src/reliability/retry.ts)

#### Examples

```ts
import { retry } from '@sandlada/result/reliability';
import { ok, err } from '@sandlada/result/factories';

const r = await retry(
  () => Promise.resolve(ok(42)),
  { times: 3, delayMs: n => 50 * (n + 1) }, // linear backoff
);
// Ok(42); on failure r.error: E | ThrownError | AbortedError — each narrowable.
```

**Collapsing every channel onto one domain error**

```ts
import { retry } from '@sandlada/result/reliability';
import { ok } from '@sandlada/result/factories';

type MyError =
  | { readonly kind: 'Unexpected'; readonly thrown: unknown }
  | { readonly kind: 'Cancelled'; readonly reason: unknown };

const r = await retry<number, MyError, MyError, MyError>(
  () => Promise.resolve(ok(42)),
  {
    onThrow:   (thrown) => ({ kind: 'Unexpected', thrown }),
    onAborted: (reason) => ({ kind: 'Cancelled', reason }),
  },
);
// r.error: MyError
```

***

### retryLazy()

Lazy counterpart to [retry](/0.20261102/api/reliability/#retry) — wraps an `AsyncResult` and defers
execution until the returned thunk is `run()`. Use when an existing AsyncResult
pipeline should retry transparently without changing upstream code.

Error channels mirror the eager [retry](/0.20261102/api/reliability/#retry): `E | TE | AE`, where `TE`
covers throws and `AE` covers the never-ran case. Supply `onThrow` /
`onAborted` to collapse them onto your own error type.

**Error identity**: like [retry](/0.20261102/api/reliability/#retry), a thrown value is preserved verbatim
inside a `ThrownError` (`{ kind: 'Thrown', thrown }`) — the original `Error`
instance, its `stack` and its `cause` all survive. Pass `onThrow` to map the
throw onto your own error type.

**Attempt numbering**: the `attempt` parameter passed to `shouldRetry` and
`onRetry` is **zero-based** (0 = first retry attempt after the initial call).
The total number of invocations is `options.times + 1` (initial + retries).

```ts
export function retryLazy<T, E, TE = ThrownError, AE = AbortedError>(
    ar: AsyncResult<T, E>,
    options: RetryOptions<E, TE, AE> = {},
): AsyncResult<T, E | TE | AE>;
```

Defined in: [reliability/retryLazy.ts](https://github.com/sandlada/result/blob/main/src/reliability/retryLazy.ts)

#### Example

```ts
import { retryLazy } from '@sandlada/result/reliability';
import { fromPromise } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';

const pipeline = retryLazy(fromPromise(() => Promise.resolve(ok(42))), { times: 3 });
const r = await pipeline.run();
```

***

### timeout()

Races an `AsyncResult` against a timeout. If the inner result does not settle
before `ms` milliseconds have elapsed, the returned AsyncResult resolves to an
`Err` produced by the optional `onTimeout` factory. The default factory yields
`{ kind: 'Timeout', ms }`.

`timeout` is **lazy** — it never triggers `ar.run()` until `.run()` is invoked.

**Duration bounds**: a timer can only express a bounded delay. Node clamps
anything it cannot represent to **1 ms** and emits a `TimeoutOverflowWarning`
/ `TimeoutNaNWarning`, so an un-clamped `Infinity` would expire immediately -
the opposite of what the caller asked for. The duration is therefore clamped
into the range a timer can honour (`Infinity` becomes the maximum timer
interval, `NaN` and negative values become zero), and the **effective**
duration is the one reported to `onTimeout` and carried by the default
`{ kind: 'Timeout', ms }` error.

**Cancellation caveat**: JavaScript Promises cannot be forcibly cancelled.
When the timer fires first, `timeout` returns `Err(onTimeout(ms))` but the
inner `ar.run()` **continues executing** in the background — its eventual
settlement is discarded. For long-running or resource-heavy inner work
(network I/O, file I/O, large computations), this is a resource leak. If
cooperative cancellation is required, wrap the inner work in a cancellable
primitive (e.g. one that listens to an `AbortSignal`) before passing it to
`timeout`.

```ts
export function timeout<T, E, TOE = TimeoutError>(
    ms: number,
    ar: AsyncResult<T, E>,
    onTimeout: (ms: number) => TOE = defaultOnTimeout as (ms: number) => TOE,
): AsyncResult<T, E | TOE>;
```

Defined in: [reliability/timeout.ts](https://github.com/sandlada/result/blob/main/src/reliability/timeout.ts)

#### Example

```ts
import { timeout } from '@sandlada/result/reliability';
import { fromPromise } from '@sandlada/result/async-result';

const safe = timeout(2000, fromPromise(() => fetch('/slow').then(r => r.json())));
const r = await safe.run();
// r is Ok(...) if fetch completed within 2000ms, else Err({ kind: 'Timeout', ms: 2000 }).
```

***

### timeoutEager()

Eager counterpart to [timeout](/0.20261102/api/reliability/#timeout). Wraps a `() => Promise<IResultOfT>`
to short-circuit slow runs into `Err(onTimeout(ms))`. Use this instead of
`timeout` when the upstream API returns a `Promise<IResultOfT>` rather than a
lazy `AsyncResult` thunk.

Accepts a `() => Promise<IResultOfT<T, E>>` and races it against the configured
timeout window. Reuses the same default `TimeoutError` shape as `timeout`, and
the same duration bounds: a non-finite or out-of-range `ms` is clamped before
it reaches the timer, so an `Infinity` deadline no longer expires after 1 ms.

**Sync-throw safety**: a synchronous throw from `fn` is converted to a
rejecting Promise via `Promise.resolve().then(fn)`, which `timeout`'s
rejection handler then converts to `Err(thrown)` — preserving the
AsyncResult no-rejection contract.

```ts
export function timeoutEager<T, E, TOE = TimeoutError>(
    ms: number,
    fn: () => Promise<IResultOfT<T, E>>,
    onTimeout?: (ms: number) => TOE,
): Promise<IResultOfT<T, E | TOE>>;
```

Defined in: [reliability/timeoutEager.ts](https://github.com/sandlada/result/blob/main/src/reliability/timeoutEager.ts)

#### Example

```ts
import { timeoutEager } from '@sandlada/result/reliability';
import { fromPromise } from '@sandlada/result/factories';

const r = await timeoutEager(2000, () => fromPromise(fetch('/slow')));
```
