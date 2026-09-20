# AGENTS.md

## Project Identity

`@sandlada/result` is a TypeScript library providing the **Result pattern** — a functional error-handling primitive that makes error flows explicit and type-safe, replacing throw/catch for predictable failure paths.

The library exposes:

- **`IResult<TError>`** — base contract: success/failure discriminated union
- **`IResultOfT<TValue, TError>`** — contract carrying a success value
- **`ok(value?)`** / **`err(error)`** — plain factory functions (no classes)
- **`IOption<T>`** — optional value (Some/None discriminated union)

## Tech Stack & Constraints

| Concern         | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Language        | TypeScript (strict mode)                                                |
| Build tools     | Rolldown 1.2 (JavaScript) + TypeScript 7 (declarations)                 |
| Module system   | `esnext` (ESM, `.js` extensions in relative imports)                    |
| Module syntax   | `verbatimModuleSyntax` — always use `import type` for type-only imports |
| Target          | ESNext                                                                  |
| Package type    | `module` (`package.json` `"type": "module"`)                            |
| Declaration     | `declaration: true`, `declarationMap: true`                             |
| Stricter checks | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`                |

### Build Pipeline

- `npm run build` clears `build/`, emits declaration files with `tsc --project tsconfig.build.json`, emits JavaScript with `rolldown.config.ts`, then runs `verify:build`.
- Rolldown emits ESM with `preserveModules: true`, `preserveModulesRoot: "src"`, `minify: true`, `comments: false`, and external sourcemaps. It never cleans `build/` itself: `npm run clean` empties the directory once at the start of the build, because a clean during the JavaScript stage would delete the declarations emitted by the previous stage.
- `src/tests/**` is excluded from both build stages; it is test infrastructure and nothing under `src/` imports it.
- TypeScript declarations keep JSDoc comments (`removeComments: false`); generated JavaScript removes source comments while retaining `sourceMappingURL` metadata.
- Pure re-export barrels may not receive a JavaScript sourcemap when Rolldown has no local mappings. The root and `./types` entries export an empty default object so those public entries produce mapped JavaScript.

### Common Commands

```bash
npm run clean         # remove build/ (cross-platform, uses Node)
npm run build         # clean -> tsc declarations -> rolldown ESM -> verify:build
npm run build:types   # emit .d.ts only (uses tsconfig.build.json)
npm run build:js      # emit minified ESM + sourcemaps via rolldown.config.ts
npm run verify:build  # check artifact layout, JSDoc, sourcemaps and entry loading
npm run typecheck     # tsc --noEmit against the full project
npm test              # vitest run (single pass, CI mode)
npm run test:watch    # vitest watch
npm run test:type     # vitest typecheck — runs *.type-spec.ts against tsconfig.typecheck.json
npm run bench         # vitest bench (src/**/*.bench.ts)
npm run bench:json    # bench -> bench/results.json

# Documentation site (separate package in site/)
npm --prefix site run dev             # Astro dev server
npm --prefix site run build           # build to site/dist/ (TypeDoc + link validation)
npm --prefix site run check           # astro check for the site
npm --prefix site run check:snippets  # type-check documented examples against src/
npm --prefix site run version:new -- <slug>  # archive a documentation version
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

## Architecture

### Mental Model (the big picture)

Read `ARCH.md` for the full decision log and `SPEC.md` for the public API index. The mental model in one paragraph:

- **Results are plain objects, not classes.** The contract is a discriminated union (`isSuccess` / `isFailure`) over `IResultSuccess` and `IResultFailure<TError>`. Value-bearing Results use `IResultOfT<TValue, TError>`. Same shape for Options (`isSome` / `isNone`).
- **Operators are standalone, data-last, curried.** No methods on result objects. This is what makes `pipe(...)` work.
- **The package layout mirrors the type space.** Because `map` means different things on `IResultOfT` vs `IOption`, every concern lives at its own subpath: `/factories`, `/operators`, `/option`, `/composition`, `/adapters`, `/combine`, `/promise-result`, `/promise-option`, `/async-result`, `/async-option`, `/reliability`, `/observability`, `/primitives`.
- **The main barrel is type-only** (`src/index.ts`). It re-exports the contract types and a runtime `moduleMarker = {}` whose sole purpose is to keep Rolldown materializing the entry's sourcemap. Functional runtime values are reached exclusively via subpaths — this is the rationale for ADR 9/10 in `ARCH.md`.
- **Two async flavors.** `promise-result/` / `promise-option/` operate on eager `Promise<IResultOfT>`; `async-result/` / `async-option/` operate on lazy `AsyncResult<T,E>` thunks (`() => Promise<IResultOfT>`). Don't conflate them — see ADR 8.
- **Three layered concerns sit on top of the core ROP operators:** `reliability/` (retry/timeout/race), `observability/` (breadcrumb `ctx`/`withPath`, formatters, observer hooks), `primitives/` (high-frequency helpers like `cond`/`reduce`/`lift`). Each reuses `IResultOfT`/`AsyncResult` and has its own subpath.

The `IResult` type lives at `src/types/IResult.ts`; per-module `index.ts` files are pure re-export barrels — there are no cyclic re-exports between modules (convention).

### Error Type Customization (Key Differentiator)

Unlike the C# reference (which hardcodes `DomainError`), this library uses a **generic `TError` parameter** — users define their own error types (discriminated unions, classes, or plain objects) and pass them as the type argument. The **default** `TError` is `unknown` (matches `IResultFailure<TError = unknown>`), so a bare `err()` returns `IResultOfT<never, unknown>` and callers are forced to narrow — no silent `Error` coercion.

### Integration Pattern (Pre-configured Result)

Third-party developers can **bake their error type** into a convenience wrapper so consumers never need to specify the `TError` generic. The library is designed to support two complementary approaches:

**1. Type alias** — lightweight, zero-overhead: define a type alias that pins `IResultOfT`'s error generic to the custom error type, e.g. `TrdResult<T> = IResultOfT<T, TrdError>`. The alias keeps function signatures clean without runtime overhead.

**2. Convenience factory** — create a const object with `Success` and `Failure` methods that wrap `ok`/`err` and return the pinned type directly. The `Success` method handles both void and valued cases; `Failure` wraps the custom error. Consumers then write `TrdResult.Success(value)` / `TrdResult.Failure(error)` without ever spelling the error generic.

> **Note:** Use `IResultOfT<T, E>` (not `IResult<T, E>`) for value-bearing
> results. Factory casts inside the convenience wrapper use `as unknown as`
> to bridge between the plain object and the custom union type.

Both approaches compose: the type alias keeps signatures clean, and the factory object eliminates `Result.Failure<T, E>(...)` boilerplate.

### Type Hierarchy

All result and option values are **plain objects** with a discriminant property.

```text
── IResult (void result) ──

IResultSuccess                           (isSuccess: true, isFailure: false — no error)
IResultFailure<TError>                   (isSuccess: false, isFailure: true, error: TError)
IResult<TError = unknown>                = IResultSuccess | IResultFailure<TError>

── IResultOfT (value-bearing) ──

IResultOfTSuccess<TValue>                (isSuccess: true, isFailure: false, value: TValue)
IResultOfTFailure<TError>                (isSuccess: false, isFailure: true, error: TError)
IResultOfT<TValue, TError = unknown>    = IResultOfTSuccess | IResultOfTFailure

── IOption ──

IOptionSome<T>                           (isSome: true, isNone: false, value: T)
IOptionNone                              (isSome: false, isNone: true)
IOption<T>                               = IOptionSome<T> | IOptionNone
```

**Key point:** No classes, no prototype methods — pure discriminated union data objects.

### Narrowing

Access `value` or `error` only after narrowing via `isSuccess` — checking `result.isSuccess` narrows the discriminated union to the success variant (where `.value` exists) or the failure variant (where `.error` exists). Accessing `.value` on a failure or `.error` on a success is a **compile-time type error**.

## Coding Conventions

1. **`interface` for contracts** — interfaces define the shape of result/option objects. No classes.
2. **`I`-prefix on contract types.** Every `interface` (and every `type` alias that names a contract — a public shape users implement or destructure — not a utility alias over primitives) is named with an `I` prefix: `IResult`, `IResultOfT`, `IOption`, `IResultSuccess`, `IRetryOptions`. Runtime value types (factory return shapes, brand markers, callback parameter tuples) and internal helpers do not need the prefix; the rule targets the **contract surface**, not every `type` keyword.
3. **`readonly` properties only** — result objects are immutable value objects.
4. **`import type { ... }`** for all type-only imports (enforced by `verbatimModuleSyntax`).
5. **No barrel / index re-export cycles.** Each module imports its dependencies from the specific source file.
6. **camelCase** for properties (`isSuccess`, `isFailure`, `error`, `value`, `isSome`, `isNone`).

## Conventions the Compiler Enforces

These are not "guidelines" — they are checked. Do not propose changes that violate them.

- `verbatimModuleSyntax: true` — every type-only import must be `import type { ... }`. No exceptions.
- `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true` — array/record access returns `T | undefined`; optional properties cannot be set to `undefined` unless the type says so.
- ESM-only, `.js` extensions in relative imports (`from '../types/IResultOfT.js'`).
- `readonly` properties only on result/option interfaces.
- No barrel re-export cycles — each module imports its dependencies from the specific source file, not from a sibling `index.ts`.
- 4-space indentation, single quotes, LF line endings (see `.editorconfig`); `max_line_length = 240` for `.ts`/`.js`.
- Indent_style applies globally — do not mix tabs/spaces.

## Comment Policy

Comments describe **the code they sit next to** — not the project as a whole. Anything a reader needs to understand intent must be self-contained in the file, or live in `ARCH.md` / `SPEC.md`, which are the canonical records.

- **No cross-document pointers in code comments.** Do not link to, reference, or quote from narrative documents such as `README.md`, `bugs.md`, or any other working log / report file inside `.ts` / `.spec.ts` comments. Linking to a core API source file (e.g. `src/types/IResult.ts`) is fine — that is code, not documentation. If you find yourself wanting to write "see bugs.md #44" or "tracked in README", you have instead forgotten to encode the constraint in code or tests; do that, and delete the pointer.
- **No external-file bug IDs in code comments.** Identifiers like `BUG001`, `bugs.md-BUG001`, "Bug 1 contract", "Issue 7 fix", "Task L5", or any other token that is only meaningful if you have a specific external `.md` open are forbidden in `.ts` / `.spec.ts` comments. The contract under test belongs in the test's `expect(...)` and the operator's type signature, not in a comment that references an external numbering scheme.
- **No padding line separators.** Do not write comment lines that exist purely to pad visual length, such as `// ----------`, `// -----------`, `// ====`, `// ************`, `// ---- Bug 1 contract ----`, or any other decoration-only line. A `describe` / `it` block's title is the section header. If you need a section break inside a test, use a nested `describe` and give it a name.

## Source Layout

```text
src/
  index.ts              — Public barrel
  types/                — IResult, IResultOfT, IOption, AsyncResult, AsyncOption interfaces
  factories/            — ok, err, fromPredicate, tryCatch, fromPromise, etc.
  operators/            — map, bind, match, unwrap, orThrow, separate, etc.
  promise-result/       — mapAsync, bindAsync, matchAsync, etc. (Promise-based)
  async-result/         — AsyncResult lazy thunk operators
  async-option/         — AsyncOption lazy thunk operators
  composition/          — pipe, composeK, safeTry
  adapters/             — switchFn, liftMap, tee, toOption, fromOption
  combine/              — combine, all, combineWithAllErrors
  option/               — ofSome, ofNone, map, bind, match, etc.
  reliability/          — retry, retryLazy, timeout, timeoutEager, race, any, allSettled
  observability/        — ctx, withPath, tapErrContext, format, inspect, observe, installObserver
  primitives/           — cond, condErr, sequence, sequenceAsyncResult, reduce, partitionOption, lift
```

```text
scripts/                — Build pipeline helpers run by npm scripts
  clean.mjs             — Remove build/ (cross-platform)
  verify-build.mjs      — Check the published artifact after a build
```

```text
site/                   — Astro Starlight documentation site (separate package, not published)
  src/content/docs/     — Hand-written pages, generated API reference, archived versions
  src/snippets/         — Type-checked mirrors of documented examples
  scripts/              — Narrative document sync and version archive helpers
```

Tests live alongside source: each `src/<dir>/` contains both `*.ts` source and `*.spec.ts` test files.

`site/` is a separate npm project, like `demo/`: it has its own `package.json` and lockfile, and the root `tsconfig.json`, `rolldown.config.ts` and `vitest.config.ts` all scope themselves to `src/`, so nothing under `site/` reaches the published package. Cloudflare builds and deploys the site through Workers Builds, using the static-assets Worker defined in `site/wrangler.jsonc`; `.github/workflows/docs.yml` only verifies the build and does not deploy.

## Testing

- **Co-located unit tests**: every `src/<dir>/<name>.ts` has a `src/<dir>/<name>.spec.ts` next to it. `*.spec.ts` is excluded from both `tsconfig.json` (build) and `rolldown.config.ts` (rolldown input walker).
- **Type tests**: `*.type-spec.ts` are picked up only by `npm run test:type` (Vitest's `typecheck` mode + `tsconfig.typecheck.json`).
- **Benchmarks**: `*.bench.ts` — collected by `vitest bench` per `vitest.config.ts`'s `bench.include`.
- **Cross-module tests** live in `src/tests/` split into `behaviors/`, `hardening/`, `integration/`, `type-tests/`. `hardening/` guards against incidents catalogued in `bugs.md` — read it before changing anything around the patterns it lists, but do not link to it from code comments (see Comment Policy).
- **Behavior policy conformance** (`hardening/`): `behavior-matrix.ts` is the machine-readable throw-channel matrix; `behavior-policy.spec.ts` runs the channel probes and a classification guard for every runtime export of every public barrel. Adding a new export without a matrix entry fails `npm test`; changing a channel without updating the matrix fails the matching probe. Register every API before changing its throw/reject policy.
- Coverage thresholds live in `vitest.config.ts` — adding code that drops a module below its gate fails CI.

## Implementation Notes

- Results are plain objects — no classes, no sentinel, no constructor invariants.
- `value` and `error` are only present on their respective variants (type-safe via discriminated union).
- Factory functions (`ok`/`err`) return the narrowest possible type (`IResultOfT<T, never>` or `IResultOfT<never, E>`).
- Use `IResultOfT<T, E>` (not `IResult<T, E>`) for value-bearing results. `IResult<E>` is the base union without `value`.
- Option types (`IOptionSome`/`IOptionNone`) are also plain discriminated union objects, not classes.
- Operators are data-last (result is the final argument).

## Adding or Changing Public API

If you add a new export, you are also expected to:

- add a co-located `*.spec.ts` and `*.type-spec.ts` where applicable,
- update the `package.json` `exports` map if a new subpath is needed,
- ensure `vitest.config.ts` coverage globs still cover the new files,
- update `SPEC.md` to list the new export with a link to its source file,
- update `ARCH.md` if the new export changes module responsibilities or ADRs,
- update `AGENTS.md` if the new export changes conventions, workflow, or source-layout descriptions.

## Things That Are Easy to Miss

- `build/` is the only published artifact (`package.json` `"files"`). Source TypeScript is not shipped.
- Rolldown config (`rolldown.config.ts`) walks `src/` and excludes `*.spec.ts`, `*.type-spec.ts`, `*.d.ts` from its input list.
- `npm run typecheck` includes `*.spec.ts` but excludes them from output; `npm run build` does the opposite.
- `bugs.md` is large (~87 KB) and is the working log of bugs/incidents — read it before making changes around any operator you haven't touched before. (Do not link to it from code comments — see Comment Policy.)

## Document Responsibilities

The project maintains complementary documentation with distinct responsibilities:

1. **ARCH.md is the architecture record.** Update whenever source code, interfaces, or module structure change.

2. **SPEC.md is the API index.** Update when adding new exports or changing public API behavior. SPEC.md lists each export with a link to its source file — full type signatures and JSDoc live in the source.

3. **AGENTS.md is the canonical AI instruction set** (broadly supported across coding agents). Update when project conventions, workflow, or source layout change. **Claude-Code-specific tooling should keep a thin pointer file** at `CLAUDE.md` whose only content is `@AGENTS.md` — do not duplicate the instruction set there.

4. **site/README.md is the documentation-site record.** Update when the site's build, content pipeline, versioning, or deployment changes. Published pages come from the source tree: `site/src/content/docs/api/` is generated by TypeDoc at build time and `site/src/content/docs/<version>/` holds the archived snapshots.
