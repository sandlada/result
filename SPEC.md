# SPEC

## Overview

`@sandlada/result` is a TypeScript library implementing the **Result pattern** — a type-safe, exception-free approach to error handling. It provides `IResult` interfaces and `Result` classes that make error flows explicit in the type system, inspired by C# Result pattern libraries but with **fully generic, user-definable error types**.

## Installation

```bash
npm install @sandlada/result
```

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

### `IResult<TValue, TError = Error>`

A result that carries a **success value**.

```ts
interface IResult<TValue, TError = Error> extends IResult<TError> {
    readonly value: TValue;
}
```

- `value` — the success payload. **Throws `TypeError`** if accessed on a failure result.

### Default Error Type

When `TError` is omitted, it defaults to `Error`:

```ts
const result: IResult = Result.Failure(new Error('fail'));       // IResult<Error>
const result: IResult<string> = Result.Success('hello');         // IResult<string, Error>
```

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

Creates a failure result.

```ts
const err = Result.Failure(new Error('Something went wrong'));
err.isSuccess; // false
err.error.message; // 'Something went wrong'
```

### `Result.Success<TValue>(value)`

Creates a success result carrying a value. The type is inferred from the argument.

```ts
const ok = Result.Success({ id: 1, name: 'Alice' });
// IResult<{ id: number; name: string }>
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
// IResult<string, ApiError>
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

function getUser(id: string): IResult<User, AppError> {
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

function validateEmail(email: string): IResult<string, DomainError> {
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

當一個項目或第三方套件使用固定的錯誤類型時，每次都寫 `IResult<T, MyError>` 和 `Result.Failure<T, MyError>(...)` 會很繁瑣。`@sandlada/result` 的泛型設計天然支援**兩層封裝**來消除重複。

### 方案一：型別別名（Type Alias）

最輕量的方式，只需一個型別別名：

```ts
// app-result.ts
import type { IResult } from '@sandlada/result';
import type { AppError } from './errors';

export type AppResult<T = void> = IResult<T, AppError>;
```

使用時無需指定 `TError`：

```ts
import type { AppResult } from './app-result';

function createUser(data: UserInput): AppResult<User> {
    // AppResult<User> 等價於 IResult<User, AppError>
}
```

但工廠方法仍然需要顯式標註 — `Result.Failure<User, AppError>(...)` 無法省去。

### 方案二：便利工廠（Convenience Factory）

進一步封裝一個**同名工廠物件**，將錯誤型別綁定到 `Success`/`Failure` 中：

```ts
// app-result.ts
import { Result } from '@sandlada/result';
import type { IResult } from '@sandlada/result';
import type { AppError } from './errors';

export type AppResult<T = void> = IResult<T, AppError>;

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
        return Result.Failure(error) as AppResult<never>;
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
import type { IResult } from '@sandlada/result';

/** 將子系統的錯誤轉換為當前系統的錯誤 */
function mapError<T>(result: IResult<T, SubError>): AppResult<T> {
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
function process(): IResult<Output, AppError> {
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
function handle(result: IResult<string, AppError>) {
    if (result.isSuccess) {
        result.value.toUpperCase(); // ✅ string
    } else {
        // result.error is AppError — use discriminated union switch
    }
}
```

## C# Reference Comparison

This library is inspired by the C# Result pattern. Key differences:

| Concept           | C#                                                               | This Library                              |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| Base interface    | `IResult { DomainError Error; bool IsSuccess; bool IsFailure; }` | `IResult<TError = Error>`                 |
| Value interface   | `IResult<out T> : IResult { T Value; }`                          | `IResult<TValue, TError = Error>`         |
| Error type        | `DomainError` (hardcoded enum)                                   | `TError` (generic, user-defined)          |
| No-error sentinel | `DomainError.General.None`                                       | Internal `Symbol('result:none')`          |
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
- **Sentinel pattern** — `error` is always accessible (never throws), matching C# semantics where `Error` returns `DomainError.General.None` on success.
- **`value` throws on failure** — guards against accidental access; forces explicit `isSuccess` checks.
- **PascalCase static, camelCase instance** — static factory methods use PascalCase (`Result.Success`, `Result.Failure`) matching C# convention, while instance properties use camelCase (`isSuccess`, `isFailure`) following TypeScript convention.

