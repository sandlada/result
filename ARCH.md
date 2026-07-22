# ARCH.md — `@sandlada/result` Architecture

> **Authoritative record of the project's architecture.** This document must be updated whenever source code, interfaces, or module structure change.

---

## Overview

`@sandlada/result` is a TypeScript library providing the **Result pattern** — a functional error-handling primitive that makes error flows explicit and type-safe, replacing throw/catch for predictable failure paths.

**Key differentiator:** Generic `TError` parameter (vs C# reference's hardcoded `DomainError`). Users pass their own error types.

## Package Metadata

| Field      | Value                        |
| ---------- | ---------------------------- |
| Name       | `@sandlada/result`           |
| Type       | `module` (ESM)               |
| License    | MIT                          |
| Repository | `github.com/sandlada/result` |

### Tech Stack

| Concern         | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| Language        | TypeScript (strict mode)                                     |
| Build tool      | `tsgo` (TypeScript Native, via `@typescript/native-preview`) |
| Module system   | `nodenext` (ESM, `.js` extensions in relative imports)       |
| Module syntax   | `verbatimModuleSyntax` — `import type` for type-only imports |
| Test runner     | Vitest v4                                                    |
| Stricter checks | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`     |

## Scripts

| Command               | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `npm run build`       | Compile TypeScript via `tsgo`                             |
| `npm test`            | Run Vitest v4 test suite (single-run, CI mode)            |
| `npm run test:watch`  | Run Vitest in interactive watch mode                      |
| `npm run bench`       | Run benchmarks via Vitest bench (interactive)             |
| `npm run bench:json`  | Run benchmarks and serialize results to `bench/results.json` |
| `npm run bench:ui`    | Run benchmarks with the `@vitest/ui` inspector            |

## Package Exports

| Entry point                     | Description                                      |
| ------------------------------- | ------------------------------------------------ |
| `@sandlada/result`              | Core types, factories, sync/async operators      |
| `@sandlada/result/async`        | Async operators (Promise<IResultOfT>)            |
| `@sandlada/result/async-result` | AsyncResult lazy thunks                          |
| `@sandlada/result/async-option` | AsyncOption lazy thunks                          |
| `@sandlada/result/adapters`     | Wlaschin three-shape adapters                    |
| `@sandlada/result/combine`      | Parallel combination (short-circuit, all-errors) |
| `@sandlada/result/composition`  | Kleisli composition, pipe, safeTry               |
| `@sandlada/result/factories`    | Core constructors (ok, err, fromThrowable, etc.) |
| `@sandlada/result/operators`    | Sync operators (map, bind, match, unwrap, etc.)  |
| `@sandlada/result/option`       | Option module (Some/None)                        |
| `@sandlada/result/types`        | Type definitions only                            |

## Source Layout

```
src/
  index.ts              — Public barrel
  types/                — IResult, IResultOfT, IOption, AsyncResult, AsyncOption interfaces (5 files)
  factories/            — ok, err, fromPredicate, tryCatch, fromPromise, etc. (10 files)
  operators/            — map, bind, match, unwrap, orThrow, separate, etc. (32 files)
  async/                — mapAsync, asyncBind, matchAsync, etc. (35 files, Promise-based)
  async-result/         — AsyncResult lazy thunk operators (26 files)
  async-option/         — AsyncOption lazy thunk operators (15 files)
  composition/          — pipe, composeK, safeTry, pipeAsync, composeKAsync (5 files)
  adapters/             — switchFn, liftMap, tee, toOption, fromOption (7 files)
  combine/              — combine, all, combineWithAllErrors (3 files)
  option/               — ofSome, ofNone, map, bind, match, etc. (16 files)
  tests/                — Cross-module integration, behaviors, hardening, type-level tests
    behaviors/          — custom-error-types, default-error-type, toJSON, value (4 files)
    hardening/          — AsyncOptionEager, AsyncResultHardening, ResultAsyncHardening (3 files)
    integration/        — api-consistency, AsyncOption, ComplexIntegration, ConsumptionPatterns, IntegrationPattern, Interop (6 files)
    type-tests/         — Result.type-tests (1 file)
```

**Unit-level tests** live alongside their subjects as `<name>.spec.ts` next to every
`src/<dir>/*.ts` source file (the co-located style). **Cross-module** tests under
`src/tests/{behaviors,hardening,integration,type-tests}/` cover scenarios that
cross module boundaries or harden against sentinel incidents recorded in
`.jules/sentinel.md`.

`tsconfig.json` excludes `*.spec.ts` from build output and `vitest.config.ts` uses
the same glob in `test.include`, so the two layers stay in sync without a separate
`test/` directory.

## Discriminated Union Types

All result and option values are **plain objects** with a discriminant property:

```
── IResult (void result) ──

IResultSuccess                           (isSuccess: true, isFailure: false — no error)
IResultFailure<TError>                   (isSuccess: false, isFailure: true, error: TError)
IResult<TError = Error>                  = IResultSuccess | IResultFailure<TError>

── IResultOfT (value-bearing) ──

IResultOfTSuccess<TValue>                (isSuccess: true, isFailure: false, value: TValue)
IResultOfTFailure<TError>                (isSuccess: false, isFailure: true, error: TError)
IResultOfT<TValue, TError = Error>       = IResultOfTSuccess | IResultOfTFailure

── IOption ──

IOptionSome<T>                           (isSome: true, isNone: false, value: T)
IOptionNone                              (isSome: false, isNone: true)
IOption<T>                               = IOptionSome<T> | IOptionNone

── AsyncOption ──

AsyncOption<T>                           (run: () => Promise<IOption<T>>)
```

**Narrowing:** Access `value` or `error` only after narrowing via `isSuccess`:

```ts
if (result.isSuccess) {
    doSomething(result.value);  // ✓ safe
} else {
    handleError(result.error);  // ✓ safe
}
```

## Module Architecture

| Module          | Responsibility                                                   |
| --------------- | ---------------------------------------------------------------- |
| `types/`        | Discriminated union type definitions (interfaces + type aliases) |
| `factories/`    | Standalone functions that produce Result/Option objects          |
| `operators/`    | Data-last curried sync operators on `IResultOfT`                 |
| `async/`        | Data-last curried async operators on `Promise<IResultOfT>`       |
| `async-result/` | **Lazy** AsyncResult thunks — defers execution until awaited     |
| `async-option/` | **Lazy** AsyncOption thunks — defers execution until awaited     |
| `composition/`  | Pipeline helpers: `pipe`, `composeK`, `safeTry`                  |
| `adapters/`     | Convert between Wlaschin's three function shapes                 |
| `combine/`      | Parallel result combination (short-circuit, accumulate errors)   |
| `option/`       | Option type operators (Some/None)                                |

**Key patterns:**
1. **Data-last currying** — Every operator accepts the data (Result/Option/Promise) as the final argument, enabling partial application and `pipe` composition.
2. **Plain objects** — No classes, no prototype methods, no sentinel values. Results are pure discriminated union objects with a string discriminant property.
3. **Factory purity** — Factories produce the narrowest possible type (`IResultOfT<T, never>` for `ok`, `IResultOfT<never, E>` for `err`).
4. **Two async approaches** — `async/` operators work with `Promise<IResultOfT>` (eager, standard promises); `async-result/` uses **lazy thunks** that defer execution.
5. **No barrel cycles** — Each module imports dependencies from specific source files, not barrel indexes, avoiding circular dependencies.
6. **Option is standalone** — Option module has no dependency on Result types. Conversion between Result and Option happens in `adapters/`.

## Coding Conventions

1. **`interface` for contracts** — Interfaces define the shape of result/option objects. No classes.
2. **`readonly` properties only** — Result objects are immutable value objects.
3. **`import type { ... }`** for all type-only imports (enforced by `verbatimModuleSyntax`).
4. **No barrel / index re-export cycles.** Each module imports dependencies from the specific source file.
5. **camelCase** for properties (`isSuccess`, `isFailure`, `error`, `value`, `isSome`, `isNone`).

## Testing Architecture

Tests live in two distinct layers:

**Layer 1 — Co-located unit tests.** Every public source file in `src/` has a
matching `<name>.spec.ts` directly beside it. There are 14 module directories
with one `.spec.ts` per source file:

| Directory              | spec count |
| ---------------------- | ----------: |
| `src/factories/`       |         10 |
| `src/adapters/`        |          7 |
| `src/combine/`         |          3 |
| `src/composition/`     |          5 |
| `src/operators/`       |         32 |
| `src/option/`          |         16 |
| `src/async/`           |         35 |
| `src/async-result/`    |         26 |
| `src/async-option/`    |         15 |
| `src/types/`           |          5 |

**Layer 2 — Cross-module tests** under `src/tests/`:

- `behaviors/` (4): `Result.custom-error-types`, `Result.default-error-type`, `Result.toJSON`, `Result.value`
- `hardening/` (3): `AsyncOptionEager`, `AsyncResultHardening`, `ResultAsyncHardening` — defend against the two incidents catalogued in `.jules/sentinel.md` (the `safeTry` generator cleanup and the `in`-operator `TypeError` on non-objects in async interop)
- `integration/` (6): `api-consistency`, `AsyncOption`, `ComplexIntegration`, `ConsumptionPatterns`, `IntegrationPattern`, `Interop`
- `type-tests/` (1): `Result.type-tests` — compile-time narrowing validation

There is **no top-level `test/` directory**. The co-located style is enforced by
both `tsconfig.json` (excludes `*.spec.ts` from build output) and
`vitest.config.ts` (`test.include: ['src/**/*.spec.ts']`).

Design principles:
1. **Success path + failure path** — Every operator tests both branches
2. **Curried + direct** — Tests verify both invocation forms
3. **Edge cases** — `never` type propagation, empty arrays, nested results, lazy await (`unwrapOrAsyncOption` against `setTimeout`)
4. **Type tests** — `Result.type-tests.spec.ts` verifies compile-time behavior
5. **Hardening tests** — sentinel incidents are encoded as long-lived regression
   tests under `src/tests/hardening/`

## Architectural Decisions

### ADR 1: Pure Discriminated Unions over Classes

**Decision:** Results are plain objects with a discriminant property, not class instances.

**Rationale:** Classes introduce prototype chain overhead, make structural typing harder, and imply behavior rather than data. Plain objects serialize trivially, match TypeScript's structural type system, and allow `isSuccess` property narrowing without `instanceof`.

### ADR 2: Generic TError over Hardcoded Error Type

**Decision:** The error type is a generic parameter, not a fixed `DomainError`.

**Rationale:** Users of the C# library must convert between error types. The generic approach lets each function define its own error contract via the type system, with `Error` as a sensible default.

### ADR 3: Standalone Functions over Instance Methods

**Decision:** All operators are standalone curried functions, not methods on a Result object.

**Rationale:** Instance methods would require classes (see ADR 1), prevent tree-shaking, and make data-last currying awkward. Standalone functions compose naturally with `pipe` and support dead-code elimination.

### ADR 4: ESM-Only with .js Extensions

**Decision:** Package uses ES modules exclusively with explicit `.js` extensions in relative imports.

**Rationale:** Required by `nodenext` module resolution. Ensures compatibility with native ESM runtimes and bundlers. Dropping CJS support simplifies the build pipeline and aligns with the TypeScript ecosystem direction.

### ADR 5: Independent Option Module

**Decision:** Option is a standalone module with no Result dependency; conversion happens in adapters.

**Rationale:** Option is conceptually independent of Result. Keeping them separate avoids circular dependencies, allows tree-shaking when only Option is used, and follows the principle of minimal dependencies between modules.

### ADR 6: Two Async Approaches (Eager + Lazy)

**Decision:** Two separate async systems: `async/` for eager `Promise<IResultOfT>` or `Promise<IOption<T>>` and `async-result/` / `async-option/` for lazy thunks.

**Rationale:** Promise-based approaches (eager) are familiar and compose well with existing async code. Lazy thunks enable deferred execution, which is useful for conditional evaluation and resource management. Separating them avoids conflating two different execution models.

## Development Workflow

1. **ARCH.md holds the current architecture design.** Update whenever source code, interfaces, or module structure change.

2. **SPEC.md teaches consumers.** Update when adding new exports or changing public API behavior.

3. **AGENTS.md guides AI agents.** Update when project conventions or workflow change.
