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
  IResult.ts          — IResultBase (internal), IResultSuccess, IResultFailure, IResult (union)
  IResultOfT.ts       — IResultOfTBase (internal), IResultOfTSuccess, IResultOfTFailure, IResultOfT (union)
  Result.ts           — Result<TError> class + ResultOfT<TValue, TError> class (independent classes)
  ResultOfT.ts        — Re-export barrel for ResultOfT
  Option.ts           — Option<T> class + IOption<T> discriminated union
  index.ts            — Public barrel re-exports
  internal/
    sentinel.ts       — NONE sentinel symbol
    invariant.ts      — AssertResultInvariant helper for constructor validation
  promise/
    AsyncResult.ts    — AsyncResult<TValue, TError> class
    index.ts          — Promise barrel re-exports
  fp/
    core.ts           — ok(), err() constructors
    operators.ts      — map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr
    composition.ts    — composeK (2–6 overloads), pipe (1–10 overloads)
    adapters.ts       — switchFn, liftMap, tee
    combine.ts        — combine, all, combineWithAllErrors
    index.ts          — FP barrel re-exports
    option/
      core.ts         — ofSome(), ofNone() constructors
      operators.ts    — map, andThen, orElse, match, tap, unwrapOr (option-specific)
      index.ts        — FP option barrel re-exports
    promise/
      core.ts         — asyncOk(), asyncErr() constructors
      operators.ts    — map, mapAsync, mapErr, mapErrAsync, bind, orElse, match, tap, tapErr, unwrapOr
      composition.ts  — composeKAsync (2–6 overloads), pipeAsync (1–10 overloads)
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
  Option.spec.ts                      — Option<T>: factories, methods, toJSON, FP operators, narrowing
  Option.filter-flatten-contains.spec.ts — Option filter, flatten, contains (Phase 5d)
  Interop.spec.ts                     — Cross-paradigm: OOP↔FP sync, OOP↔FP async, sync↔async
  Result.custom-error-types.spec.ts   — Discriminated unions, classes, plain objects
  Result.default-error-type.spec.ts   — Default Error behavior
  Result.factories.spec.ts            — All 4 factory overloads
  Result.fluent-methods.spec.ts       — ResultOfT fluent instance methods
  Result.invariant.spec.ts            — Mutual exclusivity, constructor throws, immutability
  Result.sentinel.spec.ts             — Error always accessible, sentinel pattern
  Result.static-utilities.spec.ts     — Result.tryCatch (sync), combine, all, combineWithAllErrors
  Result.tryCatchAsync.spec.ts        — tryCatchAsync, fromPromise bridge methods
  Result.type-tests.spec.ts           — Compile-time type assertions
  Result.value.spec.ts                — Value access on success/failure, narrowing
  Result.unwrap-expect.spec.ts        — unwrap, expect, unwrapErr, expectErr (Phase 5a)
  Result.toOption-fromOption.spec.ts  — toOption, fromOption (Phase 5a)
  Result.unwrapOrElse.spec.ts         — unwrapOrElse (Phase 5a)
  Result.fromPredicate.spec.ts        — fromPredicate (Phase 5a)
  Result.combinators.spec.ts          — flatten, and, or, contains, exists, bimap, swap (Phase 5b)
  Result.phase5c.spec.ts              — fromThrowable, mapOr, mapOrElse, getOrNull, toString (Phase 5c)
  Result.toJSON.spec.ts               — toJSON on Result and ResultOfT (Phase 5e)
  AsyncResult.spec.ts                 — AsyncResult class (all methods, combine, integration)
  fp-async.spec.ts                    — FP async operators, composition, adapters
  fp-composition-adapters.spec.ts     — composeK, pipe, switchFn, liftMap, tee, FP combine/all
  fp-core-operators.spec.ts           — ok/err constructors, map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr
```

---

## Class Hierarchy

The interfaces use a **discriminated union** pattern (inspired by true-myth's
Omit pattern). Each result type is split into a success variant and a failure
variant, discriminated by the `isSuccess` literal. The `value` and `error`
properties are restricted to their respective variants — accessing them
requires narrowing via `isSuccess`.

```
── Internal flat bases (for class implementation) ──

IResultBase<TError = Error>              (internal interface)
  ├── readonly error: TError             Always accessible at runtime
  ├── readonly isSuccess: boolean
  ├── readonly isFailure: boolean
  ├── tap(fn: () => void): IResult<TError>
  ├── unwrap(): void
  ├── expect(msg: string): void
  ├── unwrapErr(): TError
  ├── expectErr(msg: string): TError
  ├── toString(): string
  └── toJSON(): { isSuccess: true } | { isSuccess: false; error: TError }

IResultOfTBase<TValue, TError = Error>   (internal interface, extends IResultBase)
  ├── readonly value: TValue
  ├── map/mapErr/andThen/orElse/match/tap/tapErr/unwrapOr (fluent chain)
  ├── unwrapOrElse, unwrap, expect, unwrapErr, expectErr (escape hatches)
  ├── toOption, flatten, and, or, contains, exists, bimap, swap (combinators)
  ├── getOrNull, getOrUndefined, mapOr, mapOrElse (extraction shorts)
  └── toString, toJSON (display + serialization)

── Exported variant interfaces (discriminated union members) ──

IResultSuccess                           (interface — success variant)
  ├── readonly isSuccess: true           Literal discriminant
  └── readonly isFailure: false

IResultFailure<TError = Error>           (interface — failure variant)
  ├── readonly isSuccess: false          Literal discriminant
  ├── readonly isFailure: true
  └── readonly error: TError

IResultOfTSuccess<TValue, TError>        (interface — success variant)
  ├── extends Omit<IResultOfTBase, 'error'|'isSuccess'|'isFailure'>
  ├── readonly isSuccess: true           Literal discriminant
  ├── readonly isFailure: false
  ├── readonly value: TValue
  └── (inherits all 8 methods via Omit)

IResultOfTFailure<TValue, TError>        (interface — failure variant)
  ├── extends Omit<IResultOfTBase, 'value'|'isSuccess'|'isFailure'>
  ├── readonly isSuccess: false          Literal discriminant
  ├── readonly isFailure: true
  ├── readonly error: TError
  └── (inherits all 8 methods via Omit)

── Exported union type aliases ──

IResult<TError = Error>                  = IResultSuccess | IResultFailure<TError>
IResultOfT<TValue, TError = Error>       = IResultOfTSuccess | IResultOfTFailure

── Concrete classes (implement the internal flat bases) ──

Result<TError = Error>                   (class, implements IResultBase<TError>)
  ├── protected constructor(isSuccess, error?)  Validates invariant via assertResultInvariant
  ├── get isFailure(): boolean
  ├── Instance: tap(), unwrap(), expect(), unwrapErr(), expectErr(), toString(), toJSON()
  ├── static Success(): IResult
  ├── static Success<TValue>(value): IResultOfT<TValue>
  ├── static Failure(error: Error): IResult
  ├── static Failure<TValue, TError>(error): IResultOfT<TValue, TError>
  ├── static fromOption<T,E>(opt, errorOnNone): IResultOfT<T, E>
  ├── static fromPredicate<T,E>(v, pred, err): IResultOfT<T, E>
  └── static fromThrowable<T,E>(fn, errorFn?): IResultOfT<T, E>

ResultOfT<TValue, TError = Error>        (class, implements IResultOfTBase<TValue, TError>)
  ├── **Does NOT extend Result** (flat hierarchy — Phase 4a simplification)
  ├── readonly #value: TValue | undefined   Private field
  ├── constructor(value?, isSuccess?, error?)   Validates invariant via assertResultInvariant
  ├── get value(): TValue
  └── toJSON(): { isSuccess: true; value: TValue } | { isSuccess: false; error: TError }
```

### Option Class Hierarchy (added Phase 2)

```
── Internal flat base (for class implementation) ──

IOptionBase<T>                       (internal interface)
  ├── readonly isSome: boolean
  ├── readonly isNone: boolean
  ├── readonly value: T              Throws TypeError if isNone
  ├── map, andThen, orElse, match, tap, unwrapOr, toJSON  (7 methods)
  ├── filter, flatten, contains      (3 methods — Phase 5d)

── Exported variant interfaces (discriminated union members) ──

IOptionSome<T>                       (extends Omit<IOptionBase<T>, 'isSome' | 'isNone'>)
  ├── readonly isSome: true          Literal discriminant
  ├── readonly isNone: false
  └── readonly value: T

IOptionNone                          (extends Omit<IOptionBase<never>, 'value' | 'isSome' | 'isNone'>)
  ├── readonly isSome: false         Literal discriminant
  └── readonly isNone: true

── Exported union type alias ──

IOption<T> = IOptionSome<T> | IOptionNone

── Concrete class ──

Option<T>                            (class, implements IOptionBase<T>)
  ├── private constructor(isSome, value?)
  ├── get isSome(): boolean
  ├── get isNone(): boolean
  ├── get value(): T                 Throws TypeError if None
  ├── static Some<T>(value): IOption<T>
  ├── static None(): IOption<never>
  └── Instance methods: map, andThen, orElse, match, tap, unwrapOr, toJSON,
      filter, flatten, contains
```

**Why internal flat bases?** A TypeScript class cannot `implements` a union
type. The `IResultBase` and `IResultOfTBase` flat interfaces provide the full
shape for the class to implement. Factory methods then cast the class instance
to the exported union type (`as unknown as IResult` / `IResultOfT`).

---

## Module Architecture

### `src/IResult.ts` — Base Result Contract (Discriminated Union)

The fundamental contract, expressed as a **discriminated union** of a success
variant and a failure variant. The `isSuccess` literal property discriminates
them.

```ts
// Internal flat base — for class implementation only
export interface IResultBase<TError = Error> {
    readonly error: TError;
    readonly isSuccess: boolean;
    readonly isFailure: boolean;
}

// Success variant — no error property
export interface IResultSuccess {
    readonly isSuccess: true;
    readonly isFailure: false;
}

// Failure variant — carries error
export interface IResultFailure<TError = Error> {
    readonly isSuccess: false;
    readonly isFailure: true;
    readonly error: TError;
}

// Union type alias — what consumers use
export type IResult<TError = Error> = IResultSuccess | IResultFailure<TError>;
```

- `IResultBase` is `@internal` — used by the `Result` class to `implements`
- `IResultSuccess` has **no `error` property** — accessing `.error` on a
  success result is a **type error** (must narrow via `isSuccess` first)
- `IResultFailure` has **no value** — it only carries `error`
- At runtime, the `error` property on a success result still returns the
  sentinel, but the type system does not expose it
- Generic default: `TError = Error`

### `src/IResultOfT.ts` — Value-Bearing Contract (Discriminated Union)

Extends the base contract with a success payload, using the **Omit pattern**
(inspired by true-myth) to split into success and failure variants while
preserving all instance methods on both.

```ts
// Internal flat base — contains value + all 8 method signatures
export interface IResultOfTBase<TValue, TError = Error> extends IResultBase<TError> {
    readonly value: TValue;
    map<U>(fn: (value: TValue) => U): IResultOfT<U, TError>;
    mapErr<F>(fn: (error: TError) => F): IResultOfT<TValue, F>;
    andThen<U, F>(fn: (value: TValue) => IResultOfT<U, F>): IResultOfT<U, TError | F>;
    orElse<U, F>(fn: (error: TError) => IResultOfT<U, F>): IResultOfT<TValue | U, F>;
    match<U>(onSuccess: (value: TValue) => U, onFailure: (error: TError) => U): U;
    tap(fn: (value: TValue) => void): IResultOfT<TValue, TError>;
    tapErr(fn: (error: TError) => void): IResultOfT<TValue, TError>;
    unwrapOr(defaultValue: TValue): TValue;
    unwrapOrElse(fn: (error: TError) => TValue): TValue;
    unwrap(): TValue;
    expect(msg: string): TValue;
    unwrapErr(): TError;
    expectErr(msg: string): TError;
    toOption(): IOption<TValue>;
    flatten<U>(this: IResultOfT<IResultOfT<U, TError>, TError>): IResultOfT<U, TError>;
    and<U, F>(other: IResultOfT<U, F>): IResultOfT<U, TError | F>;
    or<F>(other: IResultOfT<TValue, F>): IResultOfT<TValue, F>;
    contains(value: TValue): boolean;
    exists(predicate: (value: TValue) => boolean): boolean;
    bimap<U, F>(onSuccess: (v: TValue) => U, onFailure: (e: TError) => F): IResultOfT<U, F>;
    swap(): IResultOfT<TError, TValue>;
    getOrNull(): TValue | null;
    getOrUndefined(): TValue | undefined;
    mapOr<U>(defaultValue: U, fn: (v: TValue) => U): U;
    mapOrElse<U>(onErr: (e: TError) => U, fn: (v: TValue) => U): U;
    toString(): string;
    toJSON(): { isSuccess: true; value: TValue } | { isSuccess: false; error: TError };
}

// Success variant — omits error, keeps value, inherits all methods via Omit
export interface IResultOfTSuccess<TValue, TError = Error>
    extends Omit<IResultOfTBase<TValue, TError>, 'error' | 'isSuccess' | 'isFailure'> {
    readonly isSuccess: true;
    readonly isFailure: false;
    readonly value: TValue;
}

// Failure variant — omits value, keeps error, inherits all methods via Omit
export interface IResultOfTFailure<TValue, TError = Error>
    extends Omit<IResultOfTBase<TValue, TError>, 'value' | 'isSuccess' | 'isFailure'> {
    readonly isSuccess: false;
    readonly isFailure: true;
    readonly error: TError;
}

// Union type alias — what consumers use
export type IResultOfT<TValue, TError = Error> =
    | IResultOfTSuccess<TValue, TError>
    | IResultOfTFailure<TValue, TError>;
```

**Key points:**

- `IResultOfTBase` is `@internal` — used by the `ResultOfT` class to `implements`
- The **Omit pattern** ensures both variants inherit all 8 instance methods,
  so `result.map(...)` works on the union type without narrowing
- `value` is **omitted** from the failure variant — accessing `.value` on a
  failure is a **type error** (must narrow via `isSuccess` first)
- `error` is **omitted** from the success variant — accessing `.error` on a
  success is a **type error**
- `value` getter in the concrete class throws `TypeError` at runtime if
  accessed on a failure (defense-in-depth beyond the type system)
- Default `TError = Error`

### `src/Result.ts` — Base Class + Generic Subclass

Contains **both** `Result<TError>` and `ResultOfT<TValue, TError>` in a single file. As of Phase 4a, `ResultOfT` **no longer extends `Result`** — it independently implements `IResultOfTBase`. Both classes use the extracted `assertResultInvariant` from `src/internal/invariant.ts`.

#### `src/internal/invariant.ts` — Invariant Helper

```ts
export function assertResultInvariant<TError>(isSuccess: boolean, error: TError): void;
```

Validates the mutual exclusivity contract: success must not carry a real error, failure must carry a real error. Used by both `Result` and `ResultOfT` constructors.

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
| `Result.fromOption<T, E>(opt, errorOnNone)`    | `IResultOfT<T, E>`          | Converts `Option.Some` → `Success`, `None` → `Failure`           |
| `Result.fromPredicate<T, E>(v, pred, err)`     | `IResultOfT<T, E>`          | Returns `Success(v)` if `pred(v)`, else `Failure(err)`           |
| `Result.fromThrowable<T, E>(fn, errorFn?)`     | `IResultOfT<T, E>`          | Converts a throwing function into a Result                       |
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

### OOP Instance Methods (on `Result` and `ResultOfT`)

All instance methods return `IResultOfT<...>` (the interface), not the concrete class.
Void methods on `Result` have no `<TValue>` parameter.

#### Void Result (on `Result<TError>`)

| Method                  | Signature                        | Description                      |
| ----------------------- | -------------------------------- | -------------------------------- |
| `result.tap(fn)`        | `(fn: () => void) => IResult<E>` | Side-effect on success           |
| `result.unwrap()`       | `() => void`                     | Panics on failure                |
| `result.expect(msg)`    | `(msg: string) => void`          | Panics with custom message       |
| `result.unwrapErr()`    | `() => TError`                   | Panics on success, returns error |
| `result.expectErr(msg)` | `(msg: string) => TError`        | Panics with custom message       |
| `result.toString()`     | `() => string`                   | `Ok` or `Err(error)`             |
| `result.toJSON()`       | `() => { isSuccess } \| {...}`   | Serializes for JSON.stringify    |

#### Value Result (on `ResultOfT<TValue, TError>`)

| Method                          | FP Equivalent  | Description                                  |
| ------------------------------- | -------------- | -------------------------------------------- |
| `result.map(fn)`                | `map`          | Transform success value                      |
| `result.mapErr(fn)`             | `mapErr`       | Transform error                              |
| `result.andThen(fn)`            | `bind`         | Chain (monadic bind)                         |
| `result.orElse(fn)`             | `orElse`       | Error recovery                               |
| `result.match(onOk, onErr)`     | `match`        | Terminal pattern-match                       |
| `result.tap(fn)`                | `tap`          | Side-effect on success                       |
| `result.tapErr(fn)`             | `tapErr`       | Side-effect on failure                       |
| `result.unwrapOr(defaultValue)` | `unwrapOr`     | Safe value extraction with fallback          |
| `result.unwrapOrElse(fn)`       | `unwrapOrElse` | Compute default from error                   |
| `result.unwrap()`               | `unwrap`       | Panics on failure, returns value             |
| `result.expect(msg)`            | `expect`       | Panics with custom message                   |
| `result.unwrapErr()`            | `unwrapErr`    | Panics on success, returns error             |
| `result.expectErr(msg)`         | `expectErr`    | Panics with custom message                   |
| `result.toOption()`             | `toOption`     | `Success(v)` → `Some(v)`, `Failure` → `None` |
| `result.flatten()`              | `flatten`      | Flattens nested Result<Result<U,E>,E>        |
| `result.and(other)`             | `and`          | Logical AND, returns `other` on success      |
| `result.or(other)`              | `or`           | Logical OR, returns `other` on failure       |
| `result.contains(value)`        | `contains`     | `true` if success and value matches          |
| `result.exists(pred)`           | `exists`       | `true` if success and predicate holds        |
| `result.bimap(onOk, onErr)`     | `bimap`        | Simultaneous map over both variants          |
| `result.swap()`                 | `swap`         | `Ok(v)` → `Err(v)`, `Err(e)` → `Ok(e)`       |
| `result.getOrNull()`            | —              | Value on success, `null` on failure          |
| `result.getOrUndefined()`       | —              | Value on success, `undefined` on failure     |
| `result.mapOr(def, fn)`         | `mapOr`        | Map success or return default                |
| `result.mapOrElse(onErr, fn)`   | `mapOrElse`    | Map success or compute from error            |
| `result.toString()`             | —              | `Ok(value)` or `Err(error)`                  |
| `result.toJSON()`               | —              | Serializes for JSON.stringify                |

### `src/index.ts` — Public Barrel (OOP)

```ts
export type {
    IResult,
    IResultSuccess,
    IResultFailure,
} from './IResult.js';
export type {
    IResultOfT,
    IResultOfTSuccess,
    IResultOfTFailure,
} from './IResultOfT.js';
export { Result } from './Result.js';
export { ResultOfT } from './ResultOfT.js';
export type { IOption, IOptionSome, IOptionNone } from './Option.js';
export { Option } from './Option.js';
```

- Uses `export type` for interfaces/type aliases (required by `verbatimModuleSyntax`)
- Classes exported as values (they also act as types)
- Variant interfaces (`IResultSuccess`, `IResultFailure`, `IResultOfTSuccess`,
  `IResultOfTFailure`) are exported for consumers who need to narrow or
  construct results with explicit variant types
- Internal flat bases (`IResultBase`, `IResultOfTBase`, `IOptionBase`) are **not** re-exported
  from the public barrel — they are implementation details for the classes

---

## Option Module Architecture (`@sandlada/result`)

The **Option type** (added Phase 2) represents an optional value — either
`Some(value)` or `None`. It is inspired by Rust's `Option<T>` and F#'s
`'a option`.

### Package.json Exports

```json
"exports": {
    ...
    "./option": { "types": "./build/Option.d.ts", "default": "./build/Option.js" },
    "./fp/option": { "types": "./build/fp/option/index.d.ts", "default": "./build/fp/option/index.js" }
}
```

### `src/Option.ts` — Option Type

```ts
export interface IOptionBase<T> { ... }      // @internal — class implements this
export interface IOptionSome<T> extends Omit<IOptionBase<T>, ...> { ... }
export interface IOptionNone extends Omit<IOptionBase<never>, ...> { ... }
export type IOption<T> = IOptionSome<T> | IOptionNone;
export class Option<T> implements IOptionBase<T> { ... }
```

Uses the same **discriminated union + Omit pattern** as the Result types.
`isSome` is the discriminant (literal `true` on Some, `false` on None).
The `value` getter throws `TypeError` when accessed on None.

Static factories (`Option.Some(value)`, `Option.None()`) return `IOption<T>`
(the interface, not the concrete class), matching the Result convention.

### `src/fp/option/core.ts` — FP Option Constructors

```ts
ofSome<T>(value: T): IOption<T>     // wraps Option.Some
ofNone(): IOption<never>            // wraps Option.None
```

### `src/fp/option/operators.ts` — FP Option Operators

All data-last curried, working with `IOption<T>` directly via `isSome` checks:

| Operator   | Signature                                                       | Description                      |
| ---------- | --------------------------------------------------------------- | -------------------------------- |
| `map`      | `<T,U>(fn: (v: T) => U) => (IOption<T>) => IOption<U>`          | Transform value if Some          |
| `andThen`  | `<T,U>(fn: (v: T) => IOption<U>) => (IOption<T>) => IOption<U>` | Monadic bind (chain)             |
| `orElse`   | `<T>(fn: () => IOption<T>) => (IOption<T>) => IOption<T>`       | Fall back to alternative if None |
| `match`    | `<T,U>(onSome, onNone) => (IOption<T>) => U`                    | Terminal pattern-match           |
| `tap`      | `<T>(fn: (v: T) => void) => (IOption<T>) => IOption<T>`         | Side-effect on Some              |
| `unwrapOr` | `<T>(defaultValue: T) => (IOption<T>) => T`                     | Safe extraction with default     |
| `filter`   | `<T>(pred: (v: T) => boolean) => (IOption<T>) => IOption<T>`    | None if predicate fails          |
| `flatten`  | `<T>(opt: IOption<IOption<T>>) => IOption<T>`                   | Flattens nested option           |
| `contains` | `<T>(target: T) => (IOption<T>) => boolean`                     | True if Some and value matches   |

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
unwrapOrElse<A, E>(fn: (e: E) => A): (r: IResultOfT<A, E>) => A
unwrap<A, E>(r: IResultOfT<A, E>): A
expect<A, E>(msg: string): (r: IResultOfT<A, E>) => A
unwrapErr<A, E>(r: IResultOfT<A, E>): E
expectErr<A, E>(msg: string): (r: IResultOfT<A, E>) => E
flatten<A, E>(r: IResultOfT<IResultOfT<A, E>, E>): IResultOfT<A, E>
and<B, F>(other: IResultOfT<B, F>): <A, E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>
or<A, F>(other: IResultOfT<A, F>): <E>(r: IResultOfT<A, E>) => IResultOfT<A, F>
contains<A>(value: A): <E>(r: IResultOfT<A, E>) => boolean
exists<A>(pred: (v: A) => boolean): <E>(r: IResultOfT<A, E>) => boolean
bimap<A, E, U, F>(onOk, onErr): (r: IResultOfT<A, E>) => IResultOfT<U, F>
swap<A, E>(r: IResultOfT<A, E>): IResultOfT<E, A>
mapOr<A, U>(def: U, fn: (v: A) => U): <E>(r: IResultOfT<A, E>) => U
mapOrElse<A, E, U>(onErr, fn): (r: IResultOfT<A, E>) => U
```

Each operator also accepts the result as an immediate second argument for direct calls:

```ts
map(x => x * 2, ok(21));  // Ok(42)
```

### `src/fp/composition.ts` — Pipelines

**`composeK`** (Kleisli fish `>=>`):

```ts
composeK<A, B, C, E>(f1, f2): (a: A) => IResultOfT<C, E>;
// 2–6 typed overloads + variadic implementation
```

**`pipe`** (F# `|>`):

```ts
pipe(value, fn1, fn2, fn3, ...)
```

Has 1–10 typed overloads for type safety.

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
export { ok, err, fromPredicate, fromThrowable } from './core.js';
export {
    map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr,
    unwrapOrElse, unwrap, expect, unwrapErr, expectErr,
    flatten, and, or, contains, exists, bimap, swap,
    mapOr, mapOrElse,
} from './operators.js';
export { composeK, pipe } from './composition.js';
export { switchFn, liftMap, tee, toOption, fromOption } from './adapters.js';
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

- `composeKAsync(f1, f2, ...)` — Kleisli composition for async switch functions (2–6 overloads)
- `pipeAsync(value, ...fns)` — pipe through async operators (1–10 typed overloads)

### `src/fp/promise/adapters.ts` — Async Adapters

- `switchFnAsync(f)` — 1-track async → async switch
- `teeAsync(f)` — async dead-end → 1-track

---

## Key Design Patterns

### 1. Sentinel Pattern

- Success results store `Symbol.for('result:none')` as their `error` value
- The sentinel survives HMR because `Symbol.for()` is globally registered
- With the discriminated union refactor, the `error` property is **not exposed**
  on the success variant — the type system enforces what was previously only a
  convention
- Consumers must check `isSuccess` to narrow before accessing `error`:

```ts
if (result.isSuccess) {
    // result.error — type error: not on the success variant
    doSomething(result.value);  // ✓ safe — narrowed to success
} else {
    handleError(result.error);   // ✓ safe — narrowed to failure
}
```

- At runtime, the `error` property on a success result still returns the
  sentinel (for backward compatibility and debugging), but the type system
  does not expose it

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
type AppResult<T = void> = IResultOfT<T, AppError>;
```

> **Note:** Use `IResultOfT<T, E>` (not `IResult<T, E>`) for value-bearing
> results. `IResult<E>` is the base union without a `value` property.

**Convenience factory** (eliminates generic boilerplate):
```ts
const AppResult = {
    Success(): AppResult<void>,
    Success<T>(value: T): AppResult<T>,
    Failure(error: AppError): AppResult<never>,
} as const;
```

> **Note:** Factory `Success`/`Failure` methods that cast `Result.Success(...)`
> to a custom `AppResult<T>` type must use `as unknown as AppResult<T>` because
> the concrete class implements the internal flat base, not the union type
> directly.

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

| Concern                 | C#                               | TypeScript                                                 |
| ----------------------- | -------------------------------- | ---------------------------------------------------------- |
| Base interface          | `IResult`                        | `IResult<TError = Error>` (discriminated union)            |
| Value-bearing interface | `IResult<out T>`                 | `IResultOfT<TValue, TError = Error>` (discriminated union) |
| Error type              | `DomainError` (hardcoded)        | `TError` generic (user-defined)                            |
| Sentinel "none"         | `DomainError.General.None`       | Internal `Symbol.for('result:none')` cast                  |
| Success factory (void)  | `Result.Success()`               | `Result.Success()`                                         |
| Failure factory         | `Result.Failure(DomainError)`    | `Result.Failure(error: TError)`                            |
| Success factory (T)     | `Result.Success<T>(T)`           | `Result.Success<T>(value: T)`                              |
| Failure factory (T)     | `Result.Failure<T>(DomainError)` | `Result.Failure<T, E>(error: E)`                           |
| Naming                  | PascalCase                       | PascalCase (static) / camelCase (instance)                 |
| Covariance              | `out T` (CLR)                    | Not needed (structural typing)                             |

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

**27 test files** with **574 test cases**, all using Vitest. Tests cover every public API surface: OOP factories, OOP instance methods, FP sync operators, FP async operators, composition, adapters, combine utilities, Option type, and cross-paradigm interop.

### OOP Core Tests

| Test File                                | Focus                                                                                                                                                           | Cases |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `Result.factories.spec.ts`               | All 4 factory overloads, type inference, edge cases                                                                                                             | 16    |
| `Result.static-utilities.spec.ts`        | `Result.tryCatch` (sync), `Result.combine`, `Result.all`, `Result.combineWithAllErrors`, FP interop                                                             | 25    |
| `Result.fluent-methods.spec.ts`          | `ResultOfT` instance methods: `.map`, `.mapErr`, `.andThen`, `.orElse`, `.match`, `.tap`, `.tapErr`, `.unwrapOr`                                                | 33    |
| `Result.invariant.spec.ts`               | Mutual exclusivity, constructor throws, immutability                                                                                                            | 10    |
| `Result.sentinel.spec.ts`                | Error always accessible, sentinel vs real error                                                                                                                 | 8     |
| `Result.value.spec.ts`                   | Value access on success/failure, type narrowing, void success                                                                                                   | 12    |
| `Result.default-error-type.spec.ts`      | Default `TError = Error` behavior                                                                                                                               | 7     |
| `Result.custom-error-types.spec.ts`      | Discriminated unions, classes, plain objects                                                                                                                    | 12    |
| `Result.type-tests.spec.ts`              | Compile-time type assertions (`expectTypeOf`)                                                                                                                   | 16    |
| `ConsumptionPatterns.spec.ts`            | Real-world branching, early return, type narrowing                                                                                                              | 12    |
| `IntegrationPattern.spec.ts`             | Type alias, convenience factory, `mapError()`, `never`                                                                                                          | 14    |
| `Option.spec.ts`                         | `Option.Some`/`None`, `isSome`/`isNone`, `value`, `map`, `andThen`, `orElse`, `match`, `tap`, `unwrapOr`, `toJSON`, discriminated union narrowing, FP operators | 50    |
| `Option.filter-flatten-contains.spec.ts` | `filter`, `flatten`, `contains` (OOP + FP)                                                                                                                      | 12    |
| `Result.unwrap-expect.spec.ts`           | `unwrap`, `expect`, `unwrapErr`, `expectErr` on both `Result` and `ResultOfT`                                                                                   | 32    |
| `Result.toOption-fromOption.spec.ts`     | `toOption`/`fromOption`                                                                                                                                         | 14    |
| `Result.unwrapOrElse.spec.ts`            | `unwrapOrElse`                                                                                                                                                  | 8     |
| `Result.fromPredicate.spec.ts`           | `fromPredicate`                                                                                                                                                 | 8     |
| `Result.combinators.spec.ts`             | `flatten`, `and`, `or`, `contains`, `exists`, `bimap`, `swap`                                                                                                   | 28    |
| `Result.phase5c.spec.ts`                 | `fromThrowable`, `mapOr`, `mapOrElse`, `getOrNull`, `getOrUndefined`, `toString`, `tap` on void Result                                                          | 24    |
| `Result.toJSON.spec.ts`                  | `toJSON` on `Result` (void) and `ResultOfT` (value), `JSON.stringify` round-trip                                                                                | 7     |

### FP Sync Tests

| Test File                         | Focus                                                                                                                 | Cases |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----- |
| `fp-core-operators.spec.ts`       | `ok`/`err` constructors, `map`, `mapErr`, `bind`, `orElse`, `match`, `tap`, `tapErr`, `unwrapOr` (curried + direct)   | 44    |
| `fp-composition-adapters.spec.ts` | `composeK`, `pipe`, `switchFn`, `liftMap`, `tee`, `toOption`, `fromOption`, FP `combine`/`all`/`combineWithAllErrors` | 28    |

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

### ADR-7: Discriminated Union Interfaces (true-myth Omit Pattern)

**Decision:** Refactor `IResult` and `IResultOfT` from flat interfaces to
**discriminated unions** using the Omit pattern (inspired by true-myth).

**Design:**
- `IResult<TError>` = `IResultSuccess | IResultFailure<TError>`
- `IResultOfT<TValue, TError>` = `IResultOfTSuccess | IResultOfTFailure`
- `isSuccess: true` / `isSuccess: false` literal discriminant (not `_tag`)
- Success variant **omits** `error`; failure variant **omits** `value`
- Internal flat bases (`IResultBase`, `IResultOfTBase`) exist solely for the
  class to `implements` — a class cannot implement a union type
- Instance methods are preserved on both variants via `Omit<IResultOfTBase, ...>`
  inheritance, so `result.map(...)` works on the union without narrowing

**Rationale:**
- **Type safety:** Accessing `.value` on a failure or `.error` on a success is
  now a **compile-time error**, not just a runtime convention. This catches
  bugs at the type level before they reach production.
- **Ergonomics:** TypeScript narrowing via `if (result.isSuccess)` automatically
  exposes `.value` or `.error` — no casts needed in consumer code.
- **Method availability:** The Omit pattern ensures fluent methods remain
  available on the union type, so `Result.Success(42).map(x => x * 2)` still
  compiles without narrowing.
- **Runtime compatibility:** The runtime behavior is unchanged — `error` still
  returns the sentinel on success, `value` still throws on failure. The union
  is purely a type-level improvement.

**Trade-offs:**
- Factory methods must cast through `unknown` (`as unknown as IResultOfT<T, E>`)
  because the class implements the flat base, not the union
- Cross-type failure returns (e.g., returning an `InfraResult` failure as a
  `DomainResult`) require `as unknown as` casts
- Internal flat bases add a small amount of conceptual complexity, but they are
  `@internal` and not exported from the public barrel
