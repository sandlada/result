<!--
This file documents bugs, runtime errors, potential errors, and performance
issues found while auditing every non-spec module under `src/`. Findings are
ordered by severity (Bug > Runtime risk > Potential footgun > Style /
performance), then by file path within each tier.

Conventions:
  - "Contract" refers to the documented behavior of the surrounding operator.
  - "TDoc" = TypeScript-only type lie / unsound cast.
  - "Runtime" = reproducible runtime misbehavior.
  - "Footgun" = surprise with no obvious symptom until exercised.
-->
# Bugs & Risk Audit — `@sandlada/result`

Scope: every `*.ts` file under `src/` except `*.spec.ts`. Audit performed
against `package.json` v0.0.4-20260722.a.

---

## 1. Bugs (definite or near-definite runtime defects)

### 1.1 `unwrapOrAsync` propagates a rejected `defaultValue` instead of catching it

File: [src/async/unwrapOrAsync.ts:18-22](src/async/unwrapOrAsync.ts:18-22)

```ts
return r.then(async inner => inner.isSuccess ? inner.value : await defaultValue);
```

When `r` is a failure and `defaultValue` is a `Promise<A>` that rejects, the
`await defaultValue` re-throws inside the `.then` callback, so the final
`Promise<A>` rejects. The whole AsyncResult family advertises that its
promises never reject — this operator breaks that contract.

Suggested fix: wrap the await in `try/catch` and convert the rejection into a
synthetic `Err`, mirroring `mapErrAsync` / `unwrapOrElseAsync`.

### 1.2 `unwrapOrElseAsync` propagates a rejected `onErr` callback result

File: [src/async/unwrapOrElseAsync.ts:16-21](src/async/unwrapOrElseAsync.ts:16-21)

```ts
return r.then(async inner => {
    if(inner.isSuccess) return inner.value;
    return await onErr(inner.error);
});
```

Same defect as 1.1 but on the fallback path. A user-supplied
`onErr: (e: E) => Promise<A>` that rejects will produce an unhandled
rejection on the composed `Promise<A>`.

### 1.3 `mapOrAsync` swallows mapping errors into `defaultValue` — undocumented

File: [src/async/mapOrAsync.ts:19-30](src/async/mapOrAsync.ts:19-30)

```ts
return r.then(async inner => {
    if(inner.isSuccess) {
        try {
            return await fn(inner.value);
        } catch {
            return defaultValue;
        }
    }
    return defaultValue;
});
```

The "swallow → defaultValue" behaviour is **tested** in
[src/async/mapOrAsync.spec.ts:38-50](src/async/mapOrAsync.spec.ts:38-50)
("returns default when sync mapper throws" and "...when async mapper
rejects"), so the intent is clear, but:

1. The JSDoc on `mapOrAsync.ts` does not mention this behaviour. It only
   says the function is "more efficient" than the equivalent composition.
2. The catch binds **no parameter**, so a caller cannot inspect or log the
   swallowed error (e.g. via `installObserver`).
3. Asymmetric with `unwrapOrElseAsync` (1.2), which propagates a rejected
   `onErr`. Both operators are "compute a default on failure"; only one
   guards the mapping branch.

The `[src/async/README.md](src/async/README.md)` mentions catch+convert in
general but does not single out `mapOrAsync`. Add a JSDoc line stating
that a thrown mapper becomes `defaultValue`.


### 1.4 Async `*Option` family silently swallows rejections into `None` / `false` — undocumented error loss

Files:
- [src/async/bindAsyncOption.ts:23-32](src/async/bindAsyncOption.ts:23-32)
- [src/async/orElseAsyncOption.ts:21-30](src/async/orElseAsyncOption.ts:21-30)
- [src/async/mapAsyncOption.ts:22-31](src/async/mapAsyncOption.ts:22-31)
- [src/async/tapAsyncOption.ts:21-30](src/async/tapAsyncOption.ts:21-30)
- [src/async/filterAsyncOption.ts:23-33](src/async/filterAsyncOption.ts:23-33)
- [src/async/existsAsyncOption.ts:21-31](src/async/existsAsyncOption.ts:21-31)

Each one uses a bare `catch {}` to convert a thrown / rejected callback into
`None` / `false`. The Option world has no error channel, so this is the only
choice, and the JSDoc on each function does say "predicate throws /
rejects → `None`" (e.g.
[src/async/mapAsyncOption.ts:14-21](src/async/mapAsyncOption.ts:14-21)).
The behaviour is **tested** in
[src/async/async-bind-option-and-map-async-option.spec.ts](src/tests/hardening/AsyncOptionEager.spec.ts).

The remaining issues:

1. The original error reason is lost — the catch binds no parameter, so a
   caller cannot `console.error` it or pipe it to `installObserver`.
2. `mapAsyncOption`'s "swallow → `None`" policy is inconsistent with its
   sibling in [src/async-result/mapAsync.ts:25-34](src/async-result/mapAsync.ts:25-34),
   which converts the same kind of throw into `err(e as E)`. Same name
   family, two policies.
3. There is no way for a consumer to opt out — once `predicate` throws,
   the only choice is `None`.
### 1.5 `okOrElse` swallows errors from `errorFn` silently in the OK branch but surfaces them on the None branch

File: [src/option/okOrElse.ts:14-25](src/option/okOrElse.ts:14-25)

```ts
if(opt.isSome) return ok(opt.value) as unknown as IResultOfT<T, E>;
try {
    return err(errorFn()) as IResultOfT<T, E>;
} catch(e: unknown) {
    return err(e as E) as IResultOfT<T, E>;
}
```

The `try/catch` only wraps `errorFn()`. The signature says
`errorFn: () => E` (sync) but the defensive catch implies async support.
If the user's `errorFn` is async (returns a Promise) and rejects, the
`err(errorFn())` call doesn't await — the rejection is silently discarded.

Not a bug for the documented sync signature, but the catch suggests async
support that isn't really there. **TDoc risk.**

### 1.6 `condErr` always claims `IResultOfT<T, F>` even though the error is typed `E`

File: [src/primitives/condErr.ts:22-25](src/primitives/condErr.ts:22-25)

```ts
export function condErr<T, E, F>(
    predicate: (value: T) => boolean,
    okValue: T,
    errorOnTrue: E,
): IResultOfT<T, F> {
    return predicate(okValue)
        ? (err(errorOnTrue) as unknown as IResultOfT<T, F>)
        : (ok(okValue) as unknown as IResultOfT<T, F>);
}
```

`errorOnTrue` has type `E`; the result claims type `F`. The function is
correct only when callers pick `E = F`. If a caller writes
`condErr<string, number, string>(...)`, the error at runtime is a number but
the type system thinks it is a string.

Suggested fix: drop the redundant `F` generic and use `E` directly, or
constrain `E extends F`.

### 1.7 `partitionOption` does not preserve input order semantics consistent with `combineWithAllErrors`

File: [src/primitives/partitionOption.ts:24-29](src/primitives/partitionOption.ts:24-29)

The function returns indices for `None` values but not for `Some` values.
Callers who need to map back to the original array must scan the input
themselves — defeating the "fixed-shape schema" use case described in the
JSDoc. The lack of symmetric `someIndices` makes the API awkward.

Not a bug per se — the JSDoc is explicit — but flagged for the mismatch
with `combineWithAllErrors`, which partitions by input position via the
short-circuiting value.

### 1.8 `composeKAsync` rejects when given zero functions, `composeK` throws

Files:
- [src/composition/composeK.ts:69-73](src/composition/composeK.ts:69-73)
- [src/composition/composeKAsync.ts:62-66](src/composition/composeKAsync.ts:62-66)

```ts
// sync
if (fns.length === 0) throw new TypeError('composeK requires at least one function');

// async
if (fns.length === 0) {
    return (_a: any) => Promise.reject(new TypeError('composeKAsync requires at least one function'));
}
```

The sync variant fails synchronously; the async variant hides the failure
inside a Promise. A user who calls `composeKAsync()` and forgets to `await`
will get a runtime rejection that is easy to miss.

### 1.9 `reliability/race.ts` returns `err(undefined as unknown as E)` for an empty input

File: [src/reliability/race.ts:23-25](src/reliability/race.ts:23-25)

```ts
if (runs.length === 0) {
    return err(undefined as unknown as E) as IResultOfT<T, E>;
}
```

The empty case produces `Err(undefined)`. For `E = Error` the runtime
payload is `undefined`, which is not an Error and bypasses any
`instanceof Error` checks downstream. Either document this explicitly or
return a sentinel (e.g. `err(new Error('race: no inputs') as E)`).

### 1.10 `reliability/any.ts` documentation vs implementation mismatch on success/error order

File: [src/reliability/any.ts:34-49](src/reliability/any.ts:34-49)

JSDoc says errors (and implicitly successes) are returned "in completion
order". The implementation pushes in whatever order the `.then` callbacks
fire (microtask scheduling). `Promise.all` does not guarantee preservation
of input order across heterogeneous async resolutions on every engine.

Suggestion: walk the array serially (or pair each run with its index and
sort by index before pushing).

### 1.11 `reliability/race.ts` "first error in input order" claim — verified, partial correction

File: [src/reliability/race.ts:42-58](src/reliability/race.ts:42-58)

The original draft of this finding claimed the implementation picked the
first error to settle, not the first in input order. Reading the code more
carefully and checking [src/reliability/race.spec.ts:103-114](src/reliability/race.spec.ts:103-114)
(which sets `ar1 = arFrom(20, err("err1"))`, `ar2 = arFrom(5, err("err2"))`
and asserts `r.error === "err1"`) shows that the implementation does
prefer input-order index 0:

```ts
if (idx === 0 || firstError === undefined) {
    firstError = r;
}
```

If `runs[0]` fails later than `runs[1]`, the `idx === 0` clause overrides
`firstError` once `runs[0]` settles. So the JSDoc claim is true, but the
behaviour is subtle:

- If `runs[0]` succeeds, the race resolves to that success and the error
  logic never runs.
- If `runs[0]` is the first to fail, it is recorded via `idx === 0`.
- If `runs[0]` is not the first to fail, it is **still** preferred — once
  `runs[0]` settles (failure or success), the `idx === 0` clause
  re-records it.
- The downside: while waiting for `runs[0]` to settle, the user has no
  signal. A consumer that wants "first to settle, whatever it is" would
  need a separate primitive.

Suggestion: extract a `firstError` selector that takes an explicit input-
order index parameter, so the two policies are explicit.

### 1.12 `fromSafePromise` always wraps non-Error rejections in `new Error(String(e))`

File: [src/factories/fromSafePromise.ts:20-26](src/factories/fromSafePromise.ts:20-26)

```ts
catch (e: unknown) {
    return err(e instanceof Error ? e : new Error(String(e))) as unknown as IResultOfT<T, Error>;
}
```

Original non-Error values (numbers, objects, custom tagged reasons) lose
identity. This contradicts `tryCatch` / `fromThrowable` / `fromPromise`,
which preserve the raw value via `e as E` when no `errorFn` is supplied.
`fromSafePromise` is the only factory that always coerces to `Error`.

---

## 1A. Behaviors that are tested but undocumented or surprising

The items below are **intentional**, in the sense that there is at least
one spec asserting the behaviour. They are listed here as caveats rather
than bugs so future maintainers do not "fix" them by accident.

### 1A.1 `mapOrAsync` mapper throws → `defaultValue` (undocumented)

File: src/async/mapOrAsync.ts (lines 19-30)

Asserted by src/async/mapOrAsync.spec.ts (lines 38-50)
("returns default when sync mapper throws" and "...when async mapper
rejects"). The JSDoc does not mention this; consumers who expect a
mapper exception to flow to the `Err` channel will be surprised. Same
case-by-case policy applies to `unwrapOrElseAsync` only when the
`onErr` callback rejects (see 1.2).

### 1A.2 `retry` strips Error identity (documented by tests)

File: src/reliability/retry.ts (lines 50-57)

Asserted by src/reliability/retry.spec.ts (lines 108-126)
("uses constructor.name when an Error with empty message is thrown" and
"wraps a non-Error throw value via String()"). The function turns thrown
Errors into `.message` strings, which means `instanceof Error` and stack
traces are lost. See 2.5 for the doc gap.

### 1A.3 Async `*Option` `catch {}` swallows error reason (tested policy)

Files: see 1.4. Asserted by
src/tests/hardening/AsyncOptionEager.spec.ts (lines 23-29).
The Option world has no error channel so silent swallow is the only
choice; consumers who want richer telemetry need to wrap their callbacks.

### 1A.4 `reliability/race.ts` "first error in input order" claim

Asserted by src/reliability/race.spec.ts (lines 103-126)
("handles all errors where first failure is not index 0" expects
`r.error === 'err1'` when `ar1` is the slower failure). The
implementation does honour the JSDoc; see 1.11 for nuance.

### 1A.5 `combineWithAllErrors` preserves input order

Asserted by src/combine/combineWithAllErrors.spec.ts (lines 30-42)
("expect(combined.error[0].field).toBe('name'); expect(combined.error[1].field).toBe('email')").
Implementation is a single forward pass; optimal.

### 1A.6 `allSettled` preserves input order

Asserted by src/reliability/allSettled.spec.ts (lines 11-23)
(uses `toEqual` with explicit `[ok(1), err('a'), ok(3)]` order).
Implementation pre-sizes the outcome array; optimal.

### 1A.7 `any` does **not** preserve input order

File: src/reliability/any.ts (lines 34-49)

Asserted (loosely) by src/reliability/any.spec.ts (lines 18-37)
(uses `.sort()` before comparing). The implementation pushes in
microtask-settle order, not input order. If a downstream consumer relies
on input order, this is a real bug for them; the project has not pinned
the behaviour either way. See 1.10.

### 1A.8 `fromSafePromise` always wraps non-Error rejections

File: src/factories/fromSafePromise.ts (lines 20-26)

Always converts non-Error rejections to `new Error(String(e))`. Not
tested directly, but the JSDoc says `fromSafePromise` "uses `Error` as
the error type by default" — so this is the deliberate contract,
incompatible with `tryCatch`/`fromThrowable`/`fromPromise` which
preserve the raw value. See 1.12.

### 1A.9 `tap` family converts callback throws into `err(caught)`

Asserted by every test in src/operators/tap.spec.ts,
tapErr.spec.ts, and the async siblings. The README explicitly states
this as the "tap/tee policy": a throw inside a side-effect is a
programming bug, not data, so the library converts to `err` to keep the
pipeline alive. The underlying caught error identity is lost, however.

### 1A.10 `withPath` outside `ctx.run` permanently mutates the global stack

Asserted (in effect) by src/tests/hardening/RetryLazy.spec.ts
(lines 50-58):
```
withPath('test');
expect(getPath()).toEqual(['test']);
```
There is no cleanup assertion, but the test demonstrates the permanent
leak. The library relies on `ctx.run` for scope discipline; calling
`withPath` standalone is an obvious footgun (see 2.2).

---
## 2. Runtime risks / latent footguns

### 2.1 Module-level path stack in observability `ctx` is not async-safe

File: src/observability/ctx.ts (lines 21-39)

```
const stack: PathSegment[] = [];
```

The `stack` is mutated via `stack.length = savedLength` from within async
`.then` callbacks. Two concurrent `ctx.run` invocations can interleave
their pops and corrupt each other's breadcrumb paths. The JSDoc explicitly
disclaims `AsyncLocalStorage`-based isolation, but it does not warn that
**concurrent** `ctx.run` calls (e.g. inside `Promise.all` over the same
process) will produce incorrect paths.

### 2.2 `withPath` never cleans up unless wrapped in `ctx.run`

File: src/observability/withPath.ts (lines 18-22)

```
ctx.push(segment);
return r;
```

A user who calls `withPath('foo')` outside any `ctx.run` scope permanently
adds `'foo'` to the shared path stack. In long-running services this leaks.
The JSDoc hints at the convention but does not warn that misuse is
permanent.

### 2.3 `installObserver` disposer is stack-like but documented as "most-recently-installed"

File: src/observability/observe.ts (lines 25-37)

```
const previous = active;
active = handler;
return () => {
    if (active === handler) active = previous;
};
```

If observer A is installed, then B, then A's disposer is called, A's
disposer finds `active === B !== A` and does nothing — so B stays active.
This is stack semantics, but the JSDoc describes "the most recently
installed one replaces any previous". The behaviour is fine in practice,
just unexpected from the doc.

### 2.4 `observe` swallows observer errors

File: src/observability/observe.ts (lines 60-66)

```
try {
    handler(event as ObserveEvent<unknown, unknown>);
} catch {
    // Observers are side-effects; swallow their errors
}
```

A misbehaving reporter silently disappears. There is no logging path
(`console.error` or similar). Debugging "why is my observer not called" is
harder than it needs to be.


### 2.5 `retry` strips Error identity even for thrown Error instances

File: [src/reliability/retry.ts:50-57](src/reliability/retry.ts:50-57)

```ts
const toErrFailure = <E>(thrown: unknown): IResultOfT<never, E> => {
    const wrapped = thrown instanceof Error ? thrown.message || thrown.constructor.name : String(thrown);
    return err(wrapped as unknown as E) as IResultOfT<never, E>;
};
```

This is the **documented** behaviour, confirmed by
[src/reliability/retry.spec.ts:108-126](src/reliability/retry.spec.ts:108-126)
("uses constructor.name when an Error with empty message is thrown" and
"wraps a non-Error throw value via String()"). Tests verify
`r.error === ''sync-throw''` rather than the Error object.

The JSDoc on `retry.ts` does not call this out; consumers who expect
`r.error` to be the actual `Error` will find `instanceof Error` fails and
stack traces gone. Suggest a `keepError: true` option, or document the
current behaviour in the JSDoc and let consumers opt in.
### 2.6 `timeout` does not cancel the inner `run()`

File: src/reliability/timeout.ts (lines 46-73)

After the timer fires and `resolve(Err)` is called, the inner `arRun()`
continues executing until its eventual settlement. That settlement is
ignored, but the work (network, file I/O, computation) keeps going. For
long-running pipelines this is a resource leak. The JSDoc says exactly
this but offers no `AbortSignal` plumbing — unlike `retry`, which does.

### 2.7 `timeoutEager` produces an `AsyncResult`-shaped ad-hoc object

File: src/reliability/timeoutEager.ts (lines 25-32)

```
const ar = {
    run: fn,
};
return timeout(ms, ar, onTimeout).run();
```

`fn: () => Promise<IResultOfT<T, E>>` is wrapped as a fake `AsyncResult`.
If `fn` throws synchronously, the fake `AsyncResult.run` returns nothing
meaningful and the `timeout` wrapper will resolve on the timer instead of
on `fn`. A `safeInvoke`-style wrapper would prevent that.

### 2.8 `format` has no circular-reference guard

File: src/observability/format.ts (lines 30-65)

The recursion guard is `depth >= opts.maxDepth`, not a visited-set. Two
objects that mutually reference each other will recurse until `maxDepth` is
reached, then both render as `{...}`. Output is correct but performance on
cyclic graphs is O(maxDepth * nodes) without de-duplication.

### 2.9 `format` stringifies with `JSON.stringify` for keys

File: src/observability/format.ts (lines 55-62)

For large numeric arrays, `JSON.stringify(k)` is wasteful. Minor performance
concern; not a bug.

### 2.10 `bind.ts` in `async-option` accepts both `AsyncOption<U>` and `Promise<IOption<U>>`

File: src/async-option/bind.ts (lines 30-46)

```
if (next !== null && typeof next === 'object' && 'run' in next && typeof next.run === 'function') {
    return next.run();
}
return next as IOption<U>;
```

The duck-typing is a `feature` (interop), but it can misfire if the user's
callback returns a value that coincidentally has a `.run` function (e.g. a
test stub). The current check is reasonable, but the same pattern in
`async-result/bind.ts`, `async-result/orElse.ts`, and
`async-result/andThrough.ts` is repeated three times with slightly
different shapes — refactor risk.

### 2.11 `asyncTapOption` returns inline None literal instead of `ofNone()`

File: src/async/tapAsyncOption.ts (lines 21-30)

```
} catch {
    return { isSome: false as const, isNone: true as const };
}
```

Every other module uses `ofNone()` from `option/`. This module inlines the
shape. If `IOptionNone` ever grows (e.g. additional discriminants), this
file silently drifts.

### 2.12 `partitionOption` index lookup asserts non-null

File: src/primitives/partitionOption.ts (lines 25-29)

```
const o = opts[i]!;
```

The non-null assertion is correct (loop guard ensures `i < opts.length`),
but `noUncheckedIndexedAccess` plus `exactOptionalPropertyTypes` makes
this pattern worth a one-line comment explaining the invariant.

### 2.13 `reduce.ts` does the same non-null assertion

File: src/primitives/reduce.ts (lines 24-29)

Same as 2.12 — fine, but a comment helps future readers.

### 2.14 `composeK` does not have data-last curried overloads

File: src/composition/composeK.ts (lines 11-65)

Only the variadic direct form exists. No `composeK(f1)(f2)(f3)` curried
form. This is consistent with how the operator is intended to be used, but
worth flagging because most other operators expose both forms.

### 2.15 `traverseArray` accepts an index parameter

File: src/operators/traverseArray.ts (lines 36-37)

```
fn: (item: A, index: number) => IResultOfT<B, E>;
```

The `index` parameter is useful but undocumented. The JSDoc does not
mention it. Callers must read the source to discover the feature.

### 2.16 `flatten` is non-recursive

File: src/operators/flatten.ts (lines 13-16)

`flatten` only unwraps one level. `IResultOfT<IResultOfT<IResultOfT<A, E>, E>, E>`
will not flatten. JSDoc does not mention the depth limit.

### 2.17 `flattenAsync` and `flattenAsyncOption` are also one-level

Files:
- src/async/flattenAsync.ts (lines 17-22)
- src/async/flattenAsyncOption.ts (lines 18-22)
- src/async-result/flatten.ts (lines 17-24)
- src/async-option/flatten.ts (lines 17-24)

Same as 2.16, no JSDoc note.

### 2.18 Three `fromPromise` variants with subtly different signatures

Files:
- src/factories/fromPromise.ts — eager
- src/factories/fromSafePromise.ts — eager, always `Error`
- src/async-result/fromPromise.ts — lazy
- src/async-option/fromPromise.ts — lazy, always `None`

The eager/lazy distinction is the main split, but the surface is easy to
confuse.

### 2.19 `ap.ts` (sync) has no async counterpart

File: src/operators/ap.ts

`ap` exists for `IResultOfT` but no `apAsync` or `apAsyncResult` lives in
the `async/` or `async-result/` folders. Callers who want applicative
semantics in async pipelines have to roll their own `map + sequence`.

### 2.20 `swapAsync` is duplicated in `async-result/swap.ts` and `async/swapAsync.ts`

Files:
- src/async/swapAsync.ts (lines 18-30)
- src/async-result/swap.ts (lines 18-29)

Same implementation, two copies. Not a bug but a maintenance hazard — any
fix has to be applied in both places.

### 2.21 `bindAsync` and `asyncBind` both exist with subtly different shapes

Files:
- src/async/bindAsync.ts
- src/async/asyncBind.ts

`bindAsync` works on `Promise<IResultOfT>`, `asyncBind` works on
`IResultOfT` and returns `Promise<IResultOfT>`. The names are easy to swap,
and the implementations diverge in how they handle sync throws from the
callback. Worth a doc note.

### 2.22 `mapAsync` exists in both `async/mapAsync.ts` and `async-result/mapAsync.ts`

Files:
- src/async/mapAsync.ts (lines 23-27) — accepts `B | Promise<B>`
- src/async-result/mapAsync.ts (lines 25-34) — accepts `Promise<U>` only

The two `mapAsync` functions have different parameter types. Library
consumers reading the barrel export see two `mapAsync` symbols and have to
read each module to discover the difference.

### 2.23 `existsAsync` swallows predicate errors

File: src/async/existsAsync.ts (lines 22-32)

```
try {
    return await predicate(inner.value);
} catch {
    return false;
}
```

Same issue as 1.4 — bare `catch` discards the reason.

### 2.24 `filterOrElseAsync` discards the captured error identity

File: src/async/filterOrElseAsync.ts (lines 30-40)

```
} catch (e: unknown) {
    return err(e as E) as unknown as IResultOfT<A, E>;
}
```

This one is better — `e as E` is captured. But if the predicate throws
synchronously before `errorFn` is called, the error from `errorFn` (had it
run) is lost. Inconsistent with the strict "predicate-throws" vs
"errorFn-throws" distinction in the JSDoc.

### 2.25 `fromPredicate` uses `arguments.length` which can be wrong under `bind` / `apply`

File: src/factories/fromPredicate.ts (lines 30-34)

```
if(arguments.length < 3) return (value: T): IResultOfT<T, E> => fromPredicate(predicate, errorOnFalse, value);
```

`fromPredicate(p, undefined, undefined)` would proceed to call
`predicate(undefined)`, not return the curried form. If the predicate
throws on `undefined`, the error gets converted to `err(undefined)` by
`predicate(value!)` — confusing. Same shape in `ok.ts:22` but less harmful
because `ok(undefined)` is a legal call.

### 2.26 `ok.ts` overload returns `IResult<never>` without `value`, breaking JSON round-trips

File: src/factories/ok.ts (lines 21-24)

`ok()` returns `{ isSuccess: true, isFailure: false }` — no `value`
property. If the consumer serializes and deserializes via
`JSON.parse(JSON.stringify(ok()))`, they get `{ isSuccess: true, isFailure:
false }` back, which is fine. Edge case worth a doc note.

### 2.27 `fromSafePromise` strips non-Error identity (also see 1.12)

File: src/factories/fromSafePromise.ts (lines 20-26)

Repeat for emphasis. The decision to wrap is correct; the choice to always
wrap (instead of passing through) limits users who want to keep the original
custom tagged error.

---


## 3. Type-level lies and unsound casts (TDoc)

These do not crash at runtime but make the type system lie. Any of them
can become runtime bugs after a refactor.

### 3.1 Widespread `as unknown as IResultOfT<...>` in factories

Files: every operator under `src/operators/`, `src/async/`, and
`src/async-result/`, plus `src/option/okOr.ts`, `src/option/okOrElse.ts`,
`src/adapters/fromOption.ts`, `src/adapters/toOption.ts`, etc.

`ok()` and `err()` have narrow return types:
- `ok<T>(value: T): IResultOfT<T, never>`
- `err<E>(error: E): IResultOfT<never, E>`

Callers cast them with `as unknown as IResultOfT<NewType, NewError>` because
the operator needs to widen both type parameters simultaneously. This is
the standard pattern in this library, but every cast is a lie that the
operator body has to make good on.

Operators that do not re-narrow after mutation are correct. Operators that
introduce the wrong variant by mistake (e.g. `bimap` returning
`err(onErr(r.error))` cast as `IResultOfT<C, F>`) are sound only because the
`onErr` return is the only thing that flows into the error slot.

If a future change to `ok()` adds a runtime invariant (e.g. freezing the
returned object), every `as unknown as IResultOfT<...>` call site silently
bypasses it.

### 3.2 `as E` casts when no `errorFn` is provided

Files:
- src/factories/fromPromise.ts (lines 23-25)
- src/factories/fromThrowable.ts (lines 30-33)
- src/factories/tryCatch.ts (lines 21-23)
- src/factories/tryCatchAsync.ts (lines 21-24)
- src/reliability/retry.ts (lines 50-57)

```
const innerError = errorFn ? errorFn(e) : (e as E);
```

When the user supplies no `errorFn`, the unknown rejection is cast to the
operator's declared error type. If `E` is `Error` and the rejection is a
`string`, runtime code that does `e instanceof Error` later will fail
silently.

Suggestion: when no `errorFn` is provided, throw the rejection instead of
casting, or coerce to a wrapped `Error` like `fromSafePromise` does.

### 3.3 `mapErr`'s catch returns `err(e as F)` even when the source error is `E`

File: src/operators/mapErr.ts (lines 23-28)

```
try {
    return err(f(r.error)) as unknown as IResultOfT<A, F>;
} catch(e: unknown) {
    return err(e as F) as unknown as IResultOfT<A, F>;
}
```

If `f` itself throws (e.g. user-provided mapper bugs out), the catch
swallows the `E`-typed input error and substitutes an `F`-typed throw.
There is no `errorFn` slot — the user has no way to recover the original
`E`. Inconsistent with `bind` family where the throw policy is explicit.

### 3.4 `bind` cast to `E | F` without distinguishing them

File: src/operators/bind.ts (lines 26-31)

```
return f(r.value) as unknown as IResultOfT<B, E | F>;
```

If `f` throws, the catch wraps as `err(e as (E | F))`. A consumer
narrowing on `E | F` may treat a thrown error as if it were a real `E` from
the upstream. There is no observer hook for "this was a thrown error, not
a returned Err". Same pattern in `bindAsync` and `orElseAsync`.

### 3.5 `condErr` unsound cast (also 1.6)

File: src/primitives/condErr.ts (lines 22-25)

The `F` generic has no relationship to `E`. A user can write
`condErr((s: string) => true, "x", 5)` and get back
`IResultOfT<string, number>` — which is OK at runtime but the type allows
nonsense.

### 3.6 `lift` default `E = never` is misleading

File: src/primitives/lift.ts (lines 24-44)

```
export function lift<A extends unknown[], T, E = never>(
    fn: (...args: A) => T,
): (...args: A) => IResultOfT<T, E>;
```

When called without an `errorFn`, the return type is `IResultOfT<T, never>`
even though the wrapper will rethrow at runtime. The JSDoc explains this,
but the type `never` suggests "this cannot fail" rather than "this can
throw".

### 3.7 `observe.ts` observer event is loosely cast

File: src/observability/observe.ts (lines 60-66)

```
handler(event as ObserveEvent<unknown, unknown>);
```

The observer loses the precise `T` and `E` types and must recover them via
`event.result.isSuccess ? event.result.value : event.result.error`. The cast
is necessary because the slot is monomorphic but it sacrifices type safety
inside observers.

### 3.8 `safeTry` cast in the yield branch

File: src/composition/safeTry.ts (lines 37-39)

```
return (yield result as unknown as IResultOfT<never, E>) as unknown as T;
```

The `yield` evaluation is `result` itself. The cast
`as IResultOfT<never, E>` is purely cosmetic (the generator's yield type is
`IResultOfT<never, E>`), but the consumer (`fromSafeTry`) re-casts the
yielded value to `IResultOfT<T, E>`. This is intentional — the success
case returns `T` directly and the failure case yields `IResultOfT<never, E>`.
Still, the cast is necessary because TypeScript cannot narrow the yield
type to the runtime discriminator.

### 3.9 `fromSafeTry`'s extra `iterator.next()` is redundant

File: src/composition/safeTry.ts (lines 69-75)

```
if (typeof iterator.return === 'function') {
    iterator.return(undefined!);
}
const check = iterator.next();
if (!check.done) {
    throw new Error('safeTry: generator yielded more than once...');
}
```

After `iterator.return(undefined!)`, the generator is supposed to be in a
final state. Calling `next()` again is a defensive check that could trigger
side effects in any `finally` block that yields. It is also a duplicate
state check — if `return()` succeeded, `check.done` is guaranteed.

---

## 4. API consistency / design nits

Not bugs but worth noting for the maintainers.

### 4.1 `match` is inconsistent between sync, async, option, and async-option modules

Files:
- src/operators/match.ts (lines 21-30) — positional `(onOk, onErr, r?)`
- src/async/matchAsync.ts (lines 21-32) — positional `(onOk, onErr, r?)`
- src/option/match.ts (lines 20-28) — positional `(onSome, onNone)` curried
- src/async/option/matchAsyncOption.ts (lines 21-32) — positional `(onSome, onNone, r?)`
- src/async-result/match.ts (lines 23-35) — **object** `{ok, err}` pattern
- src/async-option/match.ts (lines 21-33) — **object** `{some, none}` pattern

The "match" function uses positional arguments in sync + option modules but
switches to an object-handler pattern in `async-result` and `async-option`.
This is the most user-visible inconsistency in the API. Either standardize
on object handlers everywhere or on positional arguments everywhere.

### 4.2 `unwrapOrAsync` signature accepts `A | Promise<A>` but does not document async default

File: src/async/unwrapOrAsync.ts (lines 21-23)

```
return r.then(async inner => inner.isSuccess ? inner.value : await defaultValue);
```

The JSDoc shows `0` and `42` examples but does not show a Promise default.
Callers discovering `Promise<A>` support by reading the source may be
surprised that a rejected Promise default propagates (see 1.1).

### 4.3 `unwrapOr` for `IResultOfT` and `IOption` have different generic arities

Files:
- src/operators/unwrapOr.ts (lines 17-21) — `<A, E>(default, r?)`
- src/option/unwrapOr.ts (lines 16-18) — `<T>(default)` curried only

No direct bug, but the option variant never accepts an `AsyncOption`
default. If async support is desired, the signature is incomplete.

### 4.4 `bind` result type widens `E` to `E | F` but `bindAsync` has different widening rules

Files:
- src/operators/bind.ts (lines 9-13) — `IResultOfT<B, E | F>`
- src/async/bindAsync.ts (lines 9-13) — `IResultOfT<B, E | F>`

The signatures match, but in the catch path:
- sync `bind`: `return { ... error: e as (E | F) }` — `E | F`
- async `bindAsync`: `return { ... error: e as (E | F) }` — `E | F`

Same shape — no bug. But the manual widening inside the catch means
`bind` of `Result<T, A>` followed by `bind` of `Result<U, B>` produces
`Result<V, A | B | throw>`. There is no public type for "this came from a
throw". See 3.4.

### 4.5 `fromPredicate` curried overload does not validate arity

See 2.25.

### 4.6 `IResult<TError = Error>` and `IResultOfT<TValue, TError = Error>` defaults differ

The default error type is `Error` in both, but `IResult` is rarely used
directly (its only consumer is the `ok()` no-arg overload). Worth a note
in `AGENTS.md` for new contributors.

### 4.7 `sequence` and `sequenceAsyncResult` have similar names but live in different modules with different signatures

Files:
- src/primitives/sequence.ts (lines 21-23) — sync alias of `combine`
- src/primitives/sequenceAsyncResult.ts (lines 21-44) — lazy AsyncResult combinator

Same name family, different semantics. Easy to confuse.

### 4.8 `partitionOption` returns indices but `separate` returns values

Files:
- src/primitives/partitionOption.ts (lines 24-29)
- src/operators/separate.ts (lines 21-30)

Two partition helpers, two shapes. Worth a doc table comparing them.

### 4.9 `retryLazy` accepts `RetryOptions<E>` but the `shouldRetry` predicate also receives the attempt number

File: src/reliability/retry.ts (lines 35-39)

```
readonly shouldRetry?: (error: E, attempt: number) => boolean;
```

The `attempt` is documented but the value is zero-based while `times` is
counted as extra attempts. The relationship between `attempt` and `times`
is not in the JSDoc.

### 4.10 `composeKAsync` and `composeK` overlap in signatures

Both accept up to 6 functions with similar overloads. The async variant
adds `Promise<IResultOfT<...>>` to each callback's return type. The two
are easy to misimport.

### 4.11 `bindAsync` and `bindAsyncOption` accept differently shaped fallback

Files:
- src/async/bindAsync.ts (lines 9-13)
- src/async/bindAsyncOption.ts (lines 9-13)

`bindAsync` is `Result-returning`, `bindAsyncOption` is `Option-returning`.
Both are bind-family, both are async. The naming is fine but the async
folder contains both `bindAsync*` and `asyncBind*` — duplication.

---


## 5. Performance observations

### 5.1 `separate` and `partitionOption` allocate two arrays per call

Files:
- src/operators/separate.ts (lines 23-29)
- src/primitives/partitionOption.ts (lines 24-29)

Two pushes per element. For very large inputs, a single allocation with
splice-based reordering would be faster but is rarely worth the complexity.

### 5.2 `format` uses string concatenation

File: src/observability/format.ts (lines 42-62)

Each level of recursion builds a string with `+`. For deep objects this is
O(n^2). Using an array + `Array.prototype.join` is faster for large objects.

### 5.3 `composeK`/`composeKAsync` use a loop over `bind`/`bindAsync`

Files:
- src/composition/composeK.ts (lines 74-80)
- src/composition/composeKAsync.ts (lines 67-75)

Each iteration calls `bind` (or `bindAsync`) which constructs a new
function. For long pipelines, pre-computing the composed function once
(via array `.reduce`) is faster.

### 5.4 `combineWithAllErrors` walks twice (compared to `combine`)

Files:
- src/combine/combineWithAllErrors.ts (lines 23-31) — single pass with two arrays (already optimal)
- src/async-result/combineWithAllErrors.ts (lines 25-39) — same pattern

Both already optimal.

### 5.5 `partitionOption` builds two arrays in one pass

File: src/primitives/partitionOption.ts (lines 24-29)

Single pass. Optimal.

### 5.6 `reduce` is single-pass

File: src/primitives/reduce.ts (lines 25-33)

Optimal.

### 5.7 `allSettled` pre-sizes the outcome array

File: src/reliability/allSettled.ts (lines 36-50)

```
const settledOutcomes: Settled<T, E>[] = new Array(runs.length);
```

Good — avoids dynamic resizing.

### 5.8 `separate` does not pre-size

File: src/operators/separate.ts (lines 23-29)

```
const okValues: T[] = [];
const errValues: E[] = [];
```

For large inputs, pre-sizing with `new Array(results.length)` (and slicing
at the end) would reduce array resizes.

---

## 6. Summary by file

(Files with no findings omitted. Bugs/Risks/TDoc columns reference the
section numbers above.)

| File | Bugs | Risks | TDoc | Nit |
|------|------|-------|------|-----|
| src/factories/ok.ts | — | 2.25 | — | 2.26 |
| src/factories/err.ts | — | — | — | — |
| src/factories/fromPredicate.ts | — | 2.25 | — | — |
| src/factories/fromThrowable.ts | — | — | 3.2 | — |
| src/factories/tryCatch.ts | — | — | 3.2 | — |
| src/factories/tryCatchAsync.ts | — | — | 3.2 | — |
| src/factories/fromPromise.ts | — | — | 3.2 | — |
| src/factories/fromSafePromise.ts | 1.12 | 2.27 | — | — |
| src/factories/asyncOk.ts | — | — | — | — |
| src/factories/asyncErr.ts | — | — | — | — |
| src/operators/map.ts | — | — | — | — |
| src/operators/mapErr.ts | — | — | 3.3 | — |
| src/operators/mapOr.ts | — | — | — | — |
| src/operators/mapOrElse.ts | — | — | — | — |
| src/operators/bimap.ts | — | — | — | — |
| src/operators/and.ts | — | — | — | — |
| src/operators/andTee.ts | — | — | — | — |
| src/operators/andThrough.ts | — | — | — | — |
| src/operators/or.ts | — | — | — | — |
| src/operators/orTee.ts | — | — | — | — |
| src/operators/orElse.ts | — | — | — | — |
| src/operators/bind.ts | — | — | 3.4 | — |
| src/operators/ap.ts | — | — | — | 2.19 |
| src/operators/contains.ts | — | — | — | — |
| src/operators/exists.ts | — | — | — | — |
| src/operators/expect.ts | — | — | — | — |
| src/operators/expectErr.ts | — | — | — | — |
| src/operators/filterOrElse.ts | — | — | — | — |
| src/operators/flatten.ts | — | — | — | 2.16 |
| src/operators/match.ts | — | — | — | 4.1 |
| src/operators/separate.ts | — | — | — | 5.8 |
| src/operators/swap.ts | — | — | — | — |
| src/operators/tap.ts | — | — | — | — |
| src/operators/tapErr.ts | — | — | — | — |
| src/operators/traverseArray.ts | — | — | — | 2.15 |
| src/operators/unsafeUnwrap.ts | — | — | — | — |
| src/operators/unsafeUnwrapErr.ts | — | — | — | — |
| src/operators/unwrap.ts | — | — | — | — |
| src/operators/unwrapErr.ts | — | — | — | — |
| src/operators/unwrapOr.ts | — | — | — | 4.3 |
| src/operators/unwrapOrElse.ts | — | — | — | — |
| src/operators/orThrow.ts | — | — | — | — |
| src/async/mapAsync.ts | — | — | — | 2.22 |
| src/async/bindAsync.ts | — | — | 3.4 | — |
| src/async/tapAsync.ts | — | — | — | — |
| src/async/tapErrAsync.ts | — | — | — | — |
| src/async/matchAsync.ts | — | — | — | 4.1 |
| src/async/bimapAsync.ts | — | — | — | — |
| src/async/mapErrAsync.ts | — | — | — | — |
| src/async/mapOrAsync.ts | 1.3 | 1.3 | — | — |
| src/async/mapOrElseAsync.ts | — | — | — | — |
| src/async/orElseAsync.ts | — | — | — | — |
| src/async/swapAsync.ts | — | — | — | 2.20 |
| src/async/unwrapOrAsync.ts | 1.1 | — | — | — |
| src/async/unwrapOrElseAsync.ts | 1.2 | — | — | — |
| src/async/asyncBind.ts | — | — | — | 2.21 |
| src/async/asyncBindThrough.ts | — | — | — | — |
| src/async/asyncBindOption.ts | — | — | — | — |
| src/async/asyncMap.ts | — | — | — | — |
| src/async/asyncTap.ts | — | — | — | — |
| src/async/asyncTapErr.ts | — | — | — | — |
| src/async/asyncTapOption.ts | — | — | — | 2.11 |
| src/async/bindAsyncOption.ts | 1.4 | 1.4 | — | — |
| src/async/bindThroughAsync.ts | — | — | — | — |
| src/async/containsAsync.ts | — | — | — | — |
| src/async/containsAsyncOption.ts | — | — | — | — |
| src/async/existsAsync.ts | — | 2.23 | — | — |
| src/async/existsAsyncOption.ts | 1.4 | 1.4 | — | — |
| src/async/filterAsyncOption.ts | 1.4 | 1.4 | — | — |
| src/async/filterOrElseAsync.ts | — | 2.24 | — | — |
| src/async/flattenAsync.ts | — | — | — | 2.17 |
| src/async/flattenAsyncOption.ts | — | — | — | 2.17 |
| src/async/mapAsyncOption.ts | 1.4 | 1.4 | — | — |
| src/async/matchAsyncOption.ts | — | — | — | 4.1 |
| src/async/orElseAsyncOption.ts | 1.4 | 1.4 | — | — |
| src/async/tapAsyncOption.ts | 1.4 | 1.4 | — | 2.11 |
| src/async/unwrapOrAsyncOption.ts | — | — | — | — |
| src/async-result/bind.ts | — | 2.10 | — | — |
| src/async-result/andTee.ts | — | — | — | — |
| src/async-result/andThrough.ts | — | 2.10 | — | — |
| src/async-result/combine.ts | — | — | — | — |
| src/async-result/combineWithAllErrors.ts | — | — | — | — |
| src/async-result/bimap.ts | — | — | — | — |
| src/async-result/contains.ts | — | — | — | — |
| src/async-result/exists.ts | — | — | — | — |
| src/async-result/filterOrElse.ts | — | — | — | — |
| src/async-result/flatten.ts | — | — | — | 2.17 |
| src/async-result/from.ts | — | — | — | — |
| src/async-result/fromPromise.ts | — | — | — | 2.18 |
| src/async-result/fromResult.ts | — | — | — | — |
| src/async-result/map.ts | — | — | — | — |
| src/async-result/mapAsync.ts | — | — | — | 2.22 |
| src/async-result/mapErr.ts | — | — | — | — |
| src/async-result/mapErrAsync.ts | — | — | — | — |
| src/async-result/match.ts | — | — | — | 4.1 |
| src/async-result/orElse.ts | — | 2.10 | — | — |
| src/async-result/orTee.ts | — | — | — | — |
| src/async-result/swap.ts | — | — | — | 2.20 |
| src/async-result/tap.ts | — | — | — | — |
| src/async-result/tapAsync.ts | — | — | — | — |
| src/async-result/tapErr.ts | — | — | — | — |
| src/async-result/tapErrAsync.ts | — | — | — | — |
| src/async-result/unwrapOr.ts | — | — | — | — |
| src/async-option/bind.ts | — | 2.10 | — | — |
| src/async-option/map.ts | — | — | — | — |
| src/async-option/tap.ts | — | — | — | — |
| src/async-option/mapAsync.ts | — | — | — | — |
| src/async-option/tapAsync.ts | — | — | — | — |
| src/async-option/unwrapOr.ts | — | — | — | — |
| src/async-option/match.ts | — | — | — | 4.1 |
| src/async-option/orElse.ts | — | 2.10 | — | — |
| src/async-option/filter.ts | — | — | — | — |
| src/async-option/flatten.ts | — | — | — | 2.17 |
| src/async-option/from.ts | — | — | — | — |
| src/async-option/fromOption.ts | — | — | — | — |
| src/async-option/fromPromise.ts | — | — | — | 2.18 |
| src/async-option/contains.ts | — | — | — | — |
| src/async-option/exists.ts | — | — | — | — |
| src/adapters/fromOption.ts | — | — | — | — |
| src/adapters/toOption.ts | — | — | — | — |
| src/adapters/liftMap.ts | — | — | — | — |
| src/adapters/switchFn.ts | — | — | — | — |
| src/adapters/switchFnAsync.ts | — | — | — | — |
| src/adapters/tee.ts | — | — | — | — |
| src/adapters/teeAsync.ts | — | — | — | — |
| src/combine/combine.ts | — | — | — | — |
| src/combine/combineWithAllErrors.ts | — | — | — | 5.4 |
| src/combine/all.ts | — | — | — | — |
| src/composition/pipe.ts | — | — | — | — |
| src/composition/pipeAsync.ts | — | — | — | — |
| src/composition/composeK.ts | 1.8 | — | — | 2.14, 5.3 |
| src/composition/composeKAsync.ts | 1.8 | — | — | 5.3 |
| src/composition/safeTry.ts | — | — | 3.8, 3.9 | — |
| src/option/ofSome.ts | — | — | — | — |
| src/option/ofNone.ts | — | — | — | — |
| src/option/map.ts | — | — | — | — |
| src/option/bind.ts | — | — | — | — |
| src/option/tap.ts | — | — | — | — |
| src/option/filter.ts | — | — | — | — |
| src/option/flatten.ts | — | — | — | — |
| src/option/match.ts | — | — | — | 4.1 |
| src/option/orElse.ts | — | — | — | — |
| src/option/contains.ts | — | — | — | — |
| src/option/unwrapOr.ts | — | — | — | 4.3 |
| src/option/okOr.ts | — | — | — | — |
| src/option/okOrElse.ts | 1.5 | 1.5 | — | — |
| src/option/transpose.ts | — | — | — | — |
| src/option/zipWith.ts | — | — | — | — |
| src/option/all.ts | — | — | — | — |
| src/primitives/cond.ts | — | — | — | — |
| src/primitives/condErr.ts | 1.6 | — | 1.6, 3.5 | — |
| src/primitives/lift.ts | — | — | 3.6 | — |
| src/primitives/partitionOption.ts | 1.7 | 2.12 | — | 4.8 |
| src/primitives/reduce.ts | — | 2.13 | — | — |
| src/primitives/sequence.ts | — | — | — | 4.7 |
| src/primitives/sequenceAsyncResult.ts | — | — | — | 4.7 |
| src/reliability/retry.ts | 2.5 | 2.5 | 3.2 | 4.9 |
| src/reliability/retryLazy.ts | — | — | — | — |
| src/reliability/timeout.ts | — | 2.6 | — | — |
| src/reliability/timeoutEager.ts | — | 2.7 | — | — |
| src/reliability/allSettled.ts | — | — | — | 5.7 |
| src/reliability/any.ts | 1.10 | 1.10 | — | — |
| src/reliability/race.ts | 1.9, 1.11 | — | — | — |
| src/observability/ctx.ts | 2.1 | 2.1 | — | — |
| src/observability/format.ts | — | 2.8, 2.9 | — | 5.2 |
| src/observability/inspect.ts | — | — | — | — |
| src/observability/observe.ts | 2.4 | 2.3, 2.4 | 3.7 | — |
| src/observability/tapErrContext.ts | — | — | — | — |
| src/observability/withPath.ts | 2.2 | 2.2 | — | — |
| src/types/IResult.ts | — | — | — | 4.6 |
| src/types/IResultOfT.ts | — | — | — | 4.6 |
| src/option/Option.ts (types/) | — | — | — | — |
| src/types/AsyncResult.ts | — | — | — | — |
| src/types/AsyncOption.ts | — | — | — | — |
| src/types/globals.d.ts | — | — | — | — |

---


## 7. Recommended fix priority

### Genuine bugs to fix first

1. **1.1 `unwrapOrAsync` / 1.2 `unwrapOrElseAsync`** — a rejected
   `defaultValue` Promise escapes the operator. Either catch and convert
   to `err(caught)`, or document that rejected defaults propagate.
2. **1.6 `condErr`** — `E` and `F` are unconstrained generics. Drop one or
   add `E extends F`.
3. **1.8 `composeKAsync`** vs `composeK` — sync throws, async rejects.
   Pick one policy.
4. **1.9 `race([])`** — returns `err(undefined)`. Document or replace with
   a sentinel.
5. **1.11 `race` "input order"** — the policy works but is non-obvious;
   add a JSDoc note that index 0 wins on conflict (doc fix, not code).
6. **1.12 / 1A.8 `fromSafePromise`** — non-Error rejections lose identity.
   Either always preserve raw value, or make this opt-in via a flag.

### Documentation gaps to fix

7. **1.3 / 1A.1 `mapOrAsync` mapper-throws policy** — undocumented;
   JSDoc should state "mapper throw -> defaultValue".
8. **1.4 / 1A.3 `*AsyncOption` catch+None** — already documented per
   function; consider adding a one-line summary in the async README.
9. **1.10 `any` order** — doc is silent; tests use `sort()`. Pick input
   order (sort in spec) or completion order (state in spec).
10. **2.5 / 1A.2 `retry` Error stripping** — doc the conversion.

### Concurrency footguns

11. **2.1 `ctx` stack** — document the concurrency limitation explicitly.
12. **2.2 `withPath` outside `ctx.run`** — add a warning comment.
13. **2.3 `installObserver` stack semantics** — clarify in JSDoc.

### Style / polish

14. **3.x** — `as unknown as IResultOfT<...>` is pervasive; introducing a
    `Result<T, E>` branded type could remove most of them.
15. **4.1 `match` object-vs-positional** — pick one convention.
16. **5.x** — performance optimisations are minor and only matter on hot
    paths.

Everything else is polish.
