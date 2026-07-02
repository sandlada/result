# SPEC

## Overview

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a type-safe, exception-free approach to error handling. It provides `IResult` interfaces and `Result` classes that make error flows explicit in the type system, inspired by C# Result pattern libraries but with **fully generic, user-definable error types**.

## Installation

```bash
npm install @sandlada/result
```

> **Module system:** This package is **ESM-only** (`"type": "module"`). It cannot be used with `require()`. Your project must use ESM (`import`) or enable dynamic `import()` in CJS contexts.

### Import Paths

| Sub-path       | Import                                                        | Description             |
| -------------- | ------------------------------------------------------------- | ----------------------- |
| `.` (default)  | `import { Result, Option } from '@sandlada/result'`           | OOP API, all core types |
| `./fp`         | `import { ok, err, pipe } from '@sandlada/result/fp'`         | FP sync operators       |
| `./fp/option`  | `import { ofSome, map } from '@sandlada/result/fp/option'`    | FP option operators     |
| `./promise`    | `import { AsyncResult } from '@sandlada/result/promise'`      | Async OOP API           |
| `./fp/promise` | `import { asyncOk, bind } from '@sandlada/result/fp/promise'` | FP async operators      |
| `./option`     | `import { Option } from '@sandlada/result/option'`            | Option type (direct)    |

## Core Types

### `IResult<TError = Error>`

The base result contract. Every result has an error and a success/failure status.

```ts
interface IResult<TError = Error> {
    readonly error: TError;
    readonly isSuccess: boolean;
    readonly isFailure: boolean;
}
```

- `error` — always accessible. On success, returns an internal sentinel; check `isSuccess` before interpreting.
- `isSuccess` — `true` if the operation succeeded.
- `isFailure` — `true` if the operation failed (computed as `!isSuccess`).

### `IResultOfT<TValue, TError = Error>`

A result that carries a **success value**.

```ts
interface IResultOfT<TValue, TError = Error> extends IResult<TError> {
    readonly value: TValue;
}
```

- `value` — the success payload. **Throws `TypeError`** if accessed on a failure result.

### Default Error Type

When `TError` is omitted, it defaults to `Error`:

```ts
const result: IResult = Result.Failure(new Error('fail'));       // IResult<Error>
const result: IResultOfT<string> = Result.Success('hello');         // IResultOfT<string, Error>
```

## API Reference

The package exports the following symbols. The default entry (`@sandlada/result`) provides the OOP API; the `@sandlada/result/fp` sub-path provides the functional API.

### Default Export (`@sandlada/result`)

| Export       | Kind      | Signature                                                      | Description                                  |
| ------------ | --------- | -------------------------------------------------------------- | -------------------------------------------- |
| `IResult`    | interface | `IResult<TError = Error>`                                      | Base result contract (no value)              |
| `IResultOfT` | interface | `IResultOfT<TValue, TError = Error>` extends `IResult<TError>` | Value-bearing result contract                |
| `Result`     | class     | `Result<TError = Error>` implements `IResult<TError>`          | Base class with static factories + utilities |
| `ResultOfT`  | class     | `ResultOfT<TValue, TError = Error>`                            | Generic result with value + fluent methods   |
| `Option`     | class     | `Option<T>` with static `Some(value)` / `None()`               | Optional value: Some(value) or None          |
| `IOption`    | type      | `IOption<T> = IOptionSome<T> \| IOptionNone`                   | Discriminated union for Option               |

### FP Export (`@sandlada/result/fp`)

| Export                 | Kind     | Signature                                              | Description                             |
| ---------------------- | -------- | ------------------------------------------------------ | --------------------------------------- |
| `ok`                   | function | `ok(): IResult` / `ok<T>(value: T): IResultOfT<T>`     | Create success result                   |
| `err`                  | function | `err<E>(error: E): IResultOfT<never, E>`               | Create failure result                   |
| `map`                  | function | `map<A,B>(f, r?)` (data-last curried)                  | Transform success value                 |
| `mapErr`               | function | `mapErr<E,F>(f, r?)` (data-last curried)               | Transform error                         |
| `bind`                 | function | `bind<A,B,F>(f, r?)` (data-last curried)               | Monadic bind (chain)                    |
| `orElse`               | function | `orElse<E,B,F>(f, r?)` (data-last curried)             | Error recovery                          |
| `match`                | function | `match<A,E,C>(onOk, onErr, r?)` (data-last curried)    | Terminal pattern-match                  |
| `tap`                  | function | `tap<A>(fn, r?)` (data-last curried)                   | Side-effect on success                  |
| `tapErr`               | function | `tapErr<E>(fn, r?)` (data-last curried)                | Side-effect on failure                  |
| `unwrapOr`             | function | `unwrapOr<A>(defaultValue, r?)` (data-last curried)    | Safe extraction with default            |
| `pipe`                 | function | `pipe(value, ...fns)` (1–10 typed overloads)           | Left-to-right pipeline                  |
| `composeK`             | function | `composeK(f1, f2, ...)` (Kleisli `>=>`, 2–6 overloads) | Compose switch functions                |
| `switchFn`             | function | `switchFn(f)`                                          | 1-track → switch adapter                |
| `liftMap`              | function | `liftMap(f, r?)` (alias for `map`)                     | 1-track → 2-track adapter               |
| `tee`                  | function | `tee(f)`                                               | Dead-end → 1-track adapter              |
| `combine`              | function | `combine(results[])`                                   | Combine array, short-circuit first fail |
| `all`                  | function | `all(tuple)`                                           | Combine tuple, preserve types           |
| `combineWithAllErrors` | function | `combineWithAllErrors(results[])`                      | Combine array, accumulate all errors    |

### FP Option Export (`@sandlada/result/fp/option`)

| Export     | Kind     | Signature                                       | Description                      |
| ---------- | -------- | ----------------------------------------------- | -------------------------------- |
| `ofSome`   | function | `ofSome<T>(value: T): IOption<T>`               | Create Some (contains a value)   |
| `ofNone`   | function | `ofNone(): IOption<never>`                      | Create None (no value)           |
| `map`      | function | `map<T,U>(fn): (IOption<T>) => IOption<U>`      | Transform value if Some          |
| `andThen`  | function | `andThen<T,U>(fn): (IOption<T>) => IOption<U>`  | Monadic bind (chain)             |
| `orElse`   | function | `orElse<T>(fn): (IOption<T>) => IOption<T>`     | Fall back to alternative if None |
| `match`    | function | `match<T,U>(onSome, onNone): (IOption<T>) => U` | Terminal pattern-match           |
| `tap`      | function | `tap<T>(fn): (IOption<T>) => IOption<T>`        | Side-effect on Some              |
| `unwrapOr` | function | `unwrapOr<T>(defaultValue): (IOption<T>) => T`  | Safe extraction with default     |

### Promise Export (`@sandlada/result/promise`)

| Export        | Kind  | Signature                             | Description                                |
| ------------- | ----- | ------------------------------------- | ------------------------------------------ |
| `AsyncResult` | class | `AsyncResult<TValue, TError = Error>` | Lazy `Promise<IResultOfT>` with fluent API |

### FP Promise Export (`@sandlada/result/fp/promise`)

| Export          | Kind     | Signature                                                   | Description                          |
| --------------- | -------- | ----------------------------------------------------------- | ------------------------------------ |
| `asyncOk`       | function | `asyncOk<T>(value: T): AsyncResult<T, never>`               | Create success `AsyncResult`         |
| `asyncErr`      | function | `asyncErr<E>(error: E): AsyncResult<never, E>`              | Create failure `AsyncResult`         |
| `map`           | function | `map<A,B>(f, r?)` (data-last curried)                       | Sync transform success value         |
| `mapAsync`      | function | `mapAsync<A,B>(f, r?)` (data-last curried)                  | Async transform success value        |
| `mapErr`        | function | `mapErr<E,F>(f, r?)` (data-last curried)                    | Sync transform error                 |
| `mapErrAsync`   | function | `mapErrAsync<E,F>(f, r?)` (data-last curried)               | Async transform error                |
| `bind`          | function | `bind<A,B,F>(f, r?)` (data-last curried)                    | Monadic bind (chain)                 |
| `orElse`        | function | `orElse<E,B,F>(f, r?)` (data-last curried)                  | Error recovery                       |
| `match`         | function | `match<A,E,C>(onOk, onErr, r?)` (data-last curried)         | Terminal pattern-match               |
| `tap`           | function | `tap<A>(fn, r?)` (data-last curried)                        | Side-effect on success               |
| `tapErr`        | function | `tapErr<E>(fn, r?)` (data-last curried)                     | Side-effect on failure               |
| `unwrapOr`      | function | `unwrapOr<A>(defaultValue, r?)` (data-last curried)         | Safe extraction with default         |
| `pipeAsync`     | function | `pipeAsync(value, ...fns)` (1–10 typed overloads)           | Left-to-right async pipeline         |
| `composeKAsync` | function | `composeKAsync(f1, f2, ...)` (Kleisli `>=>`, 2–6 overloads) | Compose async switch functions       |
| `switchFnAsync` | function | `switchFnAsync(f)`                                          | 1-track async → async switch adapter |
| `teeAsync`      | function | `teeAsync(f)`                                               | Async dead-end → 1-track adapter     |

### `Result<TError = Error>`

```ts
class Result<TError = Error> implements IResult<TError> {
    readonly isSuccess: boolean;
    readonly error: TError;
    protected constructor(isSuccess: boolean, error?: TError);

    get isFailure(): boolean;  // !isSuccess

    static Success(): IResult;
    static Success<TValue>(value: TValue): IResultOfT<TValue>;
    static Failure(error: Error): IResult;
    static Failure<TValue, TError>(error: TError): IResultOfT<TValue, TError>;
}
```

- **Constructor is `protected`** — always use static factories, never `new Result(...)`.
- **`Result.Failure()` with no argument** throws `TypeError`.
- **Invariant violation** (success with real error, or failure with sentinel) throws `TypeError`.

### `ResultOfT<TValue, TError = Error>`

```ts
class ResultOfT<TValue, TError = Error>
    implements IResultOfT<TValue, TError>
{
    constructor(value?: TValue, isSuccess?: boolean, error?: TError);

    get value(): TValue;  // throws TypeError if isFailure
    toJSON(): { isSuccess: true; value: TValue } | { isSuccess: false; error: TError };
}
```

- **`value` getter** throws `TypeError` with message `"Cannot access value on a failure result. Check isSuccess before accessing value."` when accessed on a failure.
- **`toJSON()`** serializes to a plain object for use with `JSON.stringify`.

---

## Option — Optional Value Type

`@sandlada/result` includes an `Option<T>` type (inspired by Rust's `Option<T>` and
F#'s `'a option`) alongside the Result types. Import from the main entry or the
`./option` sub-path:

```ts
import { Option } from '@sandlada/result';
// or
import { Option } from '@sandlada/result/option';
import type { IOption, IOptionSome, IOptionNone } from '@sandlada/result/option';
```

### `IOption<T>`

A discriminated union of `IOptionSome<T> | IOptionNone`. Use `isSome` to narrow:

```ts
function describe(opt: IOption<number>): string {
    if (opt.isSome) return `Got: ${opt.value}`;   // narrowed to Some
    return 'Nothing';                              // narrowed to None
}
```

### `Option<T>` — Static Factories

| Factory            | Returns          | Description          |
| ------------------ | ---------------- | -------------------- |
| `Option.Some(val)` | `IOption<T>`     | Wrap a value         |
| `Option.None()`    | `IOption<never>` | Create an empty None |

### `Option<T>` — Instance Methods

All methods return `IOption<...>` (the interface), not the concrete class.

| Method                       | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `opt.map(fn)`                | Transform value if Some, pass through None                  |
| `opt.andThen(fn)`            | Chain an Option-returning function (bind)                   |
| `opt.orElse(fn)`             | Fall back to alternative if None                            |
| `opt.match(onSome, onNone)`  | Terminal — pattern-match both cases                         |
| `opt.tap(fn)`                | Side-effect on Some, returns `this`                         |
| `opt.unwrapOr(defaultValue)` | Safe extraction with default                                |
| `opt.toJSON()`               | Serialize: `{ isSome: true, value }` or `{ isSome: false }` |

### FP Option (`@sandlada/result/fp/option`)

Data-last curried operators for use with `pipe`:

```ts
import { ofSome, ofNone, map, andThen, orElse, match, tap, unwrapOr } from '@sandlada/result/fp/option';

pipe(
    ofSome(5),
    map(x => x * 2),
    andThen(x => x > 5 ? ofSome(x) : ofNone()),
    unwrapOr(0),
); // 10
```

---

## Factory Methods

All factory methods live on the `Result` class.

### `Result.Success()`

Creates a success result with no value.

```ts
const ok = Result.Success();
ok.isSuccess; // true
ok.isFailure; // false
```

### `Result.Failure(error)`

Creates a failure result. **The non-generic overload only accepts `Error` instances.** For custom error types (plain objects, discriminated unions, etc.), use the two-parameter generic `Result.Failure<TValue, TError>(error)` overload instead.

> **Note:** TypeScript uses structural typing, so objects with `message: string` / `name: string` are assignable to `Error` at the type level. The non-generic overload is intended for actual `Error` instances; the library does not perform runtime `instanceof` checks.

```ts
const err = Result.Failure(new Error('Something went wrong'));
err.isSuccess; // false
err.error.message; // 'Something went wrong'
```

### `Result.Success<TValue>(value)`

Creates a success result carrying a value. The type is inferred from the argument.

```ts
const ok = Result.Success({ id: 1, name: 'Alice' });
// IResultOfT<{ id: number; name: string }>
ok.value.name; // 'Alice'
```

### `Result.Failure<TValue, TError>(error)`

Creates a failure result with a typed error. `TValue` must be explicitly specified (there is no value to infer it from); `TError` is inferred from the argument.

```ts
type ApiError = { status: number; message: string };

const err = Result.Failure<string, ApiError>({
    status: 404,
    message: 'User not found',
});
// IResultOfT<string, ApiError>
```

## OOP Fluent API

`ResultOfT` instances provide fluent methods for chaining operations. All methods
return `IResultOfT<...>` (the interface).

### `result.map(fn)`

Transform the success value. On failure, passes through unchanged.

```ts
const r = Result.Success(21);
r.map(x => x * 2); // IResultOfT<42, Error>
```

### `result.mapErr(fn)`

Transform the error. On success, passes through unchanged.

```ts
const r = Result.Failure<number>('bad');
r.mapErr(e => ({ code: 500, message: e })); // IResultOfT<number, { code: number; message: string }>
```

### `result.andThen(fn)`

Monadic bind — chain a result-returning function. On failure, short-circuits.

```ts
Result.Success(21)
  .andThen(x => x > 10 ? Result.Success(x * 2) : Result.Failure<number>('too small'));
// IResultOfT<42, Error>
```

### `result.orElse(fn)`

Error recovery — try an alternative path on failure.

```ts
Result.Failure<User>('not found')
  .orElse(() => Result.Success({ id: 0, name: 'Anonymous' }));
// IResultOfT<User, Error>
```

### `result.match(onSuccess, onFailure)`

Terminal — pattern-match on both cases. Both callbacks must return the same type.

```ts
const message = result.match(
  v => `Got: ${v}`,
  e => `Error: ${e}`,
);
```

### `result.tap(fn)` / `result.tapErr(fn)`

Side-effects without changing the result. Returns `this` for chaining.

```ts
result
  .tap(v => console.log('Processing:', v))   // only on success
  .tapErr(e => logger.error(e))               // only on failure
  .andThen(process);
```

### `result.unwrapOr(defaultValue)`

Safe extraction — returns the value on success, or a default on failure. Never throws.

```ts
const name = result.unwrapOr('Unknown');
```

## Static Utilities

### `Result.tryCatch(fn, errorFn?)`

Wrap a synchronous function that may throw. Optionally map the caught error.

```ts
const parsed = Result.tryCatch(
  () => JSON.parse(input),
  (e) => ({ kind: 'ParseError' as const, raw: String(e) }),
);
```

### `Result.tryCatchAsync(fn, errorFn?)`

Wrap an **asynchronous** function that may throw. The returned `Promise` **always resolves** — rejected promises are caught and converted to failure results. This is the primary bridge between the `Promise` world and the `Result` world.

```ts
const user = await Result.tryCatchAsync(
  () => fetch('/api/user/42').then(r => r.json()),
  (e) => ({ kind: 'NetworkError' as const, cause: String(e) }),
);
// Promise<IResultOfT<User, { kind: 'NetworkError'; cause: string }>>
```

- If `fn` fulfills → `IResultOfT<T, E>` with `isSuccess: true`
- If `fn` rejects/throws → `IResultOfT<T, E>` with `isSuccess: false`
- `errorFn` is optional; when omitted, the caught value is cast directly to `E`
- TypeScript infers `T` from the function return, `E` from `errorFn` (or defaults to `Error`)

### `Result.fromPromise(promise, errorFn?)`

Convenience wrapper around `tryCatchAsync` for when you already have a `Promise<T>`.

```ts
const raw = fetch('/api/user/42').then(r => r.json()); // Promise<User>
const user = await Result.fromPromise(raw, (e) => ({ kind: 'FetchError', cause: String(e) }));
// Promise<IResultOfT<User, { kind: 'FetchError'; cause: string }>>
```

Delegates directly to `Result.tryCatchAsync(() => promise, errorFn)`.

### `Result.combine(results[])`

Combine an array of results — returns the first failure, or a success with all values.

```ts
const all = Result.combine([parseInt('1'), parseInt('2'), parseInt('x')]);
// all.isFailure === true, all.error is the parse error from 'x'
```

### `Result.all(tuple)`

Like `Promise.all` for Result — combine a tuple while preserving heterogeneous types.

```ts
const t = Result.all([ok(1), ok('hello'), ok(true)] as const);
// IResultOfT<[number, string, boolean], Error>
```

### `Result.combineWithAllErrors(results[])`

Combine results, accumulating **all** errors (validation aggregation).

```ts
const r = Result.combineWithAllErrors([
  validateName(''),    // failure
  validateEmail('x'),  // failure
  validateAge(25),     // success
]);
// r.isFailure === true, r.error.length === 2
```

## FP（函數式）模組

`@sandlada/result/fp` 提供 F# 風格的 pure functions，支援 data-last currying 與 `pipe` 組合。

### 建構子

```ts
import { ok, err } from '@sandlada/result/fp';

const success = ok(42);           // IResultOfT<number>
const failure = err('bad input');  // IResultOfT<never, string>
```

### Data-Last Curried 運算子

所有運算子支援 partial application：

```ts
import { map, bind, match } from '@sandlada/result/fp';

const double = map((x: number) => x * 2);  // 部分應用
const result = double(ok(21));              // ok(42)
```

### Pipe 組合

```ts
import { ok, err, map, bind, match, pipe } from '@sandlada/result/fp';

type AppErr = { kind: 'TooSmall'; value: number };

const process = (n: number) =>
  pipe(
    ok(n),
    map(x => x * 2),
    bind(x => x > 100 ? ok(x) : err<AppErr>({ kind: 'TooSmall', value: x })),
    match(
      v => `Success: ${v}`,
      e => `Failed: ${e.kind}`,
    ),
  );

process(60); // "Success: 120"
process(30); // "Failed: TooSmall"
```

### Kleisli Composition (`composeK`)

```ts
import { composeK } from '@sandlada/result/fp';

const validate = composeK(parseInput, checkBusinessRules);
// validate: (input: string) => IResultOfT<Output, Error>
```

### Adapters (Wlaschin Three-Shape System)

```ts
import { switchFn, liftMap, tee } from '@sandlada/result/fp';

// switchFn: plain function → switch function
const safeParse = switchFn(JSON.parse);
// safeParse: (text: string) => IResultOfT<unknown, never>

// tee: dead-end side-effect on plain value
const log = tee((x: unknown) => console.log('Got:', x));
```

### OOP ↔ FP 互通

兩種風格可以混合使用，因為它們操作相同的 `IResultOfT` 物件：

```ts
import { Result } from '@sandlada/result';
import { map, bind } from '@sandlada/result/fp';

const r = Result.Success(42);
r.map(x => x * 2);                       // OOP
pipe(r, map(x => x * 2));                // FP, 相同 r
```

## AsyncResult (`@sandlada/result/promise`)

`AsyncResult` 是一個 lazy 的 `Promise<IResultOfT<TValue, TError>>`，提供與
`ResultOfT` 一致的流暢 API。它可以被直接 `await`，回傳底層的 `IResultOfT`。

### 導入

```ts
import { AsyncResult } from '@sandlada/result/promise';
```

### 靜態工廠（camelCase）

| Factory                      | Returns                 | Description                               |
| ---------------------------- | ----------------------- | ----------------------------------------- |
| `AsyncResult.success()`      | `AsyncResult<void>`     | 建立 void success                         |
| `AsyncResult.success(value)` | `AsyncResult<T>`        | 建立攜帶值的 success                      |
| `AsyncResult.failure(error)` | `AsyncResult<never, E>` | 建立 failure                              |
| `AsyncResult.tryCatch(fn)`   | `AsyncResult<T, E>`     | 包裝 async function，catch rejection      |
| `AsyncResult.from(result)`   | `AsyncResult<T, E>`     | 將 sync `IResultOfT` 提升至 `AsyncResult` |
| `AsyncResult.fromPromise(p)` | `AsyncResult<T, E>`     | 包裝現有 `Promise<T>`                     |

### 實例方法

```ts
// 轉換（回傳 AsyncResult）
asyncResult.map(fn)            // 同步轉換 success value
asyncResult.mapAsync(fn)       // 非同步轉換 success value，catch callback 例外
asyncResult.mapErr(fn)         // 同步轉換 error
asyncResult.mapErrAsync(fn)    // 非同步轉換 error，catch callback 例外

// 鏈接（回傳 AsyncResult，error type widening）
asyncResult.andThen(fn)        // monadic bind — fn 可回傳 AsyncResult 或 IResultOfT
asyncResult.orElse(fn)         // error recovery — fn 可回傳 AsyncResult 或 IResultOfT

// 副作用（回傳 AsyncResult）
asyncResult.tap(fn)            // success 副作用
asyncResult.tapErr(fn)         // failure 副作用

// 終端（回傳 Promise）
await asyncResult.match(onOk, onErr)  // pattern-match
await asyncResult.unwrapOr(def)       // safe extraction
await asyncResult.toPromise()         // escape hatch: Promise<IResultOfT>
```

### 直接 await

`AsyncResult` 實作了 thenable protocol，可以直接 await 取得 `IResultOfT`：

```ts
const r: IResultOfT<User, AppError> = await AsyncResult.tryCatch(() => fetchUser(id));
if (r.isSuccess) {
    console.log(r.value.name);
}
```

### 範例：Async Pipeline

```ts
const result = await AsyncResult.tryCatch(() => fetchUser(id))
    .mapAsync(user => enrichProfile(user))   // async transform
    .map(profile => profile.displayName)      // sync transform
    .andThen(name => validateName(name))      // chain to another AsyncResult
    .tapErr(e => logger.error(e));           // side-effect on error

// result: IResultOfT<string, ValidationError | NetworkError>
```

### 並行組合

```ts
// short-circuits on first failure
const all = await AsyncResult.combine([
    AsyncResult.tryCatch(() => fetch('/a')),
    AsyncResult.tryCatch(() => fetch('/b')),
]);

// accumulate all errors
const validated = await AsyncResult.combineWithAllErrors([
    validateName(name),
    validateEmail(email),
]);

// heterogeneous tuple
const t = await AsyncResult.all([
    AsyncResult.success(42),
    AsyncResult.success('hello'),
] as const);
```

## FP Async 模組 (`@sandlada/result/fp/promise`)

`./fp/promise` 提供 data-last curried 風格的 async 運算子，對應 sync `./fp`。

```ts
import {
    asyncOk, asyncErr,
    map, mapAsync, mapErr, mapErrAsync,
    bind, orElse, match, tap, tapErr, unwrapOr,
    composeKAsync, pipeAsync,
    switchFnAsync, teeAsync,
} from '@sandlada/result/fp/promise';
```

### 建構子

```ts
const ok = asyncOk(42);         // AsyncResult<number, never>
const err = asyncErr('bad');    // AsyncResult<never, string>
```

### 運算子（Data-Last Curried）

```ts
const double = map((x: number) => x * 2);   // 部分應用
const r = await double(asyncOk(21));         // AsyncResult<42, never>

const fetchLen = mapAsync(async (url: string) => fetch(url).then(r => r.json()));
```

### Pipe 組合

```ts
await pipeAsync(
    asyncOk(42),
    map(x => x * 2),
    bind(x => x > 50 ? asyncOk(x) : asyncErr('too small')),
    match(v => `OK: ${v}`, e => `Error: ${e}`),
);
```

### Kleisli Composition

```ts
const validate = composeKAsync(parseInput, checkBusinessRules);
// validate: (input: string) => AsyncResult<Output, Error>
```

## Custom Error Types

The library's key differentiator: **you define your own error shapes**.

### Discriminated Union (Recommended)

Use a tagged union for exhaustiveness checking:

```ts
type AppError =
    | { kind: 'NotFound'; resource: string; id: string }
    | { kind: 'Validation'; fields: Record<string, string> }
    | { kind: 'Unauthorized'; reason: string };

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
            resource: 'User',
            id,
        });
    }
    return Result.Success(user);
}
```

Consuming with exhaustiveness:

```ts
const result = getUser('42');
if (result.isFailure) {
    switch (result.error.kind) {
        case 'NotFound':
            console.log(`Missing ${result.error.resource} ${result.error.id}`);
            break;
        case 'Validation':
            console.log('Invalid input', result.error.fields);
            break;
        case 'Unauthorized':
            console.log('Access denied:', result.error.reason);
            break;
    }
}
```

### Class-Based Errors

Use custom error classes for structured error metadata:

```ts
class DomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
    ) {
        super(message);
        this.name = 'DomainError';
    }
}

function validateEmail(email: string): IResultOfT<string, DomainError> {
    if (!email.includes('@')) {
        return Result.Failure<string, DomainError>(
            new DomainError('Invalid email format', 'INVALID_EMAIL'),
        );
    }
    return Result.Success(email);
}
```

### Plain Objects (Quick)

For simple cases, pass any object as the error:

```ts
const result = Result.Failure<number>({ reason: 'timeout', retryAfter: 5000 });
// result.error.reason === 'timeout'
// result.error.retryAfter === 5000
```

## Result 集成 — 預先綁定錯誤類型

當一個項目或第三方套件使用固定的錯誤類型時，每次都寫 `IResultOfT<T, MyError>` 和 `Result.Failure<T, MyError>(...)` 會很繁瑣。`@sandlada/result` 的泛型設計天然支援**兩層封裝**來消除重複。

### 方案一：型別別名（Type Alias）

最輕量的方式，只需一個型別別名：

```ts
// app-result.ts
import type { IResultOfT } from '@sandlada/result';
import type { AppError } from './errors';

export type AppResult<T = void> = IResultOfT<T, AppError>;
```

使用時無需指定 `TError`：

```ts
import type { AppResult } from './app-result';

function createUser(data: UserInput): AppResult<User> {
    // AppResult<User> 等價於 IResultOfT<User, AppError>
}
```

但工廠方法仍然需要顯式標註 — `Result.Failure<User, AppError>(...)` 無法省去。

### 方案二：便利工廠（Convenience Factory）

進一步封裝一個**同名工廠物件**，將錯誤型別綁定到 `Success`/`Failure` 中：

```ts
// app-result.ts
import { Result } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';
import type { AppError } from './errors';

export type AppResult<T = void> = IResultOfT<T, AppError>;

export const AppResult = {
    /** 建立不帶值的成功結果 */
    Success(): AppResult<void> {
        return Result.Success() as AppResult<void>;
    },
    /** 建立帶值的成功結果 */
    Success<T>(value: T): AppResult<T> {
        return Result.Success(value) as AppResult<T>;
    },
    /** 建立失敗結果 (never 表示無值) */
    Failure(error: AppError): AppResult<never> {
        return Result.Failure<never, AppError>(error) as AppResult<never>;
    },
} as const;
```

現在無需指定任何泛型參數：

```ts
import { AppResult } from './app-result';

function getUser(id: string): AppResult<User> {
    if (!id) {
        return AppResult.Failure({
            kind: 'Validation',
            fields: { id: 'Required' },
        });
    }
    const user = db.find(id);
    if (!user) {
        return AppResult.Failure({
            kind: 'NotFound',
            resource: 'User',
            id,
        });
    }
    return AppResult.Success(user);
}
```

#### 進階：泛型推斷優化

若 `AppResult.Failure(...)` 的返回型別是 `AppResult<never>`，由於 `never` 是 bottom type，它在 TypeScript 中可賦值給任意 `AppResult<T>`。這意味以下代碼完全型別安全：

```ts
function tryParse(input: string): AppResult<number> {
    const n = Number(input);
    if (isNaN(n)) return AppResult.Failure({ kind: 'ParseError', input });
    return AppResult.Success(n);
    //        ^? AppResult<number>
    //  Failure 返回 AppResult<never> ✅ 可賦值給 AppResult<number>
}
```

#### 巢狀錯誤轉換

當使用不同錯誤型別的子系統互相調用時，在方案二的基礎上添加錯誤對映：

```ts
import type { IResultOfT } from '@sandlada/result';

/** 將子系統的錯誤轉換為當前系統的錯誤 */
function mapError<T>(result: IResultOfT<T, SubError>): AppResult<T> {
    if (result.isSuccess) return AppResult.Success(result.value);
    return AppResult.Failure(convertToAppError(result.error));
}

function process(): AppResult<Output> {
    const subResult = subSystem.doWork();
    return mapError(subResult);
}
```

### 何時使用哪種方案

| 場景                          | 方案一（Type Alias） | 方案二（Convenience Factory） |
| ----------------------------- | -------------------- | ----------------------------- |
| 僅宣告返回型別                | ✅ 足夠               | ✅ 更完整                      |
| 避免 `Failure<T, E>` 泛型標註 | ❌ 仍需手寫           | ✅ 無需泛型                    |
| 套件發佈給第三方使用          | ✅ 零依賴開銷         | ✅ 推薦                        |
| 團隊內部使用                  | ✅ 輕量               | ✅ 推薦                        |


## Consumption Patterns

### Branching

```ts
const result = someOperation();
if (result.isSuccess) {
    // TypeScript narrows: result.value is TValue
    processValue(result.value);
} else {
    // TypeScript knows: result.error is TError
    logError(result.error);
}
```

### Early Return / Error Propagation

```ts
function process(): IResultOfT<Output, AppError> {
    const userResult = fetchUser(id);
    if (userResult.isFailure) return userResult;

    const validated = validateEmail(userResult.value.email);
    if (validated.isFailure) return validated;

    return Result.Success(transform(validated.value));
}
```

### Type Narrowing

After checking `isSuccess`, TypeScript automatically narrows the type:

```ts
function handle(result: IResultOfT<string, AppError>) {
    if (result.isSuccess) {
        result.value.toUpperCase(); // ✅ string
    } else {
        // result.error is AppError — use discriminated union switch
    }
}
```

### Railway-Oriented Programming

`@sandlada/result` provides **built-in** operators for functional pipelines. Choose between **OOP fluent chaining** or **FP data-last curried** style — both are first-class.

#### OOP Style (Fluent Chaining)

```ts
type AppError =
    | { kind: 'ParseError'; raw: string }
    | { kind: 'InvalidRange'; min: number; max: number; actual: number };

function parse(input: string): IResultOfT<number, AppError> { /* ... */ }
function validateRange(min: number, max: number): (n: number) => IResultOfT<number, AppError> { /* ... */ }

const result = parse('21')
    .map(n => n * 2)
    .andThen(validateRange(1, 100))
    .andThen(save);
// Short-circuits on first failure
```

#### FP Style (Curried + Pipe)

```ts
import { ok, map, bind, pipe } from '@sandlada/result/fp';

const result = pipe(
    parse('21'),
    map(n => n * 2),
    bind(validateRange(1, 100)),
    bind(save),
);
```

### Multi-Layer Error Mapping

> **Note:** The `AppResult` / `DomainResult` / `InfraResult` factories shown below are **user-defined** convenience wrappers — not built into the library. See [方案二：便利工廠](#方案二便利工廠convenience-factory) for how to create them.

In layered architectures, each layer uses its own error type. Use error-mapping adapters to translate between layers:

```ts
// Layer 1: Domain
type DomainError =
    | { kind: 'NotFound'; entity: string; id: string }
    | { kind: 'Validation'; fields: Record<string, string> };

type DomainResult<T = void> = IResultOfT<T, DomainError>;

// Layer 2: Infrastructure
type InfraError =
    | { kind: 'DbTimeout'; duration: number }
    | { kind: 'ConnectionLost'; host: string };

type InfraResult<T = void> = IResultOfT<T, InfraError>;

// Layer 3: Application (wraps domain + infra)
type AppError =
    | { kind: 'Domain'; inner: DomainError }
    | { kind: 'Infrastructure'; inner: InfraError };

type AppResult<T = void> = IResultOfT<T, AppError>;

// Adapters: translate errors upward
function domainToApp<T>(r: DomainResult<T>): AppResult<T> {
    if (r.isSuccess) return AppResult.Success(r.value);
    return AppResult.Failure({ kind: 'Domain', inner: r.error });
}

function infraToApp<T>(r: InfraResult<T>): AppResult<T> {
    if (r.isSuccess) return AppResult.Success(r.value);
    return AppResult.Failure({ kind: 'Infrastructure', inner: r.error });
}

// Controller: chains domain → app → HTTP response
function getUserController(id: string): AppResult<HttpResponse> {
    const domainResult = userService.getUser(id);
    const appResult = domainToApp(domainResult);
    if (!appResult.isSuccess) return mapAppErrorToHttp(appResult.error);
    return AppResult.Success({ status: 200, data: appResult.value });
}
```

### Result Combining / Aggregation

`Result.combine` and `Result.combineWithAllErrors` are **built into the library** (see [Static Utilities](#static-utilities)). They are also available in FP style via `@sandlada/result/fp`.

#### Short-Circuit (First Failure Wins)

```ts
import { combine } from '@sandlada/result/fp';

const r = combine([validateName('Alice'), validateEmail('bad'), validateAge(-5)]);
// r.isFailure === true, r.error is the first validation error
```

#### Accumulate All Errors

```ts
import { combineWithAllErrors } from '@sandlada/result/fp';

type ValidationError = { field: string; message: string };

const r = combineWithAllErrors([
    validateName('Alice'),    // success
    validateEmail('bad'),     // failure → collected
    validateAge(-5),          // failure → collected
]);
// r.isFailure === true, r.error.length === 2
```

Or with OOP style:

```ts
const r = Result.combineWithAllErrors([
    validateName('Alice'),
    validateEmail('bad'),
    validateAge(-5),
]);
```

## C# Reference Comparison

This library is inspired by the C# Result pattern. Key differences:

| Concept           | C#                                                               | This Library                              |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| Base interface    | `IResult { DomainError Error; bool IsSuccess; bool IsFailure; }` | `IResult<TError = Error>`                 |
| Value interface   | `IResult<out T> : IResult { T Value; }`                          | `IResultOfT<TValue, TError = Error>`      |
| Error type        | `DomainError` (hardcoded enum)                                   | `TError` (generic, user-defined)          |
| No-error sentinel | `DomainError.General.None`                                       | `Symbol.for('result:none')` (internal)    |
| Void success      | `Result.Success()`                                               | `Result.Success()`                        |
| Void failure      | `Result.Failure(DomainError)`                                    | `Result.Failure(error)`                   |
| Value success     | `Result.Success<T>(T)`                                           | `Result.Success<T>(value)`                |
| Value failure     | `Result.Failure<T>(DomainError)`                                 | `Result.Failure<T, E>(error)`             |
| Convention        | PascalCase                                                       | PascalCase (static), camelCase (instance) |

### C# Reference Implementation

For comparison, the original C# pattern:

```cs
public interface IResult {
    DomainError Error { get; }
    bool IsSuccess { get; }
    bool IsFailure { get; }
}

public interface IResult<out T> : IResult {
    T Value { get; }
}

public class Result : IResult {
    public DomainError Error { get; }
    public bool IsSuccess { get; }
    public bool IsFailure => !this.IsSuccess;

    protected Result(bool isSuccess, DomainError error) {
        if (isSuccess && error != DomainError.General.None ||
            !isSuccess && error == DomainError.General.None) {
            throw new ArgumentException("Invalid error combination.", nameof(error));
        }
        this.IsSuccess = isSuccess;
        this.Error = error;
    }

    public static Result Success() =>
        new(true, DomainError.General.None);

    public static Result Failure(DomainError error) =>
        new(false, error);

    public static IResult<T> Success<T>(T value) =>
        new Result<T>(value, true, DomainError.General.None);

    public static IResult<T> Failure<T>(DomainError error) =>
        new Result<T>(default, false, error);
}

public class Result<TValue> : Result, IResult<TValue> {
    private readonly TValue? _value;

    public TValue Value => this.IsSuccess
        ? _value!
        : throw new InvalidOperationException(
            "The value of a failure result can not be accessed.");

    protected internal Result(TValue? value, bool isSuccess, DomainError error)
        : base(isSuccess, error) {
        _value = value;
    }
}
```

## TypeScript Design Decisions

- **Default `TError = Error`** — zero-config for simple use cases; override with custom types for domain-specific error handling.
- **Sentinel pattern** — `error` is always accessible (never throws), matching C# semantics where `Error` returns `DomainError.General.None` on success. The sentinel key is `Symbol.for('result:none')` (registered globally to survive module reloads).
- **`value` throws on failure** — guards against accidental access; forces explicit `isSuccess` checks. Throws `TypeError` with a descriptive message.
- **`Result` constructor is `protected`** — users cannot instantiate `Result` directly. The `ResultOfT` constructor is `public` (internal-use only, since `Result`'s static factories must call `new ResultOfT(...)`). Always use `Result.Success` / `Result.Failure`. The constructor enforces the mutual-exclusivity invariant, throwing `TypeError` on violation.
- **`Result.Failure()` requires an argument** — calling `Result.Failure()` with no arguments throws `TypeError`. Always provide an error object.
- **`null` and `undefined` are valid success values** — `Result.Success<number | null>(null)` and `Result.Success<number | undefined>(undefined)` are supported. The factory overload uses `arguments.length` to distinguish void-success (`Result.Success()`) from explicit-undefined-success (`Result.Success(undefined)`).
- **PascalCase static, camelCase instance** — static factory methods use PascalCase (`Result.Success`, `Result.Failure`) matching C# convention, while instance properties use camelCase (`isSuccess`, `isFailure`) following TypeScript convention.
- **`Result` base class is generic** — `Result<TError = Error>`, not non-generic. This ensures `error` is typed without casting in the base class.
- **`isFailure` is a getter** — implemented as `get isFailure(): boolean { return !this.isSuccess; }`, not a stored property. Ensures `isFailure` is always the logical negation of `isSuccess`.

