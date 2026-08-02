# API-Specific Production Test Coverage Design

**Date:** 2026-08-02
**Status:** Approved

## 1. Goal

Upgrade the existing basic type-spec templates into production-grade, API-specific contract tests. The work covers both co-located `*.type-spec.ts` files and runtime `*.spec.ts` files. Tests will be selected from each API's signatures, overloads, generic relationships, state branches, control flow, and failure policy rather than generated from a uniform template.

When a new test exposes a genuine public-contract defect, the same module batch will include the smallest safe implementation or declaration fix and a regression test.

## 2. Scope

The work covers these direct `src` submodules in dependency order:

1. `types`
2. `factories`
3. `operators`
4. `option`
5. `combine`
6. `composition`
7. `adapters`
8. `async-result`
9. `async-option`
10. `promise-result`
11. `promise-option`
12. `reliability`
13. `observability`
14. `primitives`

`src/tests` is not an independent batch. A cross-module test may be added there only when a contract cannot be expressed adequately in a co-located test; it belongs to the commit for the module that requires it.

### Out of scope

- Refactoring public APIs merely to simplify tests.
- Introducing a shared contract-test DSL or another test framework.
- Generating Cartesian products of parameter combinations.
- Modifying implementation unrelated to the active module.
- Broad benchmark or documentation rewrites.
- Brittle assertions against private implementation details.
- Reducing existing test or coverage thresholds.

Internal helpers are tested only when their observable behavior directly determines a public contract.

## 3. Per-Module Workflow

Each module is one independently reviewable work unit:

1. Enumerate every public API and overload exported by the module.
2. Read the implementation, declarations, JSDoc, current runtime tests, and current type tests.
3. Mark the applicable dimensions from the risk matrix below.
4. Enhance existing tests instead of duplicating equivalent assertions.
5. Run focused runtime and type tests for the module.
6. Diagnose every failure and correct either the test assumption or the smallest relevant production defect.
7. Add a regression assertion for every corrected defect.
8. Repeat focused verification.
9. Review the staged diff and create one atomic commit for the direct submodule.

## 4. API Risk Matrix

Not every dimension applies to every API. An API is assessed against its actual public contract rather than forced through irrelevant cases.

### 4.1 Type contracts

Applicable `*.type-spec.ts` checks include:

- **Call forms:** direct, curried, handler-object, and overload distinctions between omitted arguments and explicit `undefined`.
- **Generic flow:** precise callback parameters, mapped return values, preserved or replaced errors, value/error unions, defaults involving `never` or `unknown`, literal preservation, readonly inputs, and tuple positions.
- **Carrier composition:** exact nesting of Result, Option, and asynchronous carriers; one-layer flattening; transposition direction; heterogeneous tuple inference for `all`; homogeneous arrays for `combine`; and error arrays for all-error combinators.
- **Negative constraints:** invalid arguments, invalid callback return carriers, constrained error types, and unsupported overload depth or composition.

Negative tests should use narrowly scoped `@ts-expect-error` directives. The following line must contain one intentional error so the directive cannot hide an unrelated regression.

### 4.2 Runtime state contracts

Applicable `*.spec.ts` checks include:

- `Ok` and `Err`; `Some` and `None`.
- Empty, singleton, and multi-element inputs.
- Failure in the first, middle, and final position.
- One-layer and deeper nesting where depth affects behavior.
- Literal values, objects, references, and explicit `undefined`.
- Callback arguments and invocation counts.
- Inactive callbacks never being called.
- Input values not being mutated unexpectedly.

### 4.3 Control flow and failure contracts

Tests must encode each API's documented policy rather than assume a family-wide policy:

- Whether a synchronous throw becomes `Err`, becomes `None`, is mapped, or propagates.
- Whether a Promise rejection is caught, converted, or propagated.
- Whether a lazy carrier remains unexecuted before `run` or equivalent consumption.
- Whether an eager API starts immediately.
- Whether short-circuiting prevents subsequent callbacks or tasks from starting or awaiting.
- Whether retry, timeout, race, and related APIs resolve boundary races correctly.

Timing-sensitive tests use controlled fake timers rather than real sleeps. Tests for non-cancellable Promises assert only public observable behavior and must not leave unhandled rejections.

## 5. Per-API Completion Criteria

An API is complete only when all applicable requirements hold:

1. Every public overload has at least one precise inference assertion.
2. Every public state branch has at least one runtime assertion.
3. Generic mapping, replacement, preservation, or union behavior is locked down.
4. At least one edge specific to that API is covered.
5. Defined short-circuit and exception behavior is tested.
6. At least one meaningful invalid use is rejected at the type level; if the API has no meaningful negative boundary, that dimension is explicitly treated as not applicable during review.
7. Existing tests are enhanced rather than copied into parallel equivalents.

Completion is risk-matrix driven, not based on line count or a fixed number of tests.

## 6. Module-Specific Emphasis

### `types`

Discriminated unions, narrowing, default error types, AsyncResult/AsyncOption carrier types, readonly data, and value/error unions.

### `factories`

Omitted arguments versus explicit `undefined`, synchronous throws, Promise rejections, predicate narrowing, error mappers, and generic defaults.

### `operators`

Direct and curried overloads, value/error widening, short-circuiting, callback invocation, raw throws versus wrapped failures, one-level transformations, and constrained escape hatches.

### `option`

Some/None short-circuiting, handler-object `match`, one-level flattening, transposition, tuple traversal, and explicit `undefined` values.

### `combine`

Homogeneous arrays versus heterogeneous tuples, readonly inputs, first-error short-circuiting, tuple-position preservation, and collection of every error.

### `composition`

The supported overload ladders for `pipe` and `pipeAsync`, error flow through `composeK` and `composeKAsync`, empty-chain behavior, and generator yield/return semantics for safe-try APIs.

### `adapters`

Synchronous/asynchronous bridging, error mapping, tee side effects with original-value preservation, and Result/Option conversion.

### `async-result`

Lazy execution, callbacks returning different supported carriers, rejection policy, asynchronous short-circuiting, and value/error unions.

### `async-option`

Rejection-to-None contracts, lazy execution, transpose-to-AsyncResult behavior, callback invocation counts, and supported callback carriers.

### `promise-result`

Eager Promise behavior, differences between synchronous-callback and asynchronous-callback families, rejection propagation, lifted operators, and combinator aggregation.

### `promise-option`

The Promise-of-Option and lift-on-Option families, per-API rejection policy, asynchronous callbacks, and None short-circuiting.

### `reliability`

Attempt counts, retry delays, timeout boundaries, eager versus lazy execution, race/any selection, allSettled discrimination, and deterministic fake timers.

### `observability`

Path stacks, asynchronous scope isolation, observer installation and restoration, observer-failure isolation, error context, output formatting, and exported type shapes.

### `primitives`

Conditional branches, lazy sequencing, reduction accumulation, Option partition indices, lifted-function exception conversion, and readonly inputs.

## 7. Defect Handling

When a new assertion fails:

1. Verify that the expected behavior follows the public signature, documentation, and surrounding API conventions.
2. Correct the test if its assumption is wrong.
3. If the declaration is wrong, make the smallest type-signature correction.
4. If runtime behavior is wrong, make the smallest implementation correction.
5. Keep a focused regression test in the relevant API's test file.
6. Do not include adjacent, unrelated cleanup.
7. If a correction must cross module boundaries, include only the necessary dependency and explain it in the commit body. Prefer a separate prerequisite fix commit only when it is independently meaningful and verifiable.

No expected failure is hidden with a broad suppression, skipped test, lowered threshold, or bypassed hook.

## 8. Verification Strategy

### Per module

Before the module commit:

- Run the module's focused runtime tests.
- Run the module's focused type-spec tests.
- Run any project lint, formatting, or type-check command that supports safe focused execution.
- Run `git diff --check`.
- Inspect the staged diff to ensure it contains only the active batch and unavoidable dependencies.

### Final verification

After all module batches:

- Run the complete type-test command (`npm run test:type`).
- Run the complete runtime test suite.
- Run the complete coverage suite and satisfy existing thresholds.
- Run the production build.
- Run all configured lint and formatting checks.
- Inspect the final worktree status and commit sequence.

A failed or skipped command must be reported accurately. Completion is not claimed until all required final commands pass.

## 9. Atomic Commit Policy

The normal unit is one commit per direct `src` submodule. Test-only examples:

```text
test(types): strengthen API-specific type and edge coverage
test(factories): cover overload and failure contracts
test(operators): cover operator-specific type and runtime contracts
```

When a batch contains a production correction, use a subject that reflects the fix, for example:

```text
fix(async-option): enforce rejection and inference contracts
```

The body should summarize the exposed defect, corrected contract, and key regression coverage when applicable. Every commit ends with:

```text
Co-Authored-By: Claude <noreply@anthropic.com>
```

Hooks are never bypassed with `--no-verify`.

## 10. Deliverables and Acceptance

The completed branch contains:

- API-specific type-contract coverage for every public API.
- Relevant runtime edge coverage for every public API.
- Minimal production fixes for genuine defects exposed by the new tests.
- Fourteen atomic direct-submodule commits, except for a justified independently meaningful prerequisite fix if one is required.
- Passing focused checks for each module and passing final full verification.
- A final summary identifying the contract categories strengthened per module, genuine defects corrected, and any limitation that could not safely be encoded as a deterministic test.
