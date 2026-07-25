# @sandlada/result

![Codecov](https://img.shields.io/codecov/c/github/sandlada/result?flag=unittests&label=Coverage&labelColor=%2300531f&color=%23a3f5aa&style=flat-square)
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
- **Async-native** — `asyncOk`/`asyncErr` factories + `pipeAsync` for Promise-based railways, plus lazy `AsyncResult` / `AsyncOption` thunks
- **Railway Oriented Programming** built-in — `map`, `bind`, `orElse`, `match`, `tap`, `combine`
- **Reliability** — bounded `retry`, `timeout`, `race`, `any`, `allSettled` for production pipelines
- **Observability** — breadcrumb `withPath` / `ctx` / `tapErrContext` + `format` / `inspect` / `installObserver`
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

All exports are listed in [SPEC.md](./SPEC.md) with links to their source files. Full type signatures and JSDoc live in the source.

| Export path | Contents |
| --- | --- |
| `@sandlada/result` | Core types, factories, sync + async operators, adapters, composition, combine (everything) |
| `@sandlada/result/promise-result` | Async operators on `Promise<IResultOfT>` |
| `@sandlada/result/async-result` | Lazy AsyncResult thunks |
| `@sandlada/result/async-option` | Lazy AsyncOption thunks |
| `@sandlada/result/adapters` | Wlaschin three-shape adapters |
| `@sandlada/result/combine` | Parallel combination |
| `@sandlada/result/composition` | Composition helpers |
| `@sandlada/result/factories` | Core constructors |
| `@sandlada/result/operators` | Sync operators |
| `@sandlada/result/option` | `IOption<T>` operators |
| `@sandlada/result/reliability` | Retry / timeout / concurrency |
| `@sandlada/result/observability` | Breadcrumbs + formatters + observer hooks |
| `@sandlada/result/primitives` | High-frequency helpers |
| `@sandlada/result/types` | Type definitions only |

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

- [SPEC.md](./SPEC.md) — API index with links to each source file
- [ARCH.md](./ARCH.md) — internal architecture and contributor documentation
- [AGENTS.md](./AGENTS.md) — AI agent conventions and project metadata for tool-assisted development

## License

MIT
