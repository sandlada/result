# API-Specific Production Test Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen co-located `*.type-spec.ts` and `*.spec.ts` files across every direct `src` submodule so that every public API has API-specific type and runtime contract coverage, fix only the genuine public-contract defects that the new tests expose, and ship the work as one atomic commit per direct submodule.

**Architecture:** For each `src/<module>`, the implementer reads the implementation, declarations, JSDoc, and existing tests; selects the risk-matrix dimensions that apply per public API; enhances the existing test files (does not add parallel duplicates); runs focused verification; fixes any genuine defect with the smallest possible change; commits with `test(<module>): ...` or `fix(<module>): ...` subject. Module order follows the approved spec (dependency order): `types` → `factories` → `operators` → `option` → `combine` → `composition` → `adapters` → `async-result` → `async-option` → `promise-result` → `promise-option` → `reliability` → `observability` → `primitives`.

**Tech Stack:** TypeScript 7.0.2, Vitest 4.1.10 (`vitest run`, `vitest typecheck run --typecheck.only src/`), existing `expectTypeOf` patterns from `*.type-spec.ts`, `vi.useFakeTimers()` / `vi.advanceTimersByTimeAsync` for timing-sensitive tests, Rolldown + tsc build pipeline.

## Global Constraints

Copied verbatim from the approved spec and `package.json`:

- Project: `@sandlada/result` v`0.0.5-20260725.a`, ESM (`"type": "module"`), TypeScript `^7.0.2` with strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax`.
- Test runner: `vitest ^4.1.10`; type tests run via `npm run test:type` which is `vitest typecheck run --typecheck.only src/`.
- File layout: every public module has a matching `*.spec.ts` and `*.type-spec.ts` co-located under `src/<module>/`.
- Type tests use the `expectTypeOf` API already used across `src/`; negative tests use narrowly scoped `@ts-expect-error` with one intentional error on the next line.
- One atomic commit per direct submodule; commit subject is `test(<module>): ...` for test-only changes or `fix(<module>): ...` when the batch includes a production fix; commit body must end with `Co-Authored-By: Claude <noreply@anthropic.com>`.
- `docs/superpowers` is in `.gitignore`; use `git add -f` only for `docs/superpowers/plans/2026-08-02-api-specific-production-tests.md` if and when the plan is updated.
- Hooks are never bypassed with `--no-verify`. No tests are skipped. Coverage thresholds and existing tools are not weakened.
- Out of scope: refactoring public APIs merely to simplify tests; introducing a shared contract-test DSL; Cartesian product parameter sweeps; modifying unrelated implementation; broad documentation or benchmark rewrites; brittle private-implementation assertions.
- Internal helpers are tested only when their observable behavior directly determines a public contract.

## Shared File Structure (applies to every module task)

Each module task creates or modifies a fixed set of files. Do not introduce new test files at other paths; the type-spec and spec co-locate with the source.

```
src/<module>/
  <api>.type-spec.ts   # enhance in place; do not duplicate
  <api>.spec.ts        # enhance in place; do not duplicate
  <api>.ts             # modify only if a genuine public-contract defect is exposed
  index.ts             # do not modify unless the batch corrects an export
```

When a cross-module test is required, place it under `src/tests/<area>/...` and include the file in the commit for the module that requires it.

## Shared Step Pattern (applies to every module task)

The per-API loop:

1. Open the existing `*.type-spec.ts` and `*.spec.ts`; do not rewrite them, only enhance.
2. Read `*.ts` to determine which risk-matrix dimensions apply.
3. For each public API, add or extend the assertions for the applicable dimensions.
4. Run `npx vitest typecheck run --typecheck.only src/<module>` (replace path to scope).
5. Run `npx vitest run src/<module>` (replace path to scope).
6. If a test fails because the production code is wrong (not the test), make the smallest fix in the same `*.ts`, re-run the focused tests, and add a regression assertion.
7. Inspect `git diff --check` and the staged diff.
8. Commit.

## Verification Helpers

Use these to scope commands without affecting other modules:

- Type tests for one module: `npx vitest typecheck run --typecheck.only src/<module>/`
- Runtime tests for one module: `npx vitest run src/<module>/`
- One file: `npx vitest run src/<module>/<api>.spec.ts`
- All of `src/`: `npx vitest run` and `npx vitest typecheck run --typecheck.only src/`
- Full pipeline: `npm run typecheck && npm run test && npm run test:type && npm run build`

Coverage should only be checked at the end of the whole plan, not per module, because the per-glob thresholds live in `vitest.config.ts` and aggregating them per module wastes time.

---

## Task 1: types module

**Files:**
- Modify: `src/types/IResult.type-spec.ts`
- Modify: `src/types/IResultOfT.type-spec.ts`
- Modify: `src/types/Option.type-spec.ts`
- Modify: `src/types/AsyncOption.type-spec.ts`
- Modify: `src/types/AsyncResult.type-spec.ts`
- Modify: `src/types/asyncCarrier.type-spec.ts`
- Possibly modify: any `src/types/*.ts` that exposes a public type contract defect
- Possibly create: `src/tests/integration/TypesDiscrimination.spec.ts` (only if a cross-file discrimination contract cannot be expressed in the per-file type-specs; include the file in this commit if added)

**Public APIs in scope:** `IResult`, `IResultSuccess`, `IResultFailure`, `IResultOfT`, `IResultOfTSuccess`, `IResultOfTFailure`, `IOption`, `IOptionSome`, `IOptionNone`, `AsyncResult`, `AsyncOption`, `ASYNC_CARRIER_BRAND`, `markAsyncCarrier`, `isAsyncCarrier`, `unwrapAsyncCarrier` (the last four are `@internal` but the brand is observed through public APIs).

- [ ] **Step 1.1: Audit each public type**

Read each `src/types/*.ts` and the existing type-specs. For each public type, list:
- Discriminant fields and literal values.
- Narrowing yields.
- Variance (covariant, invariant, contravariant) of `T` and `E`.
- Default for `TError` (typically `unknown`).
- Interactions with `AsyncResult` and `AsyncOption` carriers (does it accept both? what does it infer?).

- [ ] **Step 1.2: Add the applicable assertions per API**

For each public type, add precise assertions for the dimensions that apply. Use the existing `expectTypeOf` style. Examples to cover where applicable:
- `IResult` literal discriminant narrowing to `isSuccess: true | false`.
- `IResultSuccess.value` and `IResultFailure.error` types are exact.
- `IResultOfT<number, string>` is a structural match for `IResultSuccess<number> | IResultFailure<string>`.
- `IOption` discriminant narrows to `isSome: true | false`.
- `AsyncResult` accepts a value-returning factory, a Promise-thenable, and a `Promise<IResultOfT<T, E>>`; the inference for each is precise.
- `AsyncOption` rejects a callback that returns an `IOption<T>` (sync) when the API expects a thunk; a negative test enforces it.
- `markAsyncCarrier` brands arbitrary thunks and `isAsyncCarrier` returns a literal-true guard.

- [ ] **Step 1.3: Run focused type tests**

Run: `npx vitest typecheck run --typecheck.only src/types/`
Expected: PASS for every assertion added. Any failure indicates a genuine declaration defect; record the file:line and continue.

- [ ] **Step 1.4: Fix any genuine public-contract defects in `src/types/*.ts`**

For each failure, make the smallest type-only change that aligns the declaration with the documented contract. Do not change runtime values. Do not weaken any existing tests to accept a new behavior; update them to assert the corrected contract.

- [ ] **Step 1.5: Re-run focused type tests**

Run: `npx vitest typecheck run --typecheck.only src/types/`
Expected: PASS.

- [ ] **Step 1.6: Add regression assertions**

For every defect fixed in Step 1.4, add a named assertion in the relevant `*.type-spec.ts` that pins the corrected contract.

- [ ] **Step 1.7: Inspect staged diff**

Run: `git diff --check` and `git diff --stat`
Expected: changes limited to `src/types/**` and (if added) `src/tests/integration/TypesDiscrimination.spec.ts`.

- [ ] **Step 1.8: Commit**

```bash
git add src/types
[ -f src/tests/integration/TypesDiscrimination.spec.ts ] && git add src/tests/integration/TypesDiscrimination.spec.ts
git diff --cached --check
git commit -m "test(types): strengthen public type discrimination and carrier contracts" \
  -m "Pin discriminant narrowing, default TError = unknown, AsyncResult/AsyncOption carrier compatibility, and async carrier brand guards. Include any corrected declaration defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production declaration, change the subject to `fix(types): enforce public type contracts` and adjust the body to list the corrected defects.

---

## Task 2: factories module

**Files:**
- Modify per-API: `src/factories/<api>.type-spec.ts`
- Modify per-API: `src/factories/<api>.spec.ts`
- Possibly modify: `src/factories/<api>.ts` when a defect is exposed
- Possibly create: `src/tests/integration/FactoriesDiscrimination.spec.ts` if discrimination between curried and direct forms cannot be exercised in per-file tests

**Public APIs in scope:** `ok`, `err`, `asyncOk`, `asyncErr`, `tryCatch`, `tryCatchAsync`, `fromThrowable`, `fromPromise`, `fromSafePromise`, `fromPredicate`.

- [ ] **Step 2.1: For each public API, list the applicable dimensions**

The risk matrix is the source of truth. For `ok`/`err`, the key dimensions are:
- `arguments.length === 0` vs explicit `undefined`: `ok()` returns `IResult<never>`; `ok(undefined)` returns `IResultOfT<undefined, never>`.
- The `ok(value)` curried form vs direct form (for `fromPredicate`): `arguments.length < 3` detects curried usage and `value?: T` preserves the discriminator when `T` includes `undefined`.

For `tryCatch` / `tryCatchAsync`:
- Synchronous throw becomes `err(caught)` when no mapper is supplied; a mapper maps the error.
- The mapper signature must be inferred as `(caught: unknown) => F` and the error type of the result must widen to `F`.

For `fromThrowable`:
- Default error type is `unknown`; supplying a mapper narrows it.
- The `IResult` value type matches the function's return.

For `fromPromise` and `fromSafePromise`:
- `fromPromise` catches rejection; `fromSafePromise` lets it propagate (use the `.rejects` matcher when possible).
- Default error type for `fromPromise` is `unknown`; mapper narrows it.

For `fromPredicate`:
- Curried form `fromPredicate(p, err)(value)` and direct form `fromPredicate(p, err, value)` both yield `IResultOfT<T, E>`.
- When the predicate returns `false`, the value is `err(err)`.

For `asyncOk` / `asyncErr`:
- The result is an `AsyncResult`; the type is `AsyncResult<T, never>` or `AsyncResult<never, E>`.
- The result is lazy: `asyncOk(1)` does not invoke any callback until consumed; verify by constructing without awaiting.

- [ ] **Step 2.2: Add the applicable assertions per API**

Use the existing `expectTypeOf` style. For each API:
- Type assertions for the curried vs direct form.
- Type assertion that the error default is `unknown` (or whatever the declaration says) and that the mapper narrows it.
- A precise negative assertion (e.g., `fromPredicate` with a callback returning a Promise should fail the type check) using `@ts-expect-error` on the next line.

- [ ] **Step 2.3: Add runtime assertions**

For each API, assert the documented behavior:
- `ok()` yields an `Err`-like carrier; `ok(value)` yields the value.
- `tryCatch` catches throws with the default mapper; with a mapper, the mapped error is preserved.
- `fromPromise(await Promise.reject(err))` resolves to `err(err)`; `fromSafePromise(await Promise.reject(err))` rejects with `err` (use `await expect(...).rejects.toEqual(...)`).
- `fromPredicate(isPositive, 'no')` applied to `1` yields `ok(1)`; to `-1` yields `err('no')`.
- `asyncOk(1)` and `asyncErr('x')` are lazy (no callback invoked) and produce the expected `AsyncResult` payload when awaited.

- [ ] **Step 2.4: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/factories/ && npx vitest run src/factories/`
Expected: PASS.

- [ ] **Step 2.5: Fix any genuine public-contract defects in `src/factories/<api>.ts`**

For each failure, make the smallest change. Re-run focused tests.

- [ ] **Step 2.6: Add regression assertions**

For every defect fixed, add a named assertion in the relevant `*.spec.ts` or `*.type-spec.ts`.

- [ ] **Step 2.7: Inspect staged diff and commit**

```bash
git add src/factories
[ -f src/tests/integration/FactoriesDiscrimination.spec.ts ] && git add src/tests/integration/FactoriesDiscrimination.spec.ts
git diff --cached --check
git commit -m "test(factories): cover overload forms, error mapping, and async policy" \
  -m "Pin curried/direct discrimination, default unknown errors, mapper narrowing, and rejection propagation. Include any corrected declaration or implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(factories): ...` and adjust the body.

---

## Task 3: operators module

**Files:**
- Modify per-API: `src/operators/<api>.type-spec.ts`
- Modify per-API: `src/operators/<api>.spec.ts`
- Possibly modify: `src/operators/<api>.ts` when a defect is exposed
- Possibly create: `src/tests/integration/OperatorsContract.spec.ts` if a contract applies across operators

**Public APIs in scope:** `and`, `andTee`, `andThrough`, `ap`, `bimap`, `bind`, `catchErr`, `choose`, `contains`, `exists`, `expect`, `expectErr`, `filterOrElse`, `flatten`, `map`, `mapErr`, `mapOr`, `mapOrElse`, `match`, `or`, `orElse`, `orTee`, `orThrow`, `orThrowWith`, `separate`, `swap`, `tap`, `tapErr`, `traverseArray`, `unzip`, `unwrap`, `unwrapErr`, `unwrapOr`, `unwrapOrElse`, `unsafeUnwrap`, `unsafeUnwrapErr`.

This is the largest module. Split the work into four focus groups so a single reviewer's gate is meaningful. The four groups are evaluated as one logical commit for the module; the commit message body summarizes them all.

- [ ] **Step 3.1: Group A — Direct/curried overload contract**

For each API in `and`, `andTee`, `andThrough`, `ap`, `bimap`, `bind`, `catchErr`, `choose`, `contains`, `exists`, `expect`, `expectErr`, `filterOrElse`, `flatten`, `map`, `mapErr`, `mapOr`, `mapOrElse`, `match`, `or`, `orElse`, `orTee`, `orThrow`, `orThrowWith`, `separate`, `tap`, `tapErr`, `traverseArray`, `unzip`, `unwrap`, `unwrapErr`, `unwrapOr`, `unwrapOrElse`:
- Add a curried-form type assertion that the result is the documented curried type.
- Add a direct-form type assertion that the result has the documented return type with all generics resolved.
- For `match`, add the five-overload coverage: positional, object, curried-positional, curried-object, and the variant that takes only the handlers.

- [ ] **Step 3.2: Group B — Generic widening, narrowing, and literal preservation**

For each API:
- `bind` widens error to `E | F`; preserve value.
- `or` widens error to `E | F`; value is invariant.
- `orElse` widens value to `A | B`; narrows error to `F`.
- `and` widens value to `B`; error to `E | F`.
- `andThrough` preserves original success; error to `E | F`.
- `ap` shares a single `E` for fn-result and value-result.
- `swap` transposes value and error.
- `flatten` is one-layer only; a nested `Result<Result<Result<A,E>,E>,E>` becomes `Result<Result<A,E>,E>`.
- `unzip` produces `[IResultOfT<A, E>, IResultOfT<B, E>]`; failure short-circuits both slots with the same error.
- `expect` / `expectErr` / `unwrap` / `unwrapErr` throw `TypeError` on the wrong branch; `orThrow` requires `E extends Error`; `orThrowWith` accepts unconstrained `E` and requires `(e: E) => Error`.

Add type assertions for each of these and runtime assertions for the behaviors.

- [ ] **Step 3.3: Group C — Short-circuit and callback invocation contracts**

For each API:
- Inactive branches must not invoke the callback (e.g., `tap` on `Err` does not run the success callback).
- Short-circuit APIs must not invoke downstream callbacks (e.g., `bind` after an `Err`).
- `ap` invokes the function from the fn-result when the value-result is `Ok`.
- `and` / `andTee` / `andThrough` / `or` / `orTee` short-circuit to the other side.

Add a per-API runtime assertion. Use `vi.fn()` to count invocations and assert `toHaveBeenCalledTimes(0)` for inactive branches.

- [ ] **Step 3.4: Group D — Exception and unsafe policy**

For each API:
- `map` / `mapErr` / `bind` propagate sync throws.
- `tap` / `tapErr` / `orTee` / `andTee` convert sync throws to `err(caught)`.
- `expect` / `expectErr` / `unwrap` / `unwrapErr` / `orThrow` throw on the wrong branch.
- `unsafeUnwrap` / `unsafeUnwrapErr` throw the raw value/error.

Use `expect(() => ...).toThrow(...)` to assert throw text for the documented cases.

- [ ] **Step 3.5: Run focused tests for the entire module**

Run: `npx vitest typecheck run --typecheck.only src/operators/ && npx vitest run src/operators/`
Expected: PASS.

- [ ] **Step 3.6: Fix any genuine public-contract defects in `src/operators/<api>.ts`**

For each failure, make the smallest change. Re-run focused tests.

- [ ] **Step 3.7: Add regression assertions**

For every defect fixed, add a named assertion in the relevant file.

- [ ] **Step 3.8: Inspect staged diff and commit**

```bash
git add src/operators
[ -f src/tests/integration/OperatorsContract.spec.ts ] && git add src/tests/integration/OperatorsContract.spec.ts
git diff --cached --check
git commit -m "test(operators): cover overload forms, generic flows, and short-circuit policies" \
  -m "Strengthen type assertions for curried/direct overloads, value and error widening/narrowing, one-layer flatten, and the swap/unzip invariants. Pin callback invocation counts and the throw policy for expect/unwrap/orThrow and unsafe escape hatches. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(operators): ...` and adjust the body.

---

## Task 4: option module

**Files:**
- Modify per-API: `src/option/<api>.type-spec.ts`
- Modify per-API: `src/option/<api>.spec.ts`
- Possibly modify: `src/option/<api>.ts`
- Possibly create: `src/tests/integration/OptionContract.spec.ts` if a contract applies across option APIs

**Public APIs in scope:** `ofSome`, `ofNone`, `all`, `bind`, `contains`, `filter`, `flatten`, `map`, `match`, `okOr`, `okOrElse`, `orElse`, `tap`, `transpose`, `traverseArray`, `unwrapOr`, `zipWith`.

- [ ] **Step 4.1: For each public API, list the applicable dimensions**

- `ofSome` / `ofNone` literal discrimination; `ofSome(undefined)` is valid.
- `map` / `bind` / `tap` / `orElse` / `unwrapOr` / `filter` / `contains` all use the dual-form (direct/curried) pattern.
- `match` has the unique object-form overload `{ some, none }`; cover direct, object, curried-direct, curried-object, and the no-r variant.
- `flatten` is one-layer only.
- `transpose` swaps `IOption<IResult<T,E>>` with `IResult<IOption<T>, E>`; the async-option equivalent is in `src/async-option/transpose.ts` and is tested under the async-option task.
- `all` preserves tuple positions; `traverseArray` accepts both `Some` and `None` and short-circuits on the first `None`.
- `okOr` / `okOrElse` produce `IResultOfT<T, E>`.
- `zipWith` requires both sides to be `Some`; the value type is the callback's return.

- [ ] **Step 4.2: Add the applicable assertions per API**

Use `expectTypeOf` for type assertions and runtime assertions for state branches, short-circuit, and one-layer constraints.

- [ ] **Step 4.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/option/ && npx vitest run src/option/`
Expected: PASS.

- [ ] **Step 4.4: Fix any genuine public-contract defects**

Re-run focused tests after each fix.

- [ ] **Step 4.5: Add regression assertions**

- [ ] **Step 4.6: Inspect staged diff and commit**

```bash
git add src/option
[ -f src/tests/integration/OptionContract.spec.ts ] && git add src/tests/integration/OptionContract.spec.ts
git diff --cached --check
git commit -m "test(option): cover dual-form discrimination and one-layer invariants" \
  -m "Pin Some/None short-circuit, object-form match, one-layer flatten, transpose direction, and tuple-position inference for all and traverseArray. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(option): ...` and adjust the body.

---

## Task 5: combine module

**Files:**
- Modify per-API: `src/combine/<api>.type-spec.ts`
- Modify per-API: `src/combine/<api>.spec.ts`
- Possibly modify: `src/combine/<api>.ts`
- Possibly create: `src/tests/integration/CombineContract.spec.ts` if a contract applies across combinators

**Public APIs in scope:** `combine`, `all`, `combineWithAllErrors`.

- [ ] **Step 5.1: For each public API, list the applicable dimensions**

- `combine` is homogeneous: `readonly IResultOfT<A, E>[]` → `IResultOfT<A[], E>`; short-circuits on the first `Err`.
- `all` is heterogeneous tuple: positions preserved; the error type is a distributive conditional collapsed to a common supertype.
- `combineWithAllErrors` collects every error: `IResultOfT<A, E>[]` → `IResultOfT<A[], E[]>`; success only when every input is `Ok`.
- Empty input:
  - `combine([])` returns `ok([])`; assert this.
  - `all([])` returns `ok([])`; assert this and the inferred tuple type.
  - `combineWithAllErrors([])` returns `ok([])`.
- Mixed types: `combine([ok(1), err('a'), ok('x')])` returns `err('a')`; `combineWithAllErrors` returns `err(['a'])` (or `err([])` for the all-success case).

- [ ] **Step 5.2: Add the applicable assertions per API**

Use `expectTypeOf` for tuple inference; runtime assertions for short-circuit and aggregation.

- [ ] **Step 5.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/combine/ && npx vitest run src/combine/`
Expected: PASS.

- [ ] **Step 5.4: Fix any genuine public-contract defects**

- [ ] **Step 5.5: Add regression assertions**

- [ ] **Step 5.6: Inspect staged diff and commit**

```bash
git add src/combine
[ -f src/tests/integration/CombineContract.spec.ts ] && git add src/tests/integration/CombineContract.spec.ts
git diff --cached --check
git commit -m "test(combine): cover homogeneous, heterogeneous, and all-errors combinators" \
  -m "Pin first-error short-circuit, tuple-position inference, error collection, and empty-input behavior. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(combine): ...` and adjust the body.

---

## Task 6: composition module

**Files:**
- Modify per-API: `src/composition/<api>.type-spec.ts`
- Modify per-API: `src/composition/<api>.spec.ts`
- Possibly modify: `src/composition/<api>.ts`
- Possibly create: `src/tests/integration/CompositionContract.spec.ts` if a contract applies across composition APIs

**Public APIs in scope:** `pipe`, `pipeAsync`, `composeK`, `composeKAsync`, `safeTry`, `fromSafeTry`, `safeTryAsync`, `fromSafeTryAsync`.

- [ ] **Step 6.1: For each public API, list the applicable dimensions**

- `pipe` and `pipeAsync`: explicit overload ladder up to 10 input functions plus the no-op `pipe(value)`. Each overload must be asserted with a representative function chain that exercises the documented input types.
- `composeK`: 6 explicit overloads for 2–6 input functions. The implementation requires `fns.length >= 1`; empty input throws `TypeError` at construction. Add a runtime assertion for the throw.
- `composeKAsync`: same 6-overload ladder. The chain is pre-composed via `reduce` at construction time.
- `safeTry`: generator-based `yield*` propagation. The return type is `T | undefined`; add a type assertion that the value type matches the function's return and `undefined` is reachable.
- `fromSafeTry`: enforces single-yield semantics; if the generator yields more than once, the helper throws `Error('safeTry: generator yielded more than once')`. Add a runtime assertion for the throw.
- `safeTryAsync` / `fromSafeTryAsync`: same contracts as their sync counterparts; the callback may return an `AsyncResult<T, E>` or a `Promise<IResultOfT<T, E>>` and the helper discriminates by duck-typing `.run`.

- [ ] **Step 6.2: Add the applicable assertions per API**

For each overload of `pipe` / `pipeAsync`, add a small chain with mixed input types and assert the output type. For each `composeK` overload, add a chain that uses a function whose return type forces the union to widen.

- [ ] **Step 6.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/composition/ && npx vitest run src/composition/`
Expected: PASS.

- [ ] **Step 6.4: Fix any genuine public-contract defects**

- [ ] **Step 6.5: Add regression assertions**

- [ ] **Step 6.6: Inspect staged diff and commit**

```bash
git add src/composition
[ -f src/tests/integration/CompositionContract.spec.ts ] && git add src/tests/integration/CompositionContract.spec.ts
git diff --cached --check
git commit -m "test(composition): cover pipe ladder, composeK throws, and safeTry semantics" \
  -m "Pin the documented overload ladders for pipe and pipeAsync, the empty-chain throw for composeK, the reduce-time composition for composeKAsync, and the single-yield enforcement for safeTry/fromSafeTry. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(composition): ...` and adjust the body.

---

## Task 7: adapters module

**Files:**
- Modify per-API: `src/adapters/<api>.type-spec.ts`
- Modify per-API: `src/adapters/<api>.spec.ts`
- Possibly modify: `src/adapters/<api>.ts`
- Possibly create: `src/tests/integration/AdaptersContract.spec.ts` if a contract applies across adapters

**Public APIs in scope:** `switchFn`, `switchFnAsync`, `liftMap`, `tee`, `teeAsync`, `toOption`, `fromOption`.

- [ ] **Step 7.1: For each public API, list the applicable dimensions**

- `switchFn` / `switchFnAsync` use the dual-form pattern; sync throws are caught and mapped via the optional `errorFn`. Rejection handling is per-family (sync caught, async caught).
- `liftMap` lifts a unary function to operate on `IResult<T, E>`; the error type is preserved.
- `tee` / `teeAsync` apply a side-effecting callback to a value while preserving the original value. `tee` is sync; `teeAsync` returns a `Promise` of the original value.
- `toOption` converts `IResult<T, never>` (or the appropriate variant) to `IOption<T>`; `fromOption` converts with an explicit error-on-`None` parameter.

- [ ] **Step 7.2: Add the applicable assertions per API**

Type assertions for the curried/direct forms and the `toOption`/`fromOption` error mapping. Runtime assertions for the side-effect invocation and the original-value preservation.

- [ ] **Step 7.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/adapters/ && npx vitest run src/adapters/`
Expected: PASS.

- [ ] **Step 7.4: Fix any genuine public-contract defects**

- [ ] **Step 7.5: Add regression assertions**

- [ ] **Step 7.6: Inspect staged diff and commit**

```bash
git add src/adapters
[ -f src/tests/integration/AdaptersContract.spec.ts ] && git add src/tests/integration/AdaptersContract.spec.ts
git diff --cached --check
git commit -m "test(adapters): cover switchFn forms, tee preservation, and option conversion" \
  -m "Pin sync/async catch policy, errorFn narrowing, side-effect invocation, original-value preservation, and toOption/fromOption error mapping. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(adapters): ...` and adjust the body.

---

## Task 8: async-result module

**Files:**
- Modify per-API: `src/async-result/<api>.type-spec.ts`
- Modify per-API: `src/async-result/<api>.spec.ts`
- Possibly modify: `src/async-result/<api>.ts`
- Possibly create: `src/tests/integration/AsyncResultContract.spec.ts` if a contract applies across async-result APIs

**Public APIs in scope:** `from`, `fromPromise`, `fromResult`, `and`, `andTee`, `andThrough`, `ap`, `bimap`, `bind`, `catchErr`, `combine`, `combineWithAllErrors`, `contains`, `containsErr`, `exists`, `expect`, `expectErr`, `filterOrElse`, `flatten`, `isErr`, `isOk`, `map`, `mapAsync`, `mapErr`, `mapErrAsync`, `mapOr`, `mapOrElse`, `match`, `or`, `orElse`, `orTee`, `swapAsync`, `tap`, `tapAsync`, `tapErr`, `tapErrAsync`, `unwrap`, `unwrapErr`, `unwrapOr`, `unwrapOrElse`.

- [ ] **Step 8.1: For each public API, list the applicable dimensions**

- `from` / `fromPromise` / `fromResult` accept mixed carriers: thunk, Promise, AsyncResult, `Promise<IResultOfT<T, E>>`. Each carrier resolves to the same `AsyncResult<T, E>`.
- Dual-form (direct/curried) for the operator family.
- `mapAsync` runs the async function; sync throws and rejections are caught and converted to `err(caught)`. (The behavior is documented in the source; this task pins it.)
- `bind` and `orElse` accept mixed callback carriers (thunk / Promise / AsyncResult / `Promise<IResultOfT<T, E>>`) via the `isAsyncCarrier` detection.
- `swapAsync` transposes value and error on the AsyncResult; verify the type and the runtime.
- `combine` / `combineWithAllErrors` mirror the sync versions but operate on `AsyncResult<T, E>` and are lazy: the helper does not start downstream work until consumed.

- [ ] **Step 8.2: Add the applicable assertions per API**

Type assertions for the dual-form and the mixed carriers. Runtime assertions for lazy behavior (no callback invoked before consumption), rejection policy, and short-circuit.

- [ ] **Step 8.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/async-result/ && npx vitest run src/async-result/`
Expected: PASS.

- [ ] **Step 8.4: Fix any genuine public-contract defects**

- [ ] **Step 8.5: Add regression assertions**

- [ ] **Step 8.6: Inspect staged diff and commit**

```bash
git add src/async-result
[ -f src/tests/integration/AsyncResultContract.spec.ts ] && git add src/tests/integration/AsyncResultContract.spec.ts
git diff --cached --check
git commit -m "test(async-result): cover mixed carriers, lazy execution, and rejection policy" \
  -m "Pin thunk/Promise/AsyncResult/Promise-of-Result carrier handling, dual-form discrimination, mapAsync catch behavior, swapAsync transposition, and lazy combine. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(async-result): ...` and adjust the body.

---

## Task 9: async-option module

**Files:**
- Modify per-API: `src/async-option/<api>.type-spec.ts`
- Modify per-API: `src/async-option/<api>.spec.ts`
- Possibly modify: `src/async-option/<api>.ts`
- Possibly create: `src/tests/integration/AsyncOptionContract.spec.ts` if a contract applies across async-option APIs

**Public APIs in scope:** `from`, `fromPromise`, `fromOption`, `ofSome`, `ofNone`, `all`, `bind`, `contains`, `exists`, `filter`, `flatten`, `isNone`, `isSome`, `map`, `mapAsync`, `mapOr`, `mapOrElse`, `match`, `okOr`, `okOrElse`, `orElse`, `tap`, `tapAsync`, `transpose`, `unwrap`, `unwrapOr`, `unwrapOrElse`, `zipWith`.

- [ ] **Step 9.1: For each public API, list the applicable dimensions**

- `from` / `fromPromise` / `fromOption` accept mixed carriers; the inferred type is precise.
- Dual-form (direct/curried) for the operator family.
- Rejection-to-`None` policy: `bind`, `filter`, `orElse`, `mapAsync`, and other async-option predicates catch sync throws and async rejections and convert them to `None`. (Documented in the source; pin it.)
- `transpose` swaps `AsyncOption<AsyncResult<T, E>>` to `AsyncResult<AsyncOption<T>, E>`; the inner `Some` value is wrapped in a fresh `AsyncOption` thunk.
- `all` preserves tuple positions and short-circuits on the first `None`.

- [ ] **Step 9.2: Add the applicable assertions per API**

Type assertions for the dual-form and the mixed carriers. Runtime assertions for the rejection-to-`None` policy and lazy behavior.

- [ ] **Step 9.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/async-option/ && npx vitest run src/async-option/`
Expected: PASS.

- [ ] **Step 9.4: Fix any genuine public-contract defects**

- [ ] **Step 9.5: Add regression assertions**

- [ ] **Step 9.6: Inspect staged diff and commit**

```bash
git add src/async-option
[ -f src/tests/integration/AsyncOptionContract.spec.ts ] && git add src/tests/integration/AsyncOptionContract.spec.ts
git diff --cached --check
git commit -m "test(async-option): cover rejection-to-None policy and transpose" \
  -m "Pin thunk/Promise/AsyncOption/AsyncResult carrier handling, dual-form discrimination, async predicate catch policy, transpose direction, and tuple-position inference. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(async-option): ...` and adjust the body.

---

## Task 10: promise-result module

**Files:**
- Modify per-API: `src/promise-result/<api>.type-spec.ts`
- Modify per-API: `src/promise-result/<api>.spec.ts`
- Possibly modify: `src/promise-result/<api>.ts`
- Possibly create: `src/tests/integration/PromiseResultContract.spec.ts` if a contract applies across promise-result APIs

**Public APIs in scope:** re-exports of `asyncOk`/`asyncErr`; sync-on-Promise `flatten`, `map`, `mapErr`, `unwrapOr`, `unwrapOrElse`; async-on-Promise `bimapAsync`, `bindAsync`, `bindThroughAsync`, `containsAsync`, `existsAsync`, `filterOrElseAsync`, `flattenAsync`, `mapAsync`, `mapErrAsync`, `mapOrAsync`, `mapOrElseAsync`, `matchAsync`, `orElseAsync`, `swapAsync`, `tapAsync`, `tapErrAsync`, `unwrapOrAsync`, `unwrapOrElseAsync`, `catchErrAsync`; lift `asyncBind`, `asyncBindThrough`, `asyncMap`, `asyncOrElse`, `asyncTap`, `asyncTapErr`; combinators `ap`, `combine`, `combineWithAllErrors`.

- [ ] **Step 10.1: For each public API, list the applicable dimensions**

- Eager Promise behavior: the helper starts the inner work immediately on construction.
- Sync-callback family (e.g., `map`) and async-callback family (e.g., `mapAsync`) have different error policies: sync throws propagate via outer `.then` rejection; async rejections also propagate. Pin each.
- Lift family (`asyncMap`, `asyncBind`, etc.) takes a sync `IResultOfT<T, E>` and an async function. The error type widens to the union of the sync error and the async callback's error.
- `combine` and `combineWithAllErrors` operate on `Promise<IResultOfT<T, E>>`; the result is a `Promise<IResultOfT<T[], E>>` or `Promise<IResultOfT<T[], E[]>>` respectively. Add type assertions for the empty case and a mixed-Ok/Err case.

- [ ] **Step 10.2: Add the applicable assertions per API**

- [ ] **Step 10.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/promise-result/ && npx vitest run src/promise-result/`
Expected: PASS.

- [ ] **Step 10.4: Fix any genuine public-contract defects**

- [ ] **Step 10.5: Add regression assertions**

- [ ] **Step 10.6: Inspect staged diff and commit**

```bash
git add src/promise-result
[ -f src/tests/integration/PromiseResultContract.spec.ts ] && git add src/tests/integration/PromiseResultContract.spec.ts
git diff --cached --check
git commit -m "test(promise-result): cover eager execution, lift family, and combinators" \
  -m "Pin sync-callback versus async-callback error policies, eager Promise execution, lift-style error widening, and combinator aggregation. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(promise-result): ...` and adjust the body.

---

## Task 11: promise-option module

**Files:**
- Modify per-API: `src/promise-option/<api>.type-spec.ts`
- Modify per-API: `src/promise-option/<api>.spec.ts`
- Possibly modify: `src/promise-option/<api>.ts`
- Possibly create: `src/tests/integration/PromiseOptionContract.spec.ts` if a contract applies across promise-option APIs

**Public APIs in scope:** re-exports of `asyncOk`/`asyncErr` and `ofSome`/`ofNone`; Result-flavored on `Promise<IOption<T>>` `bindAsyncOption`, `containsAsyncOption`, `existsAsyncOption`, `filterAsyncOption`, `flattenAsyncOption`, `mapAsyncOption`, `mapOrAsyncOption`, `mapOrElseAsyncOption`, `matchAsyncOption`, `orElseAsyncOption`, `tapAsyncOption`, `tapErrAsyncOption`, `unwrapOrAsyncOption`, `unwrapOrElseAsyncOption`; lift `asyncBindOption`, `asyncMapOption`, `asyncMatchOption`, `asyncOrElseOption`, `asyncTapOption`.

- [ ] **Step 11.1: For each public API, list the applicable dimensions**

- The Result-flavored family on `Promise<IOption<T>>` either converts rejection to `None` or propagates it. Document the per-API behavior and pin it.
- The lift family operates on `IOption<T>` (sync) with an async function; the result is `Promise<IOption<U>>`; the async callback's rejection is converted to `None`.
- Re-exports of `asyncOk`/`asyncErr`/`ofSome`/`ofNone` are tested indirectly through usage; do not duplicate their contracts here.

- [ ] **Step 11.2: Add the applicable assertions per API**

- [ ] **Step 11.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/promise-option/ && npx vitest run src/promise-option/`
Expected: PASS.

- [ ] **Step 11.4: Fix any genuine public-contract defects**

- [ ] **Step 11.5: Add regression assertions**

- [ ] **Step 11.6: Inspect staged diff and commit**

```bash
git add src/promise-option
[ -f src/tests/integration/PromiseOptionContract.spec.ts ] && git add src/tests/integration/PromiseOptionContract.spec.ts
git diff --cached --check
git commit -m "test(promise-option): cover Result-flavored and lift families" \
  -m "Pin the per-API rejection policy for the Result-flavored family, the rejection-to-None behavior for the lift family, and the precise return type inference. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(promise-option): ...` and adjust the body.

---

## Task 12: reliability module

**Files:**
- Modify per-API: `src/reliability/<api>.type-spec.ts`
- Modify per-API: `src/reliability/<api>.spec.ts`
- Possibly modify: `src/reliability/<api>.ts`
- Possibly create: `src/tests/integration/ReliabilityContract.spec.ts` if a contract applies across reliability APIs

**Public APIs in scope:** `retry` (+ `RetryOptions`), `retryLazy`, `timeout` (+ `TimeoutError`), `timeoutEager`, `race`, `any`, `allSettled` (+ `Settled<T, E>`).

- [ ] **Step 12.1: For each public API, list the applicable dimensions**

- `retry` is eager; the inner work starts immediately. The number of attempts is `options.attempts`; each delay is `options.delay`. Use `vi.useFakeTimers()` and `vi.advanceTimersByTimeAsync(...)` to drive time deterministically.
- `retryLazy` is lazy: the inner work does not start until consumed.
- `timeout` is a Promise.race; the inner work continues, the timer wins. `TimeoutError` is the rejection value.
- `timeoutEager` wraps the inner function to convert sync throws to rejections before racing.
- `race` returns the first to settle; subsequent results are not surfaced.
- `any` returns the first to succeed; failure aggregates all errors. Type: `AsyncResult<T, E[]>`.
- `allSettled` returns `AsyncResult<T[], E[]>`; `Settled<T, E>` is a discriminated union.
- `Settled<T, E>` literal narrowing: `{ ok: true, value: T }` and `{ ok: false, error: E }`.

- [ ] **Step 12.2: Add the applicable assertions per API**

- Use `vi.useFakeTimers()` and reset with `vi.useRealTimers()` in `afterEach` to avoid leaks.
- Type assertions for `Settled<T, E>` discrimination, `any` aggregation, and `allSettled` aggregation.
- Runtime assertions for the deterministic timer-driven scenarios.

- [ ] **Step 12.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/reliability/ && npx vitest run src/reliability/`
Expected: PASS.

- [ ] **Step 12.4: Fix any genuine public-contract defects**

- [ ] **Step 12.5: Add regression assertions**

- [ ] **Step 12.6: Inspect staged diff and commit**

```bash
git add src/reliability
[ -f src/tests/integration/ReliabilityContract.spec.ts ] && git add src/tests/integration/ReliabilityContract.spec.ts
git diff --cached --check
git commit -m "test(reliability): cover retry, timeout, race, and settled discriminators" \
  -m "Pin attempt counts and delay handling with fake timers, eager/lazy execution distinction, TimeoutError policy, race selection, and allSettled/any aggregation types. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(reliability): ...` and adjust the body.

---

## Task 13: observability module

**Files:**
- Modify per-API: `src/observability/<api>.type-spec.ts`
- Modify per-API: `src/observability/<api>.spec.ts`
- Possibly modify: `src/observability/<api>.ts`
- Possibly create: `src/tests/integration/ObservabilityContract.spec.ts` if a contract applies across observability APIs

**Public APIs in scope:** `ctx`, `getPath` (+ `PathSegment`, `PathStack`), `withPath`, `tapErrContext` (+ `ErrContext`), `format` (+ `FormatOptions`), `inspect` (+ `Inspected`), `observe`, `installObserver`, `getActiveObserver` (+ `Observer`, `ObserveEvent`).

- [ ] **Step 13.1: For each public API, list the applicable dimensions**

- `ctx.run` establishes an async scope; `withPath(seg, fn)` pushes `seg` and runs `fn` inside the scope; the path concatenates outer-first.
- The standalone (outside `ctx.run`) call to `withPath` permanently appends to the global stack; the JSDoc warns about this. Pin the behavior so the warning is enforced by a test.
- `getPath` returns `readonly PathSegment[]` in the correct order.
- `installObserver` registers an `Observer`; the observer receives `ObserveEvent` for each `tapErrContext`/`format`/`inspect` call.
- The observer's `next`/`error`/`complete` lifecycle is honored; an observer that throws does not crash the helper.

- [ ] **Step 13.2: Add the applicable assertions per API**

Use the documented feature-detection order (Node global → `async_hooks` global → `createRequire(import.meta.url)` → polyfill). Tests should not depend on which path is taken; they should verify observable behavior under each available path by setting a `globalThis.AsyncLocalStorage = polyfillStore` for the polyfill case if needed.

- [ ] **Step 13.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/observability/ && npx vitest run src/observability/`
Expected: PASS.

- [ ] **Step 13.4: Fix any genuine public-contract defects**

- [ ] **Step 13.5: Add regression assertions**

- [ ] **Step 13.6: Inspect staged diff and commit**

```bash
git add src/observability
[ -f src/tests/integration/ObservabilityContract.spec.ts ] && git add src/tests/integration/ObservabilityContract.spec.ts
git diff --cached --check
git commit -m "test(observability): cover path stack, scope isolation, and observer lifecycle" \
  -m "Pin path concatenation order, withPath scope attachment, observer installation and restoration, observer-throw isolation, and the documented standalone-withPath warning. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(observability): ...` and adjust the body.

---

## Task 14: primitives module

**Files:**
- Modify per-API: `src/primitives/<api>.type-spec.ts`
- Modify per-API: `src/primitives/<api>.spec.ts`
- Possibly modify: `src/primitives/<api>.ts`
- Possibly create: `src/tests/integration/PrimitivesContract.spec.ts` if a contract applies across primitives

**Public APIs in scope:** `cond`, `condErr`, `sequence`, `sequenceAsyncResult`, `reduce`, `partitionOption` (+ `Partitioned<T>`), `lift`.

- [ ] **Step 14.1: For each public API, list the applicable dimensions**

- `cond` returns `Ok(undefined)` when the condition is true and `Err(err)` otherwise; the value type is `undefined`. `condErr` is the inverse.
- `sequence` is the same shape as `combine` but takes an array of `IResult` and returns `IResult<Array, E>`. `sequenceAsyncResult` is the AsyncResult analogue.
- `reduce` folds an array with a stateful callback; the initial value's type, the callback's accumulator, and the return are precise.
- `partitionOption` returns `{ some: T[], noneIndices: number[] }` (indices, not values).
- `lift` has two overloads: `lift<A, T, E = never>(fn)` and `lift<A, T, E>(fn, errorFn)`. The `E = never` default documents that the lifted function does not produce an error channel when used without an errorFn; using it without errorFn throws at runtime.

- [ ] **Step 14.2: Add the applicable assertions per API**

- [ ] **Step 14.3: Run focused tests**

Run: `npx vitest typecheck run --typecheck.only src/primitives/ && npx vitest run src/primitives/`
Expected: PASS.

- [ ] **Step 14.4: Fix any genuine public-contract defects**

- [ ] **Step 14.5: Add regression assertions**

- [ ] **Step 14.6: Inspect staged diff and commit**

```bash
git add src/primitives
[ -f src/tests/integration/PrimitivesContract.spec.ts ] && git add src/tests/integration/PrimitivesContract.spec.ts
git diff --cached --check
git commit -m "test(primitives): cover cond, sequence, reduce, partitionOption, and lift" \
  -m "Pin conditional branches, sequence/sequenceAsyncResult equivalence to combine, reduce accumulator inference, partitionOption indices contract, and the lift errorFn requirement. Include any corrected implementation defects and their regression assertions.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If the commit corrected a production defect, change the subject to `fix(primitives): ...` and adjust the body.

---

## Task 15: Final verification

**Files:** none modified; verification only.

- [ ] **Step 15.1: Run full type tests**

Run: `npm run test:type`
Expected: PASS for the whole `src/` tree.

- [ ] **Step 15.2: Run full runtime tests**

Run: `npm run test`
Expected: PASS for the whole `src/` tree.

- [ ] **Step 15.3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 15.4: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 15.5: Run coverage**

Run: `npx vitest run --coverage`
Expected: passes existing thresholds; report any unexpected threshold change to the user instead of weakening the threshold.

- [ ] **Step 15.6: Inspect the commit sequence**

Run: `git log --oneline -20` and `git status`
Expected: the previous 15 commits are the 14 module commits plus any prerequisite fix commit introduced under a Task's defect step. `git status` is clean.

- [ ] **Step 15.7: Report summary to the user**

Provide:
- Per-module summary of strengthened contract categories.
- Genuine defects corrected (if any), each with the file and a one-line description of the corrected contract.
- Any limitation that could not be safely encoded as a deterministic test.
