/**
 * @fileoverview Tags a result with a path segment so downstream
 * {@link tapErrContext} callbacks (or other observers) can include the breadcrumb
 * trail. The returned result is structurally identical to its input — `withPath`
 * is **observability-only** and does not modify `r.value` or `r.error`.
 *
 * The segment is pushed onto the current frame as soon as `withPath(segment)` is
 * called; you do not need to invoke a returned curried function. Combine with
 * `ctx.run(fn)` for lexically scoped paths.
 *
 * @example
 * ```ts
 * import { withPath } from '@sandlada/result/observability';
 * import { pipe } from '@sandlada/result';
 *
 * const r = pipe(getUser(id), withPath('fetchUser'), withPath(`id:${id}`));
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ctx } from './ctx.js';

/**
 * Push `segment` onto the current path frame and return `r` unchanged.
 *
 * - Push happens immediately on call; passing `r` is optional.
 * - Returns `r` when supplied; otherwise returns `void`.
 */
export function withPath(segment: string): void;
export function withPath<T, E>(segment: string, r: IResultOfT<T, E>): IResultOfT<T, E>;
export function withPath<T, E>(segment: string, r?: IResultOfT<T, E>): void | IResultOfT<T, E> {
    ctx.push(segment);
    return r;
}