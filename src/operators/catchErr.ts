/**
 * @fileoverview Converts a failure into a success value, maintaining the Result track.
 *
 * The recovery handler's return type (`B`) is **independent** of the input's value type
 * (`A`), so the fallback can be a structurally different shape (a default-object, a
 * sentinel, a value derived from the error, …). The result widens to
 * `IResultOfT<A | B, never>` because the recovered branch can produce either shape —
 * control-flow at the use site narrows `r.isSuccess` to `A` on the original track and
 * `r.value` to `A | B` overall (with `B` reachable only through the recovery path).
 *
 * This is the canonical "catch error → produce a different shape" recovery. Compare
 * with `orElse`, which requires the callback to return a new `IResultOfT`; `catchErr`
 * simplifies that case by lifting `onErr(e)` straight into `Ok(...)` for you.
 *
 * **Generic structure**: the curried return uses a *fresh* `<A>` generic on the inner
 * function rather than pulling `A` from the outer signature. This guarantees the
 * input's value type is re-inferred at every application site, so
 * `catchErr(handler)(IResultOfT<Config, string>)` and
 * `catchErr(handler)(IResultOfT<number, string>)` both typecheck and produce
 * `IResultOfT<Config | B, never>` and `IResultOfT<number | B, never>` respectively.
 *
 * @example
 * ```ts
 * import { catchErr, ok, err } from '@sandlada/result';
 *
 * catchErr((e: string) => 0)(err('boom')); // Ok(0)
 * catchErr((e: string) => 0)(ok(42));     // Ok(42) — pass-through on success
 *
 * // Cross-shape default — `A = Config`, `B = { kind: 'Default' }`,
 * // result widens to `IResultOfT<Config | { kind: 'Default' }, never>`
 * catchErr((e: string) => ({ kind: 'Default', reason: e }))(configResult);
 *
 * // Direct form
 * catchErr((e: string) => ({ kind: 'Default' }), err('boom'));
 * // → Ok({ kind: 'Default' })
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

/**
 * Curried form. The inner `<A>` is **deferred** so the input's value type is
 * re-inferred at every application site — `catchErr(handler)(IResultOfT<A, E>)` widens
 * `A | B` per call instead of locking `A` at the currying boundary.
 */
export function catchErr<B, E>(
    onErr: (e: E) => B,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A | B, never>;

/**
 * Direct form. `A` is inferred from the supplied result; the recovery widens to
 * `A | B`. The error track collapses to `never` because the recovery always succeeds.
 */
export function catchErr<A, B, E>(
    onErr: (e: E) => B,
    r: IResultOfT<A, E>,
): IResultOfT<A | B, never>;

// Implementation signature — fully typed against the public overloads. Using `unknown`
// here breaks TS7's "overload signature must be compatible with the implementation
// signature" check (the curried overload's inner `<A>` doesn't share a name with the
// impl's lost generics). The runtime behaviour is unchanged from the locked-A version:
// an Err is replaced by `Ok(onErr(error))`.
export function catchErr<A, B, E>(
    onErr: (e: E) => B,
    r?: IResultOfT<A, E>,
): IResultOfT<A | B, never> | (<A2>(r: IResultOfT<A2, E>) => IResultOfT<A2 | B, never>) {
    if (r === undefined) {
        return <A2>(rr: IResultOfT<A2, E>): IResultOfT<A2 | B, never> => {
            if (rr.isSuccess) return rr as unknown as IResultOfT<A2 | B, never>;
            return ok(onErr(rr.error)) as unknown as IResultOfT<A2 | B, never>;
        };
    }
    if (r.isSuccess) return r as unknown as IResultOfT<A | B, never>;
    return ok(onErr(r.error)) as unknown as IResultOfT<A | B, never>;
}
