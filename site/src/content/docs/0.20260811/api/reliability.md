---
editUrl: false
next: false
prev: false
title: reliability
slug: 0.20260811/api/reliability
---

## Interfaces

### AbortedError

Defined in: [reliability/retry.ts:122](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L122)

Default shape of the error produced when the retry loop never invokes `fn`
(pre-aborted signal, or a non-finite / negative `times`).

#### Properties

##### kind

> `readonly` **kind**: `"Aborted"`

Defined in: [reliability/retry.ts:123](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L123)

##### reason

> `readonly` **reason**: `unknown`

Defined in: [reliability/retry.ts:124](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L124)

##### times

> `readonly` **times**: `number`

Defined in: [reliability/retry.ts:125](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L125)

***

### EmptyInputsError

Defined in: [reliability/race.ts:66](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/race.ts#L66)

Default shape of the error produced by [race](/0.20260811/api/reliability/#race) when the input array is empty.
Library consumers can extend, narrow, or replace it via the `onEmpty` hook.

#### Properties

##### kind

> `readonly` **kind**: `"EmptyInputs"`

Defined in: [reliability/race.ts:67](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/race.ts#L67)

***

### RetryOptions

Defined in: [reliability/retry.ts:59](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L59)

Options for [retry](/0.20260811/api/reliability/#retry) and [retryLazy](/0.20260811/api/reliability/#retrylazy).

Each field has a sensible default; only set the knobs you actually need.

#### Type Parameters

##### E

`E` = `unknown`

— the error type your `fn` returns in its `Err`.

##### TE

`TE` = [`ThrownError`](/0.20260811/api/reliability/#thrownerror)

— the error produced when `fn` (or one of these hooks) *throws*.
Defaults to [ThrownError](/0.20260811/api/reliability/#thrownerror); override with `onThrow`.

##### AE

`AE` = [`AbortedError`](/0.20260811/api/reliability/#abortederror)

— the error produced when the loop never runs `fn` at all.
Defaults to [AbortedError](/0.20260811/api/reliability/#abortederror); override with `onAborted`.

#### Properties

##### delayMs?

> `readonly` `optional` **delayMs?**: `number` | ((`attempt`, `error`) => `number`)

Defined in: [reliability/retry.ts:70](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L70)

Delay between attempts in milliseconds.
Either a fixed number or a function of (zero-based attempt index, last error).
Default `0` (no delay). Negative values are clamped to `0`.

##### onAborted?

> `readonly` `optional` **onAborted?**: (`reason`, `times`) => `AE`

Defined in: [reliability/retry.ts:105](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L105)

Optional factory invoked when the retry loop exits without ever calling
`fn` (pre-aborted signal or non-finite / negative `times`). The returned
value becomes the `error` of the resolved `Err`. Without it the library
falls back to [AbortedError](/0.20260811/api/reliability/#abortederror).

###### Parameters

###### reason

`unknown`

###### times

`number`

###### Returns

`AE`

##### onRetry?

> `readonly` `optional` **onRetry?**: (`error`, `attempt`) => `void`

Defined in: [reliability/retry.ts:85](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L85)

Optional hook invoked **after** `shouldRetry` approves a retry and
**before** the backoff delay begins. Useful for logging or metrics
("will retry in Nms"); the value it returns is ignored.

###### Parameters

###### error

`E` | `TE`

###### attempt

`number`

###### Returns

`void`

##### onThrow?

> `readonly` `optional` **onThrow?**: (`thrown`) => `TE`

Defined in: [reliability/retry.ts:98](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L98)

Optional factory that converts a value thrown by `fn` (or by one of the
hooks above) into your own error type, collapsing `E | TE` back to `E`.
Without it the library preserves the thrown value verbatim inside a
[ThrownError](/0.20260811/api/reliability/#thrownerror).

###### Parameters

###### thrown

`unknown`

###### Returns

`TE`

##### shouldRetry?

> `readonly` `optional` **shouldRetry?**: (`error`, `attempt`) => `boolean`

Defined in: [reliability/retry.ts:79](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L79)

Predicate that decides whether to retry after a given failure.
Return `false` to stop retrying immediately and return the last result.
Default: always retry.

Receives `E | TE` because a throw from `fn` is a real failure your policy
has to classify — supply `onThrow` to collapse both into one shape.

###### Parameters

###### error

`E` | `TE`

###### attempt

`number`

###### Returns

`boolean`

##### signal?

> `readonly` `optional` **signal?**: `AbortSignal`

Defined in: [reliability/retry.ts:91](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L91)

Abort signal. If `signal.aborted` becomes `true` during the delay window,
the loop exits and the last result is returned (the supplied function is
never re-invoked past that point).

##### times?

> `readonly` `optional` **times?**: `number`

Defined in: [reliability/retry.ts:64](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L64)

Maximum retry attempts (excluding the first attempt). Default `3`.
Fractional values are floored — `times: 2.7` performs 3 attempts total.

***

### ThrownError

Defined in: [reliability/retry.ts:113](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L113)

Default shape of the error produced when `fn` throws instead of returning an
`Err`. The original thrown value is preserved verbatim in `thrown`, so the
`Error` instance, its `stack` and its `cause` all survive.

#### Properties

##### kind

> `readonly` **kind**: `"Thrown"`

Defined in: [reliability/retry.ts:114](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L114)

##### thrown

> `readonly` **thrown**: `unknown`

Defined in: [reliability/retry.ts:115](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L115)

***

### TimeoutError

Defined in: [reliability/timeout.ts:38](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/timeout.ts#L38)

Default shape of the error produced by [timeout](/0.20260811/api/reliability/#timeout) when no factory is given.
Library consumers can extend, narrow, or replace it via the `onTimeout` hook.

#### Properties

##### kind

> `readonly` **kind**: `"Timeout"`

Defined in: [reliability/timeout.ts:39](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/timeout.ts#L39)

##### ms

> `readonly` **ms**: `number`

Defined in: [reliability/timeout.ts:40](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/timeout.ts#L40)

## Type Aliases

### Settled

> **Settled**\<`T`, `E`> = \{ `error?`: `never`; `ok`: `true`; `value`: `T`; } | \{ `error`: `E`; `kind?`: `"Err"`; `ok`: `false`; `value?`: `never`; } | \{ `error`: `unknown`; `kind`: `"Rejected"`; `ok`: `false`; `value?`: `never`; }

Defined in: [reliability/allSettled.ts:43](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/allSettled.ts#L43)

Discriminated outcome of a single thunk in an `allSettled` batch.

Three variants — discriminated by `ok` and, for failures, by the `kind`
tag:

* `{ ok: true, value: T }` — the thunk resolved with `Ok`.
* `{ ok: false, error: E }` — the thunk resolved with `Err`.
* `{ ok: false, kind: 'Rejected', error: unknown }` — the inner `.run()`
  **rejected** the Promise (an upstream contract violation that
  `allSettled` defends against). The rejection value is preserved
  verbatim as `unknown` so consumers can narrow on `kind` before
  reading `error`. This avoids the type lie where rejection values
  (which can be `string`, `undefined`, or anything else) were cast
  into the user's `E` union.

#### Type Parameters

##### T

`T`

##### E

`E`

## Functions

### allSettled()

> **allSettled**\<`T`, `E`>(`results`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<[`Settled`](/0.20260811/api/reliability/#settled)\<`T`, `E`>\[], `never`>

Defined in: [reliability/allSettled.ts:53](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/allSettled.ts#L53)

Run every thunk; the result is **always** `Ok([...settled, ...in input order])`.
Unhandled rejections are captured as `{ ok: false, error: rejection }` rather than
propagated.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### results

readonly [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>\[]

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<[`Settled`](/0.20260811/api/reliability/#settled)\<`T`, `E`>\[], `never`>

***

### any()

> **any**\<`T`, `E`>(`results`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`\[], `AnyError`\<`E`>\[]>

Defined in: [reliability/any.ts:45](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/any.ts#L45)

AsyncResult analogue of `Promise.any`. Collects outcomes from every thunk; success
if any succeeded, failure (with all collected errors) if every thunk failed.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### results

readonly [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>\[]

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`\[], `AnyError`\<`E`>\[]>

***

### race()

#### Call Signature

> **race**\<`T`, `E`>(`results`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

Defined in: [reliability/race.ts:80](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/race.ts#L80)

Race — first `Ok` wins. If every thunk fails, returns the *first* `Err` in input order.
Inputs are echoed only lazily; calls to `.run()` are independent across all thunks.

A statically non-empty array cannot reach the empty branch, so that overload keeps
the error type at `E` and costs the caller nothing. Only a dynamically-sized array —
whose length is unknown at compile time — widens to `E | EE`.

##### Type Parameters

###### T

`T`

###### E

`E`

##### Parameters

###### results

readonly \[[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>, [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>]

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

#### Call Signature

> **race**\<`T`, `E`, `EE`>(`results`, `onEmpty?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `EE`>

Defined in: [reliability/race.ts:87](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/race.ts#L87)

##### Type Parameters

###### T

`T`

###### E

`E`

###### EE

`EE` = [`EmptyInputsError`](/0.20260811/api/reliability/#emptyinputserror)

— the error produced when `results` is empty. Defaults to
[EmptyInputsError](/0.20260811/api/reliability/#emptyinputserror); override by passing `onEmpty`.

##### Parameters

###### results

readonly [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>\[]

###### onEmpty?

() => `EE`

##### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `EE`>

***

### retry()

> **retry**\<`T`, `E`, `TE`, `AE`>(`fn`, `options?`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `TE` | `AE`>>

Defined in: [reliability/retry.ts:197](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retry.ts#L197)

Runs a fallible function, retrying on failure up to `options.times` times.

Synchronous throws AND promise rejections from `fn` are converted to `Err`,
as are throws escaping `shouldRetry`, `onRetry`, `delayMs`, `onThrow` and
`onAborted`. The returned promise therefore never rejects — matching the
AsyncResult contract used elsewhere in the library.

The retry loop respects `AbortSignal` between attempts only; it cannot
interrupt an in-flight invocation.

**Error channels** — the resolved error is `E | TE | AE`, where each arm is
separately discriminable and separately collapsible:

* `E` — an `Err` your `fn` returned.
* `TE` — something *threw*. Defaults to [ThrownError](/0.20260811/api/reliability/#thrownerror), which keeps the
  thrown value verbatim; pass `onThrow` to fold it into `E`.
* `AE` — the loop never ran `fn` at all. Defaults to [AbortedError](/0.20260811/api/reliability/#abortederror);
  pass `onAborted` to fold it into `E`.

If a caller-supplied `onThrow` / `onAborted` factory itself throws, the
library falls back to the corresponding default sentinel rather than
rejecting — a broken factory must not take the whole contract down.

#### Type Parameters

##### T

`T`

##### E

`E`

##### TE

`TE` = [`ThrownError`](/0.20260811/api/reliability/#thrownerror)

##### AE

`AE` = [`AbortedError`](/0.20260811/api/reliability/#abortederror)

#### Parameters

##### fn

() => [`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`> | `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

##### options?

[`RetryOptions`](/0.20260811/api/reliability/#retryoptions)\<`E`, `TE`, `AE`> = `{}`

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `TE` | `AE`>>

***

### retryLazy()

> **retryLazy**\<`T`, `E`, `TE`, `AE`>(`ar`, `options?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `TE` | `AE`>

Defined in: [reliability/retryLazy.ts:38](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/retryLazy.ts#L38)

Wraps an `AsyncResult` to add retry semantics without executing it.
The returned thunk defers work until `.run()` is called.

Error channels mirror the eager [retry](/0.20260811/api/reliability/#retry): `E | TE | AE`, where `TE`
covers throws and `AE` covers the never-ran case. Supply `onThrow` /
`onAborted` to collapse them onto your own error type.

#### Type Parameters

##### T

`T`

##### E

`E`

##### TE

`TE` = [`ThrownError`](/0.20260811/api/reliability/#thrownerror)

##### AE

`AE` = [`AbortedError`](/0.20260811/api/reliability/#abortederror)

#### Parameters

##### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### options?

[`RetryOptions`](/0.20260811/api/reliability/#retryoptions)\<`E`, `TE`, `AE`> = `{}`

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `TE` | `AE`>

***

### timeout()

> **timeout**\<`T`, `E`, `TOE`>(`ms`, `ar`, `onTimeout?`): [`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `TOE`>

Defined in: [reliability/timeout.ts:50](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/timeout.ts#L50)

Wraps an AsyncResult so that slow runs turn into `Err(onTimeout(ms))` after
`ms` milliseconds have elapsed. The inner `run()` keeps going in the
background — its eventual settlement is ignored.

#### Type Parameters

##### T

`T`

##### E

`E`

##### TOE

`TOE` = [`TimeoutError`](/0.20260811/api/reliability/#timeouterror)

#### Parameters

##### ms

`number`

##### ar

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E`>

##### onTimeout?

(`ms`) => `TOE`

#### Returns

[`AsyncResult`](/0.20260811/api/types/#asyncresult)\<`T`, `E` | `TOE`>

***

### timeoutEager()

> **timeoutEager**\<`T`, `E`, `TOE`>(`ms`, `fn`, `onTimeout?`): `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `TOE`>>

Defined in: [reliability/timeoutEager.ts:32](https://github.com/sandlada/result/blob/a046681687e0d8c2573beff3f5115a87c3383b2b/src/reliability/timeoutEager.ts#L32)

Eager `timeout` — accepts a `() => Promise<IResultOfT<T, E>>` and races it
against the configured timeout window.

Reuses the same default `TimeoutError` shape as `timeout`.

**Sync-throw safety**: a synchronous throw from `fn` is converted to a
rejecting Promise via `Promise.resolve().then(fn)`, which `timeout`'s
rejection handler then converts to `Err(thrown)` — preserving the
AsyncResult no-rejection contract.

#### Type Parameters

##### T

`T`

##### E

`E`

##### TOE

`TOE` = [`TimeoutError`](/0.20260811/api/reliability/#timeouterror)

#### Parameters

##### ms

`number`

##### fn

() => `Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E`>>

##### onTimeout?

(`ms`) => `TOE`

#### Returns

`Promise`\<[`IResultOfT`](/0.20260811/api/types/#iresultoft)\<`T`, `E` | `TOE`>>
