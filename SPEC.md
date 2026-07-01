# SPEC

## Overview

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a type-safe, exception-free approach to error handling. It provides `IResult` interfaces and `Result` classes that make error flows explicit in the type system, inspired by C# Result pattern libraries but with **fully generic, user-definable error types**.

## Installation

```bash
npm install @sandlada/result
```

> **Module system:** This package is **ESM-only** (`"type": "module"`). It cannot be used with `require()`. Your project must use ESM (`import`) or enable dynamic `import()` in CJS contexts.

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

The package exports exactly **4 symbols** from its public barrel (`@sandlada/result`):

| Export       | Kind      | Signature                                                      | Description                            |
| ------------ | --------- | -------------------------------------------------------------- | -------------------------------------- |
| `IResult`    | interface | `IResult<TError = Error>`                                      | Base result contract (no value)        |
| `IResultOfT` | interface | `IResultOfT<TValue, TError = Error>` extends `IResult<TError>` | Value-bearing result contract          |
| `Result`     | class     | `Result<TError = Error>` implements `IResult<TError>`          | Base class with static factory methods |
| `ResultOfT`  | class     | `ResultOfT<TValue, TError = Error>` extends `Result<TError>`   | Generic result class carrying a value  |

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
    extends Result<TError>
    implements IResultOfT<TValue, TError>
{
    constructor(value?: TValue, isSuccess?: boolean, error?: TError);

    get value(): TValue;  // throws TypeError if isFailure
}
```

- **`value` getter** throws `TypeError` with message `"Cannot access value on a failure result. Check isSuccess before accessing value."` when accessed on a failure.

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

> **Note:** `map`, `flatMap`, and `tap` are **not built into the library**. The code below shows a recommended pattern that you implement in your own codebase. Copy these helpers into your project as needed.

Compose operations using `map`, `flatMap`, and `tap` for functional pipelines that short-circuit on the first failure:

```ts
/** Transform the success value without touching the error channel. */
function map<T, U, E>(result: IResultOfT<T, E>, fn: (value: T) => U): IResultOfT<U, E> {
    if (!result.isSuccess) return result as unknown as IResultOfT<U, E>;
    return Result.Success(fn(result.value)) as IResultOfT<U, E>;
}

/** Chain an operation that may itself fail. Short-circuits on first failure. */
function flatMap<T, U, E>(
    result: IResultOfT<T, E>,
    fn: (value: T) => IResultOfT<U, E>,
): IResultOfT<U, E> {
    if (!result.isSuccess) return result as unknown as IResultOfT<U, E>;
    return fn(result.value);
}

/** Execute a side effect on success without changing the value. */
function tap<T, E>(result: IResultOfT<T, E>, fn: (value: T) => void): IResultOfT<T, E> {
    if (result.isSuccess) fn(result.value);
    return result;
}
```

Usage — each step only executes if the previous succeeded:

```ts
type AppError =
    | { kind: 'ParseError'; raw: string }
    | { kind: 'InvalidRange'; min: number; max: number; actual: number };

function parse(input: string): IResultOfT<number, AppError> { /* ... */ }
function validateRange(min: number, max: number): (n: number) => IResultOfT<number, AppError> { /* ... */ }
function double(n: number): number { return n * 2; }

// parse → double → validate → save, stopping at the first failure
const result = flatMap(
    flatMap(
        map(parse('21'), double),
        validateRange(1, 100),
    ),
    save('record-1'),
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

> **Note:** `combineValidations` and the `CombinedResult` factory are **user-defined** — not built into the library. This pattern demonstrates how to aggregate multiple results with the library's primitives.

Collect multiple validation results into a single combined result, useful for form validation where you want **all** errors, not just the first:

```ts
type ValidationError = { field: string; message: string };

function combineValidations<T extends unknown[]>(
    results: { [K in keyof T]: IResultOfT<T[K], ValidationError[]> },
): IResultOfT<T, ValidationError[]> {
    const allErrors: ValidationError[] = [];

    for (const r of results) {
        if (!r.isSuccess) allErrors.push(...r.error);
    }

    if (allErrors.length > 0) {
        return Result.Failure<T, ValidationError[]>(allErrors);
    }

    const values = results.map((r) => r.value) as T;
    return Result.Success(values) as IResultOfT<T, ValidationError[]>;
}

// Usage:
const r = combineValidations([
    validateName('Alice'),    // success
    validateEmail('bad'),     // failure → collects error
    validateAge(-5),          // failure → collects error
]);
// r.isFailure === true, r.error.length === 2
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

