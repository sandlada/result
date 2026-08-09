# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a type-safe, exception-free approach to error handling built on plain discriminated unions. Unlike C#-style Results, the error type is generic (`TError`) so callers bring their own error shapes. Zero runtime dependencies, ESM-only, published under MIT.

## Common commands

```bash
npm run build         # tsc -> declarations, rolldown -> minified ESM (clears build/ first)
npm run build:types   # emit .d.ts only (uses tsconfig.build.json)
npm run build:js      # emit minified ESM + sourcemaps via rolldown.config.ts
npm run typecheck     # tsc --noEmit against the full project
npm test              # vitest run (single pass, CI mode)
npm run test:watch    # vitest watch
npm run test:type     # vitest typecheck — runs *.type-spec.ts against tsconfig.typecheck.json
npm run bench         # vitest bench (src/**/*.bench.ts)
npm run bench:json    # bench -> bench/results.json
```

To run a single test file:

```bash
npx vitest run src/operators/map.spec.ts
```

To run a single named test:

```bash
npx vitest run -t "matches the success variant"
```

Vitest is configured in `vitest.config.ts`. Coverage thresholds are enforced per-glob and the **observability** module has a strict 100% gate; the **reliability** module's `branches` threshold is 84 because of a documented genuinely-unreachable timer-race guard (`src/reliability/timeout.ts:51`).

## Architecture (the big picture)

Read `ARCH.md` for the full decision log and `SPEC.md` for the public API index. The mental model in one paragraph:

- **Results are plain objects, not classes.** The contract is a discriminated union (`isSuccess` / `isFailure`) over `IResultSuccess` and `IResultFailure<TError>`. Value-bearing Results use `IResultOfT<TValue, TError>`. Same shape for Options (`isSome` / `isNone`).
- **Operators are standalone, data-last, curried.** No methods on result objects. This is what makes `pipe(...)` work.
- **The package layout mirrors the type space.** Because `map` means different things on `IResultOfT` vs `IOption`, every concern lives at its own subpath: `/factories`, `/operators`, `/option`, `/composition`, `/adapters`, `/combine`, `/promise-result`, `/promise-option`, `/async-result`, `/async-option`, `/reliability`, `/observability`, `/primitives`.
- **The main barrel is type-only** (`src/index.ts`). It re-exports `IResult`, `IResultOfT`, `IOption`, `AsyncResult`, `AsyncOption` and a runtime `moduleMarker = {}` whose sole purpose is to keep Rolldown materializing the entry's sourcemap. Functional runtime values are reached exclusively via subpaths — this is the rationale for ADR 9/10 in `ARCH.md`.
- **Two async flavors.** `promise-result/` / `promise-option/` operate on eager `Promise<IResultOfT>`; `async-result/` / `async-option/` operate on lazy `AsyncResult<T,E>` thunks (`() => Promise<IResultOfT>`). Don't conflate them — see ADR 8.
- **Three layered concerns sit on top of the core ROP operators:** `reliability/` (retry/timeout/race), `observability/` (breadcrumb `ctx`/`withPath`, formatters, observer hooks), `primitives/` (high-frequency helpers like `cond`/`reduce`/`lift`). Each reuses `IResultOfT`/`AsyncResult` and has its own subpath.

The `IResult` type lives at `src/types/IResult.ts`; per-module `index.ts` files are pure re-export barrels — there are no cyclic re-exports between modules (convention).

## Conventions that the compiler enforces

These are not "guidelines" — they are checked. Do not propose changes that violate them.

- `verbatimModuleSyntax: true` — every type-only import must be `import type { ... }`. No exceptions.
- `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true` — array/record access returns `T | undefined`; optional properties cannot be set to `undefined` unless the type says so.
- ESM-only, `.js` extensions in relative imports (`from '../types/IResultOfT.js'`).
- `readonly` properties only on result/option interfaces.
- No barrel re-export cycles — each module imports its dependencies from the specific source file, not from a sibling `index.ts`.
- 4-space indentation, single quotes, LF line endings (see `.editorconfig`); `max_line_length = 240` for `.ts`/`.js`.
- Indent_style applies globally — do not mix tabs/spaces.

## Comment policy

Code comments describe **the code next to them**, not the project. Anything a reader needs to understand intent must be self-contained in the file, or live in `ARCH.md` / `SPEC.md`.

- **No cross-document pointers in code comments.** Do not link to or quote from narrative documents like `README.md` or `bugs.md` inside `.ts` / `.spec.ts` comments. Linking to a core API source file (e.g. `src/types/IResult.ts`) is fine — that is code, not a document. If you want to write "see bugs.md #44" or "tracked in README", you have instead forgotten to encode the constraint in code or tests; do that, and delete the pointer.
- **No external-file bug IDs in code comments.** Identifiers like `BUG001`, `bugs.md-BUG001`, "Bug 1 contract", "Issue 7 fix", "Task L5", or any other token only meaningful if a specific external `.md` is open are forbidden in `.ts` / `.spec.ts` comments. The contract under test belongs in the test's `expect(...)` and the operator's type signature — not in a comment referencing an external numbering scheme.
- **No padding line separators.** Do not write `// ----------`, `// -----------`, `// ====`, `// ************`, `// ---- Bug 1 contract ----`, or any other decoration-only line. The `describe` / `it` block's title is the section header; if you need a break inside a test, use a nested `describe`.

## Testing

- **Co-located unit tests**: every `src/<dir>/<name>.ts` has a `src/<dir>/<name>.spec.ts` next to it. `*.spec.ts` is excluded from both `tsconfig.json` (build) and `rolldown.config.ts` (rolldown input walker).
- **Type tests**: `*.type-spec.ts` are picked up only by `npm run test:type` (Vitest's `typecheck` mode + `tsconfig.typecheck.json`).
- **Benchmarks**: `*.bench.ts` — collected by `vitest bench` per `vitest.config.ts`'s `bench.include`.
- **Cross-module tests** live in `src/tests/` split into `behaviors/`, `hardening/`, `integration/`, `type-tests/`. `hardening/` guards against incidents catalogued in `bugs.md` (read it before changing anything around the patterns it lists).
- Coverage thresholds live in `vitest.config.ts` — adding code that drops a module below its gate fails CI.

## Adding or changing public API

The three documentation files have **distinct responsibilities** (don't collapse them):

| File | Update when |
| --- | --- |
| `ARCH.md` | source layout, module responsibilities, ADRs change |
| `SPEC.md` | exports are added/removed or public API behavior changes |
| `AGENTS.md` | conventions, workflow, source-layout descriptions change |

If you add a new export, you are also expected to: add a co-located `*.spec.ts` and `*.type-spec.ts` where applicable, update the `package.json` `exports` map if a new subpath is needed, and ensure `vitest.config.ts` coverage globs still cover the new files.

## Things to know that are easy to miss

- `build/` is the only published artifact (`package.json` `"files"`). Source TypeScript is not shipped.
- Rolldown config (`rolldown.config.ts`) walks `src/` and excludes `*.spec.ts`, `*.type-spec.ts`, `*.d.ts` from its input list.
- `npm run typecheck` includes `*.spec.ts` but excludes them from output; `npm run build` does the opposite.
- `bugs.md` is large (~87 KB) and is the working log of bugs/incidents — search it before making changes around any operator you haven't touched before.