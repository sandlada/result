# SPEC

## Overview

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a functional error-handling primitive that makes error flows explicit and type-safe, replacing `throw`/`catch` for predictable failure paths.

The library provides:

- **`IResult<TError>`** — base contract: success/failure discriminated union (void result)
- **`IResultOfT<TValue, TError>`** — value-bearing result contract
- **`IOption<T>`** — optional value (Some/None discriminated union)
- **Standalone FP operators** — data-last curried functions for transforming results
- **Generic `TError`** — users define their own error types (key differentiator)

> **Key design choice:** No classes, no prototype methods, no sentinel values. Everything is built on **plain discriminated union objects** with standalone functions.

## Installation

```bash
npm install @sandlada/result
```

> **Module system:** This package is **ESM-only** (`"type": "module"`). It cannot be used with `require()`. Your project must use ESM (`import`) or enable dynamic `import()` in CJS contexts.

## Import Paths

| Entry point     | Import                                                     | Description               |
| --------------- | ---------------------------------------------------------- | ------------------------- |
| `.` (default)   | `import { ok, pipe, map } from '@sandlada/result'`         | All exports (main barrel) |
| `./types`       | `import type { IResultOfT } from '@sandlada/result/types'` | Type definitions only     |
| `./factories`   | `import { ok, err } from '@sandlada/result/factories'`     | Core constructors         |
| `./operators`   | `import { map, bind } from '@sandlada/result/operators'`   | Sync operators            |
| `./async`       | `import { mapAsync } from '@sandlada/result/async'`        | Async operators           |
| `./composition` | `import { pipe } from '@sandlada/result/composition'`      | Composition utilities     |
| `./adapters`    | `import { toOption } from '@sandlada/result/adapters'`     | Adapter functions         |
| `./combine`     | `import { combine } from '@sandlada/result/combine'`       | Parallel combination      |
| `./option`      | `import { ofSome, map } from '@sandlada/result/option'`    | Option sub-module         |

## Core Types

### `IResult<TError = Error>`

The base result contract for void operations (no success value).

```ts
type IResult<TError = Error> = IResultSuccess | IResultFailure<TError>;

interface IResultSuccess {
    readonly isSuccess: true;
    readonly isFailure: false;
}

interface IResultFailure<TError = Error> {
    readonly isSuccess: false;
    readonly isFailure: true;
    readonly error: TError;
}
```

- **`isSuccess` / `isFailure`** — literal discriminants. Narrow before accessing variant-specific properties.
- **`error`** — only present on the `IResultFailure` variant. Accessing `.error` on success is a **compile-time type error**.

### `IResultOfT<TValue, TError = Error>`

A value-bearing result — either success with a value, or failure with an error.

```ts
type IResultOfT<TValue, TError = Error> =
    | IResultOfTSuccess<TValue>
    | IResultOfTFailure<TError>;

interface IResultOfTSuccess<TValue> {
    readonly isSuccess: true;
    readonly isFailure: false;
    readonly value: TValue;
}

interface IResultOfTFailure<TError = Error> {
    readonly isSuccess: false;
    readonly isFailure: true;
    readonly error: TError;
}
```

- **`value`** — only present on the success variant. Access without narrowing is a **compile-time type error**.
- **`error`** — only present on the failure variant.

### Default Error Type

When `TError` is omitted, it defaults to `Error`:

```ts
import { ok, err } from '@sandlada/result';

const success: IResultOfT<number> = ok(42);          // IResultOfT<number, Error>
const failure: IResultOfT<never> = err(new Error('x')); // IResultOfT<never, Error>
```

Users can supply custom error types:

```ts
type AppError = { kind: 'NotFound'; id: string } | { kind: 'Validation'; field: string };

function findUser(id: string): IResultOfT<User, AppError> {
    if (!id) return err({ kind: 'NotFound', id });
    return ok({ id, name: 'Alice' });
}
```

### `IOption<T>`

The Option type represents an optional value.

```ts
type IOption<T> = IOptionSome<T> | IOptionNone;

interface IOptionSome<T> {
    readonly isSome: true;
    readonly isNone: false;
    readonly value: T;
}

interface IOptionNone {
    readonly isSome: false;
    readonly isNone: true;
}
```

### Type Narrowing

Always narrow before accessing variant-specific properties:

```ts
if (result.isSuccess) {
    console.log(result.value); // ✓ safe — narrowed to success variant
} else {
    console.log(result.error); // ✓ safe — narrowed to failure variant
}

if (option.isSome) {
    console.log(option.value); // ✓ safe — narrowed to Some variant
}
```

---

## API Reference

All operators are **data-last curried** — they accept the result/option as the final argument, supporting both of these styles:

```ts
// Direct: operator(fn, result)
map(x => x * 2, ok(21)); // Ok(42)

// Curried (partial application):
const double = map(x => x * 2);
double(ok(21)); // Ok(42)
```

### Factories

```ts
import { ok, err, fromPredicate, fromThrowable, tryCatch, tryCatchAsync, fromPromise, asyncOk, asyncErr } from '@sandlada/result';
```

| Function        | Signature                                           | Description                                         |
| --------------- | --------------------------------------------------- | --------------------------------------------------- |
| `ok()`          | `ok(): IResult<never>`                              | Void success                                        |
| `ok(value)`     | `ok<T>(value: T): IResultOfT<T, never>`             | Success with value                                  |
| `err(error)`    | `err<E>(error: E): IResultOfT<never, E>`            | Failure with error                                  |
| `fromPredicate` | `fromPredicate<T,E>(pred, errorFn, value?)`         | `Ok(v)` if predicate passes, `Err(errorFn(v))` else |
| `fromThrowable` | `fromThrowable<A,E>(fn, errorFn?)`                  | Wrap throwing function into Result                  |
| `tryCatch`      | `tryCatch<T,E>(fn, errorFn?)`                       | Execute fn, catch throws                            |
| `tryCatchAsync` | `tryCatchAsync<T,E>(fn, errorFn?)`                  | Async fn, catch rejections                          |
| `fromPromise`   | `fromPromise<T,E>(promise, errorFn?)`               | Wrap Promise into Result                            |
| `asyncOk`       | `asyncOk<T>(value): Promise<IResultOfT<T, never>>`  | Pre-resolved success Promise                        |
| `asyncErr`      | `asyncErr<E>(error): Promise<IResultOfT<never, E>>` | Pre-resolved failure Promise                        |

### Sync Operators

```ts
import { map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr, unwrapOrElse, unwrap, expect, unwrapErr, expectErr, flatten, and, or, contains, exists, bimap, swap, mapOr, mapOrElse, filterOrElse } from '@sandlada/result';
```

| Operator       | Signature                                                 | Description                         |
| -------------- | --------------------------------------------------------- | ----------------------------------- |
| `map`          | `map<A,B>(f): <E>(IResultOfT<A,E>) => IResultOfT<B,E>`    | Transform success value             |
| `mapErr`       | `mapErr<E,F>(f): <A>(IResultOfT<A,E>) => IResultOfT<A,F>` | Transform error                     |
| `bind`         | `bind<A,B,F>(f): <E>(...) => IResultOfT<B,E\|F>`          | Monadic bind (chain)                |
| `orElse`       | `orElse<E,B,F>(f): <A>(...) => IResultOfT<A\|B,F>`        | Error recovery                      |
| `match`        | `match<A,E,C>(onOk, onErr): (r) => C`                     | Terminal pattern-match              |
| `tap`          | `tap<A>(fn): <E>(r) => IResultOfT<A,E>`                   | Side-effect on success              |
| `tapErr`       | `tapErr<E>(fn): <A>(r) => IResultOfT<A,E>`                | Side-effect on failure              |
| `unwrapOr`     | `unwrapOr<A>(def): <E>(r) => A`                           | Extract value or default            |
| `unwrapOrElse` | `unwrapOrElse<A,E>(fn): (r) => A`                         | Extract value or compute from error |
| `unwrap`       | `unwrap<A,E>(r): A`                                       | Panics on failure                   |
| `expect`       | `expect<A,E>(msg): (r) => A`                              | Panics with custom message          |
| `unwrapErr`    | `unwrapErr<A,E>(r): E`                                    | Panics on success, returns error    |
| `expectErr`    | `expectErr<A,E>(msg): (r) => E`                           | Panics with custom message          |
| `flatten`      | `flatten<A,E>(r): IResultOfT<A,E>`                        | Flatten nested Result               |
| `and`          | `and<B,F>(other): <A,E>(r) => IResultOfT<B,F>`            | Logical AND on Result               |
| `or`           | `or<A,F>(other): <E>(r) => IResultOfT<A,F>`               | Logical OR on Result                |
| `contains`     | `contains<A>(target): <E>(r) => boolean`                  | True if success and value matches   |
| `exists`       | `exists<A>(pred): <E>(r) => boolean`                      | True if success and predicate holds |
| `bimap`        | `bimap<A,E,C,F>(onOk, onErr): (r) => IResultOfT<C,F>`     | Simultaneously map both variants    |
| `swap`         | `swap<A,E>(r): IResultOfT<E,A>`                           | Swap Ok/Err                         |
| `mapOr`        | `mapOr<A,B,E>(def, fn): (r) => B`                         | Map success or return default       |
| `mapOrElse`    | `mapOrElse<A,B,E>(onErr, fn): (r) => B`                   | Map success or compute from error   |
| `filterOrElse` | `filterOrElse<A,E>(pred, errFn): (r) => IResultOfT<A,E>`  | Filter success or map to error      |

### Async Operators

```ts
import { mapAsync, mapErrAsync, mapOrAsync, mapOrElseAsync, bindAsync, orElseAsync, matchAsync, tapAsync, tapErrAsync, unwrapOrAsync, unwrapOrElseAsync } from '@sandlada/result';
```

All async operators work with `Promise<IResultOfT<A, E>>`. Callbacks can be sync or async.

| Operator            | Signature                                                            | Description                         |
| ------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| `mapAsync`          | `mapAsync<A,B>(f): <E>(Promise<...>) => Promise<IResultOfT<B,E>>`    | Transform success value             |
| `mapErrAsync`       | `mapErrAsync<E,F>(f): <A>(Promise<...>) => Promise<IResultOfT<A,F>>` | Transform error                     |
| `mapOrAsync`        | `mapOrAsync<A,B,E>(def, fn): (r) => Promise<B>`                      | Map success or return default       |
| `mapOrElseAsync`    | `mapOrElseAsync<A,B,E>(onErr, fn): (r) => Promise<B>`                | Map success or compute from error   |
| `bindAsync`         | `bindAsync<A,B,F>(f): <E>(...) => Promise<IResultOfT<B,E\|F>>`       | Chain (monadic bind)                |
| `orElseAsync`       | `orElseAsync<E,B,F>(f): <A>(...) => Promise<IResultOfT<A\|B,F>>`     | Error recovery                      |
| `matchAsync`        | `matchAsync<A,E,C>(onOk, onErr): (r) => Promise<C>`                  | Terminal pattern-match              |
| `tapAsync`          | `tapAsync<A>(fn): <E>(r) => Promise<IResultOfT<A,E>>`                | Side-effect on success              |
| `tapErrAsync`       | `tapErrAsync<E>(fn): <A>(r) => Promise<IResultOfT<A,E>>`             | Side-effect on failure              |
| `unwrapOrAsync`     | `unwrapOrAsync<A>(def): <E>(r) => Promise<A>`                        | Extract value or default            |
| `unwrapOrElseAsync` | `unwrapOrElseAsync<A,E>(fn): (r) => Promise<A>`                      | Extract value or compute from error |

### Composition

```ts
import { pipe, pipeAsync, composeK, composeKAsync } from '@sandlada/result';
```

| Function        | Signature                                                | Description                                |
| --------------- | -------------------------------------------------------- | ------------------------------------------ |
| `pipe`          | `pipe(value, fn1, fn2, ...)` (1–10 overloads)            | Left-to-right function composition         |
| `pipeAsync`     | `pipeAsync(value, ...fns)` (1–10 overloads)              | Async pipe                                 |
| `composeK`      | `composeK<A,B,C,E>(f1, f2): (a: A) => IResultOfT<C,E>`   | Kleisli composition (`>=>`, 2–6 overloads) |
| `composeKAsync` | `composeKAsync<A,B,C,E>(f1, f2): (a: A) => Promise<...>` | Async Kleisli composition (2–6)            |

### Adapters

```ts
import { switchFn, switchFnAsync, liftMap, tee, teeAsync, toOption, fromOption } from '@sandlada/result';
```

| Function        | Signature                                            | Description                                          |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `switchFn`      | `switchFn(f): (a: A) => IResultOfT<B, never>`        | 1-track → switch (value → Result)                    |
| `switchFnAsync` | `switchFnAsync(f): (a: A) => Promise<IResultOfT<B>>` | Async 1-track → async switch                         |
| `liftMap`       | `liftMap(f): IResultOfT<A,E> => IResultOfT<B,E>`     | 1-track → 2-track (alias for `map`)                  |
| `tee`           | `tee(f): (a: A) => A`                                | Dead-end → 1-track (side-effect, returns input)      |
| `teeAsync`      | `teeAsync(f): (a: A) => Promise<A>`                  | Async dead-end → 1-track                             |
| `toOption`      | `toOption(r): IOption<A>`                            | Result → Option (`Ok(v) → Some(v)`, `Err(_) → None`) |
| `fromOption`    | `fromOption(opt, errorOnNone): IResultOfT<T,E>`      | Option → Result (`Some(v) → Ok(v)`, `None → Err(e)`) |

### Combine

```ts
import { combine, all, combineWithAllErrors } from '@sandlada/result';
```

| Function               | Signature                                    | Behavior                            |
| ---------------------- | -------------------------------------------- | ----------------------------------- |
| `combine`              | `combine<A,E>(results[]): IResultOfT<A[],E>` | Short-circuits on first failure     |
| `all`                  | `all(tuple): IResultOfT<[...tuple], E>`      | Heterogeneous tuple, short-circuits |
| `combineWithAllErrors` | `combineWithAllErrors<A,E>(results[]): ...`  | Accumulates **all** errors          |

### Option Module

```ts
import { ofSome, ofNone, map, andThen, orElse, match, tap, unwrapOr, filter, flatten, contains, all, zipWith } from '@sandlada/result/option';
```

All option operators are curried data-last (option is the final argument).

| Function   | Signature                                          | Description                                      |
| ---------- | -------------------------------------------------- | ------------------------------------------------ |
| `ofSome`   | `ofSome<T>(value): IOption<T>`                     | Create Some                                      |
| `ofNone`   | `ofNone(): IOption<never>`                         | Create None                                      |
| `map`      | `map<T,U>(fn): (IOption<T>) => IOption<U>`         | Transform value if Some                          |
| `andThen`  | `andThen<T,U>(fn): (IOption<T>) => IOption<U>`     | Monadic bind (chain)                             |
| `orElse`   | `orElse<T>(fn): (IOption<T>) => IOption<T>`        | Fall back if None                                |
| `match`    | `match<T,U>(onSome, onNone): (IOption<T>) => U`    | Terminal pattern-match                           |
| `tap`      | `tap<T>(fn): (IOption<T>) => IOption<T>`           | Side-effect on Some                              |
| `unwrapOr` | `unwrapOr<T>(def): (IOption<T>) => T`              | Safe extraction with default                     |
| `filter`   | `filter<T>(pred): (IOption<T>) => IOption<T>`      | None if predicate fails                          |
| `flatten`  | `flatten<T>(opt: IOption<IOption<T>>): IOption<T>` | Flatten nested option                            |
| `contains` | `contains<T>(target): (IOption<T>) => boolean`     | True if Some and value matches                   |
| `all`      | `all(tuple): IOption<[...values]>`                 | Combine multiple Options (short-circuit on None) |
| `zipWith`  | `zipWith<A,B,C>(fn): (a, b) => IOption<C>`         | Combine two Options with a function              |

> **Note:** When importing via the main barrel (`@sandlada/result`), Option operators are renamed with a suffix to avoid name collisions with Result operators: `mapOption`, `orElseOption`, `matchOption`, `tapOption`, `unwrapOrOption`, `filterOption`, `flattenOption`, `containsOption`, `allOption`, `zipWithOption`. `andThen` is exported without a suffix.

---

## Canonical Examples

### Basic Usage

```ts
import { ok, err, map, match, pipe } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';

function divide(a: number, b: number): IResultOfT<number, string> {
    return b === 0 ? err('Division by zero') : ok(a / b);
}

// Pattern matching
const result = match(
    (v: number) => `Result: ${v}`,
    (e: string) => `Error: ${e}`,
    divide(10, 2),
);
// "Result: 5"

// Pipeline composition
const doubleIfPositive = pipe(
    ok(5),
    filterOrElse(
        (x: number) => x > 0,
        (x: number) => `Negative: ${x}`,
    ),
    map((x: number) => x * 2),
);
// Ok(10)
```

### Custom Error Types

```ts
type AppError =
    | { kind: 'NotFound'; id: string }
    | { kind: 'Validation'; field: string; value: unknown }
    | { kind: 'Database'; cause: Error };

function getUser(id: string): IResultOfT<User, AppError> {
    if (!id) return err({ kind: 'NotFound', id });
    // ...
    return ok({ id, name: 'Alice' });
}

// Error transformation
const result = pipe(
    getUser('42'),
    mapErr((e: AppError) => `Error: ${e.kind}`),
);
```

### Async Operations

```ts
import { asyncOk, asyncErr, mapAsync, pipeAsync, unwrapOrElseAsync } from '@sandlada/result';

async function fetchUser(id: string) {
    if (!id) return asyncErr('Invalid ID');
    const data = await fetch(`/users/${id}`);
    const user = await data.json();
    return asyncOk(user);
}

const result = await pipeAsync(
    fetchUser('42'),
    mapAsync((u: User) => u.name),
    unwrapOrElseAsync((e: string) => `fallback: ${e}`),
);
```

### Integration Pattern (Pre-configured Error Type)

```ts
import { ok, err } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';

type AppError = { kind: 'NotFound' } | { kind: 'Validation'; field: string };

// Type alias
type AppResult<T = void> = IResultOfT<T, AppError>;

// Convenience factory (eliminates TError generic in call sites)
const AppResult = {
    Success<T = void>(value?: T): AppResult<T> {
        return (value === undefined ? ok() : ok(value)) as unknown as AppResult<T>;
    },
    Failure(error: AppError): AppResult<never> {
        return err(error) as AppResult<never>;
    },
} as const;

// Usage — no TError generic needed:
function findUser(id: string): AppResult<User> {
    if (!id) return AppResult.Failure({ kind: 'NotFound' });
    return AppResult.Success({ id, name: 'Alice' });
}
```

### Option

```ts
import { ofSome, ofNone, map as mapOption, andThen, unwrapOr as unwrapOrOption, pipe } from '@sandlada/result';
import type { IOption } from '@sandlada/result';

function firstElement<T>(arr: T[]): IOption<T> {
    return arr.length > 0 ? ofSome(arr[0]) : ofNone();
}

const result = pipe(
    firstElement([1, 2, 3]),
    mapOption((x: number) => x * 10),
    unwrapOrOption(0),
);
// 10
```

---

## JSON Serialization

Result and Option objects can be serialized with `JSON.stringify`:

```ts
JSON.stringify(ok(42));
// '{"isSuccess":true,"value":42}'

JSON.stringify(err('fail'));
// '{"isSuccess":false,"error":"fail"}'

JSON.stringify(ofSome(42));
// '{"isSome":true,"value":42}'

JSON.stringify(ofNone());
// '{"isSome":false}'
```

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

