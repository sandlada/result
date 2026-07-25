# ARCH.md — `@sandlada/result` Architecture

> Authoritative record of the project's architecture. Update whenever source code, interfaces, or module structure change.
> For the public API list, see [SPEC.md](./SPEC.md).

## Overview

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a functional error-handling primitive that makes error flows explicit and type-safe, replacing `throw`/`catch` for predictable failure paths.

**Key differentiator:** generic `TError` parameter (the C# reference hardcodes `DomainError`). Users pass their own error types.

## Tech Stack

| Concern | Value |
| --- | --- |
| Language | TypeScript (strict mode) |
| Build tools | TypeScript 7 (`.d.ts`) + Rolldown 1.2 (`.js`) |
| Module system | ESM, `.js` extensions in relative imports |
| Module syntax | `verbatimModuleSyntax` — `import type` for type-only imports |
| Test runner | Vitest v4 |
| Stricter checks | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run clean` | Remove `build/` |
| `npm run build` | Build declarations with TypeScript, JavaScript with Rolldown, then verify artifacts |
| `npm run build:types` | Emit `.d.ts` and `.d.ts.map` only |
| `npm run build:js` | Emit minified ESM and sourcemaps with Rolldown |
| `npm run typecheck` | Type-check without emitting |
| `npm run verify:build` | Validate exports, comments, sourcemaps, and runtime loading |
| `npm test` | Run Vitest v4 (single run, CI mode) |
| `npm run test:watch` | Vitest interactive watch |
| `npm run bench` | Vitest bench (interactive) |
| `npm run bench:json` | Vitest bench → `bench/results.json` |
| `npm run bench:ui` | Vitest bench with `@vitest/ui` |

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

### ADR 8: Async Subpath Naming (`async-result`, `async-option`, `promise-result`, `promise-option`)

**Decision:** Keep the current `async-*` / `promise-*` subpath names. Do **not** rename to `lazy-*` / `eager-*`.

**Context considered:**

- `async-result` operates on `AsyncResult<T,E>` — a lazy thunk wrapping `() => Promise<IResultOfT>`. The `async` prefix denotes the type name, not the `async/await` keyword.
- `async-option` is parallel to `async-result`.
- `promise-result` operates on `Promise<IResultOfT>` — an eager Promise already in flight.
- `promise-option` is the parallel Option-flavored package (recently extracted from `promise-result/`).

**Why not `lazy-*` / `eager-*`?**

1. **Type names don't change.** `AsyncResult<T,E>` and `AsyncOption<T>` are well-established identifiers in the codebase; renaming the types would be a much larger breaking change than renaming the subpath.
2. **Symmetry with `async/await` is intentional.** `async-result` reads naturally as "Result for async contexts" — even though the mechanism (lazy thunk) is more specific. `promise-result` reads as "Result on Promise". Both names are immediately searchable and self-documenting.
3. **Avoids type/subpath divergence.** Renaming only the subpath would create confusion: type `AsyncResult` ≠ subpath `lazy-result`.
4. **Migration cost.** Every existing user import would need updating. The current names already shipped to npm; renaming is a major-version bump with limited upside.

**Documentation responsibilities:** All `async-*` and `promise-*` modules must clearly distinguish "lazy thunk" vs "eager Promise" in their README and JSDoc, since the `async` prefix is ambiguous on its own.

### ADR 9: Main Barrel Aliasing for Async Variants — Rejected

**Decision:** Main barrel `@sandlada/result` does **not** re-export `async-result` / `async-option` / `promise-result` / `promise-option` operators under aliased names (`promiseResultMap`, `asyncOptionBind`, etc.). Subpath imports are the only way to reach these operators.

**Context considered:** Earlier, `src/index.ts` re-exported every async-result operator under a `promiseResult*` alias and every async-option operator under an `asyncOption*` alias to surface them at the top-level barrel without name collisions.

**Why rejected?**

1. **TS symbol table bloat.** Each alias adds an entry to the barrel's exported-symbol list, increasing IDE autocomplete latency and TypeScript resolution work — particularly because each `map` / `bind` / `tap` exists 2–4 times under different names and TS must do duplicate-name detection.
2. **Awkward public names.** `promiseResultMap` / `asyncOptionBind` are not mnemonic — they expose the package layout instead of describing the operation. Users have no reason to see these.
3. **Two-step type navigation.** Hovering or jumping on an aliased export lands on `index.d.ts`'s alias line first, then requires a second jump to the real definition.
4. **Tree-shaking obstruction.** Every alias pulls in the *entire* aliased module's type graph even when the consumer only wants the synchronous layer.
5. **Subpath imports are equally cheap.** `package.json` `exports` is O(1) and cached; `import { map } from '@sandlada/result/async-result'` resolves with no measurable overhead vs. `import { promiseResultMap } from '@sandlada/result'`.

**Result:** Users needing async variants import explicitly:

```ts
import { map, bind } from '@sandlada/result/operators';           // sync
import { map as mapAsync } from '@sandlada/result/promise-result'; // eager async
import { from, bind } from '@sandlada/result/async-result';     // lazy async
```

Or compose via `pipe` / `pipeAsync` so the import style stays neutral.

### ADR 10: Main Barrel — Type-Focused with Runtime Marker

**Decision:** The main barrel `@sandlada/result` (`src/index.ts` and its build output) exports the type contracts — `IResult`, `IResultOfT`, `IOption`, `AsyncResult`, `AsyncOption` — plus a single runtime `moduleMarker` empty object used to materialize the entry and its sourcemap. Functional runtime values (factories, operators, composition helpers, etc.) are reachable **only** via dedicated subpath imports.

**Context considered:** ADR 9 stopped short of removing re-exports for sync operators and helpers. The result was a ~50-name top-level barrel. Users still hit subtle collisions (`map` for Result vs Option, `pipe` vs `pipeAsync`, etc.) and IDE autocomplete lists remained cluttered.

**Why go further?**

1. **Resolve name collisions at the import site, not the barrel.** `map` means different things on `IResultOfT` and `IOption`. The compiler can't disambiguate; the package layout can. Subpath imports (`@sandlada/result/operators/map` vs `@sandlada/result/option/map`) make the type explicit at the call site.
2. **Tree-shaking becomes total.** With no runtime re-exports in the main barrel, the only way to drag a function into a bundle is to explicitly import it. There is no incidental inclusion.
3. **TypeScript symbol table collapses to ~6 entries.** IDE autocomplete, `go-to-definition`, and project-wide symbol search operate on the barrel's export list. Smaller list = faster.
4. **No functional "main barrel" knowledge to maintain.** `package.json` `exports` continues to point at the file for backward compatibility. It contains type re-exports plus `moduleMarker`, whose only purpose is to materialize the runtime entry and sourcemap under Rolldown.

**Trade-offs accepted:**

- Users who currently do `import { ok, map, pipe } from '@sandlada/result'` need to import from subpaths. This is the breaking change. Documented in `README.md` and `SPEC.md`.
- Some ergonomic short-hands are gone (e.g. `import { ok, err } from '@sandlada/result'`). The two-import replacement (`from '@sandlada/result/factories'`) is short enough to be a non-issue.

**Result:** The barrel is now:

```ts
// src/index.ts — and its .d.ts counterpart
export type { IResult, IResultSuccess, IResultFailure } from './types/IResult.js';
export type { IResultOfT, IResultOfTSuccess, IResultOfTFailure } from './types/IResultOfT.js';
export type { IOption, IOptionSome, IOptionNone } from './types/Option.js';
export type { AsyncResult } from './types/AsyncResult.js';
export type { AsyncOption } from './types/AsyncOption.js';
export const moduleMarker = {};
```

The runtime counterpart exports only `moduleMarker`; functional runtime values remain available exclusively through subpaths.

**Migration path:**

```ts
// Before
import { ok, map, bind, pipe } from '@sandlada/result';

// After
import { ok } from '@sandlada/result/factories';
import { map, bind } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';
```

## Document Responsibilities

| Document | Role |
| -------- | ---- |
| [ARCH.md](./ARCH.md) | Architecture record — update when source layout, module responsibilities, or decisions change. |
| [SPEC.md](./SPEC.md) | API index — update when exports or public API behavior change. |
| [AGENTS.md](./AGENTS.md) | AI agent conventions and project metadata. |
