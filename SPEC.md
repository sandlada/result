# SPEC.md — `@sandlada/result` API Index

> Public API index. Each entry links to its source file — full type signatures and JSDoc live in the source itself.
> For internal architecture, see [ARCH.md](./ARCH.md).

## Overview

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a type-safe, exception-free approach to error handling. Errors are first-class values carried in the type system, so you never have to wonder whether a function can fail.

The library exposes:

- `IResult<TError>` / `IResultOfT<TValue, TError>` — value-bearing success/failure discriminated unions.
- `IOption<T>` — optional value (Some / None).
- Standalone FP operators — data-last curried functions for transformation.
- Generic `TError` — you define your own error shapes.

> No classes, no prototype methods, no sentinel values. Everything is built on plain discriminated union objects with standalone functions.

## Installation

```bash
npm install @sandlada/result
```

> **ESM only.** This package cannot be used with `require()`. Use `import` (ESM) or dynamic `import()` in CJS contexts.

## Import Paths

| Entry point | Contents |
| --- | --- |
| `@sandlada/result` | **Type-focused barrel.** Re-exports `IResult`, `IResultOfT`, `IOption`, `AsyncResult`, `AsyncOption`, plus the runtime `moduleMarker`. Functional runtime values must come from a subpath. |
| `@sandlada/result/factories` | Core constructors (`ok`, `err`, `asyncOk`, `asyncErr`, `fromPredicate`, `tryCatch`, etc.). |
| `@sandlada/result/operators` | Sync operators on `IResultOfT` (`map`, `bind`, `match`, `pipe` companions, …). |
| `@sandlada/result/option` | Sync `IOption<T>` operators (`ofSome`, `ofNone`, `map`, `bind`, `okOr`, `transpose`, …). |
| `@sandlada/result/async-result` | Lazy `AsyncResult<T, E>` thunk operators. |
| `@sandlada/result/async-option` | Lazy `AsyncOption<T>` thunk operators. |
| `@sandlada/result/promise-result` | Eager async operators on `Promise<IResultOfT<T, E>>`. |
| `@sandlada/result/promise-option` | Eager async operators on `Promise<IOption<T>>`. |
| `@sandlada/result/composition` | `pipe`, `composeK`, `safeTry`, etc. |
| `@sandlada/result/adapters` | `toOption`, `fromOption`, `switchFn`, `tee`, etc. |
| `@sandlada/result/combine` | Parallel combination (`combine`, `combineWithAllErrors`). |
| `@sandlada/result/reliability` | Retry / timeout / concurrency. |
| `@sandlada/result/observability` | Breadcrumbs + formatters + observer hooks. |
| `@sandlada/result/primitives` | High-frequency helpers (`cond`, `reduce`, `partitionOption`, `lift`). |
| `@sandlada/result/types` | Re-exports the same type contracts as `@sandlada/result`, plus its own runtime `moduleMarker` — kept for backward compatibility. |

### Runtime Entry Markers

| Export | Entry points | Description |
| --- | --- | --- |
| `moduleMarker` | `@sandlada/result`, `@sandlada/result/types` | Empty object that materializes each type-focused entry and its JavaScript sourcemap. It has no domain behavior. |

## Core Types

| Type | Source |
| --- | --- |
| `IResult<TError>`, `IResultSuccess`, `IResultFailure` | [src/types/IResult.ts](./src/types/IResult.ts) |
| `IResultOfT<TValue, TError>`, `IResultOfTSuccess`, `IResultOfTFailure` | [src/types/IResultOfT.ts](./src/types/IResultOfT.ts) |
| `IOption<T>`, `IOptionSome`, `IOptionNone` | [src/types/Option.ts](./src/types/Option.ts) |
| `AsyncResult<TValue, TError>`, `AsyncResultCarrier` | [src/types/AsyncResult.ts](./src/types/AsyncResult.ts) |
| `AsyncOption<T>` | [src/types/AsyncOption.ts](./src/types/AsyncOption.ts) |

All result and option values are plain discriminated union objects with `readonly` properties. `value` and `error` are variant-exclusive — accessing the wrong one is a compile-time type error.

## API Index

### Factories — `src/factories/`

| Export | Description | Source |
| --- | --- | --- |
| `ok` / `ok(value)` | Void or value-bearing success. | [src/factories/ok.ts](./src/factories/ok.ts) |
| `err` | Failure with error. | [src/factories/err.ts](./src/factories/err.ts) |
| `fromPredicate` | `Ok(value)` if predicate passes, else `Err(error)`. | [src/factories/fromPredicate.ts](./src/factories/fromPredicate.ts) |
| `fromThrowable` | Wrap a throwing function into a Result. | [src/factories/fromThrowable.ts](./src/factories/fromThrowable.ts) |
| `tryCatch` | Execute and catch throws. | [src/factories/tryCatch.ts](./src/factories/tryCatch.ts) |
| `tryCatchAsync` | Async counterpart. | [src/factories/tryCatchAsync.ts](./src/factories/tryCatchAsync.ts) |
| `fromPromise` | Wrap a Promise into a Result. | [src/factories/fromPromise.ts](./src/factories/fromPromise.ts) |
| `fromSafePromise` | Wrap a never-reject Promise. | [src/factories/fromSafePromise.ts](./src/factories/fromSafePromise.ts) |
| `asyncOk` | Pre-resolved success Promise. | [src/factories/asyncOk.ts](./src/factories/asyncOk.ts) |
| `asyncErr` | Pre-resolved failure Promise. | [src/factories/asyncErr.ts](./src/factories/asyncErr.ts) |

### Sync Operators — `src/operators/`

| Export | Description | Source |
| --- | --- | --- |
| `map` | Transform success value. | [src/operators/map.ts](./src/operators/map.ts) |
| `mapErr` | Transform error. | [src/operators/mapErr.ts](./src/operators/mapErr.ts) |
| `bind` | Monadic chain. | [src/operators/bind.ts](./src/operators/bind.ts) |
| `orElse` | Error recovery. | [src/operators/orElse.ts](./src/operators/orElse.ts) |
| `match` | Terminal pattern-match. | [src/operators/match.ts](./src/operators/match.ts) |
| `tap` / `tapErr` | Side-effects on success / failure. | [src/operators/tap.ts](./src/operators/tap.ts), [src/operators/tapErr.ts](./src/operators/tapErr.ts) |
| `unwrapOr` / `unwrapOrElse` | Extract value with default / lazy default. | [src/operators/unwrapOr.ts](./src/operators/unwrapOr.ts), [src/operators/unwrapOrElse.ts](./src/operators/unwrapOrElse.ts) |
| `unwrap` / `expect` / `unwrapErr` / `expectErr` | Panic variants. | [src/operators/unwrap.ts](./src/operators/unwrap.ts), [src/operators/expect.ts](./src/operators/expect.ts), [src/operators/unwrapErr.ts](./src/operators/unwrapErr.ts), [src/operators/expectErr.ts](./src/operators/expectErr.ts) |
| `flatten` | Flatten nested Result. | [src/operators/flatten.ts](./src/operators/flatten.ts) |
| `and` / `or` | Logical AND / OR. | [src/operators/and.ts](./src/operators/and.ts), [src/operators/or.ts](./src/operators/or.ts) |
| `contains` / `exists` | Predicate queries. | [src/operators/contains.ts](./src/operators/contains.ts), [src/operators/exists.ts](./src/operators/exists.ts) |
| `bimap` / `swap` | Transform both variants / swap variants. | [src/operators/bimap.ts](./src/operators/bimap.ts), [src/operators/swap.ts](./src/operators/swap.ts) |
| `mapOr` / `mapOrElse` | Map success or fall back. | [src/operators/mapOr.ts](./src/operators/mapOr.ts), [src/operators/mapOrElse.ts](./src/operators/mapOrElse.ts) |
| `filterOrElse` | Filter success or map to error. | [src/operators/filterOrElse.ts](./src/operators/filterOrElse.ts) |
| `ap` | Apply wrapped function to wrapped value. | [src/operators/ap.ts](./src/operators/ap.ts) |
| `separate` / `traverseArray` | Partition / collect arrays. | [src/operators/separate.ts](./src/operators/separate.ts), [src/operators/traverseArray.ts](./src/operators/traverseArray.ts) |
| `andTee` / `orTee` / `andThrough` | Side-effects (ignoring / propagating). | [src/operators/andTee.ts](./src/operators/andTee.ts), [src/operators/orTee.ts](./src/operators/orTee.ts), [src/operators/andThrough.ts](./src/operators/andThrough.ts) |
| `unsafeUnwrap` / `unsafeUnwrapErr` | Throw raw error / value. | [src/operators/unsafeUnwrap.ts](./src/operators/unsafeUnwrap.ts), [src/operators/unsafeUnwrapErr.ts](./src/operators/unsafeUnwrapErr.ts) |
| `orThrow` / `orThrowWith` | Unwrap or throw a typed error. | [src/operators/orThrow.ts](./src/operators/orThrow.ts) |

### Composition — `src/composition/`

| Export | Description | Source |
| --- | --- | --- |
| `pipe` | Left-to-right function composition (1–10 overloads). | [src/composition/pipe.ts](./src/composition/pipe.ts) |
| `pipeAsync` | Async pipe (1–10 overloads). | [src/composition/pipeAsync.ts](./src/composition/pipeAsync.ts) |
| `composeK` | Kleisli composition (2–6 overloads). | [src/composition/composeK.ts](./src/composition/composeK.ts) |
| `composeKAsync` | Async Kleisli composition (2–6 overloads). | [src/composition/composeKAsync.ts](./src/composition/composeKAsync.ts) |
| `safeTry` / `fromSafeTry` | Generator-based `yield*` error propagation. | [src/composition/safeTry.ts](./src/composition/safeTry.ts) |

### Adapters — `src/adapters/`

| Export | Description | Source |
| --- | --- | --- |
| `switchFn` / `switchFnAsync` | Plain function → switch function. | [src/adapters/switchFn.ts](./src/adapters/switchFn.ts), [src/adapters/switchFnAsync.ts](./src/adapters/switchFnAsync.ts) |
| `liftMap` | 1-track → 2-track (alias for `map`). | [src/adapters/liftMap.ts](./src/adapters/liftMap.ts) |
| `tee` / `teeAsync` | Dead-end side-effect. | [src/adapters/tee.ts](./src/adapters/tee.ts), [src/adapters/teeAsync.ts](./src/adapters/teeAsync.ts) |
| `toOption` | Result → Option. | [src/adapters/toOption.ts](./src/adapters/toOption.ts) |
| `fromOption` | Option → Result. | [src/adapters/fromOption.ts](./src/adapters/fromOption.ts) |

### Combine — `src/combine/`

| Export | Description | Source |
| --- | --- | --- |
| `combine` | Short-circuit on first failure. | [src/combine/combine.ts](./src/combine/combine.ts) |
| `all` | Heterogeneous tuple, short-circuits. | [src/combine/all.ts](./src/combine/all.ts) |
| `combineWithAllErrors` | Accumulate all errors. | [src/combine/combineWithAllErrors.ts](./src/combine/combineWithAllErrors.ts) |

### Async Operators — `src/promise-result/`

Apply to `Promise<IResultOfT<T, E>>` and `Promise<IOption<T>>`. Callbacks may be sync or async.

| Export | Description | Source |
| --- | --- | --- |
| **Sync input / sync fn (operate on `Promise<IResultOfT>`, strictly sync fn)** | | |
| `map` / `mapErr` | Transform success / error. | [src/promise-result/map.ts](./src/promise-result/map.ts), [src/promise-result/mapErr.ts](./src/promise-result/mapErr.ts) |
| `unwrapOr` / `unwrapOrElse` | Extract value with default / lazy default. | [src/promise-result/unwrapOr.ts](./src/promise-result/unwrapOr.ts), [src/promise-result/unwrapOrElse.ts](./src/promise-result/unwrapOrElse.ts) |
| `flatten` | Flatten nested `Promise<IResultOfT>`. | [src/promise-result/flatten.ts](./src/promise-result/flatten.ts) |
| **Async fn on `Promise<IResultOfT>`** | | |
| `mapAsync` / `mapErrAsync` | Transform success / error. | [src/promise-result/mapAsync.ts](./src/promise-result/mapAsync.ts), [src/promise-result/mapErrAsync.ts](./src/promise-result/mapErrAsync.ts) |
| `mapOrAsync` / `mapOrElseAsync` | Map success or fall back. | [src/promise-result/mapOrAsync.ts](./src/promise-result/mapOrAsync.ts), [src/promise-result/mapOrElseAsync.ts](./src/promise-result/mapOrElseAsync.ts) |
| `bindAsync` / `orElseAsync` | Monadic chain / recovery. | [src/promise-result/bindAsync.ts](./src/promise-result/bindAsync.ts), [src/promise-result/orElseAsync.ts](./src/promise-result/orElseAsync.ts) |
| `bindThroughAsync` | Side-effect that propagates errors. | [src/promise-result/bindThroughAsync.ts](./src/promise-result/bindThroughAsync.ts) |
| `matchAsync` | Terminal pattern-match. | [src/promise-result/matchAsync.ts](./src/promise-result/matchAsync.ts) |
| `tapAsync` / `tapErrAsync` | Side-effects on success / failure. | [src/promise-result/tapAsync.ts](./src/promise-result/tapAsync.ts), [src/promise-result/tapErrAsync.ts](./src/promise-result/tapErrAsync.ts) |
| `unwrapOrAsync` / `unwrapOrElseAsync` | Extract value with default. Returns `Promise<A>` (bare value). | [src/promise-result/unwrapOrAsync.ts](./src/promise-result/unwrapOrAsync.ts), [src/promise-result/unwrapOrElseAsync.ts](./src/promise-result/unwrapOrElseAsync.ts) |
| `bimapAsync` / `swapAsync` / `flattenAsync` | Variant transforms async. | [src/promise-result/bimapAsync.ts](./src/promise-result/bimapAsync.ts), [src/promise-result/swapAsync.ts](./src/promise-result/swapAsync.ts), [src/promise-result/flattenAsync.ts](./src/promise-result/flattenAsync.ts) |
| `containsAsync` / `existsAsync` / `filterOrElseAsync` | Predicate queries. | [src/promise-result/containsAsync.ts](./src/promise-result/containsAsync.ts), [src/promise-result/existsAsync.ts](./src/promise-result/existsAsync.ts), [src/promise-result/filterOrElseAsync.ts](./src/promise-result/filterOrElseAsync.ts) |
| **Lift sync Result → async** | | |
| `asyncMap` / `asyncBind` / `asyncBindThrough` | Bridge sync Result → async. | [src/promise-result/asyncMap.ts](./src/promise-result/asyncMap.ts), [src/promise-result/asyncBind.ts](./src/promise-result/asyncBind.ts), [src/promise-result/asyncBindThrough.ts](./src/promise-result/asyncBindThrough.ts) |
| `asyncOrElse` / `asyncMatch` | Async recovery / pattern-match on sync Result. | [src/promise-result/asyncOrElse.ts](./src/promise-result/asyncOrElse.ts), [src/promise-result/asyncMatch.ts](./src/promise-result/asyncMatch.ts) |
| `asyncTap` / `asyncTapErr` | Async side-effect on sync Result. | [src/promise-result/asyncTap.ts](./src/promise-result/asyncTap.ts), [src/promise-result/asyncTapErr.ts](./src/promise-result/asyncTapErr.ts) |
| **Applicative & combinators** | | |
| `ap` | Apply wrapped function to wrapped value. | [src/promise-result/ap.ts](./src/promise-result/ap.ts) |
| `combine` / `combineWithAllErrors` | Parallel combination (short-circuit / accumulate). | [src/promise-result/combine.ts](./src/promise-result/combine.ts), [src/promise-result/combineWithAllErrors.ts](./src/promise-result/combineWithAllErrors.ts) |

### AsyncOption (eager `Promise<IOption<T>>`) — `src/promise-option/`

| Export | Description | Source |
| --- | --- | --- |
| `mapAsyncOption` / `bindAsyncOption` / `orElseAsyncOption` / `matchAsyncOption` | Map / chain / recover / match on `Promise<IOption>`. | [src/promise-option/mapAsyncOption.ts](./src/promise-option/mapAsyncOption.ts), [src/promise-option/bindAsyncOption.ts](./src/promise-option/bindAsyncOption.ts), [src/promise-option/orElseAsyncOption.ts](./src/promise-option/orElseAsyncOption.ts), [src/promise-option/matchAsyncOption.ts](./src/promise-option/matchAsyncOption.ts) |
| `mapOrAsyncOption` / `mapOrElseAsyncOption` | Map or fall back. | [src/promise-option/mapOrAsyncOption.ts](./src/promise-option/mapOrAsyncOption.ts), [src/promise-option/mapOrElseAsyncOption.ts](./src/promise-option/mapOrElseAsyncOption.ts) |
| `tapAsyncOption` / `tapErrAsyncOption` | Side-effects. | [src/promise-option/tapAsyncOption.ts](./src/promise-option/tapAsyncOption.ts), [src/promise-option/tapErrAsyncOption.ts](./src/promise-option/tapErrAsyncOption.ts) |
| `unwrapOrAsyncOption` / `unwrapOrElseAsyncOption` | Extract value with default. | [src/promise-option/unwrapOrAsyncOption.ts](./src/promise-option/unwrapOrAsyncOption.ts), [src/promise-option/unwrapOrElseAsyncOption.ts](./src/promise-option/unwrapOrElseAsyncOption.ts) |
| `containsAsyncOption` / `existsAsyncOption` / `filterAsyncOption` | Predicate queries. | [src/promise-option/containsAsyncOption.ts](./src/promise-option/containsAsyncOption.ts), [src/promise-option/existsAsyncOption.ts](./src/promise-option/existsAsyncOption.ts), [src/promise-option/filterAsyncOption.ts](./src/promise-option/filterAsyncOption.ts) |
| `flattenAsyncOption` | Flatten `Promise<IOption<IOption>>`. | [src/promise-option/flattenAsyncOption.ts](./src/promise-option/flattenAsyncOption.ts) |
| **Lift sync `IOption` → async** | | |
| `asyncBindOption` / `asyncTapOption` | Bridge sync Option → async. | [src/promise-option/asyncBindOption.ts](./src/promise-option/asyncBindOption.ts), [src/promise-option/asyncTapOption.ts](./src/promise-option/asyncTapOption.ts) |
| `asyncMapOption` / `asyncOrElseOption` / `asyncMatchOption` | Async lift on sync Option. `asyncMapOption` converts a *sync* mapper throw into `None` but still propagates a *rejected* mapper Promise (matches the spec-pinned "no catch in the lift family" contract for async rejection). | [src/promise-option/asyncMapOption.ts](./src/promise-option/asyncMapOption.ts), [src/promise-option/asyncOrElseOption.ts](./src/promise-option/asyncOrElseOption.ts), [src/promise-option/asyncMatchOption.ts](./src/promise-option/asyncMatchOption.ts) |

> **Note:** `unwrapOrAsync` / `unwrapOrElseAsync` previously returned `Promise<IResultOfT<A, unknown>>`; they now return `Promise<A>` (the bare unwrapped value), matching the Rust-style semantics implied by the name. Default values or error-handler rejections now propagate via the outer Promise's rejection channel rather than being wrapped as `Err`.

### AsyncResult (lazy thunks) — `src/async-result/`

Operators return a new `AsyncResult` without executing. Terminal operators (`match`, `unwrapOr`) trigger `.run()`.

| Export | Description | Source |
| --- | --- | --- |
| `from` / `fromPromise` / `fromResult` | Factories. | [src/async-result/from.ts](./src/async-result/from.ts), [src/async-result/fromPromise.ts](./src/async-result/fromPromise.ts), [src/async-result/fromResult.ts](./src/async-result/fromResult.ts) |
| `map` / `mapAsync` / `mapErr` / `mapErrAsync` | Transform success / error. | [src/async-result/map.ts](./src/async-result/map.ts), [src/async-result/mapAsync.ts](./src/async-result/mapAsync.ts), [src/async-result/mapErr.ts](./src/async-result/mapErr.ts), [src/async-result/mapErrAsync.ts](./src/async-result/mapErrAsync.ts) |
| `mapOr` / `mapOrElse` | Map success or fall back. | [src/async-result/mapOr.ts](./src/async-result/mapOr.ts), [src/async-result/mapOrElse.ts](./src/async-result/mapOrElse.ts) |
| `bind` / `orElse` | Monadic chain / recovery. | [src/async-result/bind.ts](./src/async-result/bind.ts), [src/async-result/orElse.ts](./src/async-result/orElse.ts) |
| `and` / `or` | Logical AND / OR (short-circuit, lazy on the right). | [src/async-result/and.ts](./src/async-result/and.ts), [src/async-result/or.ts](./src/async-result/or.ts) |
| `tap` / `tapAsync` / `tapErr` / `tapErrAsync` | Side-effects. | [src/async-result/tap.ts](./src/async-result/tap.ts), [src/async-result/tapAsync.ts](./src/async-result/tapAsync.ts), [src/async-result/tapErr.ts](./src/async-result/tapErr.ts), [src/async-result/tapErrAsync.ts](./src/async-result/tapErrAsync.ts) |
| `combine` / `combineWithAllErrors` | Parallel combination. | [src/async-result/combine.ts](./src/async-result/combine.ts), [src/async-result/combineWithAllErrors.ts](./src/async-result/combineWithAllErrors.ts) |
| `bimap` / `swapAsync` / `flatten` | Variant transforms. | [src/async-result/bimap.ts](./src/async-result/bimap.ts), [src/async-result/swapAsync.ts](./src/async-result/swapAsync.ts), [src/async-result/flatten.ts](./src/async-result/flatten.ts) |
| `contains` / `containsErr` / `exists` / `filterOrElse` | Predicate queries. | [src/async-result/contains.ts](./src/async-result/contains.ts), [src/async-result/containsErr.ts](./src/async-result/containsErr.ts), [src/async-result/exists.ts](./src/async-result/exists.ts), [src/async-result/filterOrElse.ts](./src/async-result/filterOrElse.ts) |
| `isOk` / `isErr` | Standalone boolean predicates. | [src/async-result/isOk.ts](./src/async-result/isOk.ts), [src/async-result/isErr.ts](./src/async-result/isErr.ts) |
| `andTee` / `orTee` / `andThrough` | Side-effects (ignoring / propagating). | [src/async-result/andTee.ts](./src/async-result/andTee.ts), [src/async-result/orTee.ts](./src/async-result/orTee.ts), [src/async-result/andThrough.ts](./src/async-result/andThrough.ts) |
| `ap` | Apply wrapped function to wrapped value. | [src/async-result/ap.ts](./src/async-result/ap.ts) |
| `match` / `unwrap` / `unwrapErr` / `expect` / `expectErr` / `unwrapOr` / `unwrapOrElse` | Terminal operators. | [src/async-result/match.ts](./src/async-result/match.ts), [src/async-result/unwrap.ts](./src/async-result/unwrap.ts), [src/async-result/unwrapErr.ts](./src/async-result/unwrapErr.ts), [src/async-result/expect.ts](./src/async-result/expect.ts), [src/async-result/expectErr.ts](./src/async-result/expectErr.ts), [src/async-result/unwrapOr.ts](./src/async-result/unwrapOr.ts), [src/async-result/unwrapOrElse.ts](./src/async-result/unwrapOrElse.ts) |

### AsyncOption (lazy thunks) — `src/async-option/`

| Export | Description | Source |
| --- | --- | --- |
| `from` / `fromPromise` / `fromOption` | Factories from thunk / Promise / sync Option. | [src/async-option/from.ts](./src/async-option/from.ts), [src/async-option/fromPromise.ts](./src/async-option/fromPromise.ts), [src/async-option/fromOption.ts](./src/async-option/fromOption.ts) |
| `ofSome` / `ofNone` | Direct constructors (Some / None). | [src/async-option/ofSome.ts](./src/async-option/ofSome.ts), [src/async-option/ofNone.ts](./src/async-option/ofNone.ts) |
| `map` / `mapAsync` / `mapOr` / `mapOrElse` | Transform Some / fall back on None. | [src/async-option/map.ts](./src/async-option/map.ts), [src/async-option/mapAsync.ts](./src/async-option/mapAsync.ts), [src/async-option/mapOr.ts](./src/async-option/mapOr.ts), [src/async-option/mapOrElse.ts](./src/async-option/mapOrElse.ts) |
| `bind` / `orElse` | Monadic chain / recovery. | [src/async-option/bind.ts](./src/async-option/bind.ts), [src/async-option/orElse.ts](./src/async-option/orElse.ts) |
| `tap` / `tapAsync` | Side-effects on Some. | [src/async-option/tap.ts](./src/async-option/tap.ts), [src/async-option/tapAsync.ts](./src/async-option/tapAsync.ts) |
| `filter` / `flatten` | Filter / flatten. | [src/async-option/filter.ts](./src/async-option/filter.ts), [src/async-option/flatten.ts](./src/async-option/flatten.ts) |
| `zipWith` / `all` | Combine two / many AsyncOptions. | [src/async-option/zipWith.ts](./src/async-option/zipWith.ts), [src/async-option/all.ts](./src/async-option/all.ts) |
| `okOr` / `okOrElse` | AsyncOption → AsyncResult bridge. | [src/async-option/okOr.ts](./src/async-option/okOr.ts), [src/async-option/okOrElse.ts](./src/async-option/okOrElse.ts) |
| `transpose` | Swap `AsyncOption<AsyncResult>` ↔ `AsyncResult<AsyncOption>`. | [src/async-option/transpose.ts](./src/async-option/transpose.ts) |
| `contains` / `exists` / `isSome` / `isNone` | Predicate queries. | [src/async-option/contains.ts](./src/async-option/contains.ts), [src/async-option/exists.ts](./src/async-option/exists.ts), [src/async-option/isSome.ts](./src/async-option/isSome.ts), [src/async-option/isNone.ts](./src/async-option/isNone.ts) |
| `match` / `unwrap` / `unwrapOr` / `unwrapOrElse` | Terminal operators. | [src/async-option/match.ts](./src/async-option/match.ts), [src/async-option/unwrap.ts](./src/async-option/unwrap.ts), [src/async-option/unwrapOr.ts](./src/async-option/unwrapOr.ts), [src/async-option/unwrapOrElse.ts](./src/async-option/unwrapOrElse.ts) |

### Option Module — `src/option/`

Curried data-last operators on `IOption<T>`. When imported via the main barrel, operators are renamed with a `Option` suffix to avoid collisions with Result operators (`mapOption`, `bindOption`, etc.).

| Export | Description | Source |
| --- | --- | --- |
| `ofSome` / `ofNone` | Constructors. | [src/option/ofSome.ts](./src/option/ofSome.ts), [src/option/ofNone.ts](./src/option/ofNone.ts) |
| `map` / `bind` / `orElse` | Transform / chain / recovery. | [src/option/map.ts](./src/option/map.ts), [src/option/bind.ts](./src/option/bind.ts), [src/option/orElse.ts](./src/option/orElse.ts) |
| `match` | Terminal pattern-match. | [src/option/match.ts](./src/option/match.ts) |
| `tap` | Side-effect on Some. | [src/option/tap.ts](./src/option/tap.ts) |
| `unwrapOr` | Extract value with default. | [src/option/unwrapOr.ts](./src/option/unwrapOr.ts) |
| `filter` | None if predicate fails. | [src/option/filter.ts](./src/option/filter.ts) |
| `flatten` | Flatten nested option. | [src/option/flatten.ts](./src/option/flatten.ts) |
| `contains` | Equality check. | [src/option/contains.ts](./src/option/contains.ts) |
| `okOr` / `okOrElse` | Option → Result. | [src/option/okOr.ts](./src/option/okOr.ts), [src/option/okOrElse.ts](./src/option/okOrElse.ts) |
| `transpose` | Swap `IOption<IResultOfT>` ↔ `IResultOfT<IOption>`. | [src/option/transpose.ts](./src/option/transpose.ts) |
| `all` | Combine Options (short-circuit on None). | [src/option/all.ts](./src/option/all.ts) |
| `zipWith` | Combine two Options with a function. | [src/option/zipWith.ts](./src/option/zipWith.ts) |

### Reliability — `src/reliability/`

Retry / timeout / concurrency primitives for production pipelines.

| Export | Description | Source |
| --- | --- | --- |
| `retry` | Eager bounded retry. Resolves `IResultOfT<T, E \| TE \| AE>`: `E` from your `fn`, `TE` when something *throws* (default `ThrownError`, preserving the thrown value verbatim), `AE` when the loop never runs `fn` (default `AbortedError`). Supply `onThrow` / `onAborted` to collapse both onto your own `E`. Never rejects — throws escaping `fn` **or** any caller hook become `Err`. | [src/reliability/retry.ts](./src/reliability/retry.ts) |
| `retryLazy` | Lazy thunk wrap of `retry`; same `E \| TE \| AE` contract. | [src/reliability/retryLazy.ts](./src/reliability/retryLazy.ts) |
| `timeout` | Lazy race against `setTimeout`. | [src/reliability/timeout.ts](./src/reliability/timeout.ts) |
| `timeoutEager` | Eager counterpart. | [src/reliability/timeoutEager.ts](./src/reliability/timeoutEager.ts) |
| `race` | First `Ok` wins; all-`Err` resolves to the lowest input index. A literal non-empty array keeps `E`; a dynamically-sized one widens to `E \| EmptyInputsError` (override via `onEmpty`). | [src/reliability/race.ts](./src/reliability/race.ts) |
| `any` | Collect all successes (or all errors if none). | [src/reliability/any.ts](./src/reliability/any.ts) |
| `allSettled` | Always `Ok`; per-thunk outcomes in input order. | [src/reliability/allSettled.ts](./src/reliability/allSettled.ts) |

### Observability — `src/observability/`

Structured-logging primitives built around a synchronous frame stack.

| Export | Description | Source |
| --- | --- | --- |
| `ctx` (`run`) | Push/pop a frame around `fn`. | [src/observability/ctx.ts](./src/observability/ctx.ts) |
| `withPath` | Push a path segment inside `ctx.run`. | [src/observability/withPath.ts](./src/observability/withPath.ts) |
| `tapErrContext` | On failure, invoke `fn(error, { path })`. | [src/observability/tapErrContext.ts](./src/observability/tapErrContext.ts) |
| `format` | Human-readable `Ok(...)` / `Err(...)`. | [src/observability/format.ts](./src/observability/format.ts) |
| `inspect` | Structured `{kind, value\|error}` view. | [src/observability/inspect.ts](./src/observability/inspect.ts) |
| `observe` | Pass-through hook that fires the installed observer. | [src/observability/observe.ts](./src/observability/observe.ts) |
| `installObserver` | Install a process-wide observer; returns a disposer. | [src/observability/index.ts](./src/observability/index.ts) |

### Primitives — `src/primitives/`

High-frequency helpers — most are thin wrappers around existing factories.

| Export | Description | Source |
| --- | --- | --- |
| `cond` | `Ok(v)` if `pred(v)` else `Err(err)`. | [src/primitives/cond.ts](./src/primitives/cond.ts) |
| `condErr` | Inverse of `cond`. | [src/primitives/condErr.ts](./src/primitives/condErr.ts) |
| `sequence` | Alias of `combine`. | [src/primitives/sequence.ts](./src/primitives/sequence.ts) |
| `sequenceAsyncResult` | Lazy `AsyncResult<T[], E>`. | [src/primitives/sequenceAsyncResult.ts](./src/primitives/sequenceAsyncResult.ts) |
| `reduce` | Left-fold; short-circuits on first source or reducer failure. | [src/primitives/reduce.ts](./src/primitives/reduce.ts) |
| `partitionOption` | `{ some, noneIndices }` — preserves `None` positions. | [src/primitives/partitionOption.ts](./src/primitives/partitionOption.ts) |
| `lift` | Wrap a (possibly throwing) function into a Result-returning one. | [src/primitives/lift.ts](./src/primitives/lift.ts) |

## Quick Start

```ts
import type { IResultOfT } from '@sandlada/result';           // type-only
import { ok, err } from '@sandlada/result/factories';          // core constructors
import { map, unwrapOr } from '@sandlada/result/operators';    // sync operators
import { pipe } from '@sandlada/result/composition';           // pipe / composeK / safeTry

type AppError =
  | { kind: 'NotFound'; id: string }
  | { kind: 'Validation'; field: string };

function getUser(id: string): IResultOfT<User, AppError> {
  if (!id) return err<AppError>({ kind: 'Validation', field: 'id' });
  const user = db.find(id);
  if (!user) return err<AppError>({ kind: 'NotFound', id });
  return ok(user);
}

const name = pipe(
  getUser('42'),
  map(u => u.name),
  unwrapOr('Unknown'),
);
```

> **Note:** The main barrel `@sandlada/result` is type-focused and exports only the type contracts plus `moduleMarker`. Functional runtime values come from a dedicated subpath. See ADR 10 in `ARCH.md` for the rationale.

## JSON Serialization

```ts
JSON.stringify(ok(42));   // '{"isSuccess":true,"value":42}'
JSON.stringify(err('x')); // '{"isSuccess":false,"error":"x"}'
JSON.stringify(ofSome(1)); // '{"isSome":true,"value":1}'
JSON.stringify(ofNone());  // '{"isSome":false,"isNone":true}'
```

## Further Reading

- [ARCH.md](./ARCH.md) — architecture, module responsibilities, ADRs.
- [README.md](./README.md) — project overview, badges, install.
- [AGENTS.md](./AGENTS.md) — AI agent conventions.
