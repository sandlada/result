# @sandlada/result

![NPM Downloads](https://img.shields.io/npm/d18m/@sandlada/result?label=NPM%20Downloads&labelColor=%2300531f&color=%23a3f5aa)
![NPM Version](https://img.shields.io/npm/v/%40sandlada%2Fresult?label=NPM%20Version&labelColor=%2300531f&color=%23a3f5aa)
![GitHub License](https://img.shields.io/github/license/sandlada/result?label=License&labelColor=%2300531f&color=%23a3f5aa)

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a type-safe, exception-free approach to error handling. It makes error flows explicit in the type system so you never wonder whether a function can fail.

Unlike traditional Result libraries that hardcode a single error type, `@sandlada/result` is **fully generic**: you bring your own error shapes (discriminated unions, classes, or plain objects).

## :zap: Highlights

- Fully generic `TError` — define your own error types
- **Pure FP** — data-last curried operators (`pipe`, `map`, `bind`) with discriminated union types
- **Option type** — `IOption<T>` (Some / None) with curried operators
- **Async-native** — `asyncOk`/`asyncErr` factories + `pipeAsync` for Promise-based railways
- **Railway Oriented Programming** built-in — `map`, `bind`, `orElse`, `match`, `tap`, `combine`
- **JSON serializable** — result and option objects survive `JSON.stringify`
- Zero dependencies
- ESM-only, strict TypeScript
- Inspired by the C# Result pattern and Rust's `Option<T>`

## :eyes: Installation

```bash
npm i @sandlada/result
```

> **ESM only.** This package cannot be used with `require()`. Your project must use ESM (`import`) or dynamic `import()`.

## :ship: Quick Start

```ts
import { ok, err, pipe, map, bind, unwrapOr } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';

// Define your error type (discriminated union recommended)
type AppError =
  | { kind: 'NotFound'; id: string }
  | { kind: 'Validation'; fields: Record<string, string> };

function getUser(id: string): IResultOfT<User, AppError> {
  if (!id) {
    return err<AppError>({ kind: 'Validation', fields: { id: 'Required' } })
      as IResultOfT<User, AppError>;
  }
  const user = db.find(id);
  if (!user) {
    return err<AppError>({ kind: 'NotFound', id })
      as IResultOfT<User, AppError>;
  }
  return ok(user);
}

// FP curried style
const name = pipe(
  getUser('42'),
  map(u => u.name),
  unwrapOr('Unknown'),
);
```

## :ledger: Core Types

### Result Interfaces (`@sandlada/result`)

| Export       | Kind | Signature                            | Description                         |
| ------------ | ---- | ------------------------------------ | ----------------------------------- |
| `IResult`    | type | `IResult<TError = Error>`            | Base result (success/failure union) |
| `IResultOfT` | type | `IResultOfT<TValue, TError = Error>` | Result carrying a success value     |

### FP Constructors & Operators (`@sandlada/result`)

| Export                 | Kind     | Description                                     |
| ---------------------- | -------- | ----------------------------------------------- |
| `ok`                   | function | Create success result                           |
| `err`                  | function | Create failure result                           |
| `tryCatch`             | function | Wrap a throwing function                        |
| `tryCatchAsync`        | function | Wrap an async throwing function                 |
| `fromPredicate`        | function | Create result from a predicate                  |
| `fromThrowable`        | function | Wrap a throwing function (typed)                |
| `fromSafePromise`      | function | Wrap a never-reject Promise into Result         |
| `map`                  | function | Transform success (data-last)                   |
| `mapErr`               | function | Transform error (data-last)                     |
| `bind`                 | function | Monadic chain (data-last)                       |
| `orElse`               | function | Error recovery (data-last)                      |
| `match`                | function | Terminal pattern-match (data-last)              |
| `tap`                  | function | Side-effect on success (data-last)              |
| `tapErr`               | function | Side-effect on failure (data-last)              |
| `andTee`               | function | Side-effect on success, ignores callback error  |
| `orTee`                | function | Side-effect on failure, ignores callback error  |
| `andThrough`           | function | Side-effect on success, propagates callback err |
| `unsafeUnwrap`         | function | Throws on failure (unconstrained E)             |
| `unsafeUnwrapErr`      | function | Throws on success (unconstrained E)             |
| `unwrapOr`             | function | Safe extraction with default (data-last)        |
| `unwrap`               | function | Extract value or throw (data-last)              |
| `unwrapErr`            | function | Extract error or throw (data-last)              |
| `flatten`              | function | Flatten nested result (data-last)               |
| `bimap`                | function | Transform both success and error (data-last)    |
| `safeTry`              | function | Generator-based yield* error propagation        |
| `fromSafeTry`          | function | Evaluates a safeTry generator                   |
| `combine`              | function | Combine results, short-circuit on first failure |
| `all`                  | function | Combine heterogeneous tuple                     |
| `combineWithAllErrors` | function | Accumulate all errors                           |
| `pipe`                 | function | Left-to-right pipeline (1–10 overloads)         |
| `composeK`             | function | Kleisli composition (2–6 overloads)             |

### Async Operators (`@sandlada/result`)

| Export          | Description                         |
| --------------- | ----------------------------------- |
| `asyncOk(v)`    | Create async success                |
| `asyncErr(e)`   | Create async failure                |
| `mapAsync`      | Async transform success             |
| `mapErrAsync`   | Async transform error               |
| `bindAsync`     | Async monadic chain                 |
| `orElseAsync`   | Async error recovery                |
| `matchAsync`    | Async terminal pattern-match        |
| `tapAsync`      | Async side-effect on success        |
| `tapErrAsync`   | Async side-effect on failure        |
| `unwrapOrAsync` | Async safe extraction with default  |
| `pipeAsync`     | Async pipeline (1–10 overloads)     |
| `composeKAsync` | Kleisli composition (2–6 overloads) |

### FP Option (`@sandlada/result/option`)

| Export      | Description                                   |
| ----------- | --------------------------------------------- |
| `ofSome`    | Create Some (wraps a value)                   |
| `ofNone`    | Create None (no value)                        |
| `map`       | Transform value if Some (curried)             |
| `andThen`   | Monadic chain (curried)                       |
| `orElse`    | Fall back to alternative if None (curried)    |
| `match`     | Terminal pattern-match (curried)              |
| `tap`       | Side-effect on Some (curried)                 |
| `unwrapOr`  | Safe extraction with default (curried)        |
| `filter`    | Keep Some only if predicate matches (curried) |
| `okOr`      | Option → Result with default error (curried)  |
| `okOrElse`  | Option → Result with lazy error (curried)     |
| `transpose` | Transpose Option<Result> → Result<Option>     |
| `flatten`   | Flatten nested option (curried)               |
| `contains`  | Check if Some matches value (curried)         |

### Conversion Adapters

| Export       | Description                               |
| ------------ | ----------------------------------------- |
| `toOption`   | Convert `IResultOfT<T, E>` → `IOption<T>` |
| `fromOption` | Convert `IOption<T>` → `IResultOfT<T, E>` |
| `switchFn`   | Branch on result state (data-last)        |
| `liftMap`    | Lift a function into the result context   |
| `tee`        | Dead-end → 1-track adapter                |

### Const & Destruct Pattern

All result and option values are **plain objects** with an `isSuccess` / `isSome` discriminant:

```ts
if (result.isSuccess) {
    console.log(result.value);  // ✓ type-safe after narrowing
} else {
    console.log(result.error);  // ✓ type-safe after narrowing
}
```

## :black_circle: Option — Optional Value (`@sandlada/result/option`)

`IOption<T>` represents an optional value — either `Some(value)` or `None`. Inspired by Rust's `Option<T>` and F#'s `'a option`, it shares the same discriminated-union design as results.

```ts
import { ofSome, ofNone, pipe } from '@sandlada/result/option';

// Create
const some = ofSome(42);
const none = ofNone();

// Curried operators
import { map, match, unwrapOr } from '@sandlada/result/option';

const label = pipe(
    ofSome(5),
    map(x => x * 2),
    match(
        (v: number) => `Got: ${v}`,
        () => 'Nothing',
    ),
);
// "Got: 10"

// JSON-safe
JSON.stringify(ofSome('hello')); // '{"isSome":true,"value":"hello"}'
JSON.stringify(ofNone());        // '{"isSome":false}'
```

### Option Operators (all curried)

| Export     | Description                                |
| ---------- | ------------------------------------------ |
| `ofSome`   | Create Some (wraps a value)                |
| `ofNone`   | Create None (no value)                     |
| `map`      | Transform value if Some, pass through None |
| `andThen`  | Chain an Option-returning function (bind)  |
| `orElse`   | Fall back to alternative if None           |
| `match`    | Terminal — pattern-match both cases        |
| `tap`      | Side-effect on Some                        |
| `unwrapOr` | Safe extraction with default               |
| `filter`   | Keep Some only if predicate matches        |
| `flatten`  | Flatten nested option                      |
| `contains` | Check if Some matches value                |

## :hourglass: Async Result Pattern (`@sandlada/result`)

When working with `Promise`-based APIs, use the async factories and operators from the FP module. All async operators append `Async` suffix to their sync counterparts.

```ts
import { asyncOk, asyncErr, pipeAsync, mapAsync, bindAsync, matchAsync } from '@sandlada/result';

const result = await pipeAsync(
    asyncOk(42),
    mapAsync((x: number) => x * 2),                 // sync transform
    bindAsync((x: number) => asyncOk(String(x))),   // async chain
    matchAsync(
        (v: string) => `value: ${v}`,
        (e: unknown) => `error: ${String(e)}`,
    ),
);
// result: "value: 84"
```

| Export          | Description                         |
| --------------- | ----------------------------------- |
| `asyncOk(v)`    | Create async success                |
| `asyncErr(e)`   | Create async failure                |
| `mapAsync`      | Async transform success             |
| `mapErrAsync`   | Async transform error               |
| `bindAsync`     | Async monadic chain                 |
| `orElseAsync`   | Async error recovery                |
| `matchAsync`    | Async terminal pattern-match        |
| `tapAsync`      | Async side-effect on success        |
| `tapErrAsync`   | Async side-effect on failure        |
| `unwrapOrAsync` | Async safe extraction with default  |
| `pipeAsync`     | Async pipeline (1–10 overloads)     |
| `composeKAsync` | Kleisli composition (2–6 overloads) |
| `switchFnAsync` | 1-track → 2-track async adapter     |
| `teeAsync`      | dead-end → 1-track async adapter    |
| `asyncMap`      | Map sync Result with async callback |
| `asyncAndThen`  | Chain sync Result with async fn     |

### tryCatchAsync & fromPromise

```ts
import { tryCatchAsync, fromPromise } from '@sandlada/result';

const userResult: Promise<IResultOfT<User, AppError>> = tryCatchAsync(
    () => fetch('/api/user/42').then(r => r.json()),
    (e) => ({ kind: 'ApiError' as const, message: String(e) }),
);
```

## :package: Integration Pattern

Bind your error type once and eliminate generic boilerplate:

```ts
// app-result.ts
import { ok, err } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';
import type { AppError } from './errors.js';

export type AppResult<T = void> = IResultOfT<T, AppError>;

export const AppResult = {
  Success(): AppResult<void> { return ok() as unknown as AppResult<void>; },
  Success<T>(value: T): AppResult<T> { return ok(value) as unknown as AppResult<T>; },
  Failure(error: AppError): AppResult<never> { return err(error) as unknown as AppResult<never>; },
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

Or simply use a type alias with FP operators:

```ts
type AppResult<T = void> = IResultOfT<T, AppError>;

function getUser(id: string): AppResult<User> {
  return ok({ id, name: 'Alice' });
}

const name = pipe(getUser('42'), map(u => u.name), unwrapOr('Unknown'));
```

## :ledger: Further Reading

- [SPEC.md](./SPEC.md) — complete API reference including async/Promise modules
- [blog.md](./blog.md) — the full development story (Chinese)

## :package: Package Exports

| Import path               | Contents                                        |
| ------------------------- | ----------------------------------------------- |
| `@sandlada/result`        | Core types (`IResult`, `IResultOfT`, `IOption`) |
| `@sandlada/result`        | FP constructors, operators & combinators        |
| `@sandlada/result/option` | FP option operators                             |

## License

MIT
