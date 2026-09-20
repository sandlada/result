# Behavior Modes

> This document is the single source of truth for the error-handling behavior of the whole library: unified terminology plus a per-module list of what every API does with throws, failure inputs, and empty inputs.
> Full signatures and JSDoc live in the source files; this document only settles behavioral conclusions and links back to them.
> The channel policy is checked by the consistency guard in `src/tests/hardening/behavior-policy.spec.ts`: a new public export that is not registered in `behavior-matrix.ts`, or a probe that contradicts the declared behavior, fails `npm test`.
> See also the module map in [AGENTS.md](../AGENTS.md); each module's API index lives in its own `src/<module>/README.md`, and ADR-level rationale lives in `src/types/README.md`.

## 1. Reading guide: the exact scope of `exception-free`

`exception-free` at the top of `README` and `SPEC` means **the main flow carries errors as values**: success and failure both travel explicitly in the type system as plain objects (`IResultOfT` / `IOption`), so callers know a function can fail without a `try`/`catch`.

It does **not** mean "the library never throws". The following three throw channels are part of the design:

1. **Callback propagation**: some operators do not capture throws from the function they are given and let them bubble up unchanged (see the per-module tables in §4).
2. **Escape hatches**: the `unwrap` / `expect` / `unsafe*` / `orThrow` family throws deliberately on contract violations (see the escape-hatch table in §4.2).
3. **The async rejection channel**: a `reject` on the outer `Promise` itself always stays a rejection; it is never converted into `Err` (see §4.6). Only the `reliability` layer promises never to reject.

To decide whether an API throws, consult the tables in §4 — do not guess from the name (for example, synchronous `map` captures but `bind` propagates).

## 2. Glossary

| Term | Definition |
| --- | --- |
| NeverThrow | The function body contains no `throw`; an internal `try`/`catch` turns throws into `Err` / `None` / a default value. |
| CatchToErr | A synchronous throw from a callback is captured and turned into `Err` (on the `Option` side, into `None` / a default value). Whether a throw from `errorFn` itself is captured a second time is noted separately in each table. |
| Propagate | A throw from a callback, or a rejected `Promise` it returns, is not captured and is handed to the caller as-is. |
| Panic | On misuse, `throw new TypeError` / `new Error` marks a contract violation (Rust-style `unwrap` semantics). |
| ThrowRaw | The carried value is thrown as-is (`throw r.error`), without wrapping it in a `TypeError`. |
| ThrowTyped | A typed error is thrown: either the value is thrown directly when `E extends Error`, or it is mapped through `errorFn` first. |
| FailFirst | Return on the first `Err` / `None` without processing the remaining inputs. Note: `FailFast` is a synonym; this document consistently uses `FailFirst`. |
| Accumulate | Run every input and collect all errors into an `Err(E[])` before returning. |
| NeverRejects | The returned `Promise` never enters the rejected state; throws and rejections are all collapsed into `Err`. Only the `reliability` layer gives this guarantee. |
| Lazy / Eager | A lazy result returns a thunk and does nothing until `run()` is called; an eager one starts the chain on the call and returns an in-flight `Promise`. |

## 3. Overview matrix

| Module | Callback throws | Failure inputs | Empty inputs | Execution timing |
| --- | --- | --- | --- | --- |
| `factories` | No callbacks to construct; `fromThrowable` / `tryCatch` / `fromPromise` / `fromSafePromise` capture to values (`fromSafePromise` normalizes a non-`Error` rejection value to `Error` when no `errorFn` is given) | Not applicable | Not applicable | Synchronous; `fromPromise` returns a `Promise` |
| `operators` | Split: the `map` family captures (`choose` is the exception: it propagates and skips `Err`), the `bind` family propagates, escape hatches throw deliberately | Mostly `FailFirst`; `separate` accumulates into partitions | Not applicable | Synchronous |
| `combine` | Pure value combination, no callbacks | `combine` / `all` fail fast, `combineWithAllErrors` accumulates errors | `Ok([])` | Synchronous |
| `composition` | `pipe` / `pipeAsync` propagate (`pipeAsync` turns a synchronous step throw into a rejection and does not unwrap thenables); `composeK` / `composeKAsync` capture to values (the async variant also captures rejections); `safeTry` / `safeTryAsync` rethrow generator throws (the async variant throws `TypeError` on an invalid resolved value and rejects on its own throws) | `FailFirst` (through `bind`) | `composeK` / `composeKAsync` panic at construction time with zero functions | Synchronous composition; `fromSafeTryAsync` is lazy |
| `adapters` | `switchFn` captures, `tee` propagates, `liftMap` delegates to `map`'s capturing | Propagate / convert; there is no short-circuit concept | Not applicable | Synchronous |
| `primitives` | `cond` / `reduce` propagate; `lift` is dual-state (captures with an `errorFn`, propagates without one) | `sequence` / `reduce` fail fast | Not applicable | Synchronous; `sequenceAsyncResult` is lazy (construction only grabs the `run` reference, and a synchronous throw inside `run()` also propagates) |
| `option` | Everything except `match` captures to `None` / a default value | Short-circuits on `None` | `all([])` is rejected at the type level (unlike `combine`) | Synchronous, zero panic APIs |
| `promise-result` | Split: the `map` / `tap` / `bimapAsync` / `asyncBindThrough` / `bindThroughAsync` families capture to values, the `bind` / `match` / `catchErrAsync` families propagate | `FailFirst` / accumulate (as in `combine`) | `Ok([])`; an outer rejection stays a rejection | Eager |
| `promise-option` | Everything except the lifting family captures to `None` / a default value; the lifting family turns synchronous throws into `None` but lets rejections propagate (`asyncMapOption` / `asyncBindOption` / `asyncTapOption` / `asyncOrElseOption` / `tapErrAsyncOption`) | Short-circuits on `None` | No combination APIs | Eager |
| `async-result` | Everything except the propagating `mapAsync` / `mapOrElse` / `match` / `exists` / `unwrapOrElse` / `ap` captures to values (`ap` is a lazy middleware) | `FailFirst` / accumulate | `Ok([])` | Lazy: middleware does not run, terminals trigger it |
| `async-option` | Everything except the propagating `match` / `mapOrElse` / `unwrapOrElse` / `exists` / `zipWith` captures to values (`mapAsync` is the opposite of the `async-result` side: it captures here, by declaration) | Short-circuits on `None` (`all` actually runs every carrier; see §5, item 3) | `Some([])`; `zipWith` returns `None` on missing arguments | Lazy, triggered by terminals |
| `reliability` | Always captures to values and never rejects | `race` settles on the first `Ok`; `any` / `allSettled` run every input | `race([])` becomes `Err`; the others return an empty success | `retry` / `timeoutEager` are eager, the rest are lazy |
| `observability` | `observe` / `installObserver` / `tapErrContext` swallow observer errors without changing the outcome; `ctx` is `AsyncLocalStorage` breadcrumbs | Propagate | Not applicable | Synchronous |

## 4. Per-module reference

### 4.1 Factories (`src/factories/`)

| Exports | Behavior | Source |
| --- | --- | --- |
| `ok` / `err` | Never throw, plain object literals | [ok.ts](../src/factories/ok.ts), [err.ts](../src/factories/err.ts) |
| `fromPredicate` | Never throws itself; a throw from the supplied `predicate` propagates | [fromPredicate.ts](../src/factories/fromPredicate.ts) |
| `fromThrowable` / `tryCatch` | Capture to values; a second throw from `errorFn` is captured by the inner handler as well | [fromThrowable.ts](../src/factories/fromThrowable.ts), [tryCatch.ts](../src/factories/tryCatch.ts) |
| `fromSafePromise` | Captures to values; without an `errorFn`, a non-`Error` rejection value is normalized to `new Error(String(e))`, and a throw from `errorFn` is also collapsed; `E` defaults to `Error` | [fromSafePromise.ts](../src/factories/fromSafePromise.ts) |
| `fromPromise` / `tryCatchAsync` / `asyncOk` / `asyncErr` | Capture to values; a `Promise` rejection becomes `Err` instead of staying a rejection | [fromPromise.ts](../src/factories/fromPromise.ts), [tryCatchAsync.ts](../src/factories/tryCatchAsync.ts) |

### 4.2 Synchronous operators (`src/operators/`)

**Transform and recover: callback behavior is split — use the table.**

| Exports | Callback throws | Failure inputs | Source |
| --- | --- | --- | --- |
| `map` / `orElse` / `tap` / `tapErr` / `bimap` / `filterOrElse` / `traverseArray` / `ap` / `andTee` / `orTee` / `andThrough` | Capture to values (`orElse` / `bimap` / `filterOrElse` also collapse a second throw from `errorFn`; a second throw from the `errorFn` of the `map` / `tap` family propagates) | Fail fast (`FailFirst`) | [map.ts](../src/operators/map.ts), [orElse.ts](../src/operators/orElse.ts), [tap.ts](../src/operators/tap.ts), [bimap.ts](../src/operators/bimap.ts), [filterOrElse.ts](../src/operators/filterOrElse.ts), [traverseArray.ts](../src/operators/traverseArray.ts), [ap.ts](../src/operators/ap.ts) |
| `bind` / `mapErr` / `match` / `catchErr` / `unwrapOrElse` / `mapOr` / `mapOrElse` / `exists` | Propagate directly, no capturing | Fail fast, or dispatch per branch; `mapOr` / `mapOrElse` take the default branch on failure | [bind.ts](../src/operators/bind.ts), [mapErr.ts](../src/operators/mapErr.ts), [match.ts](../src/operators/match.ts), [unwrapOrElse.ts](../src/operators/unwrapOrElse.ts) |
| `choose` | Propagates directly without capturing; skips `Err` and keeps going (neither fail-fast nor accumulation) | Same as the left cell | [choose.ts](../src/operators/choose.ts) |
| `flatten` / `and` / `or` / `swap` / `unwrapOr` / `contains` / `separate` / `unzip` | No callbacks, never throw; `separate` accumulates into partitions, the rest short-circuit or project | Same as the left cell | [combine.ts](../src/combine/combine.ts), [separate.ts](../src/operators/separate.ts) |

**Terminal escape hatches: do not mix the four throw modes.**

| Exports | Behavior | When to choose it | Source |
| --- | --- | --- | --- |
| `unwrap` / `expect` / `unwrapErr` / `expectErr` | Contract panic: `throw new TypeError` on violation, with `throwingFn` available to customize the thrown class | Debugging and tests, where a stack trace and an explicit misuse signal matter | [unwrap.ts](../src/operators/unwrap.ts), [expect.ts](../src/operators/expect.ts), [unwrapErr.ts](../src/operators/unwrapErr.ts), [expectErr.ts](../src/operators/expectErr.ts) |
| `unsafeUnwrap` / `unsafeUnwrapErr` | Throw raw: `throw r.error` / `throw r.value`, wrappers omitted | Escape hatch: hand an error value you already know about to an outer `try`/`catch` | [unsafeUnwrap.ts](../src/operators/unsafeUnwrap.ts), [unsafeUnwrapErr.ts](../src/operators/unsafeUnwrapErr.ts) |
| `orThrow` / `orThrowWith` | Throw typed: `orThrow` requires `E extends Error`; `orThrowWith` maps through `errorFn` first | Production code that must throw a typed `Error` subclass | [orThrow.ts](../src/operators/orThrow.ts) |

### 4.3 Composition (`src/combine/`, `src/composition/`)

| Exports | Behavior | Source |
| --- | --- | --- |
| `combine` / `all` | Fail fast (`FailFirst`), keeping the first `Err`; an empty array returns `Ok([])`; pure value combination that never throws | [combine.ts](../src/combine/combine.ts), [all.ts](../src/combine/all.ts) |
| `combineWithAllErrors` | Accumulates errors; an empty array returns `Ok([])`; never throws | [combineWithAllErrors.ts](../src/combine/combineWithAllErrors.ts) |
| `pipe` / `pipeAsync` | Propagate directly: a synchronous throw in any `pipe` step bubbles out; `pipeAsync` turns a synchronous step throw into a rejection and does not unwrap thenables (a mixed chain passes the raw value on); it is unaware of `Err` | [pipe.ts](../src/composition/pipe.ts), [pipeAsync.ts](../src/composition/pipeAsync.ts) |
| `composeK` | Captures to values: a synchronous step throw becomes `Err` and fails fast; a contract panic at construction time with zero functions | [composeK.ts](../src/composition/composeK.ts) |
| `composeKAsync` | Captures to values: synchronous throws and async rejections both become `Err`; a contract panic at construction time with zero functions | [composeKAsync.ts](../src/composition/composeKAsync.ts) |
| `safeTry` / `fromSafeTry` | Rethrows generator throws; throws an `Error` when the generator succeeds without a value or yields twice | [safeTry.ts](../src/composition/safeTry.ts) |
| `safeTryAsync` / `fromSafeTryAsync` | Rethrows generator throws (surfacing as rejections); throws a `TypeError` on an invalid resolved value; `fromSafeTryAsync` returns a lazy thunk | [safeTryAsync.ts](../src/composition/safeTryAsync.ts) |

### 4.4 Adapters and high-frequency primitives (`src/adapters/`, `src/primitives/`)

| Exports | Behavior | Source |
| --- | --- | --- |
| `switchFn` / `switchFnAsync` | Capture to values (including a second collapse for `errorFn`) | [switchFn.ts](../src/adapters/switchFn.ts) |
| `tee` / `teeAsync` | Propagate directly (there is no failure state to convert) | [tee.ts](../src/adapters/tee.ts) |
| `toOption` / `fromOption` | Never throw | [toOption.ts](../src/adapters/toOption.ts), [fromOption.ts](../src/adapters/fromOption.ts) |
| `liftMap` | Delegates to `operators/map`: a callback throw is captured as `Err` | [liftMap.ts](../src/adapters/liftMap.ts) |
| `cond` / `condErr` / `reduce` | Propagate directly; `reduce` additionally fails fast on a failed source or step | [cond.ts](../src/primitives/cond.ts), [reduce.ts](../src/primitives/reduce.ts) |
| `sequence` / `partitionOption` | Never throw; `sequence` delegates to `combine` and fails fast | [sequence.ts](../src/primitives/sequence.ts) |
| `lift` | Dual-state: with an `errorFn` it captures to values, without one it rethrows as-is. Note that `E = never` is only a type-level guarantee — the runtime can still throw | [lift.ts](../src/primitives/lift.ts) |
| `sequenceAsyncResult` | Lazy (construction only grabs the `run` reference); a synchronous throw and a runtime rejection inside `run()` both propagate as rejections, failing fast | [sequenceAsyncResult.ts](../src/primitives/sequenceAsyncResult.ts) |

### 4.5 Option (`src/option/`)

The whole module never throws (except `match`, which propagates), callback throws are always collapsed into `None` / a default value, and it short-circuits on `None`. The module deliberately has no panic APIs; use `unwrapOr` to extract.

| Exports | Behavior | Source |
| --- | --- | --- |
| `ofSome` / `ofNone` / `flatten` / `contains` / `unwrapOr` / `okOr` / `transpose` | Never throw; no callbacks or callback-independent | [ofSome.ts](../src/option/ofSome.ts), [unwrapOr.ts](../src/option/unwrapOr.ts) |
| `map` / `bind` / `filter` / `tap` / `orElse` / `okOrElse` / `zipWith` | Capture to values: a throwing callback returns `None` / the default value | [map.ts](../src/option/map.ts), [bind.ts](../src/option/bind.ts), [zipWith.ts](../src/option/zipWith.ts) |
| `traverseArray` / `traverse` | Capture to values: a throwing callback or a throwing iterator `next()` returns `None` | [traverseArray.ts](../src/option/traverseArray.ts) |
| `match` | Terminal that propagates | [match.ts](../src/option/match.ts) |
| `all` | Short-circuits on `None`; an empty tuple is rejected at the type level | [all.ts](../src/option/all.ts) |

### 4.6 Eager async (`src/promise-result/`, `src/promise-option/`)

Shared rule: eager execution that starts the chain on the call; **a rejection of the outer `Promise` itself always stays a rejection** and is never converted into `Err` / `None`.

| Exports | Callback behavior | Source |
| --- | --- | --- |
| `promise-result`'s `map` / `mapErr` / `mapAsync` / `bimapAsync` / `asyncBindThrough` / `bindThroughAsync` / the `tap` family / `asyncMap` / `asyncTap` | Capture to values; for a synchronous mapper that returns a thenable, `map` additionally throws an `Error` pointing at `mapAsync` | [map.ts](../src/promise-result/map.ts), [mapAsync.ts](../src/promise-result/mapAsync.ts), [bimapAsync.ts](../src/promise-result/bimapAsync.ts), [asyncBindThrough.ts](../src/promise-result/asyncBindThrough.ts), [bindThroughAsync.ts](../src/promise-result/bindThroughAsync.ts) |
| `promise-result`'s `bind` / `orElse` / `match` / `mapOrElse` / `unwrapOrElse` / `exists` / `filterOrElse` / `ap` / the `catchErrAsync` family / `asyncMatch` | Propagate directly; `mapOrAsync` is the special case that captures, returns the default value, and swallows observer exceptions | [bindAsync.ts](../src/promise-result/bindAsync.ts), [matchAsync.ts](../src/promise-result/matchAsync.ts), [catchErrAsync.ts](../src/promise-result/catchErrAsync.ts), [asyncMatch.ts](../src/promise-result/asyncMatch.ts) |
| `promise-result`'s `combine` / `combineWithAllErrors` | The former fails fast, the latter accumulates errors; an empty array returns `Ok([])`; a rejection of any outer promise rejects the whole combination | [combine.ts](../src/promise-result/combine.ts) |
| `promise-option`'s `map` / `bind` / `filter` / `exists` / `orElse` / `tap` / the `mapOr` family | Capture to values: a throwing callback or an async rejection is always collapsed into `None` / `false` / the default value | [mapAsyncOption.ts](../src/promise-option/mapAsyncOption.ts), [bindAsyncOption.ts](../src/promise-option/bindAsyncOption.ts) |
| `promise-option`'s lifting family `asyncMapOption` / `asyncBindOption` / `asyncTapOption` / `asyncOrElseOption` / `tapErrAsyncOption` | A synchronous throw becomes `None`; an async rejection propagates | [asyncMapOption.ts](../src/promise-option/asyncMapOption.ts), [asyncBindOption.ts](../src/promise-option/asyncBindOption.ts), [asyncOrElseOption.ts](../src/promise-option/asyncOrElseOption.ts), [tapErrAsyncOption.ts](../src/promise-option/tapErrAsyncOption.ts) |
| `promise-option`'s `asyncMatchOption` / `matchAsyncOption` / `mapOrElseAsyncOption` / `unwrapOrElseAsyncOption` | Propagate directly (a synchronous throw becomes a rejection) | [asyncMatchOption.ts](../src/promise-option/asyncMatchOption.ts) |

This layer deliberately has no `unwrap` / `expect` / `orThrow`; extraction goes through the `unwrapOr*` family, whose async rejections travel on the outer rejection channel.

### 4.7 Lazy async (`src/async-result/`, `src/async-option/`)

Shared rule: middleware returns a new thunk and does not execute; terminals such as `match` / `unwrap` / `unwrapOr` return a `Promise` and call `run()` immediately.

| Exports | Behavior | Source |
| --- | --- | --- |
| `from` / `fromResult` / `fromOption` | Pure lazy wrapping: no conversion, no execution | [from.ts](../src/async-result/from.ts), [fromOption.ts](../src/async-option/fromOption.ts) |
| `async-result`'s `fromPromise` | Captures to values: a thunk throw or rejection becomes `Err`, and a second throw from `errorFn` is collapsed too | [fromPromise.ts](../src/async-result/fromPromise.ts) |
| `async-option`'s `fromPromise` | Captures to values: the signature is only `(thunk) => Promise` with no `errorFn`; a throw or rejection always becomes `None` | [fromPromise.ts](../src/async-option/fromPromise.ts) |
| `async-result`'s `map` / `bind` / `bimap` / `mapErr` / `mapErrAsync` / `orElse` / `filterOrElse` / `tap` / `tapAsync` / `andThrough` / `catchErr` | Capture to values (including an async rejection from the inner carrier of `bind` / `orElse` and a failed recovery callback in `catchErr`); a misused thenable in `map` collapses into `Err(Error)` instead of throwing | [map.ts](../src/async-result/map.ts), [bind.ts](../src/async-result/bind.ts), [catchErr.ts](../src/async-result/catchErr.ts) |
| `async-result`'s `mapAsync` | Propagates directly (the only counterexample in this layer); `errorFn` only remaps the rejection reason and still throws | [mapAsync.ts](../src/async-result/mapAsync.ts) |
| `async-result`'s `match` / `exists` / `unwrapOrElse` (terminals) plus `ap` (lazy middleware) / `mapOrElse` | Propagate directly; `mapOr` is the special case that captures and returns the default value | [match.ts](../src/async-result/match.ts), [exists.ts](../src/async-result/exists.ts), [ap.ts](../src/async-result/ap.ts) |
| `async-result`'s `unwrap` / `unwrapErr` / `expect` / `expectErr` | Terminal contract panics; `cause` keeps the original `E` | [unwrap.ts](../src/async-result/unwrap.ts), [expect.ts](../src/async-result/expect.ts) |
| `async-result`'s `combine` / `combineWithAllErrors` | The former fails fast, the latter accumulates errors; an empty array returns `Ok([])`; nothing runs at construction time, and `run()` starts every carrier through `Promise.all` (no short-circuit at execution time) | [combine.ts](../src/async-result/combine.ts) |
| `async-option`'s `map` / `mapAsync` / `bind` / `filter` / `tap` / `orElse` / `mapOr` / `okOrElse` | Capture to values (`mapAsync` captures fully, the opposite of `async-result/mapAsync`, by declaration; includes async rejections from the inner carrier of `bind` / `orElse`) | [map.ts](../src/async-option/map.ts), [filter.ts](../src/async-option/filter.ts) |
| `async-option`'s `match` / `mapOrElse` / `unwrapOrElse` / `exists` / `zipWith` | Propagate directly | [match.ts](../src/async-option/match.ts), [zipWith.ts](../src/async-option/zipWith.ts) |
| `async-option`'s `unwrap` | Terminal contract panic (the only panic API in this layer) | [unwrap.ts](../src/async-option/unwrap.ts) |
| `async-option`'s `all` | An empty array returns `Some([])`; any `None` returns `None`; `Promise.all` starts every carrier (see §5, item 3) | [all.ts](../src/async-option/all.ts) |

### 4.8 Reliability (`src/reliability/`)

This is the only async layer that promises never to reject: synchronous throws, async rejections, and hook throws are all collapsed into `Err`.

| Exports | Behavior | Source |
| --- | --- | --- |
| `retry` / `retryLazy` | Capture to values: a throw from `fn` becomes `ThrownError` (carrying the original value); an invalid `times` or an already-aborted signal returns `AbortedError` without running `fn`; `onThrow` / `onAborted` can collapse these into your own `E`; the lazy variant only postpones execution to `run()` | [retry.ts](../src/reliability/retry.ts), [retryLazy.ts](../src/reliability/retryLazy.ts) |
| `timeout` / `timeoutEager` | Capture to values: an inner rejection becomes `Err(reason)`, a timeout becomes `Err(onTimeout(ms))`; after a timeout the inner operation keeps running in the background (it cannot be cancelled) | [timeout.ts](../src/reliability/timeout.ts), [timeoutEager.ts](../src/reliability/timeoutEager.ts) |
| `race` | The first `Ok` wins; if all fail, the first `Err` in input order; `Err` beats a rejection; if all reject, the earliest rejection; an empty array returns `Err(EmptyInputsError)`, replaceable through `onEmpty` | [race.ts](../src/reliability/race.ts) |
| `any` | Runs everything; returns the success set when there is one, otherwise the error set; rejections are marked `{ kind: 'Rejected' }`; an empty array returns `Ok([])` | [any.ts](../src/reliability/any.ts) |
| `allSettled` | Always `Ok`: returns each outcome in input order; an empty array returns `Ok([])` | [allSettled.ts](../src/reliability/allSettled.ts) |

### 4.9 Observability (`src/observability/`)

`ctx` / `withPath` maintain per-scope breadcrumb frames with `AsyncLocalStorage` (Node/Bun/Deno, falling back to a polyfill), isolated across `await` and supporting nested chains; observer errors from `tapErrContext` / `observe` / `installObserver` are always swallowed (including a second swallow inside `onError`) and never change the main flow. The `format` / `inspect` formatters never throw. See [ctx.ts](../src/observability/ctx.ts) and the [observability module spec](../src/observability/README.md).

## 5. Deliberate special cases and asymmetries

1. **The zero-panic API of `option` / `promise-*` is deliberate**: `Option` expresses absence with `None`, so there is nothing to panic about; the eager `Promise` layer extracts with `unwrapOr*` to avoid opening a throw channel next to the rejection channel.
2. **`async-option` has only `unwrap`, no `expect` / `orThrow`**: this asymmetry against the `async-result` quartet means that at the end of a pipeline you first bridge to `AsyncResult` with `okOr` / `okOrElse` and then throw a typed error.
3. **Async combination does not short-circuit**: `async-option/all`, `async-result/combine`, and `async-result/combineWithAllErrors` all start every carrier through `Promise.all`; "short-circuit" only shows in result selection (first `None` / first `Err`) or error accumulation, while every side effect still happens. Do not treat them as equivalents of the synchronous `combine` / `all`.
4. **`map` captures but `bind` propagates**: the `map` callback is a pure value mapping, so capturing is safe; the `bind` callback returns the next `Result` and is a railway switch, so propagating avoids swallowing programming errors outside the railway.
5. **`E = never` on `lift` does not mean the runtime cannot throw**: without an `errorFn` it rethrows as-is, and the type-level `never` only marks that the caller has to catch it themselves.
6. **`mapOrAsync` swallows observer exceptions**: it returns the default value while swallowing a throw from `onErr` itself, so expect a lost cause when debugging.

## 6. Choosing an escape hatch

- Want a stack trace and an explicit misuse signal (tests, assertions): the `unwrap` / `expect` family.
- Want to hand a known error value to an outer `try`/`catch`: `unsafeUnwrap` / `unsafeUnwrapErr`.
- Want to throw a typed `Error` subclass (production boundaries): `orThrow` (when `E extends Error`) or `orThrowWith` (constructed with a mapping function).
- At the end of an `AsyncResult`: collapse with the terminal `match` / `unwrapOr` first, and when a throw is genuinely required use `async-result`'s `unwrap` / `expect` (`cause` keeps the original error); at the end of an `AsyncOption`, `okOr` first and then throw.
