import type { IResultOfT } from '../types/IResultOfT.js';
import { getPath, type PathStack } from './ctx.js';

/**
 * Like `tapErr`, but the callback receives both the error and the
 * current breadcrumb path snapshot. Use to attach structured context when you log
 * or report a failure.
 *
 * Always returns `Promise<IResultOfT<T, E>>` so a single signature threads
 * through pipelines — no `Promise<IResultOfT<T,E>> | IResultOfT<T,E>` union
 * that forces downstream narrowing. The callback may be sync or async;
 * the return value is awaited before resolving.
 *
 * @example
 * ```ts
 * import { ctx, tapErrContext, withPath } from '@sandlada/result/observability';
 * import { err } from '@sandlada/result/factories';
 *
 * ctx.run(() => {
 *   withPath('fetchUser');
 *   withPath('id:42');
 *   tapErrContext((error, { path }) => {
 *     console.log({ event: 'user.fetch.failed', path, error });
 *   }, err('boom'));
 * });
 * ```
 */
export interface ErrContext {
    readonly path: PathStack;
}

export function tapErrContext<T, E>(
    fn: (error: E, context: ErrContext) => unknown,
): (r: IResultOfT<T, E>) => Promise<IResultOfT<T, E>>;
export function tapErrContext<T, E>(
    fn: (error: E, context: ErrContext) => unknown,
    r: IResultOfT<T, E>,
): Promise<IResultOfT<T, E>>;
/**
 * Fires `fn(error, ctx)` for failures, returning the original result wrapped
 * in a `Promise<IResultOfT<T, E>>`. The callback may be sync or async — its
 * return value (if a Promise) is awaited before the outer Promise resolves.
 */
export function tapErrContext<T, E>(
    fn: (error: E, context: ErrContext) => unknown,
    r?: IResultOfT<T, E>,
): Promise<IResultOfT<T, E>> | ((r: IResultOfT<T, E>) => Promise<IResultOfT<T, E>>) {
    if (r === undefined) {
        return (input: IResultOfT<T, E>): Promise<IResultOfT<T, E>> =>
            tapErrContext(fn, input);
    }
    // Observers never change the pipeline: both a synchronous throw and an
    // asynchronous rejection from `fn` are swallowed, matching `observe`.
    return (async (): Promise<IResultOfT<T, E>> => {
        if (r.isSuccess) return r;
        const path = getPath();
        try {
            const outcome = fn(r.error, { path });
            if (outcome && typeof (outcome as Promise<unknown>).then === 'function') {
                await outcome;
            }
        } catch {
            // Swallowed by design — a misbehaving observer cannot fail the pipeline.
        }
        return r;
    })();
}
