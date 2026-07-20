# TODO — Production Readiness Audit

This file documents files that were **not** tagged with `@note Ready for Product` during the audit. Each entry describes the concern, why it blocks tagging, and a recommended resolution. No code changes are made in this task — all fixes deferred to a dedicated follow-up.

---

## 2. Unresolved Design Comments ✅

### `src/async-option/tap.ts` — `tap` ✅
- **Issue**: Lines 35–40 contained unresolved design-uncertainty comments. Also used an inline `{isSome: false, isNone: true}` literal instead of `ofNone()`.
- **Fix**: ✅ **Resolved** (2026-07-20) — Removed the 5 unresolved comments, added `import { ofNone } from '../option/index.js'`, replaced the inline literal with `ofNone()`, and updated JSDoc with a `@fileoverview` documenting the throw→None policy.
- **Also flagged in**: Category 3 ✅, Category 9 ✅.

---

## 3. Design Ambiguity — `tap`/`tee` Throw Semantics ✅

**Decision**: ✅ **Option B (catch + convert)** — When a `tap`/`tee` side-effect callback throws, the result converts to the failure/None state. This is the canonical policy across all railway-based tap/tee modules. The one-track `tee`/`teeAsync` adapters (no failure state) propagate throws with explicit documentation.

**Resolved** (2026-07-20): Applied Option B uniformly across all 13 tap/tee family files.

| File                           | Throw behavior                         | Status                                                       |
| ------------------------------ | -------------------------------------- | ------------------------------------------------------------ |
| `src/option/tap.ts`            | throw → `ofNone()` (converts to None)  | ✅ JSDoc updated (already catch+convert)                      |
| `src/async-result/tap.ts`      | throw → `err(e)` (converts to failure) | ✅ JSDoc updated (already catch+convert)                      |
| `src/async-result/tapErr.ts`   | throw → `err(e)` (converts to failure) | ✅ JSDoc updated (already catch+convert)                      |
| `src/async-option/tap.ts`      | throw → `ofNone()`                     | ✅ Comments removed, literal→`ofNone()`, JSDoc updated        |
| `src/async-option/tapAsync.ts` | throw → `ofNone()`                     | ✅ Literal→`ofNone()`, JSDoc updated                          |
| `src/async-result/andTee.ts`   | throw → `err(e)` (converts to failure) | ✅ **Behavior change**: added try/catch (was propagate)       |
| `src/async-result/orTee.ts`    | throw → `err(e)` (converts to failure) | ✅ **Behavior change**: added try/catch (was propagate)       |
| `src/operators/tap.ts`         | throw → `err(e)` (converts to failure) | ✅ JSDoc updated (already catch+convert)                      |
| `src/operators/tapErr.ts`      | throw → `err(e)` (converts to failure) | ✅ JSDoc updated (already catch+convert)                      |
| `src/operators/andTee.ts`      | throw → `err(e)` (converts to failure) | ✅ JSDoc updated (already catch+convert)                      |
| `src/operators/orTee.ts`       | throw → `err(e)` (converts to failure) | ✅ JSDoc updated (already catch+convert)                      |
| `src/adapters/tee.ts`          | throw → **propagates** (one-track)     | ✅ JSDoc updated (no railway, throw propagates by design)     |
| `src/adapters/teeAsync.ts`     | throw → **propagates** (one-track)     | ✅ JSDoc updated (no railway, rejection propagates by design) |

**Throw-path tests added** to 11 spec files (the 2 `async-option` specs already had them).

---

## 4. Inconsistent Error Handling — Missing try/catch

These files do **not** wrap user callbacks in `try/catch`, so a sync throw escapes or rejects the Promise — inconsistent with their siblings which catch and convert to failure/None.

### `src/async/asyncBindOption.ts` — `asyncBindOption`
- **Issue**: No try/catch + no `.catch()` rejection handler (unlike `asyncBind` which handles both sync throws and Promise rejections).
- **Fix**: Add try/catch around the callback and `.catch()` on the returned Promise.

### `src/async/asyncTapOption.ts` — `asyncTapOption`
- **Issue**: No try/catch + no `.catch()` rejection handler (unlike `asyncTap`).
- **Also flagged in**: Category 9 — JSDoc says "Returns the original Option" but rejection propagates without `.catch()`.
- **Fix**: Add `.catch()` to trap rejections and return the original Option.

### `src/async/existsAsync.ts` — `existsAsync`
- **Issue**: No try/catch around the predicate callback.
- **Fix**: Wrap predicate in try/catch, returning `false` on throw.

### `src/async/existsAsyncOption.ts` — `existsAsyncOption`
- **Issue**: No try/catch around the predicate callback.
- **Fix**: Wrap predicate in try/catch, returning `false` on throw.

### `src/async/filterAsyncOption.ts` — `filterAsyncOption`
- **Issue**: No try/catch around the predicate callback.
- **Fix**: Wrap predicate in try/catch.

### `src/async/filterOrElseAsync.ts` — `filterOrElseAsync`
- **Issue**: No try/catch (unlike sync `filterOrElse` which catches and converts to failure).
- **Fix**: Add try/catch around the predicate.

### `src/async-result/filterOrElse.ts` — `filterOrElse`
- **Issue**: No try/catch (unlike `bind`/`map` in the same module which catch).
- **Fix**: Add try/catch around the predicate.

### `src/async-option/filter.ts` — `filter`
- **Issue**: No try/catch (unlike `bind`/`map` in the same module which catch).
- **Fix**: Add try/catch around the predicate.

### `src/adapters/tee.ts` — `tee` ✅
- **Issue**: No try/catch; a throwing `f` breaks the pipeline (undocumented behavior).
- **Also flagged in**: Category 9 ✅.
- **Fix**: ✅ **Resolved** (2026-07-20) — Per Option B policy, `tee` is one-track (no railway/failure state), so throw **propagates** by design. JSDoc updated with explicit "Throw policy" note. Throw-path test added.

### `src/adapters/teeAsync.ts` — `teeAsync` ✅
- **Issue**: No try/catch; a rejection in `f` propagates.
- **Also flagged in**: Category 6 ✅, Category 9 ✅.
- **Fix**: ✅ **Resolved** (2026-07-20) — Per Option B policy, `teeAsync` is one-track (no railway/failure state), so rejection **propagates** by design. JSDoc updated with explicit "Throw policy" note. Rejection-path test added.

---

## 5. Type Safety Footgun

### `src/adapters/switchFn.ts` — `switchFn`
- **Issue**: Return type `IResultOfT<B, never>` is a type lie: the catch branch produces `err(e as never)` but the caught `e` is `unknown`. Consumers cannot read the caught error without a cast.
- **Fix**: Either (a) change the return type to `IResultOfT<B, Error>` and wrap caught errors, or (b) accept a fallback error factory.

### `src/adapters/switchFnAsync.ts` — `switchFnAsync`
- **Issue**: Same `IResultOfT<B, never>` type lie as sync sibling.
- **Also flagged in**: Category 6 (thin test coverage — only 1 happy-path test).
- **Fix**: Same options as `switchFn.ts`. Align with whatever fix is chosen for the sync variant.

---

## 6. Thin Test Coverage

### `src/factories/asyncOk.ts` — `asyncOk`
- **Issue**: Only 1 test case (happy path). Missing: edge cases, void overload, type-level checks.
- **Fix**: Add tests covering void overload and cross-type comparisons.

### `src/factories/asyncErr.ts` — `asyncErr`
- **Issue**: Only 1 test case (happy path). Missing: type-level checks, error type propagation.
- **Fix**: Add tests covering error type compatibility.

### `src/adapters/switchFnAsync.ts` — `switchFnAsync`
- **Issue**: Only 1 test (happy path). Missing: error-path, sync-return, falsy/null tests that the sync sibling has.
- **Also flagged in**: Category 5 (type safety footgun).
- **Fix**: Add tests mirroring `switchFn.spec.ts`.

### `src/adapters/teeAsync.ts` — `teeAsync` ✅
- **Issue**: Only 1 test. Missing: rejection-in-`f` test.
- **Also flagged in**: Category 4 ✅, Category 9 ✅.
- **Fix**: ✅ **Resolved** (2026-07-20) — Added rejection-in-`f` test verifying throw propagates (one-track policy).

---

## 7. Missing Zero-Arg Guard

### `src/composition/composeK.ts` — `composeK`
- **Issue**: No guard for `composeK()` with zero arguments. Uses `fns[0]!` non-null assertion assuming non-empty input. Unlike `composeKAsync` which rejects with `TypeError` on zero args.
- **Fix**: Add a guard: `if (fns.length === 0) throw new TypeError('composeK requires at least one function');`

---

## 8. Missing `@fileoverview` / `@example` Documentation

These files have only a brief one-line JSDoc or `@example`-only header, failing the "full @fileoverview + @example" bar.

### `src/async/` (13 files — docs-only)
| File                     | Current header                    |
| ------------------------ | --------------------------------- |
| `asyncTap.ts`            | Brief one-liner, no @fileoverview |
| `asyncTapErr.ts`         | Brief one-liner, no @fileoverview |
| `bimapAsync.ts`          | Brief one-liner, no @fileoverview |
| `bindThroughAsync.ts`    | Brief one-liner, no @fileoverview |
| `containsAsync.ts`       | Brief one-liner, no @fileoverview |
| `containsAsyncOption.ts` | Brief one-liner, no @fileoverview |
| `flattenAsync.ts`        | Brief one-liner, no @fileoverview |
| `flattenAsyncOption.ts`  | Brief one-liner, no @fileoverview |
| `mapAsyncOption.ts`      | Brief one-liner, no @fileoverview |
| `matchAsyncOption.ts`    | Brief one-liner, no @fileoverview |
| `orElseAsyncOption.ts`   | Brief one-liner, no @fileoverview |
| `swapAsync.ts`           | Brief one-liner, no @fileoverview |
| `tapAsyncOption.ts`      | Brief one-liner, no @fileoverview |

### `src/async-result/` (9 files)
| File             | Current header                    |
| ---------------- | --------------------------------- |
| `andThrough.ts`  | Brief one-liner, no @fileoverview |
| `bimap.ts`       | Brief one-liner, no @fileoverview |
| `contains.ts`    | Brief one-liner, no @fileoverview |
| `exists.ts`      | Brief one-liner, no @fileoverview |
| `flatten.ts`     | Brief one-liner, no @fileoverview |
| `swap.ts`        | Brief one-liner, no @fileoverview |
| `mapErrAsync.ts` | @example only, no @fileoverview   |
| `tapAsync.ts`    | @example only, no @fileoverview   |
| `tapErrAsync.ts` | @example only, no @fileoverview   |

**Fix**: Add full `@fileoverview` describing purpose, input/output contract, and error semantics, plus a minimal `@example` code block for each.

> **Cross-references**: Several files in this category ALSO have issues in Category 4 (missing try/catch). Those files — `asyncBindOption`, `asyncTapOption`, `existsAsync`, `existsAsyncOption`, `filterAsyncOption`, `filterOrElseAsync`, `filterOrElse` (async-result), `filter` (async-option) — are listed under Category 4 as their primary blocker. Their JSDoc gaps should be addressed in the same fix pass.

---

## 9. Documentation-vs-Implementation Contradictions

JSDoc states a behavioral guarantee that the implementation does **not** uphold. These contradictions must be resolved before tagging (either update the code or update the doc). The files are listed here for reference; the primary entry is under their respective Category 3 (tap/tee design ambiguity), Category 4 (missing try/catch), or Category 2 (unresolved comments).

| File                            | Doc claim                     | Code contradiction                  | Primary cat    |
| ------------------------------- | ----------------------------- | ----------------------------------- | -------------- |
| `src/operators/map.ts`          | "must not throw"              | Catches throw → err                 | 9 (standalone) |
| `src/operators/unwrapOrElse.ts` | "Never throws"                | `onErr()` called w/o try/catch      | 9 (standalone) |
| `src/operators/tap.ts`          | "passes through unchanged"    | Catch converts to err               | 3 ✅            |
| `src/operators/tapErr.ts`       | "passes through unchanged"    | Catch converts to err               | 3 ✅            |
| `src/operators/andTee.ts`       | "passes through unchanged"    | Catch converts to err               | 3 ✅            |
| `src/operators/orTee.ts`        | "passes through unchanged"    | Catch converts to err               | 3 ✅            |
| `src/option/tap.ts`             | "passes through unchanged"    | Catch converts to None              | 3 ✅            |
| `src/adapters/tee.ts`           | "returns the value unchanged" | No try/catch; throw propagates      | 4 ✅            |
| `src/adapters/teeAsync.ts`      | "returns the value unchanged" | No try/catch; rejection propagates  | 4,6 ✅          |
| `src/async-result/tap.ts`       | "passes through unchanged"    | Catch converts to err               | 3 ✅            |
| `src/async-result/tapErr.ts`    | "passes through unchanged"    | Catch converts to err               | 3 ✅            |
| `src/async/asyncTapOption.ts`   | "Returns the original Option" | No `.catch()`; rejection propagates | 4              |

### Standalone entries (primary Category 9):

### `src/operators/map.ts` — `map`
- **Issue**: JSDoc says the mapping function "must not throw", but the code wraps the call in try/catch and converts thrown errors to `err(e)`.
- **Fix**: Either (a) remove the try/catch and add a runtime-throw guard (matching the doc), or (b) update the doc to "throws are converted to `err`" (matching the code).

### `src/operators/unwrapOrElse.ts` — `unwrapOrElse`
- **Issue**: JSDoc says "Never throws", but `onErr(r.error)` is called without try/catch. If the user's `onErr` callback throws, the exception propagates.
- **Fix**: Either (a) add try/catch around `onErr()` and throw a wrapped error, or (b) update the doc to warn that the `onErr` callback must not throw.

> **For all tap/tee entries (9 files — Categories 3 + 9 overlap)**: ✅ **Resolved** (2026-07-20) — Canonical policy decided: Option B (catch + convert). All 13 tap/tee family files updated: 8 already catch+convert (JSDoc updated), 2 had inline literals replaced with `ofNone()` + comments removed, 2 behavior-changed from propagate to catch+convert (`async-result/andTee`, `orTee`), 2 one-track adapters documented as propagate-by-design (`adapters/tee`, `teeAsync`). Throw-path tests added to 11 spec files.

---

## Summary

| Category                   | Files | Description                                                            |
| -------------------------- | ----- | ---------------------------------------------------------------------- |
| 1. Bugs                    | 1 ✅   | `unwrapOrAsyncOption` — inconsistency with sibling (fixed)             |
| 2. Unresolved comments     | 1 ✅   | `async-option/tap` — comments removed, literal→`ofNone()` (fixed)      |
| 3. Design ambiguity        | 7 ✅   | `tap`/`tee` throw semantics — Option B (catch+convert) applied (fixed) |
| 4. Missing try/catch       | 10    | Async/Option variants don't catch sync throws                          |
| 5. Type safety             | 2     | `switchFn`/`switchFnAsync` — return type lie                           |
| 6. Thin tests              | 4 ✅³  | `teeAsync` rejection test added (3 others pending)                     |
| 7. Zero-arg guard          | 1     | `composeK` — no empty-input check                                      |
| 8. Missing JSDoc           | 22    | No `@fileoverview`/`@example`                                          |
| 9. Doc-vs-impl             | 12 ✅³ | 10 tap/tee entries fixed; 2 standalone pending                         |
| **≈52 unique files total** |       | (some files in multiple categories, listed once under primary blocker) |

> ³ Partial: Category 6 `teeAsync` and Category 9 tap/tee entries (10/12) resolved as part of the tap/tee family fix. Remaining Category 6 entries (`asyncOk`, `asyncErr`, `switchFnAsync`) and Category 9 standalone entries (`map`, `unwrapOrElse`) are still pending.

---

## Resolution Order (Recommended)

1. **Category 3 first** — ✅ **Resolved** (2026-07-20) — Canonical `tap`/`tee` throw policy decided: **Option B (catch + convert)**. Railway-based tap/tee converts throw to failure/None; one-track `tee`/`teeAsync` propagates (no failure state) with explicit doc.
2. **Categories 9 + 2** — ✅ **Resolved** (2026-07-20) — Fixed doc-vs-impl contradictions and removed unresolved comments across all 13 tap/tee family files, consistent with Option B. (Category 9 standalone entries `map` and `unwrapOrElse` still pending.)
3. **Categories 4 + 7** — Add missing try/catch and zero-arg guard (straightforward, mechanical).
4. **Category 1** — ✅ **Resolved** (2026-07-20) — `unwrapOrAsyncOption` aligned with sibling; reframed from "runtime bug" to "inconsistency" since Promise auto-flattening already produced correct behavior.
5. **Category 5** — Decide on `switchFn` error type strategy.
6. **Categories 6 + 8** — Flesh out tests and documentation (lower priority, non-functional). Category 6 `teeAsync` ✅ resolved.
