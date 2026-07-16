# @sandlada/result

![NPM Downloads](https://img.shields.io/npm/d18m/@sandlada/result?label=NPM%20Downloads&labelColor=%2300531f&color=%23a3f5aa)
![NPM Version](https://img.shields.io/npm/v/%40sandlada%2Fresult?label=NPM%20Version&labelColor=%2300531f&color=%23a3f5aa)
![GitHub License](https://img.shields.io/github/license/sandlada/result?label=License&labelColor=%2300531f&color=%23a3f5aa)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/sandlada/result/tree/main/demo)

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
    return err<AppError>({ kind: 'Validation', fields: { id: 'Required' } }) as IResultOfT<User, AppError>;
  }
  const user = db.find(id);
  if (!user) {
    return err<AppError>({ kind: 'NotFound', id }) as IResultOfT<User, AppError>;
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

## :ledger: API Overview

All exports are documented in detail in [SPEC.md](./SPEC.md) with full signatures, examples, and edge-case behavior.

| Export path                     | Contents                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@sandlada/result`              | Core types (`IResult`, `IResultOfT`), factories (`ok`, `err`, `tryCatch`, `fromPromise`, …), sync operators (`map`, `bind`, `match`, `unwrap`, `orThrow`, …), async operators (`mapAsync`, `bindAsync`, `pipeAsync`, …), adapters (`toOption`, `switchFn`, `tee`, …), composition (`pipe`, `composeK`, `safeTry`), combine (`combine`, `all`, `combineWithAllErrors`) |
| `@sandlada/result/async`        | Async operators on `Promise<IResultOfT>` — `mapAsync`, `bindAsync`, `matchAsync`, `orElseAsync`, `tapAsync`, `unwrapOrAsync`, `asyncBindThrough`, …                                                                                                                                                                                                                   |
| `@sandlada/result/async-result` | Lazy AsyncResult thunks — `from`, `fromPromise`, `fromResult`, `map`, `bind`, `orElse`, `match`, `combine`, `combineWithAllErrors`                                                                                                                                                                                                                                    |
| `@sandlada/result/async-option` | Lazy AsyncOption thunks — `from`, `fromPromise`, `fromOption`, `map`, `bind`, `orElse`, `match`, `tap`, `unwrapOr`                                                                                                                                                                                                                                                    |
| `@sandlada/result/adapters`     | Wlaschin three-shape adapters — `switchFn`, `switchFnAsync`, `liftMap`, `tee`, `teeAsync`, `toOption`, `fromOption`                                                                                                                                                                                                                                                   |
| `@sandlada/result/combine`      | Parallel combination — `combine`, `all`, `combineWithAllErrors`                                                                                                                                                                                                                                                                                                       |
| `@sandlada/result/composition`  | Composition helpers — `pipe`, `composeK`, `composeKAsync`, `pipeAsync`, `safeTry`, `fromSafeTry`                                                                                                                                                                                                                                                                      |
| `@sandlada/result/factories`    | Core constructors — `ok`, `err`, `fromPredicate`, `fromThrowable`, `tryCatch`, `tryCatchAsync`, `fromPromise`, `fromSafePromise`, `asyncOk`, `asyncErr`                                                                                                                                                                                                               |
| `@sandlada/result/operators`    | Sync operators — `map`, `bind`, `match`, `unwrap`, `orThrow`, `separate`, `traverseArray`, …                                                                                                                                                                                                                                                                          |
| `@sandlada/result/option`       | Option module — `ofSome`, `ofNone`, `map`, `bind`, `match`, `okOr`, `transpose`, …                                                                                                                                                                                                                                                                                    |
| `@sandlada/result/types`        | Type definitions only — `IResult`, `IResultOfT`, `IOption`, `AsyncResult`, `AsyncOption`                                                                                                                                                                                                                                                                              |

## :package: Integration Pattern

Bind your error type once and eliminate generic boilerplate:

```ts
// app-result.ts
import { ok, err } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';
import type { AppError } from './errors.js';

export type AppResult<T = void> = IResultOfT<T, AppError>;

export const AppResult = {
  Success<T>(value?: T): AppResult<T> { return (value === undefined ? ok() : ok(value)) as unknown as AppResult<T>; },
  Failure(error: AppError): AppResult<never> { return err(error) as unknown as AppResult<never>; },
} as const;
```

```ts
// usage — no TError generic anywhere
function getUser(id: string): AppResult<User> {
  if (!id) return AppResult.Failure({ kind: 'Validation', fields: { id: 'Required' } });
  return AppResult.Success({ id, name: 'Alice' });
}
```

## :ledger: Further Reading

- [SPEC.md](./SPEC.md) — complete API reference with signatures, examples, and all modules
- [ARCH.md](./ARCH.md) — internal architecture, module design, and contributor documentation
- [AGENTS.md](./AGENTS.md) — AI agent conventions and project metadata for tool-assisted development

## License

MIT
