import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

/**
 * Wraps an async function, catching rejections as failures.
 *
 * @example
 * ```ts
 * import { tryCatchAsync } from '@sandlada/result/factories';
 * import { map } from '@sandlada/result/promise-result';
 *
 * const loaded = tryCatchAsync(
 *     () => Promise.resolve('42'),
 *     (error) => `load failed: ${String(error)}`,
 * );
 * const doubled = map((text: string) => Number(text) * 2, loaded);
 * // doubled resolves to Ok(84). A rejection becomes Err('load failed: ...').
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
