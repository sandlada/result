/**
 * @fileoverview Tags a result with a path segment so downstream
 * {@link tapErrContext} callbacks (or other observers) can include the breadcrumb
 * trail. The returned result is structurally identical to its input — `withPath`
 * is **observability-only** and does not modify `r.value` or `r.error`.
 *
 * @example
 * ```ts
 * import { withPath } from '@sandlada/result/observability';
 * import { pipe } from '@sandlada/result';
 *
 * const r = pipe(getUser(id), withPath('fetchUser'), withPath('validation'));
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ctx } from './ctx.js';

/**
 * Returns a new function that pushes `segment` onto the current path stack, passes
 * the result through, and pops the segment after. Behaviour:
 *
 * - The push happens **on the synchronous thread** of `withPath(segment)(r)`. When
 *   composing with `pipe`, push/pop are properly nested and always balanced.
 * - `withPath` does NOT swallow exceptions — if a later operator throws and the
 *   surrounding `ctx.run` is missing, the path segment is silently lost (the
 *   module-level stack will eventually contain only `[]`, which is fine).
 */
export function withPath<T, E>(segment: string): (r: IResultOfT<T, E>) => IResultOfT<T, E>;
export function withPath<T, E>(segment: string, r: IResultOfT<T, E>): IResultOfT<T, E>;
export function withPath<T, E>(
    segment: string,
    r?: IResultOfT<T, E>,
): IResultOfT<T, E> | ((r: IResultOfT<T, E>) => IResultOfT<T, E>) {
    if (r === undefined) {
        return (input: IResultOfT<T, E>): IResultOfT<T, E> => withPath(segment, input);
    }
    ctx.push(segment);
    return r;
}