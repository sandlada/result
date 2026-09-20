# types

`@sandlada/result` (root barrel) and `@sandlada/result/types` — the discriminated-union contracts every other module builds on.

## Scope

- Operates on: the value shapes themselves — `IResult`, `IResultOfT`, `IOption`, `AsyncResult`, `AsyncOption`.
- Execution model: none. Every named export is a type; the only runtime export is an empty `default` object that materializes the entries and their sourcemaps.
- Not here: constructors (`factories`), transformations (`operators`, `option`), async carriers (`async-result`, `promise-result`).

## API

### Result

| Export | Description | Source |
| --- | --- | --- |
| `IResult` (type) | Void result union: `IResultSuccess \| IResultFailure<TError>`; `TError` defaults to `unknown`. | [IResult.ts](./IResult.ts) |
| `IResultSuccess` (type) | Success variant without a value (`isSuccess: true`, `isFailure: false`). | [IResult.ts](./IResult.ts) |
| `IResultFailure` (type) | Failure variant carrying `error: TError` (`isSuccess: false`, `isFailure: true`). | [IResult.ts](./IResult.ts) |
| `IResultOfT` (type) | Value-bearing union: `IResultOfTSuccess<TValue> \| IResultOfTFailure<TError>`; `TError` defaults to `unknown`. | [IResultOfT.ts](./IResultOfT.ts) |
| `IResultOfTSuccess` (type) | Success variant carrying `value: TValue` (`isFailure: false`). | [IResultOfT.ts](./IResultOfT.ts) |
| `IResultOfTFailure` (type) | Failure variant carrying `error: TError` (`isSuccess: false`). | [IResultOfT.ts](./IResultOfT.ts) |

### Option

| Export | Description | Source |
| --- | --- | --- |
| `IOption` (type) | Optional-value union: `IOptionSome<T> \| IOptionNone`. | [Option.ts](./Option.ts) |
| `IOptionSome` (type) | Present value (`isSome: true`, `isNone: false`, `value: T`). | [Option.ts](./Option.ts) |
| `IOptionNone` (type) | Absent value (`isSome: false`, `isNone: true`). | [Option.ts](./Option.ts) |

### Async carriers

| Export | Description | Source |
| --- | --- | --- |
| `AsyncResult` (type) | Lazy thunk `{ readonly run: () => Promise<IResultOfT<T, E>> }`; `E` defaults to `unknown`. | [AsyncResult.ts](./AsyncResult.ts) |
| `AsyncOption` (type) | Lazy thunk `{ readonly run: () => Promise<IOption<T>> }`. | [AsyncOption.ts](./AsyncOption.ts) |

### Runtime entry marker

| Export | Description | Source |
| --- | --- | --- |
| `default` | Empty object. Its only purpose is to make Rolldown materialize the root and `/types` entries and their sourcemaps; it has no domain behavior. | [index.ts](./index.ts) |

## Contract notes

- Results and options are **plain objects** — no classes, no prototype methods, no sentinels.
- Narrow with the discriminant: `isSuccess` / `isFailure` on Results, `isSome` / `isNone` on Options. Accessing `value` on a failure or `error` on a success is a compile-time error.
- Every property is `readonly`; values are immutable by contract.
- `TError` defaults to `unknown`, not `Error`: a bare failure carries no usable payload until the caller narrows it.
- The root barrel `@sandlada/result` and `@sandlada/result/types` export the same contract set; both are type-focused, and functional runtime values come from subpaths.
- Values survive `JSON.stringify` unchanged, including both discriminants:

```ts
JSON.stringify(ok(42));    // '{"isSuccess":true,"isFailure":false,"value":42}'
JSON.stringify(err('x'));  // '{"isSuccess":false,"isFailure":true,"error":"x"}'
JSON.stringify(ofSome(1)); // '{"isSome":true,"isNone":false,"value":1}'
JSON.stringify(ofNone());  // '{"isSome":false,"isNone":true}'
```

## Design notes

- **Pure discriminated unions over classes.** Plain objects match TypeScript's structural type system, serialize trivially, and support property narrowing without `instanceof`.
- **Generic `TError` over a hardcoded error type.** Consumers define their own error contract; the library never converts a domain error into `Error` on their behalf.
- **Type-focused barrel.** The root entry exports contracts plus the empty `default` marker only. Functional runtime values are reachable exclusively through subpaths, which resolves name collisions at the import site and keeps tree-shaking total.

## Related

- Every module in `src/` depends on these contracts; see the module map in [`AGENTS.md`](../../AGENTS.md).
- [`factories`](../factories/README.md) and [`option`](../option/README.md) are the entry points that create these values.
