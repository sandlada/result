import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

/**
 * Wraps an async function, catching rejections as failures.
 *
 * @example
 * ```ts
 * import { tryCatchAsync } from '@sandlada/result/factories';
 * const r = await tryCatchAsync(
 *   () => fetch('/api/data'),
 *   e => new Error(String(e)),
 * );
 * // r = Ok(Response) or Err(Error)
 * ```
 */
export async function tryCatchAsync<T, E = unknown>(
    fn: () => Promise<T>,
    errorFn?: (error: unknown) => E,
): Promise<IResultOfT<T, E>> {
    try { return ok<T>(await fn()) as unknown as IResultOfT<T, E>; }
    catch(e: unknown) {
        // Wrap `errorFn(e)` so a buggy mapper does not escape the
        // try/catch and reject the outer Promise.
        let innerError: E;
        if (errorFn) {
            try { innerError = errorFn(e); }
            catch (thrown: unknown) { innerError = thrown as unknown as E; }
        } else {
            innerError = e as unknown as E;
        }
        return err(innerError);
    }
}
