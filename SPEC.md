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

| Entry point      | Import                                                     | Description               |
| ---------------- | ---------------------------------------------------------- | ------------------------- |
| `.` (default)    | `import { ok, pipe, map } from '@sandlada/result'`         | All exports (main barrel) |
| `./types`        | `import type { IResultOfT } from '@sandlada/result/types'` | Type definitions only     |
| `./factories`    | `import { ok, err } from '@sandlada/result/factories'`     | Core constructors         |
| `./operators`    | `import { map, bind } from '@sandlada/result/operators'`   | Sync operators            |
| `./async`        | `import { mapAsync } from '@sandlada/result/async'`        | Async operators           |
| `./composition`  | `import { pipe } from '@sandlada/result/composition'`      | Composition utilities     |
| `./adapters`     | `import { toOption } from '@sandlada/result/adapters'`     | Adapter functions         |
| `./combine`      | `import { combine } from '@sandlada/result/combine'`       | Parallel combination      |
| `./option`       | `import { ofSome, map } from '@sandlada/result/option'`    | Option sub-module         |
| `./async-result` | `import { from } from '@sandlada/result/async-result'`     | Lazy AsyncResult thunk    |
| `./async-option` | `import { from } from '@sandlada/result/async-option'`     | Lazy AsyncOption thunk    |

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

### `AsyncResult<TValue, TError = Error>`

A **lazy** async result — wraps `() => Promise<IResultOfT<TValue, TError>>`.
Execution is deferred until `.run()` is called.

```ts
interface AsyncResult<TValue, TError = Error> {
    readonly run: () => Promise<IResultOfT<TValue, TError>>;
}

/**
 * AsyncOption — a lazy async option.
 * Wraps `() => Promise<IOption<T>>`.
 */
interface AsyncOption<T> {
    readonly run: () => Promise<IOption<T>>;
}
```

- All operators return a new lazy `AsyncResult` or `AsyncOption` without executing.
- Terminal operators (`.run()`, `match`, `unwrapOr`) trigger execution.

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
import { ok, err, fromPredicate, fromThrowable, tryCatch, tryCatchAsync, fromPromise, fromSafePromise, asyncOk, asyncErr } from '@sandlada/result';
```

| Function          | Signature                                                    | Description                                           |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `ok()`            | `ok(): IResult<never>`                                       | Void success                                          |
| `ok(value)`       | `ok<T>(value: T): IResultOfT<T, never>`                      | Success with value                                    |
| `err(error)`      | `err<E>(error: E): IResultOfT<never, E>`                     | Failure with error                                    |
| `fromPredicate`   | `fromPredicate<T,E>(pred, error, val): IResultOfT<T,E>`      | Direct: `Ok(val)` if pred passes, else `Err(error)`   |
|                   | `fromPredicate<T,E>(pred, error): (val: T) => IResultOfT<T,E>` | Curried: returns validator function (data-last)       |
| `fromThrowable`   | `fromThrowable<A,T,E>(fn, errorFn?)`                         | Wrap throwing function into Result                    |
| `tryCatch`        | `tryCatch<T,E>(fn, errorFn?)`                                | Execute fn, catch throws                              |
| `tryCatchAsync`   | `tryCatchAsync<T,E>(fn, errorFn?)`                           | Async fn, catch rejections                            |
| `fromPromise`     | `fromPromise<T,E>(promise, errorFn?)`                        | Wrap Promise into Result                              |
| `fromSafePromise` | `fromSafePromise<T>(promise): Promise<IResultOfT<T, never>>` | Wrap a never-reject Promise                           |
| `asyncOk`         | `asyncOk<T>(value): Promise<IResultOfT<T, never>>`           | Pre-resolved success Promise                          |
| `asyncErr`        | `asyncErr<E>(error): Promise<IResultOfT<never, E>>`          | Pre-resolved failure Promise                          |

### Sync Operators

```ts
import { map, mapErr, bind, orElse, match, tap, tapErr, unwrapOr, unwrapOrElse, unwrap, expect, unwrapErr, expectErr, flatten, and, or, contains, exists, bimap, swap, mapOr, mapOrElse, filterOrElse, ap, separate, traverseArray, andTee, orTee, andThrough, unsafeUnwrap, unsafeUnwrapErr, orThrow, orThrowWith } from '@sandlada/result';
```

| Operator          | Signature                                                 | Description                               |
| ----------------- | --------------------------------------------------------- | ----------------------------------------- |
| `map`             | `map<A,B>(f): <E>(IResultOfT<A,E>) => IResultOfT<B,E>`    | Transform success value                   |
| `mapErr`          | `mapErr<E,F>(f): <A>(IResultOfT<A,E>) => IResultOfT<A,F>` | Transform error                           |
| `bind`            | `bind<A,B,F>(f): <E>(...) => IResultOfT<B,E\|F>`          | Monadic bind (chain)                      |
| `orElse`          | `orElse<E,B,F>(f): <A>(...) => IResultOfT<A\|B,F>`        | Error recovery                            |
| `match`           | `match<A,E,C>(onOk, onErr): (r) => C`                     | Terminal pattern-match                    |
| `tap`             | `tap<A>(fn): <E>(r) => IResultOfT<A,E>`                   | Side-effect on success                    |
| `tapErr`          | `tapErr<E>(fn): <A>(r) => IResultOfT<A,E>`                | Side-effect on failure                    |
| `unwrapOr`        | `unwrapOr<A>(def): <E>(r) => A`                           | Extract value or default                  |
| `unwrapOrElse`    | `unwrapOrElse<A,E>(fn): (r) => A`                         | Extract value or compute from error       |
| `unwrap`          | `unwrap<A,E>(r): A`                                       | Panics on failure                         |
| `expect`          | `expect<A,E>(msg): (r) => A`                              | Panics with custom message                |
| `unwrapErr`       | `unwrapErr<A,E>(r): E`                                    | Panics on success, returns error          |
| `expectErr`       | `expectErr<A,E>(msg): (r) => E`                           | Panics with custom message                |
| `flatten`         | `flatten<A,E>(r): IResultOfT<A,E>`                        | Flatten nested Result                     |
| `and`             | `and<B,F>(other): <A,E>(r) => IResultOfT<B,F>`            | Logical AND on Result                     |
| `or`              | `or<A,F>(other): <E>(r) => IResultOfT<A,F>`               | Logical OR on Result                      |
| `contains`        | `contains<A>(target): <E>(r) => boolean`                  | True if success and value matches         |
| `exists`          | `exists<A>(pred): <E>(r) => boolean`                      | True if success and predicate holds       |
| `bimap`           | `bimap<A,E,C,F>(onOk, onErr): (r) => IResultOfT<C,F>`     | Simultaneously map both variants          |
| `swap`            | `swap<A,E>(r): IResultOfT<E,A>`                           | Swap Ok/Err                               |
| `mapOr`           | `mapOr<A,B,E>(def, fn): (r) => B`                         | Map success or return default             |
| `mapOrElse`       | `mapOrElse<A,B,E>(onErr, fn): (r) => B`                   | Map success or compute from error         |
| `filterOrElse`    | `filterOrElse<A,E>(pred, errFn): (r) => IResultOfT<A,E>`  | Filter success or map to error            |
| `ap`              | `ap<A,B,E>(fnResult, result): IResultOfT<B,E>`            | Apply wrapped fn to wrapped value         |
| `separate`        | `separate<T,E>(results): { ok: T[]; err: E[] }`           | Partition successes and failures          |
| `traverseArray`   | `traverseArray<A,B,E>(fn, items): IResultOfT<B[],E>`      | Apply fn to every element, collect        |
| `andTee`          | `andTee<A,B,E,F>(fn): (r) => IResultOfT<A,E>`             | Side-effect on success, ignores fn result |
| `orTee`           | `orTee<A,E,B,F>(fn): (r) => IResultOfT<A,E>`              | Side-effect on failure, ignores fn result |
| `andThrough`      | `andThrough<A,B,E,F>(fn): (r) => IResultOfT<A,E\|F>`      | Side-effect on success, propagates fn err |
| `unsafeUnwrap`    | `unsafeUnwrap<A,E>(r): A`                                 | Throws raw error on failure               |
| `unsafeUnwrapErr` | `unsafeUnwrapErr<A,E>(r): E`                              | Throws raw value on success               |
| `orThrow`         | `orThrow<T, E extends Error>(r): T`                       | Unwrap success or throw the error         |
| `orThrowWith`     | `orThrowWith<T,E>(errorFn): <A>(r) => A`                  | Unwrap success or throw custom error      |

### Async Operators

```ts
import { mapAsync, mapErrAsync, mapOrAsync, mapOrElseAsync, bindAsync, orElseAsync, matchAsync, tapAsync, tapErrAsync, unwrapOrAsync, unwrapOrElseAsync, asyncMap, asyncAndThen, asyncAndThrough } from '@sandlada/result';
```

All async operators work with `Promise<IResultOfT<A, E>>`. Callbacks can be sync or async.

| Operator            | Signature                                                                       | Description                              |
| ------------------- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| `mapAsync`          | `mapAsync<A,B>(f): <E>(Promise<...>) => Promise<IResultOfT<B,E>>`               | Transform success value                  |
| `mapErrAsync`       | `mapErrAsync<E,F>(f): <A>(Promise<...>) => Promise<IResultOfT<A,F>>`            | Transform error                          |
| `mapOrAsync`        | `mapOrAsync<A,B,E>(def, fn): (r) => Promise<B>`                                 | Map success or return default            |
| `mapOrElseAsync`    | `mapOrElseAsync<A,B,E>(onErr, fn): (r) => Promise<B>`                           | Map success or compute from error        |
| `bindAsync`         | `bindAsync<A,B,F>(f): <E>(...) => Promise<IResultOfT<B,E\|F>>`                  | Chain (monadic bind)                     |
| `orElseAsync`       | `orElseAsync<E,B,F>(f): <A>(...) => Promise<IResultOfT<A\|B,F>>`                | Error recovery                           |
| `matchAsync`        | `matchAsync<A,E,C>(onOk, onErr): (r) => Promise<C>`                             | Terminal pattern-match                   |
| `tapAsync`          | `tapAsync<A>(fn): <E>(r) => Promise<IResultOfT<A,E>>`                           | Side-effect on success                   |
| `tapErrAsync`       | `tapErrAsync<E>(fn): <A>(r) => Promise<IResultOfT<A,E>>`                        | Side-effect on failure                   |
| `unwrapOrAsync`     | `unwrapOrAsync<A>(def): <E>(r) => Promise<A>`                                   | Extract value or default                 |
| `unwrapOrElseAsync` | `unwrapOrElseAsync<A,E>(fn): (r) => Promise<A>`                                 | Extract value or compute from error      |
| `asyncMap`          | `asyncMap<A,B>(f): <E>(IResultOfT<A,E>) => Promise<IResultOfT<B,E>>`            | Map sync Result with async callback      |
| `asyncAndThen`       | `asyncAndThen<A,B,E,F>(f): (IResultOfT<A,E>) => Promise<IResultOfT<B,E\|F>>`    | Chain sync Result with async fn          |
| `asyncAndThrough`    | `asyncAndThrough<A,B,E,F>(f): (IResultOfT<A,E>) => Promise<IResultOfT<B,E\|F>>`    | Chain sync Result with async side-effect |
| `mapAsyncOption`     | `mapAsyncOption<T,U>(f): (Promise<IOption<T>>) => Promise<IOption<U>>`          | Transform async option                   |
| `bindAsyncOption`    | `bindAsyncOption<T,U>(f): (Promise<IOption<T>>) => Promise<IOption<U>>`         | Chain async option                       |
| `matchAsyncOption`   | `matchAsyncOption<T,U>(onSome, onNone): (Promise<IOption<T>>) => Promise<U>`    | Match async option                       |
| `orElseAsyncOption`  | `orElseAsyncOption<T>(f): (Promise<IOption<T>>) => Promise<IOption<T>>`         | Recover async option                     |
| `tapAsyncOption`     | `tapAsyncOption<T>(f): (Promise<IOption<T>>) => Promise<IOption<T>>`            | Side-effect async option                 |
| `unwrapOrAsyncOption` | `unwrapOrAsyncOption<T>(def): (Promise<IOption<T>>) => Promise<T>`             | Unwrap async option                      |

### Composition

```ts
import { pipe, pipeAsync, composeK, composeKAsync, safeTry, fromSafeTry } from '@sandlada/result';
```

| Function        | Signature                                                | Description                                |
| --------------- | -------------------------------------------------------- | ------------------------------------------ |
| `pipe`          | `pipe(value, fn1, fn2, ...)` (1–10 overloads)            | Left-to-right function composition         |
| `pipeAsync`     | `pipeAsync(value, ...fns)` (1–10 overloads)              | Async pipe                                 |
| `safeTry`       | `safeTry<T,E>(result): Generator<IResultOfT<never,E>,T>`         | Generator yield* for Result pipelines      |
| `fromSafeTry`   | `fromSafeTry<T,E>(gen: () => Generator<...>): IResultOfT<T,E>`   | Evaluate a safeTry generator               |
| `composeK`      | `composeK<A,B,C,E>(f1, f2): (a: A) => IResultOfT<C,E>`   | Kleisli composition (`>=>`, 2–6 overloads) |
| `composeKAsync` | `composeKAsync<A,B,C,E>(f1, f2): (a: A) => Promise<...>` | Async Kleisli composition (2–6)            |

### Adapters

```ts
import { switchFn, switchFnAsync, liftMap, tee, teeAsync, toOption, fromOption } from '@sandlada/result';
```

| Function        | Signature                                                        | Description                                          |
| --------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| `switchFn`      | `switchFn(f): (a: A) => IResultOfT<B, never>`                    | 1-track → switch (value → Result)                    |
| `switchFnAsync` | `switchFnAsync<A,B>(f): (a: A) => Promise<IResultOfT<B, never>>` | Async 1-track → async switch                         |
| `liftMap`       | `liftMap(f): IResultOfT<A,E> => IResultOfT<B,E>`                 | 1-track → 2-track (alias for `map`)                  |
| `tee`           | `tee(f): (a: A) => A`                                            | Dead-end → 1-track (side-effect, returns input)      |
| `teeAsync`      | `teeAsync(f): (a: A) => Promise<A>`                              | Async dead-end → 1-track                             |
| `toOption`      | `toOption(r): IOption<A>`                                        | Result → Option (`Ok(v) → Some(v)`, `Err(_) → None`) |
| `fromOption`    | `fromOption<E>(errorOnNone, opt?): IResultOfT<T,E>`              | Option → Result (`Some(v) → Ok(v)`, `None → Err(e)`) |

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

| Function    | Signature                                                | Description                                      |
| ----------- | -------------------------------------------------------- | ------------------------------------------------ |
| `ofSome`    | `ofSome<T>(value): IOption<T>`                           | Create Some                                      |
| `ofNone`    | `ofNone(): IOption<never>`                               | Create None                                      |
| `map`       | `map<T,U>(fn): (IOption<T>) => IOption<U>`               | Transform value if Some                          |
| `andThen`   | `andThen<T,U>(fn): (IOption<T>) => IOption<U>`           | Monadic bind (chain)                             |
| `orElse`    | `orElse<T>(fn): (IOption<T>) => IOption<T>`              | Fall back if None                                |
| `match`     | `match<T,U>(onSome, onNone): (IOption<T>) => U`          | Terminal pattern-match                           |
| `tap`       | `tap<T>(fn): (IOption<T>) => IOption<T>`                 | Side-effect on Some                              |
| `unwrapOr`  | `unwrapOr<T>(def): (IOption<T>) => T`                    | Safe extraction with default                     |
| `filter`    | `filter<T>(pred): (IOption<T>) => IOption<T>`            | None if predicate fails                          |
| `flatten`   | `flatten<T>(opt: IOption<IOption<T>>): IOption<T>`       | Flatten nested option                            |
| `contains`  | `contains<T>(target): (IOption<T>) => boolean`           | True if Some and value matches                   |
| `okOr`      | `okOr<E>(error: E): <T>(IOption<T>) => IResultOfT<T,E>`  | Option → Result with default error               |
| `okOrElse`  | `okOrElse<E>(errFn): <T>(IOption<T>) => IResultOfT<T,E>` | Option → Result with lazy error                  |
| `transpose` | `transpose<T,E>(opt): IResultOfT<IOption<T>,E>`          | Transpose Option<Result> → Result<Option>        |
| `all`       | `all(tuple): IOption<[...values]>`                       | Combine multiple Options (short-circuit on None) |
| `zipWith`   | `zipWith<A,B,C>(fn): (a, b) => IOption<C>`               | Combine two Options with a function              |

> **Note:** When importing via the main barrel (`@sandlada/result`), Option operators are renamed with a suffix to avoid name collisions with Result operators: `mapOption`, `orElseOption`, `matchOption`, `tapOption`, `unwrapOrOption`, `filterOption`, `flattenOption`, `containsOption`, `allOption`, `zipWithOption`, `okOrOption`, `okOrElseOption`, `transposeOption`. `andThen` is exported without a suffix.

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

### Generator-based Pipelines (safeTry)

`safeTry` enables `yield*` error propagation — short-circuits to the nearest `fromSafeTry` on the first failure:

```ts
import { ok, err, pipe, map, safeTry, fromSafeTry } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';

function* validateAndProcess(input: unknown): Generator<IResultOfT<never, string>, string> {
    const parsed = yield* safeTry(parseInput(input));
    const validated = yield* safeTry(validate(parsed));
    const saved = yield* safeTry(save(validated));
    return saved;
}

const result = pipe(
    fromSafeTry(() => validateAndProcess({ name: 'Alice' })),
    map((s: string) => `Saved: ${s}`),
);
// Ok("Saved: ...") or first Err encountered
```

### Side-effect Operators (andTee / orTee / andThrough)

```ts
import { ok, err, pipe, andTee, orTee, andThrough } from '@sandlada/result';

// andTee — side-effect on success, ignores callback's result
const r1 = pipe(
    ok(42),
    andTee((x: number) => { console.log(x); return ok('ignored'); }),
);
// Still Ok(42), regardless of what the callback returns

// orTee — side-effect on failure, ignores callback's result
const r2 = pipe(
    err('fail'),
    orTee((e: string) => { console.log(e); return ok('ignored'); }),
);
// Still Err('fail'), regardless of what the callback returns

// andThrough — side-effect that can propagate errors
const r3 = pipe(
    ok(42),
    andThrough((x: number) => x > 0 ? ok(undefined) : err('negative')),
);
// Ok(42) — original value preserved on callback success
// If callback returns Err, that error propagates instead
```

### Bridge Sync → Async

```ts
import { ok, err, asyncMap, asyncAndThen } from '@sandlada/result';

// asyncMap — transform a sync Result with an async callback
const r1: Promise<IResultOfT<string, Error>> = asyncMap(
    async (x: number) => `Got: ${x}`,
    ok(42),
);

// asyncAndThen — chain a sync Result with an async result-returning callback
const r2: Promise<IResultOfT<string, Error>> = asyncAndThen(
    async (x: number) => x > 0 ? ok(`positive: ${x}`) : err('negative'),
    ok(42),
);
```

### Unsafe Extraction

```ts
import { unsafeUnwrap, unsafeUnwrapErr } from '@sandlada/result';

// unsafeUnwrap — throws the raw error on failure (no TypeError wrapper)
const value: number = unsafeUnwrap(ok(42));    // 42
// unsafeUnwrap(err('crash'))                    // 💥 throws 'crash' raw

// unsafeUnwrapErr — throws the raw value on success
const error: string = unsafeUnwrapErr(err('x')); // 'x'
// unsafeUnwrapErr(ok(42))                        // 💥 throws 42 raw
```

### Safe Promise

```ts
import { fromSafePromise } from '@sandlada/result';

const p = Promise.resolve(42);
const result: Promise<IResultOfT<number, never>> = fromSafePromise(p);
// result resolves to Ok(42) — error type is `never` (no rejection handling)
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

### Option ↔ Result Conversion

```ts
import { ok, err } from '@sandlada/result';
import { ofSome, ofNone, okOr, okOrElse, transpose } from '@sandlada/result/option';
import type { IResultOfT } from '@sandlada/result';
import type { IOption } from '@sandlada/result';

// okOr — Option → Result with a fixed error on None
const r1: IResultOfT<number, string> = okOr('default error', ofSome(42));
// Ok(42)

const r2: IResultOfT<number, string> = okOr('default error', ofNone());
// Err('default error')

// okOrElse — Option → Result with lazy error computation
const r3: IResultOfT<number, string> = okOrElse(
    () => 'computed error',
    ofSome(42),
);
// Ok(42)

const r4: IResultOfT<number, string> = okOrElse(
    () => 'computed error',
    ofNone(),
);
// Err('computed error')

// transpose — Swap Option<Result> ↔ Result<Option>
const r5: IResultOfT<IOption<number>, string> = transpose(ofSome(ok(42)));
// Ok(Some(42))

const r6: IResultOfT<IOption<number>, string> = transpose(ofSome(err('fail')));
// Err('fail')

const r7: IResultOfT<IOption<number>, string> = transpose(ofNone());
// Ok(None)
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
// '{"isSome":false,"isNone":true}'

## Data-Last Functions (FP Style)

All functions in `@sandlada/result` support data-last currying for composition with `pipe`.

### 建構子

```ts
import { ok, err } from '@sandlada/result';

const success = ok(42);           // IResultOfT<number>
const failure = err('bad input');  // IResultOfT<never, string>
```

### Data-Last Curried 運算子

所有運算子支援 partial application：

```ts
import { map, bind, match } from '@sandlada/result';

const double = map((x: number) => x * 2);  // 部分應用
const result = double(ok(21));              // ok(42)
```

### Pipe 組合

```ts
import { ok, err, map, bind, match, pipe } from '@sandlada/result';

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
import { composeK } from '@sandlada/result';

const validate = composeK(parseInput, checkBusinessRules);
// validate: (input: string) => IResultOfT<Output, Error>
```

### Adapters (Wlaschin Three-Shape System)

```ts
import { switchFn, liftMap, tee } from '@sandlada/result';

// switchFn: plain function → switch function
const safeParse = switchFn(JSON.parse);
// safeParse: (text: string) => IResultOfT<unknown, never>

// tee: dead-end side-effect on plain value
const log = tee((x: unknown) => console.log('Got:', x));
```

### FP Style Interop

Because both factories (`ok`, `err`) and operators (`map`, `bind`) operate on the same plain-object discriminated unions, you can freely mix them with `pipe`:

```ts
import { ok, map, pipe } from '@sandlada/result';

const r = ok(42);
pipe(r, map(x => x * 2));                // pipe 組合
const r2 = map(x => x * 2)(r);           // data-last currying
```

## AsyncResult (@sandlada/result/async-result)

`AsyncResult<T, E>` is a **lazy thunk** wrapping `() => Promise<IResultOfT<T, E>>`.
Unlike the eager `Promise<IResultOfT>` pattern, AsyncResult defers execution
until `.run()` is called, enabling composable pipelines without side effects.

### Type

```ts
import type { AsyncResult } from '@sandlada/result';
// or from the types sub-path:
import type { AsyncResult } from '@sandlada/result/types';

interface AsyncResult<T, E = Error> {
    readonly run: () => Promise<IResultOfT<T, E>>;
}
```

### Factories

```ts
import { from, fromPromise, fromResult } from '@sandlada/result/async-result';
// or from the main barrel:
import { from, fromPromise, fromResult } from '@sandlada/result';
```

| Function      | Signature                                             | Description                                   |
| ------------- | ----------------------------------------------------- | --------------------------------------------- |
| `from`        | `from<T,E>(thunk): AsyncResult<T,E>`                  | Wrap a thunk `() => Promise<IResultOfT<T,E>>` |
| `fromPromise` | `fromPromise<T,E>(thunk, errorFn?): AsyncResult<T,E>` | Wrap `() => Promise<T>`, catch rejections     |
| `fromResult`  | `fromResult<T,E>(result): AsyncResult<T,E>`           | Lift sync `IResultOfT` into AsyncResult       |

All factories are **lazy** — the computation doesn't start until `.run()`.

### Operators (Lazy)

Lazy operators return a new `AsyncResult` without executing. Import from `@sandlada/result/async-result` or the main barrel (prefixed with `asyncResult`):

```ts
import { map, mapAsync, mapErr, andThen, orElse, tap, tapErr, combine, combineWithAllErrors } from '@sandlada/result/async-result';
```

| Operator               | Signature                                                      | Description                              |
| ---------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| `map`                  | `map<T,U,E>(fn): (AsyncResult<T,E>) => AsyncResult<U,E>`       | Transform success value (sync)           |
| `mapAsync`             | `mapAsync<T,U,E>(fn): (AsyncResult<T,E>) => AsyncResult<U,E>`  | Transform success value (async)          |
| `mapErr`               | `mapErr<T,E,F>(fn): (AsyncResult<T,E>) => AsyncResult<T,F>`    | Transform error (sync)                   |
| `mapErrAsync`          | `mapErrAsync<T,E,F>(fn): (AsyncResult<T,E>) => AsyncResult<T,F>` | Transform error (async)                  |
| `andThen`              | `andThen<T,U,E>(fn): (AsyncResult<T,E>) => AsyncResult<U,E>`   | Chain (supports Promise<IResult> interop)|
| `orElse`               | `orElse<T,E,F>(fn): (AsyncResult<T,E>) => AsyncResult<T,E\|F>` | Recovery (supports Promise<IResult> interop)|
| `tap`                  | `tap<T,E>(fn): (AsyncResult<T,E>) => AsyncResult<T,E>`         | Side-effect on success (sync)            |
| `tapAsync`             | `tapAsync<T,E>(fn): (AsyncResult<T,E>) => AsyncResult<T,E>`    | Side-effect on success (async)           |
| `tapErr`               | `tapErr<T,E>(fn): (AsyncResult<T,E>) => AsyncResult<T,E>`      | Side-effect on failure (sync)            |
| `tapErrAsync`          | `tapErrAsync<T,E>(fn): (AsyncResult<T,E>) => AsyncResult<T,E>` | Side-effect on failure (async)           |
| `combine`              | `combine<T,E>(results): AsyncResult<T[],E>`                    | Combine array, short-circuits on failure |
| `combineWithAllErrors` | `combineWithAllErrors<T,E>(results): AsyncResult<T[],E[]>`     | Combine array, accumulates all errors    |

### Terminal Operators

Terminal operators call `.run()` and return `Promise`:

```ts
import { match, unwrapOr } from '@sandlada/result/async-result';
```

| Operator   | Signature                                                       | Description                   |
| ---------- | --------------------------------------------------------------- | ----------------------------- |
| `match`    | `match<T,E,U>(handlers, ar): Promise<U>`                        | Run and pattern-match (sync/async handlers) |
| `unwrapOr` | `unwrapOr<T,E>(defaultValue): (AsyncResult<T,E>) => Promise<T>` | Run, extract value or default (sync/async) |

### Example

```ts
import { fromPromise, map, andThen, match } from '@sandlada/result/async-result';
import type { AsyncResult } from '@sandlada/result';

// Build a lazy pipeline
const fetchUser: AsyncResult<User, Error> = fromPromise(
    () => fetch('/api/user/42').then(r => r.json()),
);

const pipeline = map((u: User) => u.name)(
    andThen((name: string) =>
        fromPromise(() => fetch(`/api/profile/${name}`).then(r => r.json())),
    )(fetchUser),
);

// Execute
const result = await pipeline.run(); // IResultOfT<Profile, Error>

// Or use a terminal operator:
const name = await match(
    { ok: (p: Profile) => p.displayName, err: () => 'Anonymous' },
    pipeline,
);
```

## AsyncOption (@sandlada/result/async-option)

`AsyncOption<T>` is a **lazy thunk** wrapping `() => Promise<IOption<T>>`.
Execution is deferred until `.run()` is called.

### Factories

| Function      | Signature                               | Description                          |
| ------------- | --------------------------------------- | ------------------------------------ |
| `from`        | `from<T>(thunk): AsyncOption<T>`        | Wrap a `() => Promise<IOption<T>>`   |
| `fromPromise` | `fromPromise<T>(thunk): AsyncOption<T>` | Wrap `() => Promise<T>`, catch → None |
| `fromOption`  | `fromOption<T>(opt): AsyncOption<T>`    | Lift sync `IOption` into AsyncOption |

### Operators (Lazy)

| Operator  | Signature                                              | Description                               |
| --------- | ------------------------------------------------------ | ----------------------------------------- |
| `map`      | `map<T,U>(fn): (AsyncOption<T>) => AsyncOption<U>`      | Transform value (sync)                   |
| `mapAsync` | `mapAsync<T,U>(fn): (AsyncOption<T>) => AsyncOption<U>` | Transform value (async)                  |
| `andThen`  | `andThen<T,U>(fn): (AsyncOption<T>) => AsyncOption<U>`  | Chain (supports Promise<IOption> interop) |
| `orElse`   | `orElse<T>(fn): (AsyncOption<T>) => AsyncOption<T>`     | Recovery (supports Promise<IOption> interop)|
| `tap`      | `tap<T>(fn): (AsyncOption<T>) => AsyncOption<T>`        | Side-effect on Some (sync)               |
| `tapAsync` | `tapAsync<T>(fn): (AsyncOption<T>) => AsyncOption<T>`   | Side-effect on Some (async)              |

### Terminal Operators

| Operator   | Signature                                                   | Description                   |
| ---------- | ----------------------------------------------------------- | ----------------------------- |
| `match`    | `match({ some, none }, ao): Promise<U>`                     | Run and pattern-match (sync/async handlers) |
| `unwrapOr` | `unwrapOr<T>(defaultValue): (AsyncOption<T>) => Promise<T>` | Run, extract value or default (sync/async)  |

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
        return err<AppError>({
            kind: 'Validation',
            fields: { id: 'Required' },
        });
    }
    const user = db.find(id);
    if (!user) {
        return err<AppError>({
            kind: 'NotFound',
            resource: 'User',
            id,
        });
    }
    return ok(user);
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
        return err<DomainError>(
            new DomainError('Invalid email format', 'INVALID_EMAIL'),
        );
    }
    return ok(email);
}
```

### Plain Objects (Quick)

For simple cases, pass any object as the error:

```ts
const result = err({ reason: 'timeout', retryAfter: 5000 });
// result.error.reason === 'timeout'
// result.error.retryAfter === 5000
```

## Result 集成 — 預先綁定錯誤類型

當一個項目或第三方套件使用固定的錯誤類型時，每次都寫 `IResultOfT<T, MyError>` 和 `err<MyError>(...)` 會很繁瑣。`@sandlada/result` 的泛型設計天然支援**兩層封裝**來消除重複。

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

但工廠方法仍然需要顯式標註 — `err<AppError>(...)` 無法省去。

### 方案二：便利工廠（Convenience Factory）

進一步封裝一個**同名工廠物件**，將錯誤型別綁定到 `Success`/`Failure` 中：

```ts
// app-result.ts
import { ok, err } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';
import type { AppError } from './errors';

export type AppResult<T = void> = IResultOfT<T, AppError>;

export const AppResult = {
    /** 建立不帶值的成功結果 */
    Success(): AppResult<void> {
        return ok() as AppResult<void>;
    },
    /** 建立帶值的成功結果 */
    Success<T>(value: T): AppResult<T> {
        return ok(value) as AppResult<T>;
    },
    /** 建立失敗結果 (never 表示無值) */
    Failure(error: AppError): AppResult<never> {
        return err(error) as AppResult<never>;
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

    return ok(transform(validated.value));
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

All operators are **data-last curried** — compose them with `pipe` for left-to-right reading:

#### FP Style (Curried + Pipe)

```ts
import { ok, map, bind, pipe } from '@sandlada/result';

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

`combine` and `combineWithAllErrors` are **built into the library** (see [Factories](#factories)).

#### Short-Circuit (First Failure Wins)

```ts
import { combine } from '@sandlada/result';

const r = combine([validateName('Alice'), validateEmail('bad'), validateAge(-5)]);
// r.isFailure === true, r.error is the first validation error
```

#### Accumulate All Errors

```ts
import { combineWithAllErrors } from '@sandlada/result';

type ValidationError = { field: string; message: string };

const r = combineWithAllErrors([
    validateName('Alice'),    // success
    validateEmail('bad'),     // failure → collected
    validateAge(-5),          // failure → collected
]);
// r.isFailure === true, r.error.length === 2
```

## TypeScript Design Decisions

- **Default `TError = Error`** — zero-config for simple use cases; override with custom types for domain-specific error handling.
- **Plain objects, no classes** — every result or option value is a plain discriminated union object. There are no classes, no prototype chains, no `new` constructors. This ensures maximum compatibility with generic TypeScript patterns, `JSON.stringify`, and structured clone algorithms.
- **`value` and `error` are variant-exclusive** — `value` only exists when `isSuccess === true`, `error` only exists when `isFailure === true`. This is enforced at the type level via discriminated union, not at runtime. Access without narrowing is a type error.
- **`null` and `undefined` are valid values** — `ok<number | null>(null)` and `ok<number | undefined>(undefined)` are supported. The `ok` factory uses `arguments.length` to distinguish void-success (`ok()`) from explicit-undefined-success (`ok(undefined)`).
- **`isSuccess`/`isFailure` are own properties** — unlike a getter-based implementation, these are plain `boolean` properties on the object. This simplifies serialization and structured cloning.
- **Sentinel `error` on success** — a success result's `error` property is `undefined` (not a sentinel symbol). The `IResult` union type ensures you only access `error` after narrowing.
- **No method chaining** — because results are plain objects, operators are standalone functions with data-last signatures: `map(fn)(result)`. Compose with `pipe` for left-to-right reading.
- **`camelCase` throughout** — all function names (`ok`, `err`, `isSuccess`, `map`, `andThen`) use camelCase. The C# convention (`Result.Success`) is not followed in this library.
- **Minimal runtime overhead** — no classes, no getters, no `Proxy`, no prototype lookups. Every result is a `{ isSuccess, value }` or `{ isSuccess, error }` object literal.

