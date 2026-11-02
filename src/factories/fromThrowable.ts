import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from './err.js';
import { ok } from './ok.js';

/**
 * Wraps a synchronous throwing function into a Result-returning function. Unlike `tryCatch`, `fromThrowable` returns a new function that returns `Result` — ideal for wrapping at definition time.
 *
 * FP equivalent: lift a throwing function into the Result world.
 *
 * @example
 * ```ts
 * import { fromThrowable } from '@sandlada/result/factories';
 * import { map } from '@sandlada/result/operators';
 *
 * const parse = fromThrowable(
 *     (raw: string) => JSON.parse(raw) as { a: number },
 *     (error) => `invalid json: ${String(error)}`,
 * );
 * const field = map((body) => body.a, parse('{"a":1}'));
 * const broken = parse('nope');
 * // field is Ok(1). broken is Err('invalid json: ...').
 * ```
 */
export function fromThrowable<A extends unknown[], T, E = unknown>(
    fn: (...args: A) => T,
    errorFn?: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E> {
    return (...args: A): IResultOfT<T, E> => {
        try { return ok<T>(fn(...args)) as unknown as IResultOfT<T, E>; }
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
    };
}
