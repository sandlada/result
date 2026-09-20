---
title: Getting Started
description: Install @sandlada/result and write your first typed Result pipeline.
---

`@sandlada/result` is a TypeScript library implementing the **Result Pattern** — a type-safe, exception-free approach to error handling. Success and failure both travel as plain objects, so the type system tells you when a call can fail instead of a `try`/`catch` block you have to remember to write.

Unlike traditional Result libraries that hardcode a single error type, this one is **fully generic over `TError`**: you bring your own error shapes.

## Installation

```bash
npm i @sandlada/result
```

:::caution[ESM only]
The package cannot be loaded with `require()`. Your project must use ESM (`import`) or dynamic `import()`.
:::

## Quick start

```ts
import type { IResultOfT } from '@sandlada/result';
import { ok, err } from '@sandlada/result/factories';
import { map, unwrapOr } from '@sandlada/result/operators';
import { pipe } from '@sandlada/result/composition';

type User = { id: string; name: string };

// Bring your own error type — a discriminated union works best.
type AppError =
  | { kind: 'NotFound'; id: string }
  | { kind: 'Validation'; fields: Record<string, string> };

function getUser(id: string): IResultOfT<User, AppError> {
  if (!id) {
    return err<AppError>({ kind: 'Validation', fields: { id: 'Required' } }) as IResultOfT<User, AppError>;
  }

  const user = users.get(id);

  if (!user) {
    return err<AppError>({ kind: 'NotFound', id }) as IResultOfT<User, AppError>;
  }

  return ok(user);
}

const users = new Map<string, User>([['42', { id: '42', name: 'Alice' }]]);

const name = pipe(
  getUser('42'),
  map((user) => user.name),
  unwrapOr('Unknown'),
);
```

`name` is `'Alice'`. Notice that nothing here can throw for a predictable failure: `NotFound` and `Validation` are values in the error channel.

## Import paths

The main barrel is **type-focused**. Its only runtime export is an empty default object, which exists so the entry and its sourcemap are materialized. Runtime values come from the subpath that matches the shape you are working with.

| Import path | Contents |
| --- | --- |
| `@sandlada/result` | Type contracts (`IResult`, `IResultOfT`, `IOption`, `AsyncResult`, `AsyncOption`) and the empty default marker. |
| `@sandlada/result/types` | The same type contracts, kept for backward compatibility. |
| `@sandlada/result/factories` | `ok`, `err`, `asyncOk`, `asyncErr`, `tryCatch`, `fromPromise`, and friends. |
| `@sandlada/result/operators` | Synchronous operators on `IResultOfT`: `map`, `bind`, `match`, `unwrapOr`, … |
| `@sandlada/result/option` | Synchronous `IOption<T>` operators: `ofSome`, `ofNone`, `map`, `bind`, `okOr`, … |
| `@sandlada/result/async-result` | Lazy `AsyncResult<T, E>` thunk operators. |
| `@sandlada/result/async-option` | Lazy `AsyncOption<T>` thunk operators. |
| `@sandlada/result/promise-result` | Eager operators on `Promise<IResultOfT>`. |
| `@sandlada/result/promise-option` | Eager operators on `Promise<IOption>`. |
| `@sandlada/result/composition` | `pipe`, `composeK`, `safeTry`, `pipeAsync`, `composeKAsync`. |
| `@sandlada/result/adapters` | `toOption`, `fromOption`, `switchFn`, `liftMap`, `tee`, … |
| `@sandlada/result/combine` | `combine`, `combineWithAllErrors`, `all`. |
| `@sandlada/result/reliability` | `retry`, `retryLazy`, `timeout`, `race`, `any`, `allSettled`. |
| `@sandlada/result/observability` | `ctx`, `withPath`, `format`, `inspect`, `installObserver`, … |
| `@sandlada/result/primitives` | `cond`, `condErr`, `sequence`, `reduce`, `partitionOption`, `lift`. |

### Why subpaths instead of one barrel?

Names like `map`, `bind`, and `match` exist for both `IResultOfT` and `IOption`. A single barrel cannot export two functions with the same name, so the package layout mirrors the type space instead: the import path tells both the compiler and the reader which shape is in play, and tree-shaking stays total.

## Narrowing

Access `value` or `error` only after narrowing. Because the variants are a discriminated union, the compiler rejects the wrong access.

```ts
import { ok } from '@sandlada/result/factories';
import { unwrapOr } from '@sandlada/result/operators';

const result = ok(21);

if (result.isSuccess) {
  // `value` exists here
  console.log(result.value * 2);
} else {
  // `error` exists here
  console.error(result.error);
}

console.log(unwrapOr(0)(result));
```

## Next steps

- [Behavior modes](/behavior-modes/) — which APIs throw, which capture, and which short-circuit.
- [API Reference](/api/) — every export, generated from the source JSDoc.
