# @sandlada/result

![NPM Downloads](https://img.shields.io/npm/d18m/@sandlada/result?label=NPM%20Downloads&labelColor=%2300531f&color=%23a3f5aa)
![NPM Version](https://img.shields.io/npm/v/%40sandlada%2Fresult?label=NPM%20Version&labelColor=%2300531f&color=%23a3f5aa)
![GitHub License](https://img.shields.io/github/license/sandlada/result?label=License&labelColor=%2300531f&color=%23a3f5aa)

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a type-safe, exception-free approach to error handling. It makes error flows explicit in the type system so you never wonder whether a function can fail.

Unlike traditional Result libraries that hardcode a single error type, `@sandlada/result` is **fully generic**: you bring your own error shapes (discriminated unions, classes, or plain objects).

## :zap: Highlights

- Fully generic `TError` — define your own error types
- **Dual paradigm** — OOP fluent API (`result.map().andThen()`) + FP curried operators (`pipe`, `map`, `bind`)
- **Async-native** — `AsyncResult` class + `@sandlada/result/fp/promise` for Promise-based railways
- **Railway Oriented Programming** built-in — `map`, `bind`, `orElse`, `match`, `tap`, `combine`
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

// OOP fluent style
const name = getUser('42')
  .map(u => u.name)
  .unwrapOr('Unknown');

// FP curried style
import { pipe, map, unwrapOr } from '@sandlada/result/fp';
const name2 = pipe(getUser('42'), map(u => u.name), unwrapOr('Unknown'));
```

## :ledger: Core Types

### OOP (`@sandlada/result`)

| Export       | Kind      | Signature                            | Description                      |
| ------------ | --------- | ------------------------------------ | -------------------------------- |
| `IResult`    | interface | `IResult<TError = Error>`            | Base result contract (no value)  |
| `IResultOfT` | interface | `IResultOfT<TValue, TError = Error>` | Result carrying a success value  |
| `Result`     | class     | `Result<TError = Error>`             | Base class with static factories |
| `ResultOfT`  | class     | `ResultOfT<TValue, TError = Error>`  | Generic result class with value  |

### FP (`@sandlada/result/fp`)

| Export | Kind     | Description                                                                                                                       |
| ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ok`   | function | Create success result                                                                                                             |
| `err`  | function | Create failure result                                                                                                             |
| `map`  | function | Transform success (data-last curried)                                                                                             |
| `bind` | function | Monadic chain (data-last curried)                                                                                                 |
| `pipe` | function | Left-to-right pipeline (1–6 overloads)                                                                                            |
| …      |          | `mapErr`, `orElse`, `match`, `tap`, `tapErr`, `unwrapOr`, `composeK`, `combine`, `all`, `combineWithAllErrors`, `switchFn`, `tee` |

### Factory Methods & Utilities

All on `Result`:

| Method                                   | Returns                                                     |
| ---------------------------------------- | ----------------------------------------------------------- |
| `Result.Success()`                       | `IResult` — void success                                    |
| `Result.Success(value)`                  | `IResultOfT<TValue>` — success with value (T inferred)      |
| `Result.Failure(error)`                  | `IResult` — void failure (Error only)                       |
| `Result.Failure<T, E>(error)`            | `IResultOfT<T, E>` — typed failure (T explicit, E inferred) |
| `Result.tryCatch(fn, errorFn?)`          | `IResultOfT<T, E>` — wrap a throwing function               |
| `Result.tryCatchAsync(fn, errorFn?)`     | `Promise<IResultOfT<T, E>>` — wrap an async/throwing fn     |
| `Result.fromPromise(promise, errorFn?)`  | `Promise<IResultOfT<T, E>>` — convert Promise to Result     |
| `Result.combine(results[])`              | `IResultOfT<T[], E>` — short-circuit first failure          |
| `Result.all(tuple)`                      | `IResultOfT<tuple>` — combine heterogeneous tuple           |
| `Result.combineWithAllErrors(results[])` | `IResultOfT<T[], E[]>` — accumulate all errors              |

### Fluent Methods (on `ResultOfT`)

| Method                      | Description                                  |
| --------------------------- | -------------------------------------------- |
| `result.map(fn)`            | Transform success value                      |
| `result.mapErr(fn)`         | Transform error                              |
| `result.andThen(fn)`        | Monadic bind (chain)                         |
| `result.orElse(fn)`         | Error recovery                               |
| `result.match(onOk, onErr)` | Terminal pattern-match                       |
| `result.tap(fn)`            | Side-effect on success (returns `this`)      |
| `result.tapErr(fn)`         | Side-effect on failure (returns `this`)      |
| `result.unwrapOr(default)`  | Safe extraction with fallback (never throws) |

## :hourglass: AsyncResult (`@sandlada/result/promise`)

When working with `Promise`-based APIs, nesting `Promise<IResultOfT<T, E>>` leads to awkward double-`await` patterns. `AsyncResult` wraps a `Promise<IResultOfT<T, E>>` into a thenable, chainable object — a single async railway.

```ts
import { AsyncResult } from '@sandlada/result/promise';
import type { AppError } from './errors.js';

// Create from an async operation
const user: AsyncResult<User, AppError> = AsyncResult.tryCatch(
    () => fetch('/api/user/42').then(r => r.json()),
    (e) => ({ kind: 'ApiError' as const, message: String(e) }),
);

// Chain without nesting Promise<Result<...>>
const greeting = await user
    .map(u => u.name.toUpperCase())
    .andThen(u => AsyncResult.tryCatch(() => fetch(`/api/greet/${u.id}`)))
    .map(r => r.json())
    .unwrapOr('Unknown');
```

### Static Factories

| Method                                        | Returns                                    |
| --------------------------------------------- | ------------------------------------------ |
| `AsyncResult.success(value)`                  | `AsyncResult<T, never>`                    |
| `AsyncResult.failure(error)`                  | `AsyncResult<never, E>`                    |
| `AsyncResult.tryCatch(fn, errorFn?)`          | `AsyncResult<T, E>`                        |
| `AsyncResult.from(result)`                    | `AsyncResult<T, E>` — wrap existing Result |
| `AsyncResult.fromPromise(promise, errorFn?)`  | `AsyncResult<T, E>`                        |
| `AsyncResult.combine(results[])`              | `AsyncResult<T[], E>` — short-circuit      |
| `AsyncResult.all(tuple)`                      | `AsyncResult<tuple>` — heterogeneous       |
| `AsyncResult.combineWithAllErrors(results[])` | `AsyncResult<T[], E[]>` — accumulate       |

### Instance Methods

| Method                     | Description                             |
| -------------------------- | --------------------------------------- |
| `async.map(fn)`            | Transform success (sync)                |
| `async.mapAsync(fn)`       | Transform success (async)               |
| `async.mapErr(fn)`         | Transform error (sync)                  |
| `async.mapErrAsync(fn)`    | Transform error (async)                 |
| `async.andThen(fn)`        | Monadic chain (sync or async callback)  |
| `async.orElse(fn)`         | Error recovery (sync or async callback) |
| `async.tap(fn)`            | Side-effect on success                  |
| `async.tapErr(fn)`         | Side-effect on failure                  |
| `async.match(onOk, onErr)` | Terminal pattern-match → `Promise<R>`   |
| `async.unwrapOr(default)`  | Safe extraction → `Promise<T>`          |
| `async.toPromise()`        | Unwrap to `Promise<IResultOfT<T, E>>`   |

`AsyncResult` implements the **thenable protocol** — you can `await` it directly and get the inner `IResultOfT<T, E>`:

```ts
const result: IResultOfT<User, AppError> = await AsyncResult.tryCatch(() => fetchUser('42'));
if (result.isSuccess) console.log(result.value.name);
```

## :triangular_ruler: FP Async (`@sandlada/result/fp/promise`)

Data-last curried operators for async Results, mirroring the sync FP module:

```ts
import { asyncOk, asyncErr, map, bind, pipeAsync } from '@sandlada/result/fp/promise';

const process = pipeAsync(
    asyncOk(42),
    map(x => x * 2),                          // sync transform
    bind(x => asyncOk(String(x))),            // async chain
    map(s => `value: ${s}`),                   // final transform
);
// process: Promise<IResultOfT<string, never>>
```

| Export          | Description                              |
| --------------- | ---------------------------------------- |
| `asyncOk(v)`    | Create async success                     |
| `asyncErr(e)`   | Create async failure                     |
| `map`           | Transform success (curried, data-last)   |
| `mapAsync`      | Async transform success                  |
| `mapErr`        | Transform error (curried)                |
| `mapErrAsync`   | Async transform error                    |
| `bind`          | Monadic chain (curried)                  |
| `orElse`        | Error recovery (curried)                 |
| `match`         | Terminal pattern-match (curried)         |
| `tap`           | Side-effect on success (curried)         |
| `tapErr`        | Side-effect on failure (curried)         |
| `unwrapOr`      | Safe extraction (curried)                |
| `pipeAsync`     | Async pipeline (1–6 overloads)           |
| `composeKAsync` | Kleisli composition for async switch fns |
| `switchFnAsync` | 1-track → 2-track async adapter          |
| `teeAsync`      | dead-end → 1-track async adapter         |

## :twisted_rightwards_arrows: Two Styles, One Library

```ts
import { Result } from '@sandlada/result';
import { map, bind, pipe } from '@sandlada/result/fp';

const r = Result.Success(42);

// OOP — fluent chaining
r.map(x => x * 2).andThen(x => Result.Success(x + 1));

// FP — data-last curried with pipe
pipe(r, map(x => x * 2), bind(x => Result.Success(x + 1)));

// Mix & match — both produce identical IResultOfT objects
```

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

- [SPEC.md](./SPEC.md) — complete API reference including async/Promise modules
- [blog.md](./blog.md) — the full development story (Chinese)

## :package: Package Exports

| Import path                   | Contents                              |
| ----------------------------- | ------------------------------------- |
| `@sandlada/result`            | Core types, `Result` class, factories |
| `@sandlada/result/fp`         | FP curried operators & combinators    |
| `@sandlada/result/promise`    | `AsyncResult` class (OOP async)       |
| `@sandlada/result/fp/promise` | FP async curried operators            |

## License

MIT
