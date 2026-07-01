# @sandlada/result

![NPM Downloads](https://img.shields.io/npm/d18m/@sandlada/result?label=NPM%20Downloads&labelColor=%2300531f&color=%23a3f5aa)
![NPM Version](https://img.shields.io/npm/v/%40sandlada%2Fresult?label=NPM%20Version&labelColor=%2300531f&color=%23a3f5aa)
![GitHub License](https://img.shields.io/github/license/sandlada/result?label=License&labelColor=%2300531f&color=%23a3f5aa)

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a type-safe, exception-free approach to error handling. It makes error flows explicit in the type system so you never wonder whether a function can fail.

Unlike traditional Result libraries that hardcode a single error type, `@sandlada/result` is **fully generic**: you bring your own error shapes (discriminated unions, classes, or plain objects).

## :zap: Highlights

- Fully generic `TError` — define your own error types
- Zero dependencies
- ESM-only, strict TypeScript
- Inspired by the C# Result pattern

## :eyes: Installation

```bash
npm i @sandlada/result
```

> **ESM only.** This package cannot be used with `require()`. Your project must use ESM (`import`) or dynamic `import()`.

## :ship: Quick Start

```ts
import { Result, type IResultOfT } from '@sandlada/result';

// Define your error type (discriminated union recommended)
type AppError =
  | { kind: 'NotFound'; id: string }
  | { kind: 'Validation'; fields: Record<string, string> };

function getUser(id: string): IResultOfT<User, AppError> {
  if (!id) {
    return Result.Failure<User, AppError>({
      kind: 'Validation',
      fields: { id: 'Required' },
    });
  }
  const user = db.find(id);
  if (!user) {
    return Result.Failure<User, AppError>({
      kind: 'NotFound',
      id,
    });
  }
  return Result.Success(user);
}

// Consume with type narrowing
const result = getUser('42');
if (result.isSuccess) {
  console.log(result.value.name); // ✅ User
} else {
  switch (result.error.kind) {
    case 'NotFound': /* ... */ break;
    case 'Validation': /* ... */ break;
  }
}
```

## :ledger: Core Types

| Export       | Kind      | Signature                            | Description                      |
| ------------ | --------- | ------------------------------------ | -------------------------------- |
| `IResult`    | interface | `IResult<TError = Error>`            | Base result contract (no value)  |
| `IResultOfT` | interface | `IResultOfT<TValue, TError = Error>` | Result carrying a success value  |
| `Result`     | class     | `Result<TError = Error>`             | Base class with static factories |
| `ResultOfT`  | class     | `ResultOfT<TValue, TError = Error>`  | Generic result class with value  |

### Factory Methods

All factories live on `Result`:

| Method                        | Returns                                                     |
| ----------------------------- | ----------------------------------------------------------- |
| `Result.Success()`            | `IResult` — void success                                    |
| `Result.Success(value)`       | `IResultOfT<TValue>` — success with value (T inferred)      |
| `Result.Failure(error)`       | `IResult` — void failure (Error only)                       |
| `Result.Failure<T, E>(error)` | `IResultOfT<T, E>` — typed failure (T explicit, E inferred) |

## :package: Integration Pattern

Bind your error type once and eliminate generic boilerplate:

```ts
// app-result.ts
import { Result } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';
import type { AppError } from './errors.js';

export type AppResult<T = void> = IResultOfT<T, AppError>;

export const AppResult = {
  Success(): AppResult<void> { return Result.Success() as AppResult<void>; },
  Success<T>(value: T): AppResult<T> { return Result.Success(value) as AppResult<T>; },
  Failure(error: AppError): AppResult<never> { return Result.Failure<never, AppError>(error); },
} as const;
```

```ts
// usage — no TError generic anywhere
import { AppResult } from './app-result.js';

function getUser(id: string): AppResult<User> {
  if (!id) return AppResult.Failure({ kind: 'Validation', fields: { id: 'Required' } });
  return AppResult.Success({ id, name: 'Alice' });
}
```

## :ledger: Further Reading

For detailed documentation — railway-oriented programming, multi-layer error mapping, result aggregation, and C# comparison — see [SPEC.md](./SPEC.md).

## License

MIT
