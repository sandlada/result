import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone as syncOfNone } from '../option/index.js';
import { markAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Creates an `AsyncOption` that always resolves to `None`.
 * Equivalent to `fromOption(ofNone())` but skips the sync intermediate.
 *
 * @example
 * ```ts
 * import { ofNone } from '@sandlada/result/async-option';
 *
 * const ao = ofNone<number>();
 * const opt = await ao.run(); // None
 * ```
 *
 * @note Ready for Product
 */
export function ofNone<T = never>(): AsyncOption<T> {
    // `syncOfNone()` returns `IOptionNone` (a unit literal with no payload).
    // Cast via `unknown` rather than `never` so the type honesty is visible
    // and consistent with the `as unknown as IOption<T>` convention used in
    // siblings (e.g. `bind.ts`, `orElse.ts`, `transpose.ts`).
    return markAsyncCarrier({ run: () => Promise.resolve(syncOfNone() as unknown as IOption<T>) });
}