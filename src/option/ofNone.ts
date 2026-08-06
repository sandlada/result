/**
 * @fileoverview Creates a `None` variant of `IOption` — represents absence of a value.
 *
 * The returned object is a **singleton** — every call returns the same frozen
 * reference. The internal object is deep-frozen at module load, and the
 * `IOptionNone` interface marks every field `readonly`, so the singleton
 * cannot be mutated at runtime or via TypeScript.
 *
 * Generic over `T` so the result can be substituted into any `IOption<T>`
 * slot. `T` defaults to `unknown` so a bare `ofNone()` slots into any
 * `IOption<X>` declaration via contextual typing — letting the surrounding
 * `const x: IOption<number> = ofNone()` flow without an explicit generic.
 *
 * @example
 * ```ts
 * import { ofNone } from '@sandlada/result/option';
 *
 * // Contextual typing widens `unknown` to `number` here.
 * const a: IOption<number> = ofNone();
 *
 * // Explicit generic still works when no contextual type is available.
 * const b = ofNone<string>();
 *
 * // Every call returns the same frozen object.
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
 * @typeParam T — The "would-be" value type. Defaults to `unknown` so that
 *   contextual typing (e.g. `const x: IOption<number> = ofNone()`) can flow
 *   without an explicit generic argument.
 *
 * @note Ready for Product
 */
export function ofNone<T = unknown>(): IOption<T> {
    return NONE as IOption<T>;
}
