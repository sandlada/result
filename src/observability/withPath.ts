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
 * **Out-of-scope behavior**: calling `withPath(segment)` outside of any active
 * `ctx.run(fn)` scope is a **silent no-op** — the segment is discarded and
 * `getPath()` remains empty. There is no process-global path stack to leak
 * into; standalone calls simply have no observable effect. Wrap standalone
 * calls in `ctx.run` when you actually want the segment recorded.
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
import { ctx, type PathSegment } from './ctx.js';

/**
 * Push `segment` onto the current path frame and return `r` unchanged.
 *
 * - Push happens immediately on call; passing `r` is optional.
 * - Returns `r` when supplied; otherwise returns `void`.
 */
export function withPath(segment: PathSegment): void;
export function withPath<T, E>(segment: PathSegment, r: IResultOfT<T, E>): IResultOfT<T, E>;
export function withPath<T, E>(segment: PathSegment, r?: IResultOfT<T, E>): void | IResultOfT<T, E> {
    ctx.push(segment);
    return r;
}