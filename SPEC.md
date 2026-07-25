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
| `@sandlada/result` | Main barrel — all exports. |
| `@sandlada/result/types` | Type definitions only. |
| `@sandlada/result/factories` | Core constructors. |
| `@sandlada/result/operators` | Sync operators. |
| `@sandlada/result/promise-result` | Async operators (eager `Promise<...>`). |
| `@sandlada/result/composition` | Composition helpers. |
| `@sandlada/result/adapters` | Result / Option / shape adapters. |
| `@sandlada/result/combine` | Parallel combination. |
| `@sandlada/result/option` | `IOption<T>` operators. |
| `@sandlada/result/async-result` | Lazy AsyncResult thunks. |
| `@sandlada/result/async-option` | Lazy AsyncOption thunks. |
| `@sandlada/result/reliability` | Retry / timeout / concurrency. |
| `@sandlada/result/observability` | Breadcrumbs + formatters + observer hooks. |
| `@sandlada/result/primitives` | High-frequency helpers. |

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

Apply to `Promise<IResultOfT<T, E>>`. Callbacks may be sync or async.

| Export | Description | Source |
| --- | --- | --- |
| `mapAsync` / `mapErrAsync` | Transform success / error. | [src/promise-result/mapAsync.ts](./src/promise-result/mapAsync.ts), [src/promise-result/mapErrAsync.ts](./src/promise-result/mapErrAsync.ts) |
| `mapOrAsync` / `mapOrElseAsync` | Map success or fall back. | [src/promise-result/mapOrAsync.ts](./src/promise-result/mapOrAsync.ts), [src/promise-result/mapOrElseAsync.ts](./src/promise-result/mapOrElseAsync.ts) |
| `bindAsync` / `orElseAsync` | Monadic chain / recovery. | [src/promise-result/bindAsync.ts](./src/promise-result/bindAsync.ts), [src/promise-result/orElseAsync.ts](./src/promise-result/orElseAsync.ts) |
| `matchAsync` | Terminal pattern-match. | [src/promise-result/matchAsync.ts](./src/promise-result/matchAsync.ts) |
| `tapAsync` / `tapErrAsync` | Side-effects on success / failure. | [src/promise-result/tapAsync.ts](./src/promise-result/tapAsync.ts), [src/promise-result/tapErrAsync.ts](./src/promise-result/tapErrAsync.ts) |
| `unwrapOrAsync` / `unwrapOrElseAsync` | Extract value with default. | [src/promise-result/unwrapOrAsync.ts](./src/promise-result/unwrapOrAsync.ts), [src/promise-result/unwrapOrElseAsync.ts](./src/promise-result/unwrapOrElseAsync.ts) |
| `asyncMap` / `asyncBind` / `asyncBindThrough` | Bridge sync Result → async. | [src/promise-result/asyncMap.ts](./src/promise-result/asyncMap.ts), [src/promise-result/asyncBind.ts](./src/promise-result/asyncBind.ts), [src/promise-result/asyncBindThrough.ts](./src/promise-result/asyncBindThrough.ts) |
| `asyncTap` / `asyncTapErr` | Async side-effect on sync Result. | [src/promise-result/asyncTap.ts](./src/promise-result/asyncTap.ts), [src/promise-result/asyncTapErr.ts](./src/promise-result/asyncTapErr.ts) |
| `bindThroughAsync` | Side-effect that propagates errors. | [src/promise-result/bindThroughAsync.ts](./src/promise-result/bindThroughAsync.ts) |
| `bimapAsync` / `swapAsync` / `flattenAsync` | Variant transforms async. | [src/promise-result/bimapAsync.ts](./src/promise-result/bimapAsync.ts), [src/promise-result/swapAsync.ts](./src/promise-result/swapAsync.ts), [src/promise-result/flattenAsync.ts](./src/promise-result/flattenAsync.ts) |
| `containsAsync` / `existsAsync` / `filterOrElseAsync` | Predicate queries. | [src/promise-result/containsAsync.ts](./src/promise-result/containsAsync.ts), [src/promise-result/existsAsync.ts](./src/promise-result/existsAsync.ts), [src/promise-result/filterOrElseAsync.ts](./src/promise-result/filterOrElseAsync.ts) |
| Async option variants | `mapAsyncOption`, `bindAsyncOption`, `matchAsyncOption`, `orElseAsyncOption`, `tapAsyncOption`, `unwrapOrAsyncOption`, `asyncBindOption`, `asyncTapOption`, `filterAsyncOption`, `flattenAsyncOption`, `containsAsyncOption`, `existsAsyncOption`. | [src/promise-result/](./src/promise-result/) |

### AsyncResult (lazy thunks) — `src/async-result/`

Operators return a new `AsyncResult` without executing. Terminal operators (`match`, `unwrapOr`) trigger `.run()`.

| Export | Description | Source |
| --- | --- | --- |
| `from` / `fromPromise` / `fromResult` | Factories. | [src/async-result/from.ts](./src/async-result/from.ts), [src/async-result/fromPromise.ts](./src/async-result/fromPromise.ts), [src/async-result/fromResult.ts](./src/async-result/fromResult.ts) |
| `map` / `mapAsync` / `mapErr` / `mapErrAsync` | Transform success / error. | [src/async-result/map.ts](./src/async-result/map.ts), [src/async-result/mapAsync.ts](./src/async-result/mapAsync.ts), [src/async-result/mapErr.ts](./src/async-result/mapErr.ts), [src/async-result/mapErrAsync.ts](./src/async-result/mapErrAsync.ts) |
| `bind` / `orElse` | Monadic chain / recovery. | [src/async-result/bind.ts](./src/async-result/bind.ts), [src/async-result/orElse.ts](./src/async-result/orElse.ts) |
| `tap` / `tapAsync` / `tapErr` / `tapErrAsync` | Side-effects. | [src/async-result/tap.ts](./src/async-result/tap.ts), [src/async-result/tapAsync.ts](./src/async-result/tapAsync.ts), [src/async-result/tapErr.ts](./src/async-result/tapErr.ts), [src/async-result/tapErrAsync.ts](./src/async-result/tapErrAsync.ts) |
| `combine` / `combineWithAllErrors` | Parallel combination. | [src/async-result/combine.ts](./src/async-result/combine.ts), [src/async-result/combineWithAllErrors.ts](./src/async-result/combineWithAllErrors.ts) |
| `bimap` / `swapAsync` / `flatten` | Variant transforms. | [src/async-result/bimap.ts](./src/async-result/bimap.ts), [src/async-result/swapAsync.ts](./src/async-result/swapAsync.ts), [src/async-result/flatten.ts](./src/async-result/flatten.ts) |
| `contains` / `exists` / `filterOrElse` | Predicate queries. | [src/async-result/contains.ts](./src/async-result/contains.ts), [src/async-result/exists.ts](./src/async-result/exists.ts), [src/async-result/filterOrElse.ts](./src/async-result/filterOrElse.ts) |
| `andTee` / `orTee` / `andThrough` | Side-effects (ignoring / propagating). | [src/async-result/andTee.ts](./src/async-result/andTee.ts), [src/async-result/orTee.ts](./src/async-result/orTee.ts), [src/async-result/andThrough.ts](./src/async-result/andThrough.ts) |
| `ap` | Apply wrapped function to wrapped value. | [src/async-result/ap.ts](./src/async-result/ap.ts) |
| `match` / `unwrapOr` | Terminal operators. | [src/async-result/match.ts](./src/async-result/match.ts), [src/async-result/unwrapOr.ts](./src/async-result/unwrapOr.ts) |

### AsyncOption (lazy thunks) — `src/async-option/`

| Export | Description | Source |
| --- | --- | --- |
| `from` / `fromPromise` / `fromOption` | Factories. | [src/async-option/from.ts](./src/async-option/from.ts), [src/async-option/fromPromise.ts](./src/async-option/fromPromise.ts), [src/async-option/fromOption.ts](./src/async-option/fromOption.ts) |
| `map` / `mapAsync` / `bind` / `orElse` | Transform / chain. | [src/async-option/map.ts](./src/async-option/map.ts), [src/async-option/mapAsync.ts](./src/async-option/mapAsync.ts), [src/async-option/bind.ts](./src/async-option/bind.ts), [src/async-option/orElse.ts](./src/async-option/orElse.ts) |
| `tap` / `tapAsync` | Side-effects on Some. | [src/async-option/tap.ts](./src/async-option/tap.ts), [src/async-option/tapAsync.ts](./src/async-option/tapAsync.ts) |
| `filter` / `flatten` | Filter / flatten. | [src/async-option/filter.ts](./src/async-option/filter.ts), [src/async-option/flatten.ts](./src/async-option/flatten.ts) |
| `contains` / `exists` | Predicate queries. | [src/async-option/contains.ts](./src/async-option/contains.ts), [src/async-option/exists.ts](./src/async-option/exists.ts) |
| `match` / `unwrapOr` | Terminal operators. | [src/async-option/match.ts](./src/async-option/match.ts), [src/async-option/unwrapOr.ts](./src/async-option/unwrapOr.ts) |

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
| `retry` | Eager bounded retry. | [src/reliability/retry.ts](./src/reliability/retry.ts) |
| `retryLazy` | Lazy thunk wrap of `retry`. | [src/reliability/retryLazy.ts](./src/reliability/retryLazy.ts) |
| `timeout` | Lazy race against `setTimeout`. | [src/reliability/timeout.ts](./src/reliability/timeout.ts) |
| `timeoutEager` | Eager counterpart. | [src/reliability/timeoutEager.ts](./src/reliability/timeoutEager.ts) |
| `race` | First `Ok` wins. | [src/reliability/race.ts](./src/reliability/race.ts) |
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
import { ok, err, pipe, map, unwrapOr } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';

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
