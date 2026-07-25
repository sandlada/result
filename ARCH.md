# ARCH.md — `@sandlada/result` Architecture

> Authoritative record of the project's architecture. Update whenever source code, interfaces, or module structure change.
> For the public API list, see [SPEC.md](./SPEC.md).

## Overview

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a functional error-handling primitive that makes error flows explicit and type-safe, replacing `throw`/`catch` for predictable failure paths.

**Key differentiator:** generic `TError` parameter (the C# reference hardcodes `DomainError`). Users pass their own error types.

## Tech Stack

| Concern         | Value |
| --------------- | ----- |
| Language        | TypeScript (strict mode) |
| Build tool      | `tsc` (TypeScript 7) |
| Module system   | ESM, `.js` extensions in relative imports |
| Module syntax   | `verbatimModuleSyntax` — `import type` for type-only imports |
| Test runner     | Vitest v4 |
| Stricter checks | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |

## Scripts

| Command              | Purpose |
| -------------------- | ------- |
| `npm run build`      | Compile via `tsc` |
| `npm test`           | Run Vitest v4 (single run, CI mode) |
| `npm run test:watch` | Vitest interactive watch |
| `npm run bench`      | Vitest bench (interactive) |
| `npm run bench:json` | Vitest bench → `bench/results.json` |
| `npm run bench:ui`   | Vitest bench with `@vitest/ui` |

## Source Layout

```
src/
  index.ts              — Public barrel
  types/                — IResult, IResultOfT, IOption, AsyncResult, AsyncOption
  factories/            — ok, err, fromPredicate, tryCatch, fromPromise, …
  operators/            — map, bind, match, unwrap, orThrow, separate, …
  promise-result/       — mapAsync, bindAsync, matchAsync, … (Promise-based)
  async-result/         — AsyncResult lazy thunk operators
  async-option/         — AsyncOption lazy thunk operators
  composition/          — pipe, composeK, safeTry, pipeAsync, composeKAsync
  adapters/             — switchFn, liftMap, tee, toOption, fromOption
  combine/              — combine, all, combineWithAllErrors
  option/               — ofSome, ofNone, map, bind, match, okOr, transpose, …
  reliability/          — retry, timeout, race, any, allSettled
  observability/        — ctx, withPath, format, inspect, observe, installObserver
  primitives/           — cond, condErr, sequence, reduce, partitionOption, lift
  tests/                — Cross-module integration, behaviors, hardening, type tests
```

## Module Responsibilities

| Module            | Responsibility |
| ----------------- | -------------- |
| `types/`          | Discriminated union type definitions |
| `factories/`      | Standalone functions producing Result/Option objects |
| `operators/`      | Data-last curried sync operators on `IResultOfT` |
| `promise-result/` | Data-last curried operators on `Promise<IResultOfT>` (eager) |
| `async-result/`   | Lazy AsyncResult thunks — defer execution until `.run()` |
| `async-option/`   | Lazy AsyncOption thunks |
| `composition/`    | `pipe`, `composeK`, `safeTry`, `pipeAsync`, `composeKAsync` |
| `adapters/`       | Convert between Wlaschin's three function shapes |
| `combine/`        | Parallel result combination (short-circuit, accumulate errors) |
| `option/`         | `IOption<T>` operators — independent of Result |
| `reliability/`    | Retry / timeout / concurrency primitives |
| `observability/`  | Breadcrumb stack + formatters + observer hooks |
| `primitives/`     | High-frequency helpers (`cond`, `reduce`, `lift`, `partitionOption`, …) |

See [SPEC.md](./SPEC.md) for the API list exported by each module.

## Coding Conventions

1. **`interface` for contracts** — shape of result/option objects, no classes.
2. **`readonly` properties only** — results are immutable value objects.
3. **`import type { ... }`** for all type-only imports (enforced by `verbatimModuleSyntax`).
4. **No barrel / index re-export cycles.** Each module imports dependencies from the specific source file.
5. **camelCase** for properties (`isSuccess`, `isFailure`, `error`, `value`, `isSome`, `isNone`).

## Testing Architecture

**Two layers:**

1. **Co-located unit tests** — every `src/<dir>/*.ts` has a matching `<name>.spec.ts` beside it. `tsconfig.json` excludes `*.spec.ts` from output and `vitest.config.ts` includes them, so the two layers stay in sync without a separate `test/` directory.
2. **Cross-module tests** under `src/tests/`:
   - `behaviors/` — custom error types, default error type, `toJSON`, value semantics.
   - `hardening/` — regression guards against the incidents catalogued in `.jules/sentinel.md`.
   - `integration/` — scenarios that cross module boundaries.
   - `type-tests/` — compile-time narrowing validation.

Design principles: success + failure paths tested, both curried and direct invocation forms, edge cases (empty arrays, lazy await, nested results), and `never` type propagation.

## Architectural Decisions

### ADR 1: Pure Discriminated Unions over Classes

Results are plain objects with a discriminant property, not class instances. Plain objects serialize trivially, match TypeScript's structural type system, and allow `isSuccess` property narrowing without `instanceof`.

### ADR 2: Generic TError over Hardcoded Error Type

The error type is a generic parameter, not a fixed `DomainError`. Users define their own error contract; `Error` is the sensible default.

### ADR 3: Standalone Functions over Instance Methods

All operators are standalone curried functions, not methods on a Result object. Standalone functions compose naturally with `pipe` and support dead-code elimination.

### ADR 4: ESM-Only with `.js` Extensions

Required for native Node.js ESM (`"type": "module"`). Dropping CJS simplifies the build pipeline and aligns with the TypeScript ecosystem direction.

### ADR 5: Independent Option Module

Option is a standalone module with no Result dependency; conversion happens in `adapters/`. Avoids circular dependencies and allows tree-shaking when only Option is used.

### ADR 6: Two Async Approaches (Eager + Lazy)

`promise-result/` works with eager `Promise<...>`; `async-result/` / `async-option/` use lazy thunks. Separating them avoids conflating two execution models.

### ADR 7: Three Layered Concerns (Reliability / Observability / Primitives)

Beyond the core ROP operators, three additional concern-specific modules exist:

- `reliability/` — production retry/timeout/concurrency (`retry`, `timeout`, `race`, `any`, `allSettled`).
- `observability/` — breadcrumb path stack + formatters + observer hooks.
- `primitives/` — high-frequency helpers (`cond`, `reduce`, `lift`, `partitionOption`).

Each module reuses the existing `IResultOfT` and `AsyncResult` types without inventing new abstractions, so consumers can pick a module without learning a separate mental model. All three are tree-shakeable via dedicated export paths in `package.json`.

## Document Responsibilities

| Document | Role |
| -------- | ---- |
| [ARCH.md](./ARCH.md) | Architecture record — update when source layout, module responsibilities, or decisions change. |
| [SPEC.md](./SPEC.md) | API index — update when exports or public API behavior change. |
| [AGENTS.md](./AGENTS.md) | AI agent conventions and project metadata. |
