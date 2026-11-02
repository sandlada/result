import type { AsyncOption } from '../types/AsyncOption.js';
import { ofNone as syncOfNone } from '../option/ofNone.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Creates an `AsyncOption` that always resolves to `None`.
 * Equivalent to `fromOption(ofNone())` but skips the sync intermediate.
 *
 * Default `T = unknown` mirrors option/ofNone so contextual typing flows
 * the same way (`const x: AsyncOption<number> = ofNone()` widens without
 * needing an explicit generic argument).
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * import { fromOption, match, ofNone, orElse } from '@sandlada/result/async-option';
 *
 * const input = ofNone<number>();
 * const recovered = orElse(() => fromOption(ofSome(0)), input);
 * const label = await match(
 *   { some: (n) => `value:${n}`, none: () => 'missing' },
 *   recovered,
 * );
 * // label === 'value:0'; orElse supplies Some when input is None
 * ```
 */
export function ofNone<T = unknown>(): AsyncOption<T> {
    // `syncOfNone<T>()` already returns the correctly-parameterized IOption<T>;
    // no `as unknown as` shim is needed because the singleton satisfies
    // IOption<T> structurally (T is a phantom on None).
    return markAsyncCarrier({ run: () => Promise.resolve(syncOfNone<T>()) });
}
