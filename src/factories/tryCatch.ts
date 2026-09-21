import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

/**
 * Executes a synchronous function that may throw, and wraps the result. Unlike `fromThrowable`, `tryCatch` executes the function immediately.
 *
 * @example
 * ```ts
 * import { tryCatch } from '@sandlada/result/factories';
 * const r = tryCatch(() => JSON.parse('{"a":1}'));
 * // r = Ok({ a: 1 })
 * ```
 */
export function tryCatch<T, E = unknown>(
    fn: () => T,
    errorFn?: (error: unknown) => E,
): IResultOfT<T, E> {
    try { return ok<T>(fn()) as unknown as IResultOfT<T, E>; }
    catch(e: unknown) {
        // Wrap `errorFn(e)` so a buggy mapper does not escape the
        // try/catch and bypass the Result wrapper.
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
