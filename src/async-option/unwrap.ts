import type { AsyncOption } from '../types/AsyncOption.js';

/**
 * Extracts the value from an `AsyncOption`, or throws if `None`.
 * Use sparingly — prefer `unwrapOr`, `unwrapOrElse`, or `match` in most code.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/async-option';
 *
 * const v = await unwrap(ofSome(42)); // 42
 * await unwrap(ofNone()); // throws Error
 * ```
 *
 * @note Ready for Product
 */
export function unwrap<T>(ao: AsyncOption<T>): Promise<T> {
    return ao.run().then(opt => {
        if (opt.isSome) return opt.value;
        throw new Error('Called `unwrap` on a None value');
    });
}