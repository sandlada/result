import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';

export function tap<A, E>(
    fn: (a: A) => Promise<void | unknown>,
): (r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>;
export function tap<A, E>(
    fn: (a: A) => Promise<void | unknown>,
    r: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>>;
/**
 * Side-effect on success for a sync `IResultOfT` using an async callback.
 * Returns the original Result.
 * If the callback throws or returns a rejected Promise, the error is caught
 * and returned as an `Err` result.
 *
 * @example
 * ```ts
 * import { tap } from '@sandlada/result/bridge-result';
 * import { match } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = ok(42);
 * const touched = await tap(async (x: number) => { void x; }, input);
 * const label = match((n) => `still:${n}`, (e) => `err:${String(e)}`, touched);
 * // label === 'still:42'; tap returns the original Ok unchanged
 *
 * const failure = err('skip');
 * const passthrough = await tap(async (x: number) => { void x; }, failure);
 * // passthrough stays Err('skip'); tap short-circuits on failure
 * ```
 */
export function tap<A, E>(
    fn: (a: A) => Promise<void | unknown>,
    r?: IResultOfT<A, E>,
): Promise<IResultOfT<A, E>> | ((r: IResultOfT<A, E>) => Promise<IResultOfT<A, E>>) {
    if (r === undefined) return (r: IResultOfT<A, E>) => tap(fn, r);
    if (!r.isSuccess) return Promise.resolve(r);
    try {
        return fn(r.value).then(
            () => r,
            e => err(e as E),
        );
    } catch (e: unknown) {
        return Promise.resolve(err(e as E));
    }
}
