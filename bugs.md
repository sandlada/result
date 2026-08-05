# Bugs — `@sandlada/result`

> Logged code-logic bugs found by scanning every module's API. Type-only issues
> and "implicit type errors / type spoofing" are out of scope per the task brief;
> only behavioral defects are recorded here.

## Index

| # | Module | File | Summary |
| - | ------ | ---- | ------- |
| 1 | `reliability` | [`src/reliability/retry.ts`](#1-reliabilityretryts--pre-aborted-signal-returns-undefined) | Pre-aborted signal (or `times: -1` / `NaN`) leaves `lastResult` unset, function returns `undefined` cast as `IResultOfT`. |
| 2 | `promise-option` | [`src/promise-option/asyncMapOption.ts`](#2-promise-optionasyncmapoptionts--sync-throw-from-mapper-escapes-the-promise) | A synchronous throw from `f(o.value)` escapes as a sync throw instead of being delivered as `Promise<None>`, inconsistent with sibling `asyncBindOption` / `asyncTapOption` / `asyncMap`. |

---

## 1. `reliability/retry.ts` — pre-aborted signal returns `undefined`

**File**: `src/reliability/retry.ts`
**Line**: 137 (return statement); root cause at 126–128 (loop guard fires before any `safeInvoke`).

### Symptom

```ts
return lastResult as unknown as IResultOfT<T, E>;
```

When the for-loop body never executes, `lastResult` is `undefined`. The `as unknown as IResultOfT<T, E>` is a TypeScript-only fiction; at runtime the function resolves to the bare `undefined` value, breaking the `Promise<IResultOfT<T, E>>` contract.

### Triggering inputs

- `signal` is already aborted when `retry()` is called (e.g. `controller.abort()` then `await retry(fn, { signal: controller.signal })`).
- `times: -1` (or any negative integer) — the loop condition `attempt <= times` is immediately false.
- `times: NaN` — `<= NaN` is false, the loop body never runs.

In all three cases the test `'does not invoke fn when signal is already aborted'` (line 120 of `retry.spec.ts`) only asserts the user function was not called; it never inspects the resolved value, so the bug is invisible to the existing suite.

### Concrete failure

```ts
const controller = new AbortController();
controller.abort();
const r = await retry(() => ok(1), { signal: controller.signal });
r.isSuccess; // TypeError: Cannot read properties of undefined (reading 'isSuccess')
```

### Expected

The function should return `Err(<some 'aborted' / 'no attempts' sentinel>)` so the caller can `match` / `mapErr` on a real `IResultOfT`.

---

## 2. `promise-option/asyncMapOption.ts` — sync throw from mapper escapes the Promise

**File**: `src/promise-option/asyncMapOption.ts`
**Line**: 30 (`return f(o.value).then(v => ofSome(v));` — `f` is invoked directly with no outer try/catch).

### Symptom

```ts
return f(o.value).then(v => ofSome(v));
```

If `f(o.value)` throws synchronously (rather than returning a rejected Promise), the exception propagates *out of* `asyncMapOption` as a sync throw, never reaching a `.catch()` handler downstream. The sibling helpers in the same module do not have this defect.

### Sibling helpers — they DO catch

For comparison (verified):

- `src/promise-option/asyncBindOption.ts:35-42` — wraps `fn(opt.value)` in `try { ... } catch { return Promise.resolve(ofNone<U>()); }`.
- `src/promise-option/asyncTapOption.ts:33-39` — same wrapping pattern, also converts both sync throw and Promise rejection to `None`.
- `src/promise-result/asyncMap.ts:41-48` — same wrapping pattern, converts sync throw to `Promise.resolve(err(e as unknown as E))`.

`asyncMapOption.ts` is the only one of the four "lift sync → async" helpers that omits the try/catch.

### Triggering input

```ts
import { asyncMapOption, ofSome } from '@sandlada/result/promise-option';
const r = await asyncMapOption(<T>(x: T) => { throw new Error('boom'); }, ofSome(1));
// Sync throw escapes at the call site; `await` is never reached, so `.catch` /
// try/catch around the await will not catch it.
```

### Expected

The function should wrap `f(o.value)` in `try { ... } catch { return Promise.resolve(ofNone<B>()); }` so a sync throw is converted to a `None` Promise, matching its siblings.

---

## Modules scanned with no logic bugs found

The following modules were scanned in full and contain no logic bugs at the
runtime-behavior level:

- `adapters/` — `fromOption`, `liftMap`, `switchFn`, `switchFnAsync`, `tee`, `teeAsync`, `toOption`
- `async-option/` — `all`, `bind`, `contains`, `exists`, `filter`, `flatten`, `from`, `fromOption`, `fromPromise`, `isNone`, `isSome`, `map`, `mapAsync`, `mapOr`, `mapOrElse`, `match`, `ofNone`, `ofSome`, `okOr`, `okOrElse`, `orElse`, `tap`, `tapAsync`, `transpose`, `unwrap`, `unwrapOr`, `unwrapOrElse`, `zipWith`
- `async-result/` — `and`, `andTee`, `andThrough`, `ap`, `bimap`, `bind`, `catchErr`, `combine`, `combineWithAllErrors`, `contains`, `containsErr`, `exists`, `expect`, `expectErr`, `filterOrElse`, `flatten`, `from`, `fromPromise`, `fromResult`, `isErr`, `isOk`, `map`, `mapAsync`, `mapErr`, `mapErrAsync`, `mapOr`, `mapOrElse`, `match`, `or`, `orElse`, `orTee`, `swapAsync`, `tap`, `tapAsync`, `tapErr`, `tapErrAsync`, `unwrap`, `unwrapErr`, `unwrapOr`, `unwrapOrElse`
- `combine/` — `all`, `combine`, `combineWithAllErrors`
- `composition/` — `composeK`, `composeKAsync`, `pipe`, `pipeAsync`, `safeTry`, `safeTryAsync`
- `factories/` — `asyncErr`, `asyncOk`, `err`, `fromPredicate`, `fromPromise`, `fromSafePromise`, `fromThrowable`, `ok`, `tryCatch`, `tryCatchAsync`
- `observability/` — `ctx`, `format`, `inspect`, `observe`, `tapErrContext`, `withPath`, `installObserver`
- `operators/` — `and`, `andTee`, `andThrough`, `ap`, `bimap`, `bind`, `catchErr`, `choose`, `contains`, `exists`, `expect`, `expectErr`, `filterOrElse`, `flatten`, `map`, `mapErr`, `mapOr`, `mapOrElse`, `match`, `or`, `orElse`, `orTee`, `orThrow`, `separate`, `swap`, `tap`, `tapErr`, `traverseArray`, `unsafeUnwrap`, `unsafeUnwrapErr`, `unwrap`, `unwrapErr`, `unwrapOr`, `unwrapOrElse`, `unzip`
- `option/` — `all`, `bind`, `contains`, `filter`, `flatten`, `map`, `match`, `ofNone`, `ofSome`, `okOr`, `okOrElse`, `orElse`, `tap`, `transpose`, `traverseArray`, `unwrapOr`, `zipWith`
- `primitives/` — `cond`, `condErr`, `lift`, `partitionOption`, `reduce`, `sequence`, `sequenceAsyncResult`
- `promise-result/` — `ap`, `asyncBind`, `asyncBindThrough`, `asyncMap`, `asyncMatch`, `asyncOrElse`, `asyncTap`, `asyncTapErr`, `bimapAsync`, `bindAsync`, `bindThroughAsync`, `catchErrAsync`, `combine`, `combineWithAllErrors`, `containsAsync`, `existsAsync`, `filterOrElseAsync`, `flatten`, `flattenAsync`, `map`, `mapAsync`, `mapErr`, `mapErrAsync`, `mapOrAsync`, `mapOrElseAsync`, `matchAsync`, `orElseAsync`, `swapAsync`, `tapAsync`, `tapErrAsync`, `unwrapOr`, `unwrapOrAsync`, `unwrapOrElse`, `unwrapOrElseAsync`
- `promise-option/` — `asyncBindOption`, `asyncMapOption` ⚠ (see Bug 2), `asyncMatchOption`, `asyncOrElseOption`, `asyncTapOption`, `bindAsyncOption`, `containsAsyncOption`, `existsAsyncOption`, `filterAsyncOption`, `flattenAsyncOption`, `mapAsyncOption`, `mapOrAsyncOption`, `mapOrElseAsyncOption`, `matchAsyncOption`, `orElseAsyncOption`, `tapAsyncOption`, `tapErrAsyncOption`, `unwrapOrAsyncOption`, `unwrapOrElseAsyncOption`
- `reliability/` — `allSettled`, `any`, `race`, `retryLazy`, `timeout`, `timeoutEager` (besides `retry` — see Bug 1)
- `types/` — `asyncCarrier`, `AsyncOption`, `AsyncResult`, `IResult`, `IResultOfT`, `Option`

---

## Solutions

### Decision summary

| Bug | 🌟 Selected | ✅ Best expectation-fit | 🧰 Most maintainable | 📖 Most readable |
| --- | --- | --- | --- | --- |
| 1 — `retry.ts` returns `undefined` | **Approach 1A** | **Approach 1A** | Approach 1B *(breaks never-reject contract)* | Approach 1D |
| 2 — `asyncMapOption` sync throw escapes | **Approach 2A** | **Approach 2A** | Approach 2B | Approach 2B |

Two design poles shape every fix in this file:

- **Never-reject** is the contract this library promises (`Promise<IResultOfT<T, E>>` only resolves to a Result; it never rejects). `timeout.ts` is the precedent: timeout failure is delivered as `Err({ kind: 'Timeout', ms })`, widening the error type to `E | TOE`.
- **Inside-Result control flow**. Side-effecting errors (mapper rejection, mapper throw) inside lift helpers must conform to the chosen handler. The "lift" family in `promise-option/` is documented to *propagate* rejections; the broader `async-option/` lazy carrier *catches* them — see `async-option/mapAsync.ts:36-40`. Each Bug below has a strategy that respects the existing line of the respective family.

### Legend

- 🌟 **Selected** — the approach the rest of the doc treats as the recommended ship.
- ✅ **Best expectation-fit** — closest to the library's documented contract, sibling precedent, and pinned spec tests.
- 🧰 **Most maintainable** — easiest for future contributors to keep correct over time; fewest invariants.
- 📖 **Most readable** — quickest to grasp when a newcomer opens the patched file.

### Bug 1 — `reliability/retry.ts` (pre-aborted signal returns `undefined`)

Three concrete approaches. All are valid; the choice depends on how strict you want the "never reject" contract to be and how aggressive a type change you're willing to ship.

#### Approach 1A — sentinel `Err` with widened error type *(Recommended)*

> **Badges**: 🌟 Selected · ✅ Best expectation-fit
>
> *Why it wins expectation-fit*: it mirrors `src/reliability/timeout.ts:38-43` (`{ kind: 'Timeout', ms }`) and preserves the "the returned promise never rejects" wording in `src/reliability/retry.ts:114-115`. Callers branch on `error.kind === 'Aborted'`, the same way they branch on `error.kind === 'Timeout'` today.

Mirror `timeout.ts`. Pre-check the abort / loop conditions once at function entry. If any are bad, return `Err` with a `{ kind: 'Aborted', reason }` shape (mirrors `{ kind: 'Timeout', ms }`), widening the return type to `IResultOfT<T, E | AbortedReason>`. The AsyncResult "never rejects" promise stays intact.

```ts
// new exports alongside RetryOptions
export interface AbortedReason {
    readonly kind: 'Aborted';
    readonly reason: unknown;
    readonly times?: number;            // included when times <= -1 || NaN
}

const defaultAborted = (reason: unknown, times?: number): AbortedReason =>
    Object.freeze({ kind: 'Aborted' as const, reason, times });

export interface RetryOptions<E = unknown> {
    /**...existing fields... */
    /** Optional factory invoked when the retry loop exits without ever calling `fn`
     *  (pre-aborted signal or non-positive/NaN `times`). Defaults to the `{ kind: 'Aborted' }`
     *  sentinel. The factory's return value becomes the `error` of the returned `Err`. */
    readonly onAborted?: (reason: unknown, times: number) => unknown;
}

export async function retry<T, E>(
    fn: () => IResultOfT<T, E> | Promise<IResultOfT<T, E>>,
    options: RetryOptions<E> = {},
): Promise<IResultOfT<T, E | AbortedReason>> {        // <-- E widened
    const times = options.times ?? 3;
    if (!Number.isFinite(times) || times < 0 || options.signal?.aborted) {
        const reason = options.signal?.reason;
        const e = options.onAborted?.(reason, times) ?? defaultAborted(reason, times);
        return err(e as unknown as E | AbortedReason) as unknown as IResultOfT<T, E | AbortedReason>;
    }
    // ...existing loop with `lastResult` already proven non-undefined after at least one iteration...
}
```

**Pros**: Sibling of `timeout.ts`. Promise still never rejects. Sentinels are user-discriminable (`error.kind === 'Aborted'`), so callers can branch.
**Cons**: Widens the return type — a controlled breaking change. Document in `SPEC.md` and bump the major version.

#### Approach 1B — call `signal.throwIfAborted()` (matches `p-retry`/`p-timeout`)

> **Badges**: 🧰 Most maintainable
>
> *Caveat*: disqualified as 🌟 / ✅ because it breaks the "never rejects" contract quoted at `src/reliability/retry.ts:114-115`. Listed here because adopting the same idiom as `p-retry` / `p-timeout` / MDN's `AbortSignal` is the most future-proof choice — worth considering for `retryOrThrow` (Approach 1D) instead of dropping it entirely.

Throw inside the loop at the same points the loop checks `signal?.aborted`. The promise rejects with `signal.reason` (typically a `DOMException` of `AbortError`). This matches what `p-retry` does at multiple loop points (entry, before/after `input()`, inside `onAttemptFailure`); see [`sindresorhus/p-retry@main/index.js`](https://github.com/sindresorhus/p-retry/blob/main/index.js).

```ts
if (options.signal?.aborted) {
    options.signal.throwIfAborted();           // throws → Promise rejects
}
// ...
for (let attempt = 0; attempt <= times; attempt++) {
    if (options.signal?.aborted) options.signal.throwIfAborted();
    lastResult = await safeInvoke(fn);
    // ...same guard before delay...
}
```

**Pros**: Outside-ecosystem standard. Expressive abort info via `signal.reason`. No `E` widening.
**Cons**: **Breaks this library's documented contract**:
> Synchronous throws AND promise rejections from `fn` are both converted to `Err` so the returned promise never rejects — matching the AsyncResult contract used elsewhere in the library.
(`src/reliability/retry.ts:114-115`)
Discard this for `retry`, but keep it in mind for the eager/lazy split — see Approach 1D.

#### Approach 1C — guard the post-loop cast

> *No dimension badge*: smallest patch but dishonest (`err('no attempts') as unknown as IResultOfT<T, E>`); collapses back to 1A once you reject the wrong-typed sentinel. Listed for completeness, not recommended.

Tiny, surgical, contract-preserving. Keep `retry`'s signature and the loop unchanged, but make `lastResult` provably assigned before the final `return`. Initialize it with a sentinel `Err` so the loop never exits with `lastResult === undefined`.

```ts
let lastResult: IResultOfT<T, E> = err('no attempts') as unknown as IResultOfT<T, E>;   // <-- default
for (let attempt = 0; attempt <= times; attempt++) {
    if (options.signal?.aborted) break;
    lastResult = await safeInvoke(fn);
    if (lastResult.isSuccess) return lastResult;
    // ...
}
return lastResult;      // always a real Result now
```

**Pros**: Smallest possible patch. No type change. No doc churn.
**Cons**: The sentinel `'no attempts'` is a *string* typed as `E`, which is bad — `E` is user-defined and may not be `string`. To make it correct, you'd need to *pre-validate* the call and throw / `Err` early, which collapses back into Approach 1A. The simpler "assign before loop" version is dishonest and erodes the "well-typed `E`" contract.

#### Approach 1D — split retry into `retry` (never rejects) + `retryOrThrow` (rejects on abort)

> **Badges**: 📖 Most readable
>
> *Why it wins readability*: each function has a one-sentence contract by name; the body of each is ~5 lines. Pair this with 1A (the selected 🌟) for the canonical ship and add `retryOrThrow` as an opt-in escape hatch for callers who want stdlib semantics.

Match the AsyncResult contract for `retry`, and add a sibling `retryOrThrow` that throws on pre-aborted / no-attempt. Document the split, mirror `fromPromise` vs `fromSafePromise`.

```ts
export async function retryOrThrow<T, E>(fn: ..., options: RetryOptions<E> = {}): Promise<IResultOfT<T, E>> {
    options.signal?.throwIfAborted();
    if (!Number.isFinite(options.times ?? 3) || (options.times ?? 3) < 0) {
        throw new Error('retry: times must be a non-negative integer');
    }
    return retry(fn, options);
}
```

**Pros**: Both contracts available. Forward-compatible with Approach 1B for users who want stdlib semantics.
**Cons**: Larger surface area. Two functions to maintain.

#### Precedent summary — Bug 1

| Library | Mechanism | Path of info |
| --- | --- | --- |
| [`p-retry`](https://github.com/sindresorhus/p-retry) (Sindre Sorhus) | `options.signal?.throwIfAborted()` at multiple loop points | Promise rejects with `signal.reason` (AbortError). |
| [`p-timeout`](https://github.com/sindresorhus/p-timeout) (Sindre Sorhus) | `signal.throwIfAborted()` early; AbortError via rejection | Promise rejects. |
| `timeout.ts` (this library) | `Err({ kind: 'Timeout', ms })` returned from the resolved Promise | Never rejects; `E` widened to `E \| TOE`. |
| MDN `AbortSignal` | `signal.throwIfAborted()` is the canonical explicit throw point. | Throws. |

**Recommendation for Bug 1**: ship Approach 1A as the primary fix (matches in-house precedent, preserves the never-reject contract, allows callers to discriminate). Consider pairing it with Approach 1D so users who want stdlib semantics can opt into them. Avoid 1B alone; it silently breaks the documented promise.

---

### Bug 2 — `promise-option/asyncMapOption.ts` (sync throw escapes the Promise)

Three concrete approaches. The choice hinges on a single design question: should `asyncMapOption` *propagate* mapper rejections (the existing documented contract — see `asyncMapOption.spec.ts:31-39`) or *catch* them (the contract of its `promise-option/` siblings and the `async-option/` lazy carrier)?

#### Approach 2A — catch sync only; preserve async propagation *(Recommended, surgical)*

> **Badges**: 🌟 Selected · ✅ Best expectation-fit
>
> *Why it wins expectation-fit*: the existing `asyncMapOption.spec.ts:31-39` test — *`'propagates async mapper rejection verbatim (no catch in the lift family)'`* — is the library's pinned contract. The bug is that **sync throws** escape accidentally; 2A closes only the accidental escape and lets the pinned test continue to pass.

Wrap `f(o.value)` in try/catch so a synchronous throw becomes `ofNone()`, but leave the `.then(success, …)` handler untouched so a rejected mapper Promise still propagates. Respects the existing spec test that locks in "no catch" for async rejection.

```ts
export function asyncMapOption<A, B>(
    f: (a: A) => Promise<B>,
    o?: IOption<A>,
): Promise<IOption<B>> | ((o: IOption<A>) => Promise<IOption<B>>) {
    if (o === undefined) return (o: IOption<A>) => asyncMapOption(f, o);
    if (o.isNone) return Promise.resolve(ofNone());
    let inner: Promise<B>;
    try {
        inner = f(o.value);             // catches sync throw
    } catch {
        return Promise.resolve(ofNone<B>());
    }
    return inner.then(v => ofSome(v));  // async rejection propagates by design
}
```

**Pros**: Smallest patch. Existing spec test (`'propagates async mapper rejection verbatim (no catch in the lift family)'`) keeps passing. Fixes the actual bug (sync throw was an accidental escape, not an intentional "no catch"). Matches the spec note that distinguishes `asyncMapOption` from `mapAsyncOption` ("Distinct from the Result-flavored mapAsyncOption, which catches.").
**Cons**: None significant. The "no catch on async" stance is now an active, documented policy rather than an accident.

#### Approach 2B — full catch (match all `promise-option/` siblings and `async-option/mapAsync`)

> **Badges**: 🧰 Most maintainable · 📖 Most readable
>
> *Why it wins maintainability & readability*: it uses the *exact* `try { return f(o.value).then(success, failure); } catch { … }` shape that all three siblings (`asyncBindOption`/`asyncTapOption`/`asyncMap`) already use — so the file becomes consistent and any future contributor sees the same idiom everywhere.
>
> *Caveat*: changes the contract that `asyncMapOption.spec.ts:31-39` locks in. If you adopt 2B, flip that test in the same PR (`await expect(...).resolves.toEqual(ofNone())`) and update the docblock that says "Distinct from the Result-flavored mapAsyncOption, which catches." — that's a deliberate family-wide policy change, not a bug fix.

Convert to the wrapped pattern of `asyncBindOption` / `asyncTapOption` / `asyncTapOption` / `asyncMap` / `async-option/mapAsync`:

```ts
try {
    return f(o.value).then(
        v => ofSome(v),
        () => ofNone<B>(),         // also converts async rejection → ofNone
    );
} catch {
    return Promise.resolve(ofNone<B>());
}
```

**Pros**: Mirrors `tryCatch` semantics from `fp-ts` ([`TaskEither.tryCatch`](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html)) where `await f()` inside `try` catches both sync throws and async rejections in one block. Removes a footgun; closes the only asymmetric gap in the lift family.
**Cons**: Changes the existing `'propagates async mapper rejection verbatim'` test result. The spec *itself* documents that this family "does NOT catch"; closing it contradicts that document. Either flip the spec or pick Approach 2A.

#### Approach 2C — declarative help via the existing `factories/tryCatch` / `fromThrowable`

> *No dimension badge*: shares 2B's contract change and adds an extra indirection layer that the rest of the codebase doesn't route through. Listed only to be exhaustive.

```ts
import { tryCatch } from '../factories/tryCatch.js';

return tryCatch(() => f(o.value), () => ofNone<B>() as unknown as Promise<IOption<B>>);
```

**Pros**: All throw policy lives in `factories/tryCatch`. One uniform pattern across the library.
**Cons**: Same "catches async too" question as 2B. Wires `asyncMapOption` into a layer that's currently used only at sync-shape boundaries. Likely overkill for a single helper.

#### Precedent summary — Bug 2

| Library | Mechanism | Sync throw | Async rejection |
| --- | --- | --- | --- |
| [`fp-ts` `TaskEither.tryCatch`](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html) | `try { return await f().then(_.right) } catch (reason) { return _.left(onRejected(reason)) }` | caught | caught |
| `sanctuary` `S.try` | `try { return f() } catch { return fallback() }` (sync only) | caught | not applicable |
| `ramda` `tryCatch` | wraps a throwing thunk, returns a Maybe | caught | not applicable |
| `neverthrow` `map` | unwraps-then-runs; mapper throw surfaces as `Err(mapperException)` if the result is a plain function | caught at the boundary | caught |
| `async-option/mapAsync` (this library) | `try { return ofSome(await fn(opt.value)); } catch { return ofNone(); }` | caught | caught |
| `promise-option/asyncBindOption` (this lib) | same pattern | caught | caught |
| `promise-option/asyncMapOption` (current) | `f(o.value).then(v => ofSome(v))` — *no* try/catch | **escapes** | propagates (by spec) |

**Recommendation for Bug 2**: ship Approach 2A as the surgical fix; it closes the bug without touching the existing "propagate async rejection" spec test. Decide whether to also adopt 2B as a follow-up that aligns the four `promise-option/` lift helpers (`asyncBindOption` / `asyncTapOption` / `asyncMatchOption` / `asyncMapOption`) on a single throw policy — that is a separate design conversation worth having, not a stealth part of this bug fix.

---

## Suggested test additions

Append these alongside the existing suites. They pin the corrected behavior at the contract level so neither bug regresses.

```ts
// retry.spec.ts (Bug 1 — never returns undefined)
it('returns Err({ kind: "Aborted" }) when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const r = await retry(() => ok(1), { signal: controller.signal });
    expect(r.isFailure).toBe(true);
    if (r.isFailure) expect((r.error as { kind: string }).kind).toBe('Aborted');
});

it('returns Err({ kind: "Aborted" }) for negative times', async () => {
    const r = await retry(() => ok(1), { times: -1 });
    expect(r.isFailure).toBe(true);
});

it('returns Err({ kind: "Aborted" }) for NaN times', async () => {
    const r = await retry(() => ok(1), { times: NaN });
    expect(r.isFailure).toBe(true);
});

it('honors a custom onAborted factory', async () => {
    const r = await retry(() => ok(1), { times: -1, onAborted: () => 'no-attempts' });
    if (r.isFailure) expect(r.error).toBe('no-attempts');
});

// asyncMapOption.spec.ts (Bug 2 — sync throw → None; async rejection still propagates)
it('converts a synchronous mapper throw to None', async () => {
    const o = await asyncMapOption(<T>(_x: T) => { throw new Error('sync-boom'); }, ofSome(1));
    expect(o.isNone).toBe(true);
});

it('still propagates async mapper rejection unchanged', async () => {
    await expect(
        asyncMapOption(async () => { throw new Error('async-boom'); }, ofSome(1)),
    ).rejects.toThrow('async-boom');
});
```
