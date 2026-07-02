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
| Version     | `0.0.1-20260701.b`                                                                   |
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

build/
  index.js            — Compiled output (mirrors src/)
  index.d.ts          — Type declarations
  ...

test/
  ComplexIntegration.spec.ts       — Multi-layer, railway, aggregation, async patterns
  ConsumptionPatterns.spec.ts      — Real-world branching, early return, type narrowing
  IntegrationPattern.spec.ts       — Type alias & convenience factory
  Result.custom-error-types.spec.ts — Discriminated unions, classes, plain objects
  Result.default-error-type.spec.ts — Default Error behavior
  Result.factories.spec.ts         — All 4 factory overloads
  Result.invariant.spec.ts         — Mutual exclusivity, constructor throws, immutability
  Result.sentinel.spec.ts          — Error always accessible, sentinel pattern
  Result.type-tests.spec.ts        — Compile-time type assertions
  Result.value.spec.ts             — Value access on success/failure, narrowing
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
const NONE: unique symbol = Symbol.for('result:none');
```

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

### `src/ResultOfT.ts` — Re-export Barrel

Pure re-export for discoverability at the expected module path:

```ts
export { ResultOfT } from './Result.js';
```

### `src/index.ts` — Public Barrel

```ts
export type { IResult } from './IResult.js';
export type { IResultOfT } from './IResultOfT.js';
export { Result } from './Result.js';
export { ResultOfT } from './ResultOfT.js';
```

- Uses `export type` for interfaces (required by `verbatimModuleSyntax`)
- Classes exported as values (they also act as types)

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

**10 test files** with ~144 test cases, all using Vitest.

| Test File                           | Focus                                                         | Cases |
| ----------------------------------- | ------------------------------------------------------------- | ----- |
| `Result.factories.spec.ts`          | All 4 factory overloads, type inference, edge cases           | 16    |
| `Result.invariant.spec.ts`          | Mutual exclusivity, constructor throws, immutability          | 9     |
| `Result.sentinel.spec.ts`           | Error always accessible, sentinel vs real error               | 8     |
| `Result.value.spec.ts`              | Value access on success/failure, type narrowing, void success | 11    |
| `Result.default-error-type.spec.ts` | Default `TError = Error` behavior                             | 7     |
| `Result.custom-error-types.spec.ts` | Discriminated unions, classes, plain objects                  | 11    |
| `Result.type-tests.spec.ts`         | Compile-time type assertions (`expectTypeOf`)                 | 16    |
| `ConsumptionPatterns.spec.ts`       | Real-world branching, early return, type narrowing            | 12    |
| `IntegrationPattern.spec.ts`        | Type alias, convenience factory, `mapError()`, `never`        | 14    |
| `ComplexIntegration.spec.ts`        | Multi-layer services, railway pipeline, aggregation, async    | 40    |

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
