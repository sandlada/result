import type { IResultOfT } from '../types/IResultOfT.js';

export interface MatchHandlers<A, E, C> {
    readonly ok: (a: A) => C;
    readonly err: (e: E) => C;
}

// Positional form (back-compatible)
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
): (r: IResultOfT<A, E>) => C;
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
    r: IResultOfT<A, E>,
): C;
// Object form (preferred — matches async-result/match convention)
export function match<A, E, C>(
    handlers: MatchHandlers<A, E, C>,
): (r: IResultOfT<A, E>) => C;
export function match<A, E, C>(
    handlers: MatchHandlers<A, E, C>,
    r: IResultOfT<A, E>,
): C;
/**
 * Terminal handler — pattern-matches on both success and failure
 * cases. Supports both positional `(onOk, onErr, r?)` and object
 * `({ ok, err }, r?)` handler shapes, matching the convention used by
 * `match` in `@sandlada/result/async-result`. Prefer the object form for
 * consistency across the library.
 *
 * F# equivalent: `function Ok v → onOk v | Error e → onErr e`
 *
 * @example
 * ```ts
 * import { match, map } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const success = ok(42);
 * const mapped = map((n: number) => n + 1, success);
 * const fromObject = match(
 *     { ok: (v) => `success: ${v}`, err: (e) => `failure: ${String(e)}` },
 *     mapped,
 * );
 * // fromObject === 'success: 43'
 *
 * const failure = err('no');
 * const fromPositional = match((v) => `ok:${v}`, (e) => `err:${String(e)}`, failure);
 * // fromPositional === 'err:no'
 * ```
 */
export function match<A, E, C>(
    onOkOrHandlers: ((a: A) => C) | MatchHandlers<A, E, C>,
    onErrOrR?: ((e: E) => C) | IResultOfT<A, E>,
    r?: IResultOfT<A, E>,
): C | ((r: IResultOfT<A, E>) => C) {
    // Object form detection: first arg must be an object that is not a function.
    if (typeof onOkOrHandlers === 'function') {
        // Positional form
        const onOk = onOkOrHandlers as (a: A) => C;
        const onErr = onErrOrR as (e: E) => C;
        if (r === undefined) {
            return (rr: IResultOfT<A, E>): C => match(onOk, onErr, rr);
        }
        return r.isSuccess ? onOk(r.value) : onErr(r.error);
    }
    // Object form
    const handlers = onOkOrHandlers;
    const direct = onErrOrR;
    if (direct === undefined) {
        return (rr: IResultOfT<A, E>): C => match(handlers, rr);
    }
    const target = direct as unknown as IResultOfT<A, E>;
    return target.isSuccess ? handlers.ok(target.value) : handlers.err(target.error);
}
