# ARCH.md — `@sandlada/result` Architecture

> **Authoritative record of the project's architecture.** This document must be updated whenever source code, interfaces, or module structure change.

---

## Overview

`@sandlada/result` is a TypeScript library providing the **Result pattern** — a functional error-handling primitive that makes error flows explicit and type-safe, replacing throw/catch for predictable failure paths.

**Key differentiator:** Unlike the C# reference (which hardcodes `DomainError`), this library uses a **generic `TError` parameter**. Users pass their own error types.

---

## Package Metadata

| Field       | Value                                                                                |
| ----------- | ------------------------------------------------------------------------------------ |
| Name        | `@sandlada/result`                                                                   |
| Version     | `0.0.1-20260702.a`                                                                   |
| Description | Type-safe Result pattern for TypeScript — explicit error handling without exceptions |
| Type        | `module` (ESM)                                                                       |
| Entry       | `./build/index.js`                                                                   |
| Types       | `./build/index.d.ts`                                                                 |
| License     | MIT                                                                                  |
| Repository  | `github.com/sandlada/result`                                                         |

### Tech Stack

| Concern         | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Language        | TypeScript (strict mode)                                                |
| Build tool      | `tsgo` (TypeScript Native, via `@typescript/native-preview`)            |
| Module system   | `nodenext` (ESM, `.js` extensions in relative imports)                  |
| Module syntax   | `verbatimModuleSyntax` — always use `import type` for type-only imports |
| Target          | ESNext                                                                  |
| Declaration     | `declaration: true`, `declarationMap: true`                             |
| Stricter checks | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`                |
| Test runner     | Vitest v4                                                               |

### Scripts

| Script       | Command                        |
| ------------ | ------------------------------ |
| `build`      | `tsgo --project tsconfig.json` |
| `test`       | `vitest run`                   |
| `test:watch` | `vitest`                       |

### Package Exports

The package exposes the following entry points via `package.json` `"exports"`:

| Entry point     | Resolves to                          |
| --------------- | ------------------------------------ |
| `.`             | `./build/index.js` (barrel)          |
| `./types`       | `./build/types/index.js` (type defs) |
| `./factories`   | `./build/factories/index.js`         |
| `./operators`   | `./build/operators/index.js`         |
| `./async`       | `./build/async/index.js`             |
| `./composition` | `./build/composition/index.js`       |
| `./adapters`    | `./build/adapters/index.js`          |
| `./combine`     | `./build/combine/index.js`           |
| `./option`      | `./build/option/index.js`            |

---

## Source Layout

```
src/
  index.ts             — Public barrel re-exports (all exports, Option operators renamed with suffix)

  types/               — Type definitions (discriminated union interfaces)
    IResult.ts         — IResultSuccess, IResultFailure, IResult
    IResultOfT.ts      — IResultOfTSuccess, IResultOfTFailure, IResultOfT
    Option.ts          — IOptionSome, IOptionNone, IOption
    index.ts           — Barrel re-export

  factories/           — Core constructors
    ok.ts, err.ts, fromPredicate.ts, fromThrowable.ts,
    tryCatch.ts, tryCatchAsync.ts, fromPromise.ts,
    asyncOk.ts, asyncErr.ts
    index.ts           — Barrel re-export

  operators/           — Sync operators
    and.ts, bimap.ts, bind.ts, contains.ts, exists.ts,
    expect.ts, expectErr.ts, filterOrElse.ts, flatten.ts,
    map.ts, mapErr.ts, mapOr.ts, mapOrElse.ts, match.ts,
    or.ts, orElse.ts, swap.ts, tap.ts, tapErr.ts, unwrap.ts,
    unwrapErr.ts, unwrapOr.ts, unwrapOrElse.ts
    index.ts           — Barrel re-export

  async/               — Async operators
    bindAsync.ts, mapAsync.ts, mapErrAsync.ts, mapOrAsync.ts,
    mapOrElseAsync.ts, matchAsync.ts, orElseAsync.ts,
    tapAsync.ts, tapErrAsync.ts, unwrapOrAsync.ts,
    unwrapOrElseAsync.ts
    index.ts           — Barrel re-export

  composition/         — Composition utilities
    composeK.ts, composeKAsync.ts, pipe.ts, pipeAsync.ts
    index.ts           — Barrel re-export

  adapters/            — Adapter / interop functions
    fromOption.ts, liftMap.ts, switchFn.ts, switchFnAsync.ts,
    tee.ts, teeAsync.ts, toOption.ts
    index.ts           — Barrel re-export

  combine/             — Result aggregation
    all.ts, combine.ts, combineWithAllErrors.ts
    index.ts           — Barrel re-export

  option/              — Option sub-module
    ofSome.ts, ofNone.ts, all.ts, andThen.ts, contains.ts,
    filter.ts, flatten.ts, map.ts, match.ts, orElse.ts,
    tap.ts, unwrapOr.ts, zipWith.ts, index.ts

build/
  index.js            — Compiled output (mirrors src/)
  index.d.ts          — Type declarations
  types/              — Compiled types/ mirror
  factories/          — Compiled factories/ mirror
  operators/          — Compiled operators/ mirror
  async/              — Compiled async/ mirror
  composition/        — Compiled composition/ mirror
  adapters/           — Compiled adapters/ mirror
  combine/            — Compiled combine/ mirror
  option/             — Compiled option/ mirror
  ...
    filter.ts          — filter()
    flatten.ts         — flatten()
    contains.ts        — contains()
    index.ts           — Option barrel re-exports (simple names)

build/
  index.js            — Compiled output (mirrors src/)
  index.d.ts          — Type declarations
  ...

test/
  # Root-level — kept aggregate specs
  ComplexIntegration.spec.ts          — Multi-layer, railway, aggregation, async patterns
  ConsumptionPatterns.spec.ts         — Real-world branching, early return, type narrowing
  IntegrationPattern.spec.ts          — Type alias & convenience factory
  Interop.spec.ts                     — Cross-paradigm: sync←→async, FP composition
  Result.custom-error-types.spec.ts   — Discriminated unions, classes, plain objects
  Result.default-error-type.spec.ts   — Default Error behavior
  Result.filterOrElse.spec.ts         — filterOrElse
  Result.toJSON.spec.ts               — toJSON on Result objects
  Result.type-tests.spec.ts           — Compile-time type assertions
  Result.value.spec.ts                — Value access on success/failure, narrowing

  # factories/ — 1:1 with src/factories/
  factories/ok.spec.ts                — ok() void, ok(value), consistency
  factories/err.spec.ts               — err(error) void, typed err, consistency
  factories/asyncOk.spec.ts           — asyncOk creates success AsyncResult
  factories/asyncErr.spec.ts          — asyncErr creates failure AsyncResult
  factories/tryCatch.spec.ts          — tryCatch sync (normal, throws, errorFn, etc.)
  factories/tryCatchAsync.spec.ts     — tryCatchAsync (resolve, throw, etc.)
  factories/fromThrowable.spec.ts     — fromThrowable wrap, caught, error mapper
  factories/fromPredicate.spec.ts     — fromPredicate true/false/DU error

  # operators/ — 1:1 with src/operators/
  operators/map.spec.ts               — map (curried/direct, failure pass-through)
  operators/mapErr.spec.ts            — mapErr (curried/direct, success pass-through)
  operators/bind.spec.ts              — bind (chain, short-circuit, error widening)
  operators/orElse.spec.ts            — orElse (recovery, success pass-through)
  operators/match.spec.ts             — match (curried/direct, union return)
  operators/tap.spec.ts               — tap (side-effect, failure NOT called)
  operators/tapErr.spec.ts            — tapErr (side-effect on failure only)
  operators/unwrapOr.spec.ts          — unwrapOr (default on failure, curried)
  operators/unwrapOrElse.spec.ts      — unwrapOrElse (lazy default, curried)
  operators/unwrap.spec.ts            — unwrap (void/value/FP operator)
  operators/expect.spec.ts            — expect (void/value/FP operator)
  operators/unwrapErr.spec.ts         — unwrapErr (void/value/FP operator)
  operators/expectErr.spec.ts         — expectErr (void/value/FP operator)
  operators/flatten.spec.ts           — flatten (nested success, outer failure)
  operators/and.spec.ts               — and (direct, curried)
  operators/or.spec.ts                — or (direct, success pass-through)
  operators/contains.spec.ts          — contains (matching, non-matching, failure)
  operators/exists.spec.ts            — exists (curried)
  operators/bimap.spec.ts             — bimap (direct, curried)
  operators/swap.spec.ts              — swap (success→failure, failure→success)
  operators/mapOr.spec.ts             — mapOr (default value, curried)
  operators/mapOrElse.spec.ts         — mapOrElse (lazy error/value, curried)

  # async/ — 1:1 with src/async/
  async/mapAsync.spec.ts             — mapAsync (curried/direct, failure pass-through)
  async/mapErrAsync.spec.ts          — mapErrAsync (curried, success pass-through)
  async/mapOrAsync.spec.ts           — mapOrAsync (default, curried/direct)
  async/mapOrElseAsync.spec.ts       — mapOrElseAsync (success/failure, curried)
  async/bindAsync.spec.ts            — bindAsync (chain, sync binding, short-circuit)
  async/orElseAsync.spec.ts          — orElseAsync (recovery, pass-through)
  async/matchAsync.spec.ts           — matchAsync (success/failure curried)
  async/tapAsync.spec.ts             — tapAsync (side-effect on success)
  async/tapErrAsync.spec.ts          — tapErrAsync (side-effect on failure)
  async/unwrapOrAsync.spec.ts        — unwrapOrAsync (value/default)
  async/unwrapOrElseAsync.spec.ts    — unwrapOrElseAsync (lazy, curried/direct)

  # composition/ — 1:1 with src/composition/
  composition/composeK.spec.ts        — composeK (chain, short-circuit, nested)
  composition/pipe.spec.ts            — pipe (single arg, multi-fn, early failure)
  composition/composeKAsync.spec.ts   — composeKAsync (async switch functions)
  composition/pipeAsync.spec.ts       — pipeAsync (async pipeline, failure handling)

  # adapters/ — 1:1 with src/adapters/
  adapters/switchFn.spec.ts           — switchFn (wrap, exception, falsy)
  adapters/liftMap.spec.ts            — liftMap (curried/direct, failure pass-through)
  adapters/tee.spec.ts                — tee (side-effect, no mutation)
  adapters/teeAsync.spec.ts           — teeAsync (async side-effect)
  adapters/switchFnAsync.spec.ts      — switchFnAsync (lift async function)
  adapters/toOption.spec.ts           — toOption (Success→Some, Failure→None)
  adapters/fromOption.spec.ts         — fromOption (Some→Success, None→Failure)

  # combine/ — 1:1 with src/combine/
  combine/combine.spec.ts             — combine (all success, short-circuit)
  combine/combineWithAllErrors.spec.ts — combineWithAllErrors (collect errors)
  combine/all.spec.ts                 — all (heterogeneous tuple, as const)

  # option/ — 1:1 with src/option/
  option/ofSome.spec.ts               — ofSome (Some variant, carries value)
  option/ofNone.spec.ts               — ofNone (None variant)
  option/map.spec.ts                  — mapOption (transform, pass-through, pipe)
  option/andThen.spec.ts              — andThen (chain, short-circuit)
  option/orElse.spec.ts               — orElseOption (fallback, lazy)
  option/match.spec.ts                — matchOption (onSome/onNone)
  option/tap.spec.ts                  — tapOption (side-effect)
  option/unwrapOr.spec.ts             — unwrapOrOption (default)
  option/filter.spec.ts               — filter (predicate, pass-through)
  option/flatten.spec.ts              — flatten (nested Some/None)
  option/contains.spec.ts             — contains (matching, non-matching)
  option/all.spec.ts                  — all (tuple, heterogeneous, short-circuit)
  option/zipWith.spec.ts              — zipWith (combine fn, partial application)

  # types/ — 1:1 with src/types/
  types/IResult.spec.ts               — IResult discriminated union contract
  types/IResultOfT.spec.ts            — IResultOfT discriminated union contract
  types/Option.spec.ts                — IOption discriminated union narrowing
```

---

## Discriminated Union Types

All result and option values are **plain objects** with a discriminant property — no classes, no sentinel, no constructor invariants.

```
── IResult (void result) ──

IResultSuccess                      (interface — success variant)
  ├── readonly isSuccess: true      Literal discriminant
  └── readonly isFailure: false

IResultFailure<TError = Error>      (interface — failure variant)
  ├── readonly isSuccess: false     Literal discriminant
  ├── readonly isFailure: true
  └── readonly error: TError

IResult<TError = Error>            = IResultSuccess | IResultFailure<TError>

── IResultOfT (value-bearing result) ──

IResultOfTSuccess<TValue>           (interface — success variant)
  ├── readonly isSuccess: true      Literal discriminant
  ├── readonly isFailure: false
  └── readonly value: TValue

IResultOfTFailure<TError = Error>      (interface — failure variant)
  ├── readonly isSuccess: false     Literal discriminant
  ├── readonly isFailure: true
  └── readonly error: TError

IResultOfT<TValue, TError = Error> = IResultOfTSuccess<TValue>
                                    | IResultOfTFailure<TError>

── IOption (optional value) ──

IOptionSome<T>                      (interface — Some variant)
  ├── readonly isSome: true         Literal discriminant
  ├── readonly isNone: false
  └── readonly value: T

IOptionNone                         (interface — None variant)
  ├── readonly isSome: false        Literal discriminant
  ├── readonly isNone: true
  └── (no value property)

IOption<T>                         = IOptionSome<T> | IOptionNone
```

**Key points:**
- The `isSuccess` / `isSome` literal discriminates the variant
- `value` is only on the success/Some variant — accessing `.value` on a failure/None is a **type error**
- `error` is only on the failure variant — accessing `.error` on success is a **type error**
- Naming via `isSuccess` before accessing variant-specific properties
- No classes, no prototype methods — pure data objects

---

## Module Architecture

### `src/types/IResult.ts` & `src/types/IResultOfT.ts` — Discriminated Union Types

Both files export **plain interfaces and type aliases only** — no classes, no
internal flat bases. Results are plain objects created by factory functions.

```ts
// types/IResult.ts — void result contract
export type IResult<TError = Error> = IResultSuccess | IResultFailure<TError>;

// types/IResultOfT.ts — value-bearing result contract
export type IResultOfT<TValue, TError = Error> =
    | IResultOfTSuccess<TValue>
    | IResultOfTFailure<TError>;
```

Both types are **discriminated unions** where `isSuccess` is the discriminant.

### `src/factories/` — Factory Functions

Standalone functions that produce plain discriminated-union objects — no classes,
no sentinel, no constructor invariants.

| File               | Signature                                          | Description                        |
| ------------------ | -------------------------------------------------- | ---------------------------------- |
| `ok.ts`            | `ok(): IResult<never>`                             | Void success                       |
|                    | `ok<T>(value: T): IResultOfT<T, never>`            | Success with value                 |
| `err.ts`           | `err<E>(error: E): IResultOfT<never, E>`           | Failure with error                 |
| `fromPredicate.ts` | `fromPredicate<T,E>(pred, err, value?)`            | `Ok(v)` if predicate passes        |
| `fromThrowable.ts` | `fromThrowable<A,T,E>(fn, errorFn?)`               | Wrap throwing function into Result |
| `tryCatch.ts`      | `tryCatch<T,E>(fn, errorFn?)`                      | Execute fn, catch throws           |
| `tryCatchAsync.ts` | `tryCatchAsync<T,E>(fn, errorFn?)`                 | Async fn, catch rejections         |
| `fromPromise.ts`   | `fromPromise<T,E>(promise, errorFn?)`              | Wrap Promise into Result           |
| `asyncOk.ts`       | `asyncOk<T>(value): Promise<IResultOfT<T,never>>`  | Pre-resolved success               |
| `asyncErr.ts`      | `asyncErr<E>(error): Promise<IResultOfT<never,E>>` | Pre-resolved failure               |

F#-style naming: `ok(value)` produces a success result, `err(error)` produces a failure.

### `src/operators/` — Sync Operators (Data-Last Curried)

All operators are **data-last curried** — they accept the result as the final
argument, enabling partial application and `pipe` composition. Each operator also
accepts the result as an immediate last argument for direct calls:

```ts
map(x => x * 2, ok(21));  // Ok(42)
```

| File              | Signature                                                         | Description                         |
| ----------------- | ----------------------------------------------------------------- | ----------------------------------- |
| `map.ts`          | `map<A,B>(f): <E>(IResultOfT<A,E>) => IResultOfT<B,E>`            | Transform success value             |
| `mapErr.ts`       | `mapErr<E,F>(f): <A>(IResultOfT<A,E>) => IResultOfT<A,F>`         | Transform error                     |
| `bind.ts`         | `bind<A,B,F>(f): <E>(IResultOfT<A,E>) => IResultOfT<B,E\|F>`      | Chain (monadic bind)                |
| `orElse.ts`       | `orElse<E,B,F>(f): <A>(...) => IResultOfT<A\|B,F>`                | Error recovery                      |
| `match.ts`        | `match<A,E,C>(onOk, onErr): (r) => C`                             | Terminal pattern-match              |
| `tap.ts`          | `tap<A>(fn): <E>(r) => IResultOfT<A,E>`                           | Side-effect on success              |
| `tapErr.ts`       | `tapErr<E>(fn): <A>(r) => IResultOfT<A,E>`                        | Side-effect on failure              |
| `unwrapOr.ts`     | `unwrapOr<A>(def): <E>(r) => A`                                   | Extract value or default            |
| `unwrapOrElse.ts` | `unwrapOrElse<A,E>(fn): (r) => A`                                 | Extract value or compute from error |
| `unwrap.ts`       | `unwrap<A,E>(r): A`                                               | Panics on failure                   |
| `expect.ts`       | `expect<A,E>(msg): (r) => A`                                      | Panics with custom message          |
| `unwrapErr.ts`    | `unwrapErr<A,E>(r): E`                                            | Panics on success, returns error    |
| `expectErr.ts`    | `expectErr<A,E>(msg): (r) => E`                                   | Panics with custom message          |
| `flatten.ts`      | `flatten<A,E>(r: IResultOfT<IResultOfT<A,E>,E>): IResultOfT<A,E>` | Flatten nested Result               |
| `and.ts`          | `and<B,F>(other): <A,E>(r) => IResultOfT<B,E\|F>`                 | Logical AND                         |
| `or.ts`           | `or<A,F>(other): <E>(r) => IResultOfT<A,F>`                       | Logical OR                          |
| `contains.ts`     | `contains<A>(target): <E>(r) => boolean`                          | True if success and value matches   |
| `exists.ts`       | `exists<A>(pred): <E>(r) => boolean`                              | True if success and predicate holds |
| `bimap.ts`        | `bimap<A,E,C,F>(onOk, onErr): (r) => IResultOfT<C,F>`             | Simultaneous map over both variants |
| `swap.ts`         | `swap<A,E>(r): IResultOfT<E,A>`                                   | Swap Ok/Err                         |
| `filterOrElse.ts` | `filterOrElse<A,E>(pred, errFn): (r) => IResultOfT<A,E>`          | Filter success or map to error      |
| `mapOr.ts`        | `mapOr<A,B,E>(def, fn): (r) => B`                                 | Map success or return default       |
| `mapOrElse.ts`    | `mapOrElse<A,B,E>(onErr, fn): (r) => B`                           | Map success or compute from error   |

### `src/async/` — Async Operators (Promise-based)

All async operators work with `Promise<IResultOfT<A, E>>` as the data type —
they are data-last curried. Callbacks can be sync or async. Each operator has
both curried and direct call forms.

| File                   | Signature                                                                        | Description                               |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| `mapAsync.ts`          | `mapAsync<A,B>(f): <E>(Promise<IResultOfT<A,E>>) => Promise<IResultOfT<B,E>>`    | Transform success value                   |
| `mapErrAsync.ts`       | `mapErrAsync<E,F>(f): <A>(Promise<IResultOfT<A,E>>) => Promise<IResultOfT<A,F>>` | Transform error                           |
| `bindAsync.ts`         | `bindAsync<A,B,F>(f): <E>(...) => Promise<IResultOfT<B,E\|F>>`                   | Chain with async callback                 |
| `orElseAsync.ts`       | `orElseAsync<E,B,F>(f): <A>(...) => Promise<IResultOfT<A\|B,F>>`                 | Async error recovery                      |
| `matchAsync.ts`        | `matchAsync<A,E,C>(onOk, onErr): (r) => Promise<C>`                              | Terminal pattern-match on async result    |
| `tapAsync.ts`          | `tapAsync<A>(fn): <E>(r) => Promise<IResultOfT<A,E>>`                            | Side-effect on async success              |
| `mapOrAsync.ts`        | `mapOrAsync<A,B,E>(def, fn): (r) => Promise<B>`                                  | Map success or return default from async  |
| `mapOrElseAsync.ts`    | `mapOrElseAsync<A,B,E>(onErr, fn): (r) => Promise<B>`                            | Map success or compute from error async   |
| `unwrapOrAsync.ts`     | `unwrapOrAsync<A>(def): <E>(r) => Promise<A>`                                    | Extract value or default from async       |
| `unwrapOrElseAsync.ts` | `unwrapOrElseAsync<A,E>(fn): (r) => Promise<A>`                                  | Extract value or compute from error async |
| `unwrapOrAsync.ts`     | `unwrapOrAsync<A>(def): <E>(r) => Promise<A>`                                    | Extract value or default from async       |

### `src/composition/` — Pipelines

| File               | Signature                                                            | Description                                         |
| ------------------ | -------------------------------------------------------------------- | --------------------------------------------------- |
| `pipe.ts`          | `pipe(value, fn1, fn2, ...)`                                         | Left-to-right function composition (1–10 overloads) |
| `pipeAsync.ts`     | `pipeAsync(value, ...fns)`                                           | Async pipe (1–10 overloads)                         |
| `composeK.ts`      | `composeK<A,B,C,E>(f1, f2): (a: A) => IResultOfT<C,E>`               | Kleisli composition (2–6 overloads)                 |
| `composeKAsync.ts` | `composeKAsync<A,B,C,E>(f1, f2): (a: A) => Promise<IResultOfT<C,E>>` | Async Kleisli composition (2–6)                     |

### `src/adapters/` — Wlaschin Three-Shape System

Converts between Wlaschin's three function shapes:

| File               | From     | To      | Description                                                              |
| ------------------ | -------- | ------- | ------------------------------------------------------------------------ |
| `switchFn.ts`      | 1-track  | switch  | `(a: A) => B` → `(a: A) => IResultOfT<B, never>`                         |
| `switchFnAsync.ts` | 1-track  | switch  | `(a: A) => Promise<B>` → `(a: A) => Promise<IResultOfT<B, never>>`       |
| `liftMap.ts`       | 1-track  | 2-track | `(a: A) => B` → `IResultOfT<A, E> => IResultOfT<B, E>` (alias for `map`) |
| `tee.ts`           | dead-end | 1-track | `(a: A) => void` → `(a: A) => A`                                         |
| `teeAsync.ts`      | dead-end | 1-track | `(a: A) => Promise<void>` → `(a: A) => Promise<A>`                       |
| `toOption.ts`      | Result   | Option  | `Ok(v)` → `Some(v)`, `Err(_)` → `None`                                   |
| `fromOption.ts`    | Option   | Result  | `Some(v)` → `Ok(v)`, `None` → `Err(errorOnNone)`                         |

### `src/combine/` — Parallel Combination

| File                      | Signature                                                   | Behavior                            |
| ------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| `combine.ts`              | `combine<A,E>(results[]): IResultOfT<A[],E>`                | Short-circuits on first failure     |
| `all.ts`                  | `all(tuple): IResultOfT<[...tuple], E>`                     | Heterogeneous tuple, short-circuits |
| `combineWithAllErrors.ts` | `combineWithAllErrors<A,E>(results[]): IResultOfT<A[],E[]>` | Accumulates **all** errors          |

### `src/option/` — Option Module

Standalone functions — no classes, no `Option.Some()` / `Option.None()` factories.
All operators are curried data-last.

| File          | Signature                                          | Description                              |
| ------------- | -------------------------------------------------- | ---------------------------------------- |
| `ofSome.ts`   | `ofSome<T>(value): IOption<T>`                     | Create Some variant                      |
| `ofNone.ts`   | `ofNone(): IOption<never>`                         | Create None variant                      |
| `map.ts`      | `map<T,U>(fn): (IOption<T>) => IOption<U>`         | Transform value if Some                  |
| `andThen.ts`  | `andThen<T,U>(fn): (IOption<T>) => IOption<U>`     | Monadic bind (chain)                     |
| `orElse.ts`   | `orElse<T>(fn): (IOption<T>) => IOption<T>`        | Fall back if None                        |
| `match.ts`    | `match<T,U>(onSome, onNone): (IOption<T>) => U`    | Terminal pattern-match                   |
| `tap.ts`      | `tap<T>(fn): (IOption<T>) => IOption<T>`           | Side-effect on Some                      |
| `unwrapOr.ts` | `unwrapOr<T>(def): (IOption<T>) => T`              | Safe extraction with default             |
| `filter.ts`   | `filter<T>(pred): (IOption<T>) => IOption<T>`      | None if predicate fails                  |
| `flatten.ts`  | `flatten<T>(opt: IOption<IOption<T>>): IOption<T>` | Flattens nested option                   |
| `all.ts`      | `all(tuple): IOption<[...values]>`                 | Combine multiple Options (short-circuit) |
| `contains.ts` | `contains<T>(target): (IOption<T>) => boolean`     | True if Some and value matches           |
| `zipWith.ts`  | `zipWith<A,B,C>(fn): (a, b) => IOption<C>`         | Combine two Options with a function      |

### `src/index.ts` — Public Barrel

```ts
// ── Type exports ──
export type { IResult, IResultSuccess, IResultFailure } from './types/IResult.js';
export type { IResultOfT, IResultOfTSuccess, IResultOfTFailure } from './types/IResultOfT.js';
export type { IOption, IOptionSome, IOptionNone } from './types/Option.js';

// ── Core constructors ──
export { ok, err, fromPredicate, fromThrowable, tryCatch, tryCatchAsync, fromPromise, asyncOk, asyncErr } from './factories/index.js';

// ── Sync operators ──
export { map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr, unwrapOrElse, unwrap, expect, unwrapErr, expectErr, flatten, and, or, contains, exists, bimap, swap, mapOr, mapOrElse } from './operators/index.js';

// ── Async operators ──
export { mapAsync, mapErrAsync, mapOrAsync, mapOrElseAsync, bindAsync, orElseAsync, matchAsync, tapAsync, tapErrAsync, unwrapOrAsync, unwrapOrElseAsync } from './async/index.js';

// ── Composition ──
export { composeK, pipe, composeKAsync, pipeAsync } from './composition/index.js';

// ── Adapters ──
export { switchFn, liftMap, tee, toOption, fromOption, switchFnAsync, teeAsync } from './adapters/index.js';

// ── Combine ──
export { combine, all, combineWithAllErrors } from './combine/index.js';

// ── Option (re-exported with renamed identifiers to avoid name collisions) ──
export { ofSome, ofNone } from './option/index.js';
export { map as mapOption, andThen, orElse as orElseOption, match as matchOption, tap as tapOption, unwrapOr as unwrapOrOption, filter as filterOption, flatten as flattenOption, contains as containsOption, all as allOption, zipWith as zipWithOption } from './option/index.js';
```

- Uses `export type` for interfaces/type aliases (required by `verbatimModuleSyntax`)
- All exports are **standalone functions** — no classes, no OOP wrappers
- Option operators are re-exported with `Option` suffix (`mapOption`, `orElseOption`, etc.) to avoid name collisions with Result operators
- `andThen` and `flatten` are not renamed because Result has no corresponding export (Result uses `bind` instead of `andThen`, and `flatten` has a different signature)

---

## Option Module Architecture (`@sandlada/result/option`)

The **Option type** represents an optional value — either `Some(value)` or `None`.
It is inspired by Rust's `Option<T>` and F#'s `'a option`. Like Result, Option
values are **plain discriminated union objects** — no classes, no OOP wrappers.

### Type Definitions (`src/types/Option.ts`)

```ts
export interface IOptionSome<T> {
    readonly isSome: true;
    readonly isNone: false;
    readonly value: T;
}
export interface IOptionNone {
    readonly isSome: false;
    readonly isNone: true;
}
export type IOption<T> = IOptionSome<T> | IOptionNone;
```

### Functions (`src/option/`)

All functions are standalone (no `Option.Some()` / `Option.None()` class factories):

| File          | Signature                                          | Description                              |
| ------------- | -------------------------------------------------- | ---------------------------------------- |
| `ofSome.ts`   | `ofSome<T>(value): IOption<T>`                     | Create Some variant                      |
| `ofNone.ts`   | `ofNone(): IOption<never>`                         | Create None variant                      |
| `map.ts`      | `map<T,U>(fn): (IOption<T>) => IOption<U>`         | Transform value if Some                  |
| `andThen.ts`  | `andThen<T,U>(fn): (IOption<T>) => IOption<U>`     | Monadic bind (chain)                     |
| `orElse.ts`   | `orElse<T>(fn): (IOption<T>) => IOption<T>`        | Fall back if None                        |
| `match.ts`    | `match<T,U>(onSome, onNone): (IOption<T>) => U`    | Terminal pattern-match                   |
| `tap.ts`      | `tap<T>(fn): (IOption<T>) => IOption<T>`           | Side-effect on Some                      |
| `unwrapOr.ts` | `unwrapOr<T>(def): (IOption<T>) => T`              | Safe extraction with default             |
| `filter.ts`   | `filter<T>(pred): (IOption<T>) => IOption<T>`      | None if predicate fails                  |
| `flatten.ts`  | `flatten<T>(opt: IOption<IOption<T>>): IOption<T>` | Flattens nested option                   |
| `all.ts`      | `all(tuple): IOption<[...values]>`                 | Combine multiple Options (short-circuit) |
| `contains.ts` | `contains<T>(target): (IOption<T>) => boolean`     | True if Some and value matches           |
| `zipWith.ts`  | `zipWith<A,B,C>(fn): (a, b) => IOption<C>`         | Combine two Options with a function      |

All operators are **curried data-last** — the option is the final argument.

---

## Async Module Architecture (`@sandlada/result`)

The library handles asynchronous operations through two mechanisms:

### Async Factories (`src/factories/`)

Async factories return `Promise<IResultOfT<T, E>>` directly — they are the
**bridge** between `Promise` and `Result`:

| File               | Signature                                                       | Description                     |
| ------------------ | --------------------------------------------------------------- | ------------------------------- |
| `tryCatchAsync.ts` | `tryCatchAsync<T,E>(fn, errorFn?): Promise<IResultOfT<T,E>>`    | Wrap async fn, catch rejections |
| `fromPromise.ts`   | `fromPromise<T,E>(promise, errorFn?): Promise<IResultOfT<T,E>>` | Wrap existing Promise           |
| `asyncOk.ts`       | `asyncOk<T>(value): Promise<IResultOfT<T,never>>`               | Pre-resolved success Promise    |
| `asyncErr.ts`      | `asyncErr<E>(error): Promise<IResultOfT<never,E>>`              | Pre-resolved failure Promise    |

### Async Operators (`src/async/`)

Async operators work with `Promise<IResultOfT<A, E>>` as the input/output type.
They are data-last curried like their sync counterparts. Callbacks can be sync
or async. See the [Module Architecture — `src/async/`](#srcasync--async-operators-promise-based)
section above for full operator signatures.

### Async Composition (`src/composition/`)

- `pipeAsync(value, ...fns)` — pipe through async functions (1–10 overloads)
- `composeKAsync(f1, f2, ...)` — Kleisli composition for async switch functions (2–6 overloads)

### Async Adapters (`src/adapters/`)

- `switchFnAsync(f)` — 1-track async → async switch
- `teeAsync(f)` — async dead-end → 1-track

**Note:** There is no `AsyncResult` class and no `./promise` sub-path. Async
computation is handled entirely through `Promise<IResultOfT>` with data-last
curried operators — no wrapper class needed.

---

## Key Design Patterns

### 1. Pure Functional Architecture (No Classes)

The library provides all functionality through **standalone functions** that
operate on **plain discriminated union objects**. There are:
- No classes to instantiate
- No `new` keyword
- No prototype methods
- No sentinel values
- No internal base interfaces
- No `this` context

Every function imports the types it needs directly from `src/types/` and
returns plain objects conforming to the discriminated union interfaces.

### 2. Discriminated Union Type Safety

Accessing `value` or `error` is only possible after narrowing via `isSuccess`:

```ts
if (result.isSuccess) {
    doSomething(result.value);  // ✓ safe — narrowed to success
} else {
    handleError(result.error);   // ✓ safe — narrowed to failure
}
```

The type system enforces this at compile time — no runtime checks needed.

### 3. Data-Last Curried Operators

All operators are **data-last curried**: the data (result) is the final argument.
This enables two calling styles:

**Curried** (partial application):
```ts
const double = map((x: number) => x * 2);
double(ok(21));  // Ok(42)
```

**Direct** (immediate invocation):
```ts
map(x => x * 2, ok(21));  // Ok(42)
```

Operators that don't benefit from currying (`unwrap`, `flatten`, `swap`, `combine`,
`all`, `combineWithAllErrors`) accept the result as their only argument.

### 4. Integration Pattern (Pre-configured Result)

Third-party developers can bake their error type into a convenience wrapper:

**Type alias** (lightweight):
```ts
type AppResult<T = void> = IResultOfT<T, AppError>;
```

> **Note:** Use `IResultOfT<T, E>` (not `IResult<T, E>`) for value-bearing
> results. `IResult<E>` is the base union without a `value` property.

**Convenience factory** (eliminates generic boilerplate):
```ts
import { ok, err } from '@sandlada/result';

const AppResult = {
    Success<T = void>(value?: T): AppResult<T> {
        return (value === undefined ? ok() : ok(value)) as unknown as AppResult<T>;
    },
    Failure(error: AppError): AppResult<never> {
        return err(error) as AppResult<never>;
    },
} as const;
```

Both approaches compose: the type alias keeps signatures clean, and the factory
object eliminates generic boilerplate in function signatures.

---

## C# / TypeScript Mapping

| Concern                 | C#                               | TypeScript                                                        |
| ----------------------- | -------------------------------- | ----------------------------------------------------------------- |
| Base interface          | `IResult`                        | `IResult<TError = Error>` (discriminated union)                   |
| Value-bearing interface | `IResult<out T>`                 | `IResultOfT<TValue, TError = Error>` (discriminated union)        |
| Error type              | `DomainError` (hardcoded)        | `TError` generic (user-defined)                                   |
| Sentinel "none"         | `DomainError.General.None`       | Not needed (pure objects, no sentinel)                            |
| Success factory (void)  | `Result.Success()`               | `ok()`                                                            |
| Failure factory         | `Result.Failure(DomainError)`    | `err(error: TError)`                                              |
| Success factory (T)     | `Result.Success<T>(T)`           | `ok(value: T)`                                                    |
| Failure factory (T)     | `Result.Failure<T>(DomainError)` | `err<T, E>(error: E)`                                             |
| Naming                  | PascalCase                       | camelCase (`ok`, `err`, `map`, `bind`, `match`)                   |
| Covariance              | `out T` (CLR)                    | Not needed (structural typing)                                    |
| Operators               | Instance methods                 | Data-last curried standalone functions                            |
| Module organization     | Single namespace                 | Sub-path exports per concern (`./factories`, `./operators`, etc.) |

---

## Coding Conventions

1. **`interface` for contracts only.** Types are pure discriminated union interfaces — no classes, no OOP wrappers.
2. **`readonly` properties only** — result objects are immutable value objects.
3. **`import type { ... }`** for all type-only imports (enforced by `verbatimModuleSyntax`).
4. **No barrel / index re-export cycles.** Each module imports its dependencies from the specific source file.
5. **camelCase** for all exports and properties (`ok`, `err`, `map`, `bind`, `isSuccess`, `isFailure`, `value`, `error`).
6. **Data-last currying** — the result/option argument is always the final parameter.
7. **Two call forms** — operators support both curried (`map(fn)(result)`) and direct (`map(fn, result)`) invocation.

---

## Testing Architecture

**24 test files**, all using Vitest. Tests cover every public API surface: factory functions, sync operators, async operators, composition, adapters, combine utilities, Option type, and cross-paradigm interop. All tests import from the source directly (`../src/index.js`, `../src/types/...`) and use the purely functional API.

### Factory & Core Tests

| Test File                           | Focus                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `Result.factories.spec.ts`          | `ok`/`err` factory overloads, void success, type inference, edge cases |
| `Result.fromPredicate.spec.ts`      | `fromPredicate` curried and direct forms                               |
| `Result.phase5c.spec.ts`            | `fromThrowable`, `mapOr`, `mapOrElse`                                  |
| `Result.static-utilities.spec.ts`   | `tryCatch` (sync), `combine`, `all`, `combineWithAllErrors`            |
| `Result.default-error-type.spec.ts` | Default `TError = Error` behavior                                      |
| `Result.custom-error-types.spec.ts` | Discriminated unions, classes, plain objects as error types            |
| `Result.type-tests.spec.ts`         | Compile-time type assertions (`expectTypeOf`)                          |

### Operator Tests

| Test File                            | Focus                                                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `Result.value.spec.ts`               | Value access on success/failure, type narrowing, void success                                                     |
| `Result.unwrap-expect.spec.ts`       | `unwrap`, `expect`, `unwrapErr`, `expectErr`                                                                      |
| `Result.unwrapOrElse.spec.ts`        | `unwrapOrElse`                                                                                                    |
| `Result.combinators.spec.ts`         | `flatten`, `and`, `or`, `contains`, `exists`, `bimap`, `swap`                                                     |
| `Result.toOption-fromOption.spec.ts` | `toOption` / `fromOption` adapters                                                                                |
| `Result.toJSON.spec.ts`              | `toJSON` serialization of result objects                                                                          |
| `fp-core-operators.spec.ts`          | `ok`/`err`, `map`, `mapErr`, `bind`, `orElse`, `match`, `tap`, `tapErr`, `unwrapOr`                               |
| `fp-composition-adapters.spec.ts`    | `composeK`, `pipe`, `switchFn`, `liftMap`, `tee`, `toOption`/`fromOption`, `combine`/`all`/`combineWithAllErrors` |
| `fp-async.spec.ts`                   | Async operators, composition, adapters                                                                            |

### Integration & Interop Tests

| Test File                     | Focus                                                               |
| ----------------------------- | ------------------------------------------------------------------- |
| `ComplexIntegration.spec.ts`  | Multi-layer services, railway pipeline, aggregation, async patterns |
| `ConsumptionPatterns.spec.ts` | Real-world branching, early return, type narrowing                  |
| `IntegrationPattern.spec.ts`  | Type alias & convenience factory (using `ok`/`err` directly)        |
| `Interop.spec.ts`             | Cross-paradigm: sync→async boundary, FP composition patterns        |

### Option Tests

| Test File                                | Focus                                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Option.spec.ts`                         | `ofSome`/`ofNone`, `isSome`/`isNone`, `value`, `map`, `andThen`, `orElse`, `match`, `tap`, `unwrapOr`, `toJSON`, discriminated union narrowing |
| `Option.filter-flatten-contains.spec.ts` | `filter`, `flatten`, `contains`                                                                                                                |

### Test Design Principles

- **Contract-based:** All tests verify behavior through public APIs only — no access to internal state or `any` casts.
- **Dual-path:** Every function is tested on both success and failure paths.
- **Data-last currying:** Operators are tested in both curried (`map(fn)(result)`) and direct (`map(fn, result)`) call modes.
- **Error-type widening:** `bind`/`orElse` tests verify that error types widen correctly (union of input and callback error types).

---

## Architectural Decisions

### ADR-1: Generic `TError` over Hardcoded Error Type

**Decision:** Use a generic `TError` parameter with a default of `Error`, rather than hardcoding a specific error type (as the C# reference does with `DomainError`).

**Rationale:** TypeScript developers use diverse error patterns — discriminated unions, classes, plain objects. A generic parameter gives users full control while the default keeps simple cases simple.

### ADR-2: No Sentinel Value

**Decision:** The library does **not** use a sentinel value for the success variant's
`error` property.

**Rationale:** Because the discriminated union design separates the success and
failure variants into distinct interfaces, the success variant simply **has no**
`error` property at the type level. The runtime objects only have the properties
they need — `{ isSuccess: true, isFailure: false }` for void success,
`{ isSuccess: true, isFailure: false, value }` for value success. No sentinel
is stored or checked.

### ADR-3: Pure Functions over Classes

**Decision:** All API surface is provided as standalone functions operating on
plain discriminated union objects — no classes, no prototype methods.

**Rationale:**
- **Tree-shaking:** Consumers import only the functions they need, reducing bundle size
- **No `this` context:** Functions can be passed directly as callbacks without binding
- **Composability:** Data-last curried functions compose naturally with `pipe`
- **Simplicity:** Plain objects are easy to inspect, serialize, and debug
- **Interop:** Works seamlessly with both FP and OOP consumer code

### ADR-4: Factory Functions Return Discriminated Union Objects Directly

**Decision:** Factory functions (`ok`, `err`) return plain objects conforming to
the discriminated union interfaces directly — no wrapper, no class instance.

**Rationale:** The returned objects are plain `{ isSuccess, isFailure, ... }`
objects. Consumers can destructure them, `JSON.stringify` them, or check their
properties without any special handling. The `as const` assertions on the
discriminant properties ensure literal type narrowing.

### ADR-5: Single Entry Point (No ./fp Sub-Path)

**Decision:** The library provides a **single entry point** at `@sandlada/result`
with sub-path exports for organization (`./factories`, `./operators`, `./async`,
etc.), rather than separate OOP (`@sandlada/result`) and FP (`@sandlada/result/fp`)
sub-paths.

**Rationale:**
- There is only one API style (functional), so no need for dual sub-paths
- Sub-path exports organize by concern without enforcing a particular import style
- The barrel (`@sandlada/result`) re-exports everything for convenience
- Consumers who want minimal imports can use specific sub-paths

### ADR-6: Discriminated Union Interfaces (Pure Union, No Base Types)

**Decision:** `IResult<TError>` and `IResultOfT<TValue, TError>` are pure
discriminated unions with **no internal flat base interfaces**, no Omit pattern,
and no base class.

**Design:**
- `IResult<TError>` = `IResultSuccess | IResultFailure<TError>`
- `IResultOfT<TValue, TError>` = `IResultOfTSuccess<TValue> | IResultOfTFailure<TError>`
- `isSuccess: true` / `isSuccess: false` literal discriminant
- Success variant has **no** `error` property; failure variant has **no** `value` property
- No `IResultBase`, `IResultOfTBase`, or `IOptionBase` interfaces exist

**Rationale:**
- **Type safety:** Accessing `.value` on a failure or `.error` on a success is
  a **compile-time error**. This catches bugs before they reach production.
- **Ergonomics:** TypeScript narrowing via `if (result.isSuccess)` automatically
  exposes `.value` or `.error` — no casts needed in consumer code.
- **Simplicity:** With no classes or instance methods, there is no need for base
  interfaces or Omit patterns — pure unions are sufficient.
- **No runtime overhead:** Plain objects with only the properties they need —
  no sentinel, no prototype chain, no hidden state.

**Trade-off:** Factory functions must use `as const` assertions on the discriminant
properties and cast through the union type (`as IResultOfT<T, never>`), but this
is a one-time cost in the factory, invisible to consumers.
