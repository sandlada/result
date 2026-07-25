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
- Rolldown emits ESM with `preserveModules: true`, `preserveModulesRoot: "src"`, `minify: true`, `comments: false`, and external sourcemaps.
- TypeScript declarations keep JSDoc comments (`removeComments: false`); generated JavaScript removes source comments while retaining `sourceMappingURL` metadata.
- Pure re-export barrels may not receive a JavaScript sourcemap when Rolldown has no local mappings. The root and `./types` entries export an empty default object so those public entries produce mapped JavaScript.

## Architecture

### Error Type Customization (Key Differentiator)

Unlike the C# reference (which hardcodes `DomainError`), this library uses a **generic `TError` parameter** — users define their own error types (discriminated unions, classes, or plain objects) and pass them as the type argument. The **default** `TError` is `Error` when not specified.

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
IResult<TError = Error>                  = IResultSuccess | IResultFailure<TError>

── IResultOfT (value-bearing) ──

IResultOfTSuccess<TValue>                (isSuccess: true, isFailure: false, value: TValue)
IResultOfTFailure<TError>                (isSuccess: false, isFailure: true, error: TError)
IResultOfT<TValue, TError = Error>       = IResultOfTSuccess | IResultOfTFailure

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
2. **`readonly` properties only** — result objects are immutable value objects.
3. **`import type { ... }`** for all type-only imports (enforced by `verbatimModuleSyntax`).
4. **No barrel / index re-export cycles.** Each module imports its dependencies from the specific source file.
5. **camelCase** for properties (`isSuccess`, `isFailure`, `error`, `value`, `isSome`, `isNone`).

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

Tests live alongside source: each `src/<dir>/` contains both `*.ts` source and `*.spec.ts` test files.

## Implementation Notes

- Results are plain objects — no classes, no sentinel, no constructor invariants.
- `value` and `error` are only present on their respective variants (type-safe via discriminated union).
- Factory functions (`ok`/`err`) return the narrowest possible type (`IResultOfT<T, never>` or `IResultOfT<never, E>`).
- Use `IResultOfT<T, E>` (not `IResult<T, E>`) for value-bearing results. `IResult<E>` is the base union without `value`.
- Option types (`IOptionSome`/`IOptionNone`) are also plain discriminated union objects, not classes.
- Operators are data-last (result is the final argument).

## Document Responsibilities

The project maintains three complementary documentation files with distinct responsibilities:

1. **ARCH.md is the architecture record.** Update whenever source code, interfaces, or module structure change.

2. **SPEC.md is the API index.** Update when adding new exports or changing public API behavior. SPEC.md lists each export with a link to its source file — full type signatures and JSDoc live in the source.

3. **AGENTS.md guides AI agents.** Update when project conventions, workflow, or source layout change.
