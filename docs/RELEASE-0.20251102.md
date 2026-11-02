# Release 0.20251102.0

Breaking release: new `bridge-result` / `bridge-option` subpaths, renamed exports, and removed aliases. See the [site migration page](https://result.sandlada.com/migration/) for import rewrites.

## Throw semantics

Phase 4 did **not** change runtime throw/reject policy for existing exports. The matrix shadow pass only aligned documentation and probes.

**Still different by design:** `async-result/mapAsync` propagates synchronous throws and callback rejections; `promise-result/mapAsync` captures them as `Err`. Renaming exports did not merge these behaviors.

## Removed or moved exports (summary)

### Lift operators → `bridge-result` / `bridge-option`

| Old | New |
| --- | --- |
| `promise-result` `asyncMap` … `asyncTapErr` (seven names) | `bridge-result` `map`, `bind`, `bindThrough`, `match`, `orElse`, `tap`, `tapErr` |
| `promise-option` `asyncMapOption` … `asyncTapOption` (five names) | `bridge-option` `map`, `bind`, `match`, `orElse`, `tap` |

### `promise-option` suffix drop

Fourteen eager operators lost the `Option` suffix (for example `mapAsyncOption` → `mapAsync`). Behavior unchanged; throw policy remains per module.

### Deleted

| Removed | Replacement |
| --- | --- |
| `adapters` `liftMap` | `operators` `map` |
| `promise-result` re-exports `asyncOk` / `asyncErr` | `@sandlada/result/factories` |
| `promise-option` re-exports `ofSome` / `ofNone` / `asyncOk` / `asyncErr` | `@sandlada/result/option` and `@sandlada/result/factories` |
