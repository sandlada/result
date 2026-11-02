import type { AsyncOption } from '../types/AsyncOption.js';
import { runCarrier } from '../types/asyncCarrier.js';

/**
 * Extracts the value from an `AsyncOption`, or throws if `None`.
 * Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, isNone, unwrap } from '@sandlada/result/async-option';
 *
 * const input = fromOption(ofSome(42));
 * const value = await unwrap(input);
 * // value === 42
 *
 * const empty = fromOption(ofNone<number>());
 * const missing = await isNone(empty);
 * // missing === true; unwrap(empty) would throw on None
 * ```
 */
export function unwrap<T>(ao: AsyncOption<T>): Promise<T> {
    return runCarrier(ao).then(opt => {
        if (opt.isSome) return opt.value;
        throw new Error('Called `unwrap` on a None value');
    });
}
