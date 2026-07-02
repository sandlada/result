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

---

## Source Layout

```
src/
  IResult.ts          — IResult<TError> interface
  IResultOfT.ts       — IResultOfT<TValue, TError> interface
  Result.ts           — Result<TError> class + ResultOfT<TValue, TError> class
  ResultOfT.ts        — Re-export barrel for ResultOfT
  index.ts            — Public barrel re-exports
  internal/
    sentinel.ts       — NONE sentinel symbol
  promise/
    AsyncResult.ts    — AsyncResult<TValue, TError> class
    index.ts          — Promise barrel re-exports
  fp/
    core.ts           — ok(), err() constructors
    operators.ts      — map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr
    composition.ts    — composeK, pipe
    adapters.ts       — switchFn, liftMap, tee
    combine.ts        — combine, all, combineWithAllErrors
    index.ts          — FP barrel re-exports
    promise/
      core.ts         — asyncOk(), asyncErr() constructors
      operators.ts    — map, mapAsync, mapErr, mapErrAsync, bind, orElse, match, tap, tapErr, unwrapOr
      composition.ts  — composeKAsync, pipeAsync
      adapters.ts     — switchFnAsync, teeAsync
      index.ts        — FP async barrel re-exports

build/
  index.js            — Compiled output (mirrors src/)
  index.d.ts          — Type declarations
  ...

test/
  ComplexIntegration.spec.ts          — Multi-layer, railway, aggregation, async patterns
  ConsumptionPatterns.spec.ts         — Real-world branching, early return, type narrowing
  IntegrationPattern.spec.ts          — Type alias & convenience factory
  Interop.spec.ts                     — Cross-paradigm: OOP↔FP sync, OOP↔FP async, sync↔async
  Result.custom-error-types.spec.ts   — Discriminated unions, classes, plain objects
  Result.default-error-type.spec.ts   — Default Error behavior
  Result.factories.spec.ts            — All 4 factory overloads
  Result.fluent-methods.spec.ts       — ResultOfT instance methods: map, mapErr, andThen, orElse, match, tap, tapErr, unwrapOr
  Result.invariant.spec.ts            — Mutual exclusivity, constructor throws, immutability
  Result.sentinel.spec.ts             — Error always accessible, sentinel pattern
  Result.static-utilities.spec.ts     — Result.tryCatch (sync), combine, all, combineWithAllErrors
  Result.tryCatchAsync.spec.ts        — tryCatchAsync, fromPromise bridge methods
  Result.type-tests.spec.ts           — Compile-time type assertions
  Result.value.spec.ts                — Value access on success/failure, narrowing
  AsyncResult.spec.ts                 — AsyncResult class (all methods, combine, integration)
  fp-async.spec.ts                    — FP async operators, composition, adapters
  fp-composition-adapters.spec.ts     — composeK, pipe, switchFn, liftMap, tee, FP combine/all
  fp-core-operators.spec.ts           — ok/err constructors, map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr
```

---

## Class Hierarchy

```
IResult<TError = Error>                  (interface)
  ├── readonly error: TError             Always accessible; on success holds sentinel
  ├── readonly isSuccess: boolean
  └── readonly isFailure: boolean        Computed: !isSuccess

IResultOfT<TValue, TError = Error>       (interface, extends IResult<TError>)
  └── readonly value: TValue            Throws TypeError on failure

Result<TError = Error>                   (class, implements IResult<TError>)
  ├── protected constructor(isSuccess, error?)  Validates invariant
  ├── get isFailure(): boolean
  ├── static Success(): IResult
  ├── static Success<TValue>(value): IResultOfT<TValue>
  ├── static Failure(error: Error): IResult
  └── static Failure<TValue, TError>(error): IResultOfT<TValue, TError>

ResultOfT<TValue, TError = Error>        (class, extends Result<TError>,
  │                                        implements IResultOfT<TValue, TError>)
  ├── readonly #value: TValue | undefined   Private field
  ├── constructor(value?, isSuccess?, error?)
  └── get value(): TValue
```

---

## Module Architecture

### `src/IResult.ts` — Base Interface

The fundamental contract. Every result has three readonly properties:

```ts
export interface IResult<TError = Error> {
    readonly error: TError;
    readonly isSuccess: boolean;
    readonly isFailure: boolean;
}
```

- Generic default: `TError = Error`
- `error` is **always accessible** (never throws)
- `isFailure` is declared as `readonly`; concrete class computes it as `!isSuccess`

### `src/IResultOfT.ts` — Value-Bearing Interface

Extends the base contract with a success payload:

```ts
export interface IResultOfT<TValue, TError = Error> extends IResult<TError> {
    readonly value: TValue;
}
```

- `value` getter in the concrete class throws `TypeError` if accessed on a failure
- Default `TError = Error`

### `src/Result.ts` — Base Class + Generic Subclass

Contains **both** `Result<TError>` and `ResultOfT<TValue, TError>` in a single file to avoid circular dependencies.

#### Sentinel (`NONE`)

```ts
import { NONE } from './internal/sentinel.js';
```

- Defined in `src/internal/sentinel.ts` as `Symbol.for('result:none')`
- Shared between OOP (`Result.ts`) and FP (`fp/core.ts`) modules
- Uses `Symbol.for()` so the same symbol survives HMR / module reloads
- Cast to `TError` to satisfy the type system
- On success results, stored as the `error` value
- Distinct from any real user-supplied error

#### Constructor Invariant

The constructor enforces mutual exclusivity:

| Condition                      | Action                                                     |
| ------------------------------ | ---------------------------------------------------------- |
| `isSuccess && error !== NONE`  | throws `TypeError` — "success must not carry a real error" |
| `!isSuccess && error === NONE` | throws `TypeError` — "failure must carry a real error"     |

#### Static Factory Methods

All factories live on `Result` (the non-generic base class), not on `ResultOfT`.

| Signature                        | Returns            | Implementation                                                           |
| -------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `Result.Success()`               | `IResult`          | Creates `Result<Error>` with `isSuccess=true`, `error=NONE`              |
| `Result.Success<T>(value)`       | `IResultOfT<T>`    | Creates `ResultOfT<T, Error>` with value, `isSuccess=true`, `error=NONE` |
| `Result.Failure(error: Error)`   | `IResult`          | Creates `ResultOfT` with `isSuccess=false`, given error                  |
| `Result.Failure<T, E>(error: E)` | `IResultOfT<T, E>` | Creates `ResultOfT<T, E>` with `isSuccess=false`, given error            |

**Design rules:**
- Factory methods return the **narrowest interface type** (`IResult` or `IResultOfT`) — consumers are not coupled to concrete classes
- `Failure<T, E>()` requires `T` to be specified (no value to infer it from), but `E` can be inferred from the error argument
- `Success()` (no args) returns `IResult` (void); `Success<T>(value)` returns `IResultOfT<T>`

#### Static Utilities

| Signature                                      | Returns                     | Description                                                      |
| ---------------------------------------------- | --------------------------- | ---------------------------------------------------------------- |
| `Result.tryCatch<T, E>(fn, errorFn?)`          | `IResultOfT<T, E>`          | Wrap a sync function that may throw                              |
| `Result.tryCatchAsync<T, E>(fn, errorFn?)`     | `Promise<IResultOfT<T, E>>` | Wrap an async function that may throw/reject; always resolves    |
| `Result.fromPromise<T, E>(promise, errorFn?)`  | `Promise<IResultOfT<T, E>>` | Convenience wrapper around `tryCatchAsync` for existing promises |
| `Result.combine<T, E>(results[])`              | `IResultOfT<T[], E>`        | Combine array of results — short-circuits on first failure       |
| `Result.all(tuple)`                            | `IResultOfT<[...], E>`      | Combine heterogeneous tuple — preserves each element's type      |
| `Result.combineWithAllErrors<T, E>(results[])` | `IResultOfT<T[], E[]>`      | Combine array, accumulating all errors (validation aggregation)  |

**`tryCatchAsync` and `fromPromise`** are the **bridge** between `Promise` and `Result`.
Both return `Promise<IResultOfT<T, E>>` — they are boundary functions that convert
asynchronous throw/reject into resolved failure results. The `errorFn` parameter
optionally maps the caught `unknown` to the user's `TError` type; when omitted,
the caught value is cast directly.

### `src/ResultOfT.ts` — Re-export Barrel

Pure re-export for discoverability at the expected module path:

```ts
export { ResultOfT } from './Result.js';
```

### OOP Instance Methods (on `ResultOfT`)

All instance methods return `IResultOfT<...>` (the interface), not the concrete class.
Each method is conceptually equivalent to a corresponding FP operator.

| Method                          | FP Equivalent | Signature                                                                   | Description                            |
| ------------------------------- | ------------- | --------------------------------------------------------------------------- | -------------------------------------- |
| `result.map(fn)`                | `map`         | `<U>(fn: (v: TValue) => U) => IResultOfT<U, TError>`                        | Transform success value                |
| `result.mapErr(fn)`             | `mapErr`      | `<F>(fn: (e: TError) => F) => IResultOfT<TValue, F>`                        | Transform error                        |
| `result.andThen(fn)`            | `bind`        | `<U, F>(fn: (v: TValue) => IResultOfT<U, F>) => IResultOfT<U, TError \| F>` | Chain (monadic bind)                   |
| `result.orElse(fn)`             | `orElse`      | `<U, F>(fn: (e: TError) => IResultOfT<U, F>) => IResultOfT<TValue \| U, F>` | Error recovery                         |
| `result.match(onOk, onErr)`     | `match`       | `<U>(onOk: (v: TValue) => U, onErr: (e: TError) => U) => U`                 | Terminal pattern-match                 |
| `result.tap(fn)`                | `tap`         | `(fn: (v: TValue) => void) => IResultOfT<TValue, TError>`                   | Side-effect on success, returns `this` |
| `result.tapErr(fn)`             | `tapErr`      | `(fn: (e: TError) => void) => IResultOfT<TValue, TError>`                   | Side-effect on failure, returns `this` |
| `result.unwrapOr(defaultValue)` | `unwrapOr`    | `(defaultValue: TValue) => TValue`                                          | Safe value extraction with fallback    |

### `src/index.ts` — Public Barrel (OOP)

```ts
export type { IResult } from './IResult.js';
export type { IResultOfT } from './IResultOfT.js';
export { Result } from './Result.js';
export { ResultOfT } from './ResultOfT.js';
```

- Uses `export type` for interfaces (required by `verbatimModuleSyntax`)
- Classes exported as values (they also act as types)

---

## FP Module Architecture (`@sandlada/result/fp`)

The library provides a **functional-programming module** at the `./fp` sub-path.
All functions follow the **F# data-last curried** convention: the data (result) is the
last argument, enabling partial application and composition.

### Package.json Exports

```json
{
  "exports": {
    ".": { "types": "./build/index.d.ts", "default": "./build/index.js" },
    "./fp": { "types": "./build/fp/index.d.ts", "default": "./build/fp/index.js" },
    "./promise": { "types": "./build/promise/index.d.ts", "default": "./build/promise/index.js" },
    "./fp/promise": { "types": "./build/fp/promise/index.d.ts", "default": "./build/fp/promise/index.js" },
    "./*": { "types": "./build/*.d.ts", "default": "./build/*.js" }
  }
}
```

Users import via:

```ts
// OOP (default)
import { Result } from '@sandlada/result';

// FP
import { ok, err, map, bind, pipe } from '@sandlada/result/fp';
```

### `src/fp/core.ts` — FP Constructors

```ts
export function ok(): IResult<never>;
export function ok<T>(value: T): IResultOfT<T, never>;
export function err<E>(error: E): IResultOfT<never, E>;
```

F#-style naming:
- `ok(value)` → `Result.Success(value)` (but returns `IResultOfT<never, E>` on the err path)
- `err(error)` → `Result.Failure<never, E>(error)`

### `src/fp/operators.ts` — Core Operators

All operators are **data-last curried** — the result argument comes last:

```ts
// Signature pattern: (transformer) => (result) => newResult
map<A, B>(f: (a: A) => B): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E>
mapErr<E, F>(f: (e: E) => F): <A>(r: IResultOfT<A, E>) => IResultOfT<A, F>
bind<A, B, F>(f: (a: A) => IResultOfT<B, F>): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>
orElse<E, B, F>(f: (e: E) => IResultOfT<B, F>): <A>(r: IResultOfT<A, E>) => IResultOfT<A | B, F>
match<A, E, C>(onOk, onErr): (r: IResultOfT<A, E>) => C
tap<A>(fn): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>
tapErr<E>(fn): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>
unwrapOr<A>(defaultValue): <E>(r: IResultOfT<A, E>) => A
```

Each operator also accepts the result as an immediate second argument for direct calls:

```ts
map(x => x * 2, ok(21));  // Ok(42)
```

### `src/fp/composition.ts` — Pipelines

**`composeK`** (Kleisli fish `>=>`):

```ts
composeK<A, B, C, E>(
  f1: (a: A) => IResultOfT<B, E>,
  f2: (b: B) => IResultOfT<C, E>,
): (a: A) => IResultOfT<C, E>
```

**`pipe`** (F# `|>`):

```ts
pipe(value, fn1, fn2, fn3, ...)
```

Has 1–6 typed overloads for type safety.

### `src/fp/adapters.ts` — Wlaschin Three-Shape System

Converts between Wlaschin's three function shapes:

| Adapter    | From     | To      | Description                                                              |
| ---------- | -------- | ------- | ------------------------------------------------------------------------ |
| `switchFn` | 1-track  | switch  | `(a: A) => B` → `(a: A) => IResultOfT<B, never>`                         |
| `liftMap`  | 1-track  | 2-track | `(a: A) => B` → `IResultOfT<A, E> => IResultOfT<B, E>` (alias for `map`) |
| `tee`      | dead-end | 1-track | `(a: A) => void` → `(a: A) => A`                                         |

### `src/fp/combine.ts` — Parallel Combination

| Function                          | Behavior                                |
| --------------------------------- | --------------------------------------- |
| `combine(results[])`              | Short-circuits on first failure         |
| `all(tuple)`                      | Heterogeneous tuple, short-circuits     |
| `combineWithAllErrors(results[])` | Accumulates **all** errors (validation) |

### `src/fp/index.ts` — FP Barrel

```ts
export { ok, err } from './core.js';
export { map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr } from './operators.js';
export { composeK, pipe } from './composition.js';
export { switchFn, liftMap, tee } from './adapters.js';
export { combine, all, combineWithAllErrors } from './combine.js';
```

---

## Promise / Async Module Architecture (`@sandlada/result/promise`)

The `./promise` sub-path provides the `AsyncResult` class — a lazy
`Promise<IResultOfT<TValue, TError>>` with a fluent, composable API that
mirrors `ResultOfT`.

The exports for `./promise` and `./fp/promise` are defined in the main `package.json`
(see [Package.json Exports](#packagejson-exports) above).

Users import via:

```ts
// OOP async
import { AsyncResult } from '@sandlada/result/promise';

// FP async
import { asyncOk, asyncErr, map, bind, pipeAsync } from '@sandlada/result/fp/promise';
```

### `src/promise/AsyncResult.ts` — AsyncResult Class

Wraps a `Promise<IResultOfT<TValue, TError>>` and implements:

- **Thenable protocol** (`then()`) — allows `await asyncResult` to get `IResultOfT`
- **Static factories (camelCase):** `success`, `failure`, `tryCatch`, `from`, `fromPromise`
- **Instance methods returning AsyncResult:** `map`, `mapAsync`, `mapErr`, `mapErrAsync`, `andThen`, `orElse`, `tap`, `tapErr`
- **Instance methods returning Promise:** `match(fn)` → `Promise<T>`, `unwrapOr(def)` → `Promise<T>`
- **Escape hatch:** `toPromise()` → `Promise<IResultOfT<TValue, TError>>`
- **Static utilities:** `combine`, `all`, `combineWithAllErrors`

**Design rules:**
- Static factories use **camelCase** (unlike `Result` which uses PascalCase)
- `mapAsync` / `mapErrAsync` catch callback exceptions and convert to Failure
- `andThen` / `orElse` accept `AsyncResult | IResultOfT` with error-type widening
- Private `#promise` field is truly private; `toPromise()` is the escape hatch

### `src/promise/index.ts` — Promise Barrel

```ts
export { AsyncResult } from './AsyncResult.js';
```

---

## FP Async Module Architecture (`@sandlada/result/fp/promise`)

The `./fp/promise` sub-path provides data-last curried FP operators that
delegate to `AsyncResult` instance methods.

### `src/fp/promise/core.ts` — FP Async Constructors

```ts
export function asyncOk<T>(value: T): AsyncResult<T, never>;
export function asyncErr<E>(error: E): AsyncResult<never, E>;
```

### `src/fp/promise/operators.ts` — Async Operators

All operators are data-last curried, taking `AsyncResult` as the data argument:

| Operator      | FP Sync Equivalent | Delegates To              |
| ------------- | ------------------ | ------------------------- |
| `map`         | `map`              | `AsyncResult.map`         |
| `mapAsync`    | —                  | `AsyncResult.mapAsync`    |
| `mapErr`      | `mapErr`           | `AsyncResult.mapErr`      |
| `mapErrAsync` | —                  | `AsyncResult.mapErrAsync` |
| `bind`        | `bind`             | `AsyncResult.andThen`     |
| `orElse`      | `orElse`           | `AsyncResult.orElse`      |
| `match`       | `match`            | `AsyncResult.match`       |
| `tap`         | `tap`              | `AsyncResult.tap`         |
| `tapErr`      | `tapErr`           | `AsyncResult.tapErr`      |
| `unwrapOr`    | `unwrapOr`         | `AsyncResult.unwrapOr`    |

### `src/fp/promise/composition.ts` — Async Pipelines

- `composeKAsync(f1, f2)` — Kleisli composition for async switch functions
- `pipeAsync(value, ...fns)` — pipe through async operators (1–6 typed overloads)

### `src/fp/promise/adapters.ts` — Async Adapters

- `switchFnAsync(f)` — 1-track async → async switch
- `teeAsync(f)` — async dead-end → 1-track

---

## Key Design Patterns

### 1. Sentinel Pattern

- Success results store `Symbol.for('result:none')` as their `error` value
- The sentinel survives HMR because `Symbol.for()` is globally registered
- Consumers must check `isSuccess` before interpreting `error`:

```ts
if (result.isSuccess) {
    // result.error is NONE sentinel — don't interpret it
    doSomething(result.value);
} else {
    // result.error is a real user error
    handleError(result.error);
}
```

### 2. Invariant: Mutual Exclusivity

A result is **always exactly one** of success or failure:
- **Success** must NOT carry a real error (enforced via constructor throw)
- **Failure** must carry a real error (enforced via constructor throw)
- `isSuccess !== isFailure` always holds

### 3. Static Factory on Base Class

All factories live on the non-generic `Result` class, not on `ResultOfT`:
- Mirrors C# reference convention: `Result.Success<T>(value)`, not `Result<T>.Success(value)`
- Enables type inference from the factory call (TypeScript can infer `TValue` from the argument)
- `Failure<T, E>()` requires explicit `TValue` since there's no value to infer from

### 4. Integration Pattern (Pre-configured Result)

Third-party developers can bake their error type into a convenience wrapper:

**Type alias** (lightweight):
```ts
type AppResult<T = void> = IResult<T, AppError>;
```

**Convenience factory** (eliminates generic boilerplate):
```ts
const AppResult = {
    Success(): AppResult<void>,
    Success<T>(value: T): AppResult<T>,
    Failure(error: AppError): AppResult<never>,
} as const;
```

Both approaches compose: the type alias keeps signatures clean, and the factory object eliminates `Result.Failure<T, E>(...)` boilerplate.

### 5. OOP ↔ FP Dual Paradigm

The library provides two programming styles that share the same underlying data
structures and are **fully interoperable**:

| Style | Entry Point           | Convention                  | Example                                        |
| ----- | --------------------- | --------------------------- | ---------------------------------------------- |
| OOP   | `@sandlada/result`    | Fluent method chaining      | `result.map(f).andThen(g).unwrapOr(def)`       |
| FP    | `@sandlada/result/fp` | Data-last curried functions | `pipe(ok(42), map(f), bind(g), unwrapOr(def))` |

**Key design rule:** OOP instance methods internally delegate to the same logic as
FP operators — there is no duplication. Both paths produce identical `IResultOfT`
objects.

You can freely mix styles:

```ts
import { Result } from '@sandlada/result';
import { map, bind } from '@sandlada/result/fp';

const r = Result.Success(42);

// OOP style
r.map(x => x * 2).andThen(x => Result.Success(x + 1));

// FP style with OOP result — same thing, different syntax
pipe(r, map(x => x * 2), bind(x => Result.Success(x + 1)));
```

---

## C# / TypeScript Mapping

| Concern                 | C#                               | TypeScript                                 |
| ----------------------- | -------------------------------- | ------------------------------------------ |
| Base interface          | `IResult`                        | `IResult<TError = Error>`                  |
| Value-bearing interface | `IResult<out T>`                 | `IResultOfT<TValue, TError = Error>`       |
| Error type              | `DomainError` (hardcoded)        | `TError` generic (user-defined)            |
| Sentinel "none"         | `DomainError.General.None`       | Internal `Symbol.for('result:none')` cast  |
| Success factory (void)  | `Result.Success()`               | `Result.Success()`                         |
| Failure factory         | `Result.Failure(DomainError)`    | `Result.Failure(error: TError)`            |
| Success factory (T)     | `Result.Success<T>(T)`           | `Result.Success<T>(value: T)`              |
| Failure factory (T)     | `Result.Failure<T>(DomainError)` | `Result.Failure<T, E>(error: E)`           |
| Naming                  | PascalCase                       | PascalCase (static) / camelCase (instance) |
| Covariance              | `out T` (CLR)                    | Not needed (structural typing)             |

---

## Coding Conventions

1. **`interface` for contracts, `class` for implementations.** Export both so consumers can implement custom results if needed.
2. **`readonly` properties only** — result objects are immutable value objects.
3. **Static factories live on `Result`**, not on `ResultOfT`. This mirrors the C# reference.
4. **`import type { ... }`** for all type-only imports (enforced by `verbatimModuleSyntax`).
5. **No barrel / index re-export cycles.** Each module imports its dependencies from the specific source file. `ResultOfT.ts` is a single re-export from `Result.ts` for discoverability.
6. **PascalCase** for static members (`Result.Success`, `Result.Failure`), matching C# convention. **camelCase** for instance properties (`isSuccess`, `isFailure`, `error`, `value`).

---

## Testing Architecture

**18 test files** with **391 test cases**, all using Vitest. Tests cover every public API surface: OOP factories, OOP instance methods, FP sync operators, FP async operators, composition, adapters, combine utilities, and cross-paradigm interop.

### OOP Core Tests

| Test File                           | Focus                                                                                                            | Cases |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----- |
| `Result.factories.spec.ts`          | All 4 factory overloads, type inference, edge cases                                                              | 16    |
| `Result.static-utilities.spec.ts`   | `Result.tryCatch` (sync), `Result.combine`, `Result.all`, `Result.combineWithAllErrors`, FP interop              | 25    |
| `Result.fluent-methods.spec.ts`     | `ResultOfT` instance methods: `.map`, `.mapErr`, `.andThen`, `.orElse`, `.match`, `.tap`, `.tapErr`, `.unwrapOr` | 33    |
| `Result.invariant.spec.ts`          | Mutual exclusivity, constructor throws, immutability                                                             | 10    |
| `Result.sentinel.spec.ts`           | Error always accessible, sentinel vs real error                                                                  | 8     |
| `Result.value.spec.ts`              | Value access on success/failure, type narrowing, void success                                                    | 12    |
| `Result.default-error-type.spec.ts` | Default `TError = Error` behavior                                                                                | 7     |
| `Result.custom-error-types.spec.ts` | Discriminated unions, classes, plain objects                                                                     | 12    |
| `Result.type-tests.spec.ts`         | Compile-time type assertions (`expectTypeOf`)                                                                    | 16    |
| `ConsumptionPatterns.spec.ts`       | Real-world branching, early return, type narrowing                                                               | 12    |
| `IntegrationPattern.spec.ts`        | Type alias, convenience factory, `mapError()`, `never`                                                           | 14    |

### FP Sync Tests

| Test File                         | Focus                                                                                                               | Cases |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----- |
| `fp-core-operators.spec.ts`       | `ok`/`err` constructors, `map`, `mapErr`, `bind`, `orElse`, `match`, `tap`, `tapErr`, `unwrapOr` (curried + direct) | 44    |
| `fp-composition-adapters.spec.ts` | `composeK`, `pipe`, `switchFn`, `liftMap`, `tee`, FP `combine`/`all`/`combineWithAllErrors`                         | 28    |

### Async Tests

| Test File                      | Focus                                                  | Cases |
| ------------------------------ | ------------------------------------------------------ | ----- |
| `AsyncResult.spec.ts`          | `AsyncResult` class: all methods, combine, integration | 50    |
| `Result.tryCatchAsync.spec.ts` | Async bridge methods: `tryCatchAsync`, `fromPromise`   | 13    |
| `fp-async.spec.ts`             | FP async operators, composition, adapters              | 31    |

### Integration & Interop Tests

| Test File                    | Focus                                                                           | Cases |
| ---------------------------- | ------------------------------------------------------------------------------- | ----- |
| `ComplexIntegration.spec.ts` | Multi-layer services, railway pipeline, aggregation, async patterns             | 40    |
| `Interop.spec.ts`            | Cross-paradigm: OOP↔FP sync, OOP↔FP async, sync↔async boundary, edge conditions | 20    |

### Test Design Principles

- **Contract-based:** All tests verify behavior through public APIs only — no access to internal sentinel, protected constructors, or `any` casts.
- **Dual-path:** Every function and method is tested on both success and failure paths.
- **Data-last currying:** FP operators are tested in both curried (`map(fn)(result)`) and direct (`map(fn, result)`) call modes.
- **Error-type widening:** `andThen`/`orElse`/`bind` tests verify that error types widen correctly (union of input and callback error types).
- **Interop by construction:** Tests in every file mix OOP and FP styles to verify that `IResultOfT` objects from either paradigm work seamlessly together.

---

## Architectural Decisions

### ADR-1: Generic `TError` over Hardcoded Error Type

**Decision:** Use a generic `TError` parameter with a default of `Error`, rather than hardcoding a specific error type (as the C# reference does with `DomainError`).

**Rationale:** TypeScript developers use diverse error patterns — discriminated unions, classes, plain objects. A generic parameter gives users full control while the default keeps simple cases simple.

### ADR-2: `Symbol.for()` over `Symbol()` for Sentinel

**Decision:** Use `Symbol.for('result:none')` instead of a plain `Symbol()`.

**Rationale:** `Symbol.for()` returns the same symbol value across module reloads (HMR), preventing sentinel identity mismatches during development.

### ADR-3: `ResultOfT` Co-located in `Result.ts`

**Decision:** Define both `Result` and `ResultOfT` classes in the same `Result.ts` file, with a separate `ResultOfT.ts` re-export barrel.

**Rationale:** `ResultOfT` is referenced by `Result`'s static factory methods. Placing them in separate files would create a circular dependency. The barrel re-export maintains discoverability at the expected module path.

### ADR-4: Factory Methods Return Interfaces, Not Classes

**Decision:** Static factory return types are the narrowest interface (`IResult` / `IResultOfT`) rather than the concrete class.

**Rationale:** Consumers should program against the contract, not the implementation. This allows future changes to the concrete class without breaking consumers.

### ADR-5: Class Constructor is `protected`

**Decision:** Both `Result` and `ResultOfT` constructors are `protected`.

**Rationale:** Users create results exclusively through static factory methods. The `protected` constructor allows subclassing while preventing direct instantiation by consumers.

### ADR-6: Dual-Paradigm Architecture (OOP Default, FP Sub-Path)

**Decision:** Provide two API styles — OOP (default `@sandlada/result`) and FP (`@sandlada/result/fp`) — that share the same underlying data structures and are fully interoperable.

**Rationale:**
- TypeScript developers come from diverse backgrounds (C#, Java → OOP fluent; Haskell, F#, Elm → FP curried)
- Both styles need to produce the same `IResultOfT` objects so they interop seamlessly
- FP operators use data-last currying to enable partial application and `pipe` composition
- OOP defaults so the main import path stays familiar to the C# reference audience
- The `./fp` sub-path is opt-in — no bundle bloat for OOP-only users
