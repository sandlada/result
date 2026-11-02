import type { IResultOfT } from '../types/IResultOfT.js';
import { err } from '../factories/err.js';
import { ok } from '../factories/ok.js';
import { dualByArity } from '../internal/dual.js';

export function ap<A, B, E, F>(
    fnResult: IResultOfT<(a: A) => B, E>,
): (result: IResultOfT<A, F>) => IResultOfT<B, E | F>;
export function ap<A, B, E, F>(
    fnResult: IResultOfT<(a: A) => B, E>,
    result: IResultOfT<A, F>,
): IResultOfT<B, E | F>;
/**
 * Applicative `ap` — applies a function wrapped in a Result to a value wrapped in a Result.
 * If either the function or the value is a failure, the first failure propagates.
 *
 * The function-result and value-result are allowed to have **different** error
 * types — the combined error widens to `E | F`. This matches the sibling
 * `bind` operator and supports heterogeneous-error pipelines.
 *
 * fp-ts equivalent: `ap` / `ap(applyToValue, wrappedFn)`
 *
 * @example
 * ```ts
 * import { ap } from '@sandlada/result/operators';
 * import { ok, err } from '@sandlada/result/factories';
 *
 * ap(ok((x: number) => x * 2), ok(21)); // Ok(42)
 * ap(err<string>('fn failed'), ok(21)); // Err('fn failed')
 *
 * // Both sides may fail with different error types; the result unions them.
 * const fn = err<TypeError>(new TypeError('nope'));
 * const value = err<RangeError>(new RangeError('range'));
 * ap(fn, value); // Err(TypeError | RangeError)
 * ```
 */
export function ap<A, B, E, F>(
    fnResult: IResultOfT<(a: A) => B, E>,
    result?: IResultOfT<A, F>,
): IResultOfT<B, E | F> | ((result: IResultOfT<A, F>) => IResultOfT<B, E | F>) {
    return dualByArity(1, apDirect as (...args: unknown[]) => unknown)(fnResult, result) as
        | IResultOfT<B, E | F>
        | ((result: IResultOfT<A, F>) => IResultOfT<B, E | F>);
}

function apDirect(...args: unknown[]): unknown {
    const fnResult = args[0] as IResultOfT<(a: unknown) => unknown, unknown>;
    const result = args[1] as IResultOfT<unknown, unknown>;
    if (!fnResult.isSuccess) return fnResult as unknown as IResultOfT<unknown, unknown>;
    if (!result.isSuccess) return result as unknown as IResultOfT<unknown, unknown>;
    try {
        return ok(fnResult.value(result.value));
    } catch (e: unknown) {
        return err(e as unknown as unknown);
    }
}
