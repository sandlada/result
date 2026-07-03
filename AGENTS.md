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
| Build tool      | `tsgo` (TypeScript Native, via `@typescript/native-preview`)            |
| Module system   | `nodenext` (ESM, `.js` extensions in relative imports)                  |
| Module syntax   | `verbatimModuleSyntax` — always use `import type` for type-only imports |
| Target          | ESNext                                                                  |
| Package type    | `module` (`package.json` `"type": "module"`)                            |
| Declaration     | `declaration: true`, `declarationMap: true`                             |
| Stricter checks | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`                |

## Architecture

### Error Type Customization (Key Differentiator)

Unlike the C# reference (which hardcodes `DomainError`), this library uses a **generic `TError` parameter**. Users pass their own error types:

```ts
type AppError =
  | { kind: 'NotFound'; id: string }
  | { kind: 'Validation'; fields: Record<string, string> };

function findUser(id: string): IResultOfT<User, AppError> { /* ... */ }
```

The **default** `TError` is `Error` when not specified. Users are free to use discriminated unions, classes, or plain objects.

### Integration Pattern (Pre-configured Result)

Third-party developers can **bake their error type** into a convenience wrapper so consumers never need to specify the `TError` generic. The library is designed to support two complementary approaches:

**1. Type alias** — lightweight, zero-overhead:

```ts
// trd-result.ts
import type { IResultOfT } from '@sandlada/result';
import type { TrdError } from './errors';

export type TrdResult<T = void> = IResultOfT<T, TrdError>;
```

**2. Convenience factory** — re-exports `ok`/`err` factories with `TrdError` already wired:

```ts
// trd-result.ts
import { ok, err } from '@sandlada/result/fp';
import type { IResultOfT } from '@sandlada/result';
import type { TrdError } from './errors';

export type TrdResult<T = void> = IResultOfT<T, TrdError>;

export const TrdResult = {
    Success(): TrdResult<void>,
    Success<T>(value: T): TrdResult<T>,
    Failure(error: TrdError): TrdResult<never>,
} as const;

// Usage — no TError generic needed:
function getUser(id: string): TrdResult<User> {
    if (!id) return TrdResult.Failure(new TrdError('INVALID_ID'));
    return TrdResult.Success({ id, name: 'Alice' });
}
```

> **Note:** Use `IResultOfT<T, E>` (not `IResult<T, E>`) for value-bearing
> results. Factory casts inside the convenience wrapper use `as unknown as`
> to bridge between the plain object and the custom union type.

Both approaches compose: the type alias keeps signatures clean, and the factory object eliminates `Result.Failure<T, E>(...)` boilerplate.

### Type Hierarchy

All result and option values are **plain objects** with a discriminant property.

```
── IResult (void result) ──

IResultSuccess                           (isSuccess: true, isFailure: false — no error)
IResultFailure<TError>                   (isSuccess: false, isFailure: true, error: TError)
IResult<TError = Error>                  = IResultSuccess | IResultFailure<TError>

── IResultOfT (value-bearing) ──

IResultOfTSuccess<TValue>                (isSuccess: true, isFailure: false, value: TValue)
IResultOfTFailure<TValue, TError>        (isSuccess: false, isFailure: true, error: TError)
IResultOfT<TValue, TError = Error>       = IResultOfTSuccess | IResultOfTFailure

── IOption ──

IOptionSome<T>                           (isSome: true, isNone: false, value: T)
IOptionNone                              (isSome: false, isNone: true)
IOption<T>                               = IOptionSome<T> | IOptionNone
```

**Key point:** No classes, no prototype methods — pure discriminated union data objects.

### Narrowing

Access `value` or `error` only after narrowing via `isSuccess`:

```ts
if (result.isSuccess) {
    doSomething(result.value);  // ✓ safe
} else {
    handleError(result.error);  // ✓ safe
}
```

## Coding Conventions

1. **`interface` for contracts** — interfaces define the shape of result/option objects. No classes.
2. **`readonly` properties only** — result objects are immutable value objects.
3. **`import type { ... }`** for all type-only imports (enforced by `verbatimModuleSyntax`).
4. **No barrel / index re-export cycles.** Each module imports its dependencies from the specific source file.
5. **camelCase** for properties (`isSuccess`, `isFailure`, `error`, `value`, `isSome`, `isNone`).

## Source Layout

```
src/
  IResult.ts           — IResultSuccess, IResultFailure, IResult (discriminated union type)
  IResultOfT.ts        — IResultOfTSuccess, IResultOfTFailure, IResultOfT (discriminated union type)
  Option.ts            — IOptionSome, IOptionNone, IOption (discriminated union type)
  index.ts             — public barrel re-exports

  // One file per export — users import from '@sandlada/result' (no /fp suffix)
  ok.ts, err.ts, fromPredicate.ts, fromThrowable.ts, tryCatch.ts,
  tryCatchAsync.ts, fromPromise.ts, asyncOk.ts, asyncErr.ts,
  map.ts, mapErr.ts, bind.ts, orElse.ts, match.ts, tap.ts, tapErr.ts,
  unwrapOr.ts, unwrapOrElse.ts, unwrap.ts, expect.ts, unwrapErr.ts,
  expectErr.ts, flatten.ts, and.ts, or.ts, contains.ts, exists.ts,
  bimap.ts, swap.ts, mapOr.ts, mapOrElse.ts,
  mapAsync.ts, mapErrAsync.ts, bindAsync.ts, orElseAsync.ts,
  matchAsync.ts, tapAsync.ts, tapErrAsync.ts, unwrapOrAsync.ts,
  composeK.ts, pipe.ts, composeKAsync.ts, pipeAsync.ts,
  switchFn.ts, liftMap.ts, tee.ts, toOption.ts, fromOption.ts,
  switchFnAsync.ts, teeAsync.ts,
  combine.ts, all.ts, combineWithAllErrors.ts

  option/
    ofSome.ts          — ofSome()
    ofNone.ts          — ofNone()
    map.ts, andThen.ts, orElse.ts, match.ts, tap.ts,
    unwrapOr.ts, filter.ts, flatten.ts, contains.ts
    index.ts           — Option barrel (exported as @sandlada/result/option)
```

## C# / TypeScript Mapping

| Concern                 | C#                               | TypeScript                                                 |
| ----------------------- | -------------------------------- | ---------------------------------------------------------- |
| Base interface          | `IResult`                        | `IResult<TError = Error>` (discriminated union)            |
| Value-bearing interface | `IResult<out T>`                 | `IResultOfT<TValue, TError = Error>` (discriminated union) |
| Error type              | `DomainError` (hardcoded)        | `TError` generic (user-defined)                            |
| Sentinel "none"         | `DomainError.General.None`       | Not needed (no class, no sentinel)                         |
| Success factory (void)  | `Result.Success()`               | `ok()`                                                     |
| Failure factory         | `Result.Failure(DomainError)`    | `err(error: TError)`                                       |
| Success factory (T)     | `Result.Success<T>(T)`           | `ok(value: T)`                                             |
| Failure factory (T)     | `Result.Failure<T>(DomainError)` | `err<T, E>(error: E)`                                      |
| Naming                  | PascalCase                       | camelCase (`ok`, `err`, `isSuccess`, `value`)              |
| Covariance              | `out T` (CLR)                    | Not needed (structural typing)                             |

## Implementation Notes

- Results are plain objects — no classes, no sentinel, no constructor invariants.
- `value` and `error` are only present on their respective variants (type-safe via discriminated union).
- Factory functions (`ok`/`err`) return the narrowest possible type (`IResultOfT<T, never>` or `IResultOfT<never, E>`).
- Use `IResultOfT<T, E>` (not `IResult<T, E>`) for value-bearing results. `IResult<E>` is the base union without `value`.
- Option types (`IOptionSome`/`IOptionNone`) are also plain discriminated union objects, not classes.
- Operators are data-last (result is the final argument).

## Development Workflow

1. **ARCH.md holds the current architecture design.** `ARCH.md` is the authoritative record of the project's architecture. It must always reflect the latest design decisions, class hierarchy, module relationships, and any architectural changes made during development.

2. **Every code update must update ARCH.md.** Whenever you modify source code, add new files, change interfaces, or alter the module structure, you **must** update `ARCH.md` to keep it in sync with the codebase. This includes — but is not limited to — adding new classes or interfaces, modifying existing type signatures, restructuring modules, or changing architectural patterns.
