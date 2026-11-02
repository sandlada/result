import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function lift<A extends unknown[], T, E = never>(
    fn: (...args: A) => T,
): (...args: A) => IResultOfT<T, E>;
export function lift<A extends unknown[], T, E>(
    fn: (...args: A) => T,
    errorFn: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E>;
/**
 * `lift` — lift a (possibly throwing) function into the
 * `IResultOfT` context. This is the `fromThrowable` cousin that **never** marks
 * the failure channel: use it for synchronous, total functions where you want the
 * `Result` shape for pipeline uniformity without an error type.
 *
 * If `fn` throws, the error is captured under the supplied `errorFn`. If no
 * `errorFn` is given, thrown errors propagate out of `lift(...)` itself (matching
 * `unwrapOr`'s documented throw policy).
 *
 * **Note on `E = never`**: the single-argument overload has default error type
 * `never`. This reflects the **type-level** guarantee that the function never
 * produces an `Err` when no `errorFn` is supplied — but the function itself can
 * still throw at runtime, in which case the throw propagates synchronously to
 * the caller. If you want all errors funneled into the `Err` channel, supply
 * an `errorFn`.
 *
 * @example
 * ```ts
 * import { lift } from '@sandlada/result/primitives';
 * import { match } from '@sandlada/result/operators';
 *
 * const safeParseInt = lift((s: string) => Number.parseInt(s, 10), (e) => new Error(String(e)));
 * const input = '21';
 * const parsed = safeParseInt(input);
 * const total = lift((n: number) => n * 2)(42);
 * const label = match((n) => String(n), (e) => String(e), parsed);
 * // label === 21; total is Ok(84); invalid strings map to Err via the errorFn argument
 * ```
 */
export function lift<A extends unknown[], T, E>(
    fn: (...args: A) => T,
    errorFn?: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E> {
    return (...args: A): IResultOfT<T, E> => {
        try {
            return ok(fn(...args));
        } catch (caught) {
            // Wrap `errorFn(caught)` so a buggy mapper does not escape the
            // try/catch and bypass the Result wrapper.
            if (errorFn) {
                try { return err(errorFn(caught)); }
                catch (thrown: unknown) { return err(thrown as unknown as E); }
            }
            throw caught;
        }
    };
}
