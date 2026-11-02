---
title: API migration (breaking release)
description: Import path and export name changes when upgrading from the 0.20260811 API surface to the current package.
---

This page lists **breaking renames and removals** introduced in the refactor that split sync→async **lift** operators into `bridge-result` / `bridge-option`, dropped redundant re-exports, and aligned `promise-option` naming. The archived docs under [`/0.20260811/`](/0.20260811/) still describe the old names; new code should use the tables below.

Behavior (throw vs capture vs short-circuit) is unchanged unless noted in the release notes. Same export name on different subpaths can still differ in policy — for example `async-result/mapAsync` and `promise-result/mapAsync` are not interchangeable.

## Lift operators moved out of `promise-result` / `promise-option`

These operators take a **sync** `IResultOfT` or `IOption` and return a `Promise` of the same carrier. They now live on dedicated bridge subpaths with shorter names.

| Old import | New import |
| --- | --- |
| `promise-result` `asyncMap` | `bridge-result` `map` |
| `promise-result` `asyncBind` | `bridge-result` `bind` |
| `promise-result` `asyncBindThrough` | `bridge-result` `bindThrough` |
| `promise-result` `asyncMatch` | `bridge-result` `match` |
| `promise-result` `asyncOrElse` | `bridge-result` `orElse` |
| `promise-result` `asyncTap` | `bridge-result` `tap` |
| `promise-result` `asyncTapErr` | `bridge-result` `tapErr` |
| `promise-option` `asyncMapOption` | `bridge-option` `map` |
| `promise-option` `asyncBindOption` | `bridge-option` `bind` |
| `promise-option` `asyncMatchOption` | `bridge-option` `match` |
| `promise-option` `asyncOrElseOption` | `bridge-option` `orElse` |
| `promise-option` `asyncTapOption` | `bridge-option` `tap` |

Example:

```ts
import { map } from '@sandlada/result/bridge-result';
import { ok } from '@sandlada/result/factories';

const r = await map(async (x: number) => x * 2, ok(21));
```

## `promise-option` eager operators — drop the `Option` suffix

The module already operates on `Promise<IOption<T>>`. The following exports were renamed (files were moved with `git mv`; behavior is unchanged):

`mapAsyncOption` → `mapAsync`, `bindAsyncOption` → `bindAsync`, `matchAsyncOption` → `matchAsync`, `orElseAsyncOption` → `orElseAsync`, `tapAsyncOption` → `tapAsync`, `tapErrAsyncOption` → `tapErrAsync`, `containsAsyncOption` → `containsAsync`, `existsAsyncOption` → `existsAsync`, `filterAsyncOption` → `filterAsync`, `flattenAsyncOption` → `flattenAsync`, `mapOrAsyncOption` → `mapOrAsync`, `mapOrElseAsyncOption` → `mapOrElseAsync`, `unwrapOrAsyncOption` → `unwrapOrAsync`, `unwrapOrElseAsyncOption` → `unwrapOrElseAsync`.

These names now match `promise-result` / `async-result` spelling. **Throw policy is still per module** — do not assume `promise-option/mapAsync` behaves like `async-option/mapAsync`.

## Removed exports and replacements

| Removed | Use instead |
| --- | --- |
| `adapters` `liftMap` | `operators` `map` (same curried/data-last shape; `liftMap` was a semantic alias) |
| `promise-result` barrel `asyncOk` / `asyncErr` | `factories` `asyncOk` / `asyncErr` |
| `promise-option` barrel `ofSome` / `ofNone` / `asyncOk` / `asyncErr` | `option` `ofSome` / `ofNone` and `factories` `asyncOk` / `asyncErr` |

## Related docs

- [Bridge-result module spec](/specs/bridge-result/) — sync Result lifted to a Promise of Result.
- [Bridge-option module spec](/specs/bridge-option/) — sync Option lifted to a Promise of Option.
- [Behavior modes](/behavior-modes/) — throw and short-circuit policy by subpath.
