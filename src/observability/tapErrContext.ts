/**
 * @fileoverview Like `tapErr`, but the callback receives both the error and the
 * current breadcrumb path snapshot. Use to attach structured context when you log
 * or report a failure.
 *
 * @example
 * ```ts
 * import { ctx, tapErrContext, withPath } from '@sandlada/result/observability';
 * import { pipe } from '@sandlada/result';
 *
 * pipe(
 *   getUser(id),
 *   withPath('getUser'),
 *   withPath(`id:${id}`),
 *   tapErrContext((error, { path }) => {
 *     logger.error({ event: 'user.fetch.failed', path, error });
 *   }),
 * );
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { getPath, type PathStack } from './ctx.js';

export interface ErrContext {
    readonly path: PathStack;
}

/**
 * Fires `fn(error, ctx)` for failures, returning the result unchanged. Has no effect
 * on success. The callback **may** be async (returned promise is awaited); if it
 * throws, the error is propagated to the caller (mirroring the project's
 * `tap`-family throw policy documented in `unwrapOrElse`).
 */
export function tapErrContext<T, E>(
    fn: (error: E, context: ErrContext) => unknown,
): (r: IResultOfT<T, E>) => Promise<IResultOfT<T, E>> | IResultOfT<T, E>;
export function tapErrContext<T, E>(
    fn: (error: E, context: ErrContext) => unknown,
    r: IResultOfT<T, E>,
): Promise<IResultOfT<T, E>> | IResultOfT<T, E>;
export function tapErrContext<T, E>(
    fn: (error: E, context: ErrContext) => unknown,
    r?: IResultOfT<T, E>,
):
    | ((r: IResultOfT<T, E>) => Promise<IResultOfT<T, E>> | IResultOfT<T, E>)
    | (Promise<IResultOfT<T, E>> | IResultOfT<T, E>) {
    if (r === undefined) {
        return (input: IResultOfT<T, E>): Promise<IResultOfT<T, E>> | IResultOfT<T, E> =>
            tapErrContext(fn, input);
    }
    if (r.isSuccess) return r;
    const path = getPath();
    const outcome = fn(r.error, { path });
    if (outcome && typeof (outcome as Promise<unknown>).then === 'function') {
        return Promise.resolve(outcome).then(() => r);
    }
    return r;
}