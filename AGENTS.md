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

function findUser(id: string): IResult<User, AppError> { /* ... */ }
```

The **default** `TError` is `Error` when not specified. Users are free to use discriminated unions, classes, or plain objects.

### Integration Pattern (Pre-configured Result)

Third-party developers can **bake their error type** into a convenience wrapper so consumers never need to specify the `TError` generic. The library is designed to support two complementary approaches:

**1. Type alias** — lightweight, zero-overhead:

```ts
// trd-result.ts
import type { IResult } from '@sandlada/result';
import type { TrdError } from './errors';

export type TrdResult<T = void> = IResult<T, TrdError>;
```

**2. Convenience factory** — re-exports `Result` factories with `TrdError` already wired:

```ts
// trd-result.ts
import { Result } from '@sandlada/result';
import type { IResult } from '@sandlada/result';
import type { TrdError } from './errors';

export type TrdResult<T = void> = IResult<T, TrdError>;

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

Both approaches compose: the type alias keeps signatures clean, and the factory object eliminates `Result.Failure<T, E>(...)` boilerplate.

### Class Hierarchy

```
IResult<TError = Error>           (interface)
├── readonly error: TError
├── readonly isSuccess: boolean
└── readonly isFailure: boolean    (computed: !isSuccess)

IResult<TValue, TError = Error>   (interface, extends IResult<TError>)
└── readonly value: TValue         (throws if accessed on failure)

Result                             (class, implements IResult)
├── protected constructor(isSuccess, error)  — validates invariant
├── static Success(): Result
├── static Failure(error): Result
├── static Success<T>(value): IResult<T>
└── static Failure<T, E>(error): IResult<T, E>

Result<TValue, TError>            (class extends Result, implements IResult<TValue, TError>)
└── protected internal constructor(value?, isSuccess, error)
```

### Invariant: Mutual Exclusivity

A result is **always exactly one** of success or failure. The constructor enforces:

- `isSuccess && error !== NONE` → **throw** (success must not carry a real error)
- `!isSuccess && error === NONE` → **throw** (failure must carry a real error)

Where `NONE` is an internal sentinel (`Symbol('result:none')`) cast to `TError`.

### Sentinel Pattern

The `error` property is **always accessible** (never throws), matching the C# behavior where `Error` returns `DomainError.General.None` on success. Internally, success results store the `NONE` sentinel as their error. Users check `isSuccess` before interpreting `error`.

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
  IResult.ts          — IResult<TError> interface
  IResultOfT.ts       — IResult<TValue, TError> interface
  Result.ts           — Result class (base, non-generic)
  ResultOfT.ts        — Result<TValue, TError> class
  index.ts            — public barrel re-exports
```

## C# / TypeScript Mapping

| Concern                 | C#                               | TypeScript                                 |
| ----------------------- | -------------------------------- | ------------------------------------------ |
| Base interface          | `IResult`                        | `IResult<TError = Error>`                  |
| Value-bearing interface | `IResult<out T>`                 | `IResult<TValue, TError = Error>`          |
| Error type              | `DomainError` (hardcoded)        | `TError` generic (user-defined)            |
| Sentinel "none"         | `DomainError.General.None`       | Internal `Symbol()` cast                   |
| Success factory (void)  | `Result.Success()`               | `Result.Success()`                         |
| Failure factory         | `Result.Failure(DomainError)`    | `Result.Failure(error: TError)`            |
| Success factory (T)     | `Result.Success<T>(T)`           | `Result.Success<T>(value: T)`              |
| Failure factory (T)     | `Result.Failure<T>(DomainError)` | `Result.Failure<T, E>(error: E)`           |
| Naming                  | PascalCase                       | PascalCase (static) / camelCase (instance) |
| Covariance              | `out T` (CLR)                    | Not needed (structural typing)             |

## Implementation Notes

- The `NONE` sentinel should be a well-known `Symbol` (`Symbol.for('result:none')`) so it survives module reloads in dev.
- `value` getter throws `TypeError` with a clear message when accessed on a failure.
- Factory methods on `Result` return the narrowest possible type (`IResult<T>` / `IResult<T, E>`) rather than the concrete class, to avoid coupling consumers to the implementation.
- The `failure<T, E>()` overload requires `T` to be specified (no value to infer it from), but `E` can be inferred from the error argument.
