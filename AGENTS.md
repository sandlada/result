# AGENTS.md

## Project Identity

`@sandlada/result` is a TypeScript library providing the **Result Pattern** — a functional error-handling primitive that makes error flows explicit and type-safe, replacing throw/catch for predictable failure paths.

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
npm run verify:build  # check artifact layout, JSDoc, sourcemaps and entry loading, then the module READMEs
npm run verify:readme # check module READMEs against barrels, the AGENTS.md module map and package.json exports
npm run verify:examples # compile every JSDoc @example block under src/ (tsconfig.examples.json)
npm run typecheck     # tsc --noEmit against the full project
npm test              # vitest run (single pass, CI mode)
npm run test:watch    # vitest watch
npm run test:type     # vitest typecheck — runs *.type-spec.ts against tsconfig.typecheck.json
npm run bench         # vitest bench (src/**/*.bench.ts)
npm run bench:json    # bench -> bench/results.json

# Documentation site (separate package in site/)
npm --prefix site run dev             # Astro dev server
npm --prefix site run build           # build to site/dist/ (content sync + TypeDoc + link validation + verify:seo)
npm --prefix site run check           # astro check for the site
npm --prefix site run check:snippets  # type-check documented examples against src/
npm --prefix site run verify          # check:snippets + check + build
npm --prefix site run verify:seo      # re-check SEO invariants of an existing site/dist/
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

Each module owns its spec at `src/<module>/README.md`; the module map below links them. The mental model in one paragraph:

- **Results are plain objects, not classes.** The contract is a discriminated union (`isSuccess` / `isFailure`) over `IResultSuccess` and `IResultFailure<TError>`. Value-bearing Results use `IResultOfT<TValue, TError>`. Same shape for Options (`isSome` / `isNone`).
- **Operators are standalone, data-last, curried.** No methods on result objects. This is what makes `pipe(...)` work.
- **The package layout mirrors the type space.** Because `map` means different things on `IResultOfT` vs `IOption`, every concern lives at its own subpath: `/factories`, `/operators`, `/option`, `/composition`, `/adapters`, `/combine`, `/promise-result`, `/promise-option`, `/async-result`, `/async-option`, `/reliability`, `/observability`, `/primitives`.
- **The main barrel is type-only** (`src/index.ts`). It re-exports the contract types and a runtime empty default object whose sole purpose is to keep Rolldown materializing the entry's sourcemap. Functional runtime values are reached exclusively via subpaths — the rationale is recorded in [`src/types/README.md`](src/types/README.md).
- **Two async flavors.** `promise-result/` / `promise-option/` operate on eager `Promise<IResultOfT>`; `async-result/` / `async-option/` operate on lazy `AsyncResult<T,E>` thunks (`() => Promise<IResultOfT>`). Don't conflate them — see the module map below.
- **Three layered concerns sit on top of the core ROP operators:** `reliability/` (retry/timeout/race), `observability/` (breadcrumb `ctx`/`withPath`, formatters, observer hooks), `primitives/` (high-frequency helpers like `cond`/`reduce`/`lift`). Each reuses `IResultOfT`/`AsyncResult` and has its own subpath.

The `IResult` type lives at `src/types/IResult.ts`; per-module `index.ts` files are re-export barrels (the root and `types` entries add an empty `export default {}` marker) — there are no cyclic re-exports between modules (convention).

### Module Map

| Module | Subpath | Spec | Behavior matrix |
| --- | --- | --- | --- |
| types | `@sandlada/result` (root barrel) and `@sandlada/result/types` | [src/types/README.md](src/types/README.md) | — |
| factories | `@sandlada/result/factories` | [src/factories/README.md](src/factories/README.md) | [§4.1](docs/behavior-modes.md#41-factories-srcfactories) |
| operators | `@sandlada/result/operators` | [src/operators/README.md](src/operators/README.md) | [§4.2](docs/behavior-modes.md#42-synchronous-operators-srcoperators) |
| option | `@sandlada/result/option` | [src/option/README.md](src/option/README.md) | [§4.5](docs/behavior-modes.md#45-option-srcoption) |
| composition | `@sandlada/result/composition` | [src/composition/README.md](src/composition/README.md) | [§4.3](docs/behavior-modes.md#43-composition-srccombine-srccomposition) |
| adapters | `@sandlada/result/adapters` | [src/adapters/README.md](src/adapters/README.md) | [§4.4](docs/behavior-modes.md#44-adapters-and-high-frequency-primitives-srcadapters-srcprimitives) |
| combine | `@sandlada/result/combine` | [src/combine/README.md](src/combine/README.md) | [§4.3](docs/behavior-modes.md#43-composition-srccombine-srccomposition) |
| promise-result | `@sandlada/result/promise-result` | [src/promise-result/README.md](src/promise-result/README.md) | [§4.6](docs/behavior-modes.md#46-eager-async-srcpromise-result-srcpromise-option) |
| promise-option | `@sandlada/result/promise-option` | [src/promise-option/README.md](src/promise-option/README.md) | [§4.6](docs/behavior-modes.md#46-eager-async-srcpromise-result-srcpromise-option) |
| async-result | `@sandlada/result/async-result` | [src/async-result/README.md](src/async-result/README.md) | [§4.7](docs/behavior-modes.md#47-lazy-async-srcasync-result-srcasync-option) |
| async-option | `@sandlada/result/async-option` | [src/async-option/README.md](src/async-option/README.md) | [§4.7](docs/behavior-modes.md#47-lazy-async-srcasync-result-srcasync-option) |
| reliability | `@sandlada/result/reliability` | [src/reliability/README.md](src/reliability/README.md) | [§4.8](docs/behavior-modes.md#48-reliability-srcreliability) |
| observability | `@sandlada/result/observability` | [src/observability/README.md](src/observability/README.md) | [§4.9](docs/behavior-modes.md#49-observability-srcobservability) |
| primitives | `@sandlada/result/primitives` | [src/primitives/README.md](src/primitives/README.md) | [§4.4](docs/behavior-modes.md#44-adapters-and-high-frequency-primitives-srcadapters-srcprimitives) |

`npm run verify:readme` keeps this map, `package.json` `exports` and the module directories in agreement, and checks every module README's API table against its barrel.

### Error Type Customization (Key Differentiator)

Unlike the C# reference (which hardcodes `DomainError`), this library uses a **generic `TError` parameter** — users define their own error types (discriminated unions, classes, or plain objects) and pass them as the type argument. The **default** `TError` is `unknown` (matches `IResultFailure<TError = unknown>`), so a failure stays unusable until the caller narrows it — no silent `Error` coercion.

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

Comments describe **the code they sit next to** — not the project as a whole. Anything a reader needs to understand intent must be self-contained in the file, or live in the canonical records (`AGENTS.md`, `docs/behavior-modes.md`, or the module `README.md` that owns the code).

- **No cross-document pointers in code comments.** Do not link to, reference, or quote from narrative documents such as `README.md`, `bugs.md`, or any other working log / report file inside `.ts` / `.spec.ts` comments. Linking to a core API source file (e.g. `src/types/IResult.ts`) is fine — that is code, not documentation. If you find yourself wanting to write "see bugs.md #44" or "tracked in README", you have instead forgotten to encode the constraint in code or tests; do that, and delete the pointer.
- **No external-file bug IDs in code comments.** Identifiers like `BUG001`, `bugs.md-BUG001`, "Bug 1 contract", "Issue 7 fix", "Task L5", or any other token that is only meaningful if you have a specific external `.md` open are forbidden in `.ts` / `.spec.ts` comments. The contract under test belongs in the test's `expect(...)` and the operator's type signature, not in a comment that references an external numbering scheme.
- **No padding line separators.** Do not write comment lines that exist purely to pad visual length, such as `// ----------`, `// -----------`, `// ====`, `// ************`, `// ---- Bug 1 contract ----`, or any other decoration-only line. A `describe` / `it` block's title is the section header. If you need a section break inside a test, use a nested `describe` and give it a name.
- **JSDoc placement is part of the API contract.** Public JSDoc must sit directly above the declaration it documents (after the imports): TypeDoc only attaches a comment to the declaration it immediately precedes, so a block parked at the top of the file renders nowhere. For overloaded functions, put the block above the **implementation signature** so the site renders it once at function level instead of repeating it per overload.
- **No `@fileoverview` or `@note` tags.** `@fileoverview` is not a TypeDoc tag and produces a literal "Fileoverview" heading; unknown tags also emit build warnings. Start the block with the summary sentence. Module barrels use `@packageDocumentation` instead, which TypeDoc renders as the API page intro.
- **Examples must compile.** Every fenced `ts` block under `@example` is extracted to `.examples/` and type-checked by `npm run verify:examples` (part of `verify:build`). Keep them self-contained: import from the real subpaths (`@sandlada/result/<module>`; runtime values never come from the root barrel) and do not reference fictional helpers.

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
  verify-readme.mjs     — Check the module READMEs against barrels, the AGENTS.md map and package.json
```

```text
site/                   — Astro Starlight documentation site (separate package, not published)
  lib/                  — Shared site data (module registry in site.mjs), content sync, frontmatter and file helpers
  assets/               — SVG sources of the committed social/icon PNGs
  public/               — robots.txt, favicon, apple touch icon, og:image
  plugins/              — Starlight plugins run at config time (content sync, API page metadata)
  src/content/docs/     — Hand-written pages, generated API reference, archived versions
  src/snippets/         — Type-checked mirrors of documented examples
  src/starlightRouteData.ts — Route middleware: robots policy, og:type, JSON-LD
  scripts/              — Thin CLI shells (content sync, SEO verification, icon rendering, version archive)
```

Tests live alongside source: each `src/<dir>/` contains both `*.ts` source and `*.spec.ts` test files. Every module directory also carries a `README.md` — its spec and API index (see the module map above).

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
- register the export in `src/tests/hardening/behavior-matrix.ts` before changing its throw/reject policy,
- update the owning module README (`src/<module>/README.md`) — its API table must list the new export with a link to its source file,
- update the module map in `AGENTS.md` if a new module directory or subpath is added,
- update `AGENTS.md` if the new export changes conventions, workflow, or source-layout descriptions.

## Things That Are Easy to Miss

- `build/` is the only published artifact (`package.json` `"files"`). Source TypeScript is not shipped.
- Rolldown config (`rolldown.config.ts`) walks `src/` and excludes `*.spec.ts`, `*.type-spec.ts`, `*.d.ts` from its input list.
- `npm run typecheck` includes `*.spec.ts` but excludes them from output; `npm run build` does the opposite.
- `bugs.md` is the working log of bugs/incidents — read it before making changes around any operator you haven't touched before. (Do not link to it from code comments — see Comment Policy.)

## Document Responsibilities

The project maintains complementary documentation with distinct responsibilities:

1. **Module READMEs (`src/<module>/README.md`) are the module specs.** Each one is the API index and contract record for its subpath: scope, an export table linked to source files, and the module-specific invariants. Full type signatures and JSDoc live in the source, and throw/short-circuit conclusions defer to `docs/behavior-modes.md`. Update whenever exports, interfaces, or public behavior change — `npm run verify:readme` fails when a README and its barrel disagree.

2. **AGENTS.md is the canonical AI instruction set** (broadly supported across coding agents), and it carries the module map. Update when project conventions, workflow, source layout, or module ownership change. **Claude-Code-specific tooling should keep a thin pointer file** at `CLAUDE.md` whose only content is `@AGENTS.md` — do not duplicate the instruction set there.

3. **docs/behavior-modes.md is the throw/short-circuit policy record.** Update when any throw, short-circuit, or empty-input behavior changes; the consistency guard in `src/tests/hardening/behavior-policy.spec.ts` runs the matrix probes.

4. **site/README.md is the documentation-site record.** Update when the site's build, content pipeline, versioning, or deployment changes. Published pages come from the source tree: `site/src/content/docs/api/` is generated by TypeDoc at build time and `site/src/content/docs/<version>/` holds the archived snapshots.
