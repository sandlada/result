import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function bimapAsync<A, E, B, F>(
    onOk: (a: A) => B | Promise<B>,
    onErr: (e: E) => F | Promise<F>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, F>>;
export function bimapAsync<A, E, B, F>(
    onOk: (a: A) => B | Promise<B>,
    onErr: (e: E) => F | Promise<F>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, F>>;
/**
 * Maps both success and failure values of a `Promise<IResultOfT<A, E>>` simultaneously.
 *
 * @example
 * ```ts
 * import { bimapAsync, matchAsync } from '@sandlada/result/promise-result';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * const input = Promise.resolve(ok(5));
 * const mapped = bimapAsync(
 *   (x: number) => x.toString(),
 *   (e: string) => e.toUpperCase(),
 *   input,
 * );
 * const okSide = await matchAsync((s) => s, (e) => e, mapped);
 * // okSide === '5'
 *
 * const failed = Promise.resolve(err('boom'));
 * const remapped = await bimapAsync(
 *   (x: number) => x.toString(),
 *   (e: string) => e.toUpperCase(),
 *   failed,
 * );
 * // remapped is Err('BOOM'); bimapAsync transforms the error channel on failure
 * ```
 */
export function bimapAsync<A, E, B, F>(
    onOk: (a: A) => B | Promise<B>,
    onErr: (e: E) => F | Promise<F>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, F>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, F>>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => bimapAsync(onOk, onErr, r);
    return r.then(async inner => {
        try {
            if (inner.isSuccess) {
                return ok(await onOk(inner.value));
            } else {
                return err(await onErr(inner.error));
            }
        } catch (e: unknown) {
            return err(e as unknown as F);
        }
    });
}
