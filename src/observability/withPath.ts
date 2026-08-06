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
 * The curried form (`withPath(segment)` returning a unary function) lets the
 * operator slot directly into `pipe` without an arrow wrapper, matching the
 * shape of `tap`, `map`, `bind`, etc.
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
 * // Direct form
 * const r = withPath('fetchUser', getUser(id));
 *
 * // Curried form — slots directly into `pipe`
 * const r = pipe(getUser(id), withPath('fetchUser'), withPath(`id:${id}`));
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ctx, type PathSegment } from './ctx.js';

/**
 * Push `segment` onto the current path frame and return a curried operator.
 * Use this form when you want `withPath(segment)` to slot into `pipe`
 * directly, mirroring `tap(segment)` / `map(segment)`.
 */
export function withPath(segment: PathSegment): <T, E>(r: IResultOfT<T, E>) => IResultOfT<T, E>;

/**
 * Direct form — push `segment` and return `r` unchanged.
 */
export function withPath<T, E>(segment: PathSegment, r: IResultOfT<T, E>): IResultOfT<T, E>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
export function withPath(segment: PathSegment, r?: IResultOfT<unknown, unknown>): unknown {
    ctx.push(segment);
    if (r === undefined) {
        return <T, E>(next: IResultOfT<T, E>): IResultOfT<T, E> => next;
    }
    return r;
}