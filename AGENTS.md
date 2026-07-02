# AGENTS.md

## Project Identity

`@sandlada/result` is a TypeScript library providing the **Result pattern** — a functional error-handling primitive that makes error flows explicit and type-safe, replacing throw/catch for predictable failure paths.

The library exposes:

- **`IResult<TError>`** — base contract: error + status
- **`IResult<TValue, TError>`** — contract carrying a success value
- **`Result`** — base class with static factory methods
- **`Result<TValue, TError>`** — generic result class

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

**2. Convenience factory** — re-exports `Result` factories with `TrdError` already wired:

```ts
// trd-result.ts
import { Result } from '@sandlada/result';
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
> results. Factory casts from `Result.Success(...)` to a custom union type must
> use `as unknown as TrdResult<T>` because the class implements the internal
> flat base, not the union directly.

Both approaches compose: the type alias keeps signatures clean, and the factory object eliminates `Result.Failure<T, E>(...)` boilerplate.

### Class Hierarchy

The interfaces use a **discriminated union** pattern (true-myth Omit pattern).
Each result type is split into success and failure variants, discriminated by
the `isSuccess` literal. `value` and `error` are restricted to their respective
variants — accessing them requires narrowing via `isSuccess`.

```
── Internal flat bases (for class implementation) ──

IResultBase<TError = Error>              (internal interface)
├── readonly error: TError
├── readonly isSuccess: boolean
└── readonly isFailure: boolean

IResultOfTBase<TValue, TError = Error>   (internal interface, extends IResultBase)
├── readonly value: TValue
└── map/mapErr/andThen/orElse/match/tap/tapErr/unwrapOr  (8 method signatures)

── Exported variant interfaces (discriminated union members) ──

IResultSuccess                           (isSuccess: true, isFailure: false — no error)
IResultFailure<TError>                   (isSuccess: false, isFailure: true, error: TError)
IResultOfTSuccess<TValue, TError>        (Omit error, isSuccess: true, has value + methods)
IResultOfTFailure<TValue, TError>        (Omit value, isSuccess: false, has error + methods)

── Exported union type aliases ──

IResult<TError = Error>                  = IResultSuccess | IResultFailure<TError>
IResultOfT<TValue, TError = Error>       = IResultOfTSuccess | IResultOfTFailure

── Concrete classes ──

Result                             (class, implements IResultBase)
├── protected constructor(isSuccess, error)  — validates invariant via assertResultInvariant
├── static Success(): IResult
├── static Failure(error): IResult
├── static Success<T>(value): IResultOfT<T>
└── static Failure<T, E>(error): IResultOfT<T, E>

ResultOfT<TValue, TError>          (class, implements IResultOfTBase)
├── **Does NOT extend Result** (flat hierarchy — Phase 4a simplification)
├── protected internal constructor(value?, isSuccess, error)  — validates invariant
├── Instance methods: map, mapErr, andThen, orElse, match, tap, tapErr, unwrapOr
└── toJSON(): { isSuccess: true; value } | { isSuccess: false; error }

── Option type (Phase 2) ──

IOptionBase<T>                     (internal interface)
├── readonly isSome: boolean
├── readonly isNone: boolean
├── readonly value: T
└── map/andThen/orElse/match/tap/unwrapOr/toJSON (7 methods)

IOptionSome<T>                     (Omit error, isSome: true, has value + methods)
IOptionNone                        (Omit value, isSome: false, no value)

IOption<T> = IOptionSome<T> | IOptionNone

Option<T>                          (class, implements IOptionBase)
├── Private constructor(isSome, value?)
├── static Some<T>(value): IOption<T>
├── static None(): IOption<never>
└── Instance methods: map, andThen, orElse, match, tap, unwrapOr, toJSON
```

**Why internal flat bases?** A class cannot `implements` a union type. The
`IResultBase`/`IResultOfTBase`/`IOptionBase` flat interfaces provide the full shape for the
class. Factory methods cast to the exported union type (`as unknown as`).

### Invariant: Mutual Exclusivity

A result is **always exactly one** of success or failure. The invariant is
validated in `src/internal/invariant.ts` (`assertResultInvariant`), used by
both `Result` and `ResultOfT` constructors:

- `isSuccess && error !== NONE` → **throw** (success must not carry a real error)
- `!isSuccess && error === NONE` → **throw** (failure must carry a real error)

Where `NONE` is an internal sentinel (`Symbol('result:none')`) cast to `TError`.

### Sentinel Pattern

At runtime, the `error` property on a success result returns the `NONE` sentinel
(`Symbol.for('result:none')`), matching the C# behavior where `Error` returns
`DomainError.General.None` on success. However, with the discriminated union
refactor, the `error` property is **not exposed on the success variant's type** —
the type system enforces what was previously only a convention. Users must narrow
via `isSuccess` before accessing `error`:

```ts
if (result.isSuccess) {
    // result.error — type error: not on success variant
    doSomething(result.value);  // ✓ safe
} else {
    handleError(result.error);   // ✓ safe
}
```

## Coding Conventions

1. **`interface` for contracts, `class` for implementations.** Export both so consumers can implement custom results if needed.
2. **`readonly` properties only** — result objects are immutable value objects.
3. **Static factories live on `Result`**, not on `Result<T>`. This mirrors the C# reference: `Result.Success<T>(value)`, not `Result<T>.Success(value)`.
4. **`import type { ... }`** for all type-only imports (enforced by `verbatimModuleSyntax`).
5. **No barrel / index re-export cycles.** Each module imports its dependencies from the specific source file.
6. **PascalCase** for static members (`Result.Success`, `Result.Failure`), matching C# convention. **camelCase** for instance properties (`isSuccess`, `isFailure`, `error`, `value`).

## Source Layout

```
src/
  IResult.ts          — IResultBase (internal), IResultSuccess, IResultFailure, IResult (union)
  IResultOfT.ts       — IResultOfTBase (internal), IResultOfTSuccess, IResultOfTFailure, IResultOfT (union)
  Result.ts           — Result class + ResultOfT class (independent, flat hierarchy)
  ResultOfT.ts        — Re-export barrel for ResultOfT
  Option.ts           — Option<T> class + IOption<T> discriminated union
  index.ts            — public barrel re-exports
  internal/
    sentinel.ts       — NONE sentinel (Symbol.for('result:none'))
    invariant.ts      — assertResultInvariant helper
  fp/
    ...
    option/
      core.ts         — ofSome(), ofNone() constructors
      operators.ts    — map, andThen, orElse, match, tap, unwrapOr
      index.ts        — FP option barrel
    ...
```

## C# / TypeScript Mapping

| Concern                 | C#                               | TypeScript                                                 |
| ----------------------- | -------------------------------- | ---------------------------------------------------------- |
| Base interface          | `IResult`                        | `IResult<TError = Error>` (discriminated union)            |
| Value-bearing interface | `IResult<out T>`                 | `IResultOfT<TValue, TError = Error>` (discriminated union) |
| Error type              | `DomainError` (hardcoded)        | `TError` generic (user-defined)                            |
| Sentinel "none"         | `DomainError.General.None`       | Internal `Symbol()` cast                                   |
| Success factory (void)  | `Result.Success()`               | `Result.Success()`                                         |
| Failure factory         | `Result.Failure(DomainError)`    | `Result.Failure(error: TError)`                            |
| Success factory (T)     | `Result.Success<T>(T)`           | `Result.Success<T>(value: T)`                              |
| Failure factory (T)     | `Result.Failure<T>(DomainError)` | `Result.Failure<T, E>(error: E)`                           |
| Naming                  | PascalCase                       | PascalCase (static) / camelCase (instance)                 |
| Covariance              | `out T` (CLR)                    | Not needed (structural typing)                             |

## Implementation Notes

- The `NONE` sentinel should be a well-known `Symbol` (`Symbol.for('result:none')`) so it survives module reloads in dev.
- `value` getter throws `TypeError` with a clear message when accessed on a failure.
- Factory methods on `Result` return the narrowest possible type (`IResultOfT<T>` / `IResultOfT<T, E>`) rather than the concrete class, to avoid coupling consumers to the implementation.
- The `Failure<T, E>()` overload requires `T` to be specified (no value to infer it from), but `E` can be inferred from the error argument.
- **Discriminated union:** `IResult` and `IResultOfT` are type alias unions, not flat interfaces. The class implements internal flat bases (`IResultBase`/`IResultOfTBase`) and factory methods cast via `as unknown as` to the union type.
- **Omit pattern:** `IResultOfTSuccess`/`IResultOfTFailure` extend `Omit<IResultOfTBase, ...>` to inherit all instance methods while restricting `value`/`error` to their respective variants.
- **Use `IResultOfT<T, E>`** (not `IResult<T, E>`) for value-bearing results. `IResult<E>` is the base union without `value`.

## Development Workflow

1. **ARCH.md holds the current architecture design.** `ARCH.md` is the authoritative record of the project's architecture. It must always reflect the latest design decisions, class hierarchy, module relationships, and any architectural changes made during development.

2. **Every code update must update ARCH.md.** Whenever you modify source code, add new files, change interfaces, or alter the module structure, you **must** update `ARCH.md` to keep it in sync with the codebase. This includes — but is not limited to — adding new classes or interfaces, modifying existing type signatures, restructuring modules, or changing architectural patterns.
