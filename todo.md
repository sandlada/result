# TODO — Production Readiness Audit

This file documents files that were **not** tagged with `@note Ready for Product` during the audit. Each entry describes the concern, why it blocks tagging, and a recommended resolution.

> **Update 2026-07-21** — Implementation of Cat 4 (excl 4.2), Cat 6, Cat 7, Cat 8, Cat 9.1 is **complete**. See "Resolution Status" at the bottom.
>
> **Deferred per user request** (2026-07-21): Category 5 (`switchFn` type lie), Category 9.2 (`unwrapOrElse` "Never throws"), Category 4.2 (`asyncTapOption` catch decision).

---

## 4. Inconsistent Error Handling — Missing try/catch

These files do **not** wrap user callbacks in `try/catch`, so a sync throw escapes or rejects the Promise — inconsistent with their siblings which catch and convert to failure/None.

### `src/async/asyncBindOption.ts` — `asyncBindOption` ✅ (2026-07-21)
- **Issue**: No try/catch + no `.catch()` rejection handler (unlike `asyncBind` which handles both sync throws and Promise rejections).
- **Fix**: Add try/catch around the callback and `.catch()` on the returned Promise.
- **Status**: ✅ Try/catch added; `err(e)` semantics converted to `ofNone()` (Option→None); JSDoc + `@note Ready for Product` added. Spec rewritten — replaced native-propagation test with 3 catch+convert tests.

### `src/async/asyncTapOption.ts` — `asyncTapOption` ⏸️ (deferred as 4.2)
- **Issue**: No try/catch + no `.catch()` rejection handler (unlike `asyncTap`).
- **Also flagged in**: Category 9 — JSDoc says "Returns the original Option" but rejection propagates without `.catch()`.
- **Fix**: Add `.catch()` to trap rejections and return the original Option.
- **Status**: ⏸️ **Deferred** per user scope reduction (2026-07-21). Pending separate decision on catch semantics.

### `src/async/existsAsync.ts` — `existsAsync` ✅ (2026-07-21)
- **Issue**: No try/catch around the predicate callback.
- **Fix**: Wrap predicate in try/catch, returning `false` on throw.
- **Status**: ✅ Try/catch added; predicate throws/rejects → `false`. JSDoc + `@note Ready for Product`. Spec has 2 throw-path tests.

### `src/async/existsAsyncOption.ts` — `existsAsyncOption` ✅ (2026-07-21)
- **Issue**: No try/catch around the predicate callback.
- **Fix**: Wrap predicate in try/catch, returning `false` on throw.
- **Status**: ✅ Same pattern as `existsAsync` for `IOption`. Spec has 2 throw-path tests.

### `src/async/filterAsyncOption.ts` — `filterAsyncOption` ✅ (2026-07-21)
- **Issue**: No try/catch around the predicate callback.
- **Fix**: Wrap predicate in try/catch.
- **Status**: ✅ Try/catch added; catch → `ofNone()` (Option). Spec has 2 throw-path tests.

### `src/async/filterOrElseAsync.ts` — `filterOrElseAsync` ✅ (2026-07-21)
- **Issue**: No try/catch (unlike sync `filterOrElse` which catches and converts to failure).
- **Fix**: Add try/catch around the predicate.
- **Status**: ✅ Try/catch around predicate + errorFn; catch → `err(e as E)`. Spec has 3 throw-path tests (predicate sync/async, errorFn).

### `src/async-result/filterOrElse.ts` — `filterOrElse` ✅ (2026-07-21)
- **Issue**: No try/catch (unlike `bind`/`map` in the same module which catch).
- **Fix**: Add try/catch around the predicate.
- **Status**: ✅ Try/catch inside `run`; catch → `err(e as E)`. Spec has 3 throw-path tests.

### `src/async-option/filter.ts` — `filter` ✅ (2026-07-21)
- **Issue**: No try/catch (unlike `bind`/`map` in the same module which catch).
- **Fix**: Add try/catch around the predicate.
- **Status**: ✅ Try/catch inside `run`; catch → `ofNone()`. Spec has 2 throw-path tests.

---

## 5. Type Safety Footgun ⏸️ (deferred)

### `src/adapters/switchFn.ts` — `switchFn` ⏸️
- **Issue**: Return type `IResultOfT<B, never>` is a type lie: the catch branch produces `err(e as never)` but the caught `e` is `unknown`. Consumers cannot read the caught error without a cast.
- **Fix**: Either (a) change the return type to `IResultOfT<B, Error>` and wrap caught errors, or (b) accept a fallback error factory.
- **Status**: ⏸️ **Deferred** per user scope reduction (2026-07-21). Type-strategy decision still pending.

### `src/adapters/switchFnAsync.ts` — `switchFnAsync` ⏸️ (Cat 5) + ✅ (Cat 6)
- **Issue**: Same `IResultOfT<B, never>` type lie as sync sibling.
- **Also flagged in**: Category 6 (thin test coverage — only 1 happy-path test).
- **Fix**: Same options as `switchFn.ts`. Align with whatever fix is chosen for the sync variant.
- **Status**: ⏸️ Cat 5 deferred; ✅ Cat 6 expanded from 1 to 6 tests (mirrors `switchFn.spec.ts`). Tests use `(result.error as Error)` cast until Cat 5 fix lands.

---

## 6. Thin Test Coverage

### `src/factories/asyncOk.ts` — `asyncOk` ✅ (2026-07-21)
- **Issue**: Only 1 test case (happy path). Missing: edge cases, void overload, type-level checks.
- **Fix**: Add tests covering void overload and cross-type comparisons.
- **Status**: ✅ Expanded to 6 tests (value-passing, type inference, null, undefined, consistency, IResult conformance). Note: `asyncOk` returns `Promise<IResultOfT>` not `AsyncResult`, so no `.run()` call. No void overload exists in `asyncOk<T>(value: T)` signature.

### `src/factories/asyncErr.ts` — `asyncErr` ✅ (2026-07-21)
- **Issue**: Only 1 test case (happy path). Missing: type-level checks, error type propagation.
- **Fix**: Add tests covering error type compatibility.
- **Status**: ✅ Expanded to 12 tests mirroring `err.spec.ts` (Error objects, discriminated unions, numeric codes, typed, factory consistency). No void overload exists in `asyncErr<E>(error: E)` signature.

### `src/adapters/switchFnAsync.ts` — `switchFnAsync` ✅ (2026-07-21, Cat 6 only)
- **Issue**: Only 1 test (happy path). Missing: error-path, sync-return, falsy/null tests that the sync sibling has.
- **Also flagged in**: Category 5 (type safety footgun).
- **Fix**: Add tests mirroring `switchFn.spec.ts`.
- **Status**: ✅ Cat 6 expanded to 6 tests; Cat 5 still deferred.
---

## 7. Missing Zero-Arg Guard

### `src/composition/composeK.ts` — `composeK` ✅ (2026-07-21)
- **Issue**: No guard for `composeK()` with zero arguments. Uses `fns[0]!` non-null assertion assuming non-empty input. Unlike `composeKAsync` which rejects with `TypeError` on zero args.
- **Fix**: Add a guard: `if (fns.length === 0) throw new TypeError('composeK requires at least one function');`
- **Status**: ✅ Guard added BEFORE the try/catch (so the TypeError escapes synchronously and is not swallowed). Spec has a new test asserting `composeK()` throws `TypeError`.

---

## 8. Missing `@fileoverview` / `@example` Documentation ✅ (2026-07-21)

These files have only a brief one-line JSDoc or `@example`-only header, failing the "full @fileoverview + @example" bar.

### `src/async/` (13 files — docs-only)
| File                     | Current header                    | Status |
| ------------------------ | --------------------------------- | ------ |
| `asyncTap.ts`            | Brief one-liner, no @fileoverview | ✅      |
| `asyncTapErr.ts`         | Brief one-liner, no @fileoverview | ✅      |
| `bimapAsync.ts`          | Brief one-liner, no @fileoverview | ✅      |
| `bindThroughAsync.ts`    | Brief one-liner, no @fileoverview | ✅      |
| `containsAsync.ts`       | Brief one-liner, no @fileoverview | ✅      |
| `containsAsyncOption.ts` | Brief one-liner, no @fileoverview | ✅      |
| `flattenAsync.ts`        | Brief one-liner, no @fileoverview | ✅      |
| `flattenAsyncOption.ts`  | Brief one-liner, no @fileoverview | ✅      |
| `mapAsyncOption.ts`      | Brief one-liner, no @fileoverview | ✅      |
| `matchAsyncOption.ts`    | Brief one-liner, no @fileoverview | ✅      |
| `orElseAsyncOption.ts`   | Brief one-liner, no @fileoverview | ✅      |
| `swapAsync.ts`           | Brief one-liner, no @fileoverview | ✅      |
| `tapAsyncOption.ts`      | Brief one-liner, no @fileoverview | ✅      |

### `src/async-result/` (9 files)
| File             | Current header                    | Status |
| ---------------- | --------------------------------- | ------ |
| `andThrough.ts`  | Brief one-liner, no @fileoverview | ✅      |
| `bimap.ts`       | Brief one-liner, no @fileoverview | ✅      |
| `contains.ts`    | Brief one-liner, no @fileoverview | ✅      |
| `exists.ts`      | Brief one-liner, no @fileoverview | ✅      |
| `flatten.ts`     | Brief one-liner, no @fileoverview | ✅      |
| `swap.ts`        | Brief one-liner, no @fileoverview | ✅      |
| `mapErrAsync.ts` | @example only, no @fileoverview   | ✅      |
| `tapAsync.ts`    | @example only, no @fileoverview   | ✅      |
| `tapErrAsync.ts` | @example only, no @fileoverview   | ✅      |

**Fix**: Add full `@fileoverview` describing purpose, input/output contract, and error semantics, plus a minimal `@example` code block for each.

> **Cross-references**: Several files in this category ALSO have issues in Category 4 (missing try/catch). Those files — `asyncBindOption`, `asyncTapOption`, `existsAsync`, `existsAsyncOption`, `filterAsyncOption`, `filterOrElseAsync`, `filterOrElse` (async-result), `filter` (async-option) — are listed under Category 4 as their primary blocker. Their JSDoc gaps should be addressed in the same fix pass.

**Bonus**: `src/async-option/bind.ts` (had `@example` only) — also got `@fileoverview` prepended.

**Additional** (in same fix pass, already had `@note` but added examples to reach full bar):
- `src/async-result/andTee.ts`, `orTee.ts` — added `@example` to existing `@fileoverview` blocks.

---

## 9. Documentation-vs-Implementation Contradictions

JSDoc states a behavioral guarantee that the implementation does **not** uphold. These contradictions must be resolved before tagging (either update the code or update the doc). The files are listed here for reference; the primary entry is under their respective Category 3 (tap/tee design ambiguity), Category 4 (missing try/catch), or Category 2 (unresolved comments).

| File                            | Doc claim                     | Code contradiction                  | Primary cat            |
| ------------------------------- | ----------------------------- | ----------------------------------- | ---------------------- |
| `src/operators/map.ts`          | "must not throw"              | Catches throw → err                 | 9 (standalone) ✅ (9.1) |
| `src/operators/unwrapOrElse.ts` | "Never throws"                | `onErr()` called w/o try/catch      | 9 (standalone) ⏸️ (9.2) |
| `src/operators/tap.ts`          | "passes through unchanged"    | Catch converts to err               | 3 ✅                    |
| `src/operators/tapErr.ts`       | "passes through unchanged"    | Catch converts to err               | 3 ✅                    |
| `src/operators/andTee.ts`       | "passes through unchanged"    | Catch converts to err               | 3 ✅                    |
| `src/operators/orTee.ts`        | "passes through unchanged"    | Catch converts to err               | 3 ✅                    |
| `src/option/tap.ts`             | "passes through unchanged"    | Catch converts to None              | 3 ✅                    |
| `src/adapters/tee.ts`           | "returns the value unchanged" | No try/catch; throw propagates      | 4 ✅                    |
| `src/adapters/teeAsync.ts`      | "returns the value unchanged" | No try/catch; rejection propagates  | 4,6 ✅                  |
| `src/async-result/tap.ts`       | "passes through unchanged"    | Catch converts to err               | 3 ✅                    |
| `src/async-result/tapErr.ts`    | "passes through unchanged"    | Catch converts to err               | 3 ✅                    |
| `src/async/asyncTapOption.ts`   | "Returns the original Option" | No `.catch()`; rejection propagates | 4 ⏸️ (deferred as 4.2)  |

### Standalone entries (primary Category 9):

### `src/operators/map.ts` — `map` ✅ (9.1, 2026-07-21)
- **Issue**: JSDoc says the mapping function "must not throw", but the code wraps the call in try/catch and converts thrown errors to `err(e)`.
- **Fix**: Either (a) remove the try/catch and add a runtime-throw guard (matching the doc), or (b) update the doc to "throws are converted to `err`" (matching the code).
- **Status**: ✅ JSDoc updated to "If the mapping function throws, the thrown value is caught and converted to `err(caughtError)`"; `@note Ready for Product` added. Spec has a new throw-path test.

### `src/operators/unwrapOrElse.ts` — `unwrapOrElse` ⏸️ (9.2)
- **Issue**: JSDoc says "Never throws", but `onErr(r.error)` is called without try/catch. If the user's `onErr` callback throws, the exception propagates.
- **Fix**: Either (a) add try/catch around `onErr()` and throw a wrapped error, or (b) update the doc to warn that the `onErr` callback must not throw.
- **Status**: ⏸️ **Deferred** per user scope reduction (2026-07-21). Awaiting decision on catch semantics (Option B catch+convert vs. propagate).

> **For all tap/tee entries (9 files — Categories 3 + 9 overlap)**: ✅ **Resolved** (2026-07-20) — Canonical policy decided: Option B (catch + convert). All 13 tap/tee family files updated: 8 already catch+convert (JSDoc updated), 2 had inline literals replaced with `ofNone()` + comments removed, 2 behavior-changed from propagate to catch+convert (`async-result/andTee`, `orTee`), 2 one-track adapters documented as propagate-by-design (`adapters/tee`, `teeAsync`). Throw-path tests added to 11 spec files.

---

## Resolution Status (2026-07-21)

| Category                   | Files      | Status                                                                         |
| -------------------------- | ---------- | ------------------------------------------------------------------------------ |
| 1. Bugs                    | 1 ✅        | `unwrapOrAsyncOption` — inconsistency with sibling (fixed)                     |
| 2. Unresolved comments     | 1 ✅        | `async-option/tap` — comments removed, literal→`ofNone()` (fixed)              |
| 3. Design ambiguity        | 7 ✅        | `tap`/`tee` throw semantics — Option B (catch+convert) applied                 |
| 4. Missing try/catch       | 7 ✅ / 2 ⏸️  | 7 fixed; 2 deferred (4.2 `asyncTapOption` — catch decision pending)            |
| 5. Type safety             | 2 ⏸️        | `switchFn`/`switchFnAsync` — return type lie (deferred)                        |
| 6. Thin tests              | 4 ✅        | All 4 thin specs expanded (`asyncOk`, `asyncErr`, `switchFnAsync`, `teeAsync`) |
| 7. Zero-arg guard          | 1 ✅        | `composeK` — guard added before try/catch                                      |
| 8. Missing JSDoc           | 23 ✅       | All `async/`, `async-result/`, and bonus `async-option/bind.ts` updated        |
| 9. Doc-vs-impl             | 11 ✅ / 1 ⏸️ | `map` (9.1) fixed; `unwrapOrElse` (9.2) deferred                               |
| **≈52 unique files total** |            | 46 resolved, 4 deferred (4.2, 5×2, 9.2)                                        |

---

## Deferred Items (Awaiting Decision)

| ID  | File                            | Concern                                                     |
| --- | ------------------------------- | ----------------------------------------------------------- |
| 4.2 | `src/async/asyncTapOption.ts`   | Catch+convert vs propagate (currently propagates)           |
| 5   | `src/adapters/switchFn.ts`      | `IResultOfT<B, never>` is a type lie                        |
| 5   | `src/adapters/switchFnAsync.ts` | Same type lie as sync sibling                               |
| 9.2 | `src/operators/unwrapOrElse.ts` | "Never throws" claim contradicted by uncaught `onErr` throw |

---

## Resolution Order (Recommended)

1. **Category 3 first** — ✅ **Resolved** (2026-07-20) — Canonical `tap`/`tee` throw policy decided: **Option B (catch + convert)**. Railway-based tap/tee converts throw to failure/None; one-track `tee`/`teeAsync` propagates (no failure state) with explicit doc.
2. **Categories 9 + 2** — ✅ **Resolved** (2026-07-20/21) — Fixed doc-vs-impl contradictions and removed unresolved comments across all 13 tap/tee family files. `map` (9.1) also fixed in 2026-07-21. `unwrapOrElse` (9.2) still pending.
3. **Categories 4 + 7** — ✅ **Resolved** (2026-07-21) — All missing try/catch added; zero-arg guard for `composeK` added (with spec test). `asyncTapOption` (4.2) deferred to a separate decision.
4. **Category 1** — ✅ **Resolved** (2026-07-20) — `unwrapOrAsyncOption` aligned with sibling; reframed from "runtime bug" to "inconsistency" since Promise auto-flattening already produced correct behavior.
5. **Category 5** — ⏸️ **Deferred** — Decide on `switchFn` error type strategy.
6. **Categories 6 + 8** — ✅ **Resolved** (2026-07-21) — All 4 thin specs expanded; 23 files now have full `@fileoverview` + `@example` JSDoc.
