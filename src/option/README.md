# option

`@sandlada/result/option` — data-last curried operators on synchronous `IOption`, independent of Result.

## Scope

- Operates on: `IOption<T>` (Some / None).
- Execution model: synchronous; no Promise is involved.
- Not here: Result operators (`operators`), async Option carriers (`async-option`, `promise-option`).

## API

### Constructors

| Export | Description | Source |
| --- | --- | --- |
| `ofSome` | Wraps a value in `Some`. | [ofSome.ts](./ofSome.ts) |
| `ofNone` | Returns the frozen `None` singleton; `T` defaults to `unknown` so contextual typing flows. | [ofNone.ts](./ofNone.ts) |

### Transform and chain

| Export | Description | Source |
| --- | --- | --- |
| `map` | Transforms the `Some` value. | [map.ts](./map.ts) |
| `bind` | Chains a callback that returns the next Option. | [bind.ts](./bind.ts) |
| `filter` | Turns `Some` into `None` when the predicate fails. | [filter.ts](./filter.ts) |
| `flatten` | Flattens a nested `IOption<IOption<T>>`. | [flatten.ts](./flatten.ts) |
| `orElse` | Falls back to another Option on `None`. | [orElse.ts](./orElse.ts) |
| `tap` | Side effect on `Some`; the original Option is returned. | [tap.ts](./tap.ts) |

### Query and combine

| Export | Description | Source |
| --- | --- | --- |
| `contains` | Equality check against the `Some` value. | [contains.ts](./contains.ts) |
| `all` | Combines a non-empty tuple of Options, short-circuiting on the first `None`. | [all.ts](./all.ts) |
| `zipWith` | Combines N≥2 Options with a function (explicit arities 2–10, mapped type beyond). | [zipWith.ts](./zipWith.ts) |
| `traverseArray` / `traverse` | Maps an array / iterable with an Option-returning function, short-circuiting on `None`. | [traverseArray.ts](./traverseArray.ts) |

### Bridge to Result

| Export | Description | Source |
| --- | --- | --- |
| `okOr` / `okOrElse` | `Some` becomes `Ok`; `None` becomes `Err(error)` / `Err(errorFn())`. | [okOr.ts](./okOr.ts), [okOrElse.ts](./okOrElse.ts) |
| `transpose` | Swaps `IOption<IResultOfT<T, E>>` and `IResultOfT<IOption<T>, E>`. | [transpose.ts](./transpose.ts) |

### Terminals

| Export | Description | Source |
| --- | --- | --- |
| `match` | Pattern match over `Some` / `None`. | [match.ts](./match.ts) |
| `unwrapOr` | Extracts the `Some` value or returns the default. | [unwrapOr.ts](./unwrapOr.ts) |

## Contract notes

- Every operator except `match` collapses a throwing callback into `None` or the default value; `match` propagates. See [behavior-modes.md §4.5](../../docs/behavior-modes.md#45-option-srcoption).
- The module deliberately has **no panic APIs** (`unwrap` / `expect` / `orThrow` do not exist here): absence is expressed with `None`, and extraction goes through `unwrapOr`, `okOr` or `match`.
- `all` requires a non-empty tuple at the type level; unlike `combine/all`, `all([])` does not typecheck.
- `traverseArray` covers concrete arrays with an index-aware callback; `traverse` covers generic `Iterable` inputs. Both capture callback throws and iterator `next()` throws as `None`.
- Data-last and curried: `map(fn)(option)`; every operator also accepts the direct form `map(fn, option)`.

## Design notes

- **Independent of Result.** Option is its own module with no Result import; conversion happens through `okOr` / `transpose` here and `toOption` / `fromOption` in `adapters`. This keeps the two type spaces decoupled and tree-shakeable.

## Related

- [`adapters`](../adapters/README.md) — `toOption` / `fromOption` conversions.
- [`promise-option`](../promise-option/README.md) and [`async-option`](../async-option/README.md) — eager and lazy async carriers for Options.
- [`operators`](../operators/README.md) — the parallel operator set on `IResultOfT`.
