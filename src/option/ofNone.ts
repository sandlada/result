/**
 * @fileoverview Creates a `None` variant of `IOption` — represents absence of a value.
 *
 * The returned object is a **singleton** — every call returns the same frozen
 * reference. The internal object is deep-frozen at module load, and the
 * `IOptionNone` interface marks every field `readonly`, so the singleton
 * cannot be mutated at runtime or via TypeScript.
 *
 * Generic over `T` so the result can be substituted into any `IOption<T>`
 * slot. `T` defaults to `never` because `None` carries no value, and `never`
 * is the bottom type assignable to any slot. **Important**: `never` is the
 * *default* inference, not a coercion — TypeScript does not auto-widen
 * `IOption<never>` to `IOption<X>`. Callers who need a specific `T` should
 * provide it explicitly (`ofNone<X>()`) or rely on contextual typing from
 * the surrounding declaration.
 *
 * @example
 * ```ts
 * import { ofNone, ofSome } from '@sandlada/result/option';
 *
 * // Default inference — IOption<never> assignable to IOption<X> via explicit
 * // generic only. Without the generic, this errors:
 * const a: IOption<number> = ofNone<number>(); // Some(none) → fine
 *
 * // Equivalent under the hood: every call returns the same frozen object.
 * const x = ofNone<number>();
 * const y = ofNone<string>();
 * x === y; // true
 * ```
 *
 * @note Ready for Product
 */

import type { IOption, IOptionNone } from '../types/Option.js';

// Module-level singleton, deep-frozen at load time. The `IOptionNone` shape
// has no nested objects, so a single `Object.freeze` is sufficient to make
// the whole graph immutable.
const NONE: IOptionNone = Object.freeze({
    isSome: false,
    isNone: true,
}) as IOptionNone;

/**
 * Creates a `None` variant of {@link IOption}.
 *
 * Returns the **same frozen singleton** for every invocation regardless of
 * the type parameter `T`. The `T` parameter is purely a type-level slot
 * marker; the runtime payload carries no value.
 *
 * @typeParam T — The "would-be" value type. Defaults to `never` because
 *   `None` has no value, and `never` is the bottom type. When the inferred
 *   default (`IOption<never>`) doesn't match the surrounding slot, supply
 *   the type parameter explicitly (e.g. `ofNone<number>()`).
 *
 * @note Ready for Product
 */
export function ofNone<T = never>(): IOption<T> {
    return NONE as IOption<T>;
}
