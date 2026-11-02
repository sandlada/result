import type { IOption } from '../types/Option.js';
import { noneShape } from '../internal/shape.js';

/**
 * Creates a `None` variant of {@link IOption} — represents absence of a value.
 *
 * The returned object is a **singleton** — every call returns the same frozen
 * reference. The internal object is deep-frozen at module load, and the
 * `IOptionNone` interface marks every field `readonly`, so the singleton
 * cannot be mutated at runtime or via TypeScript.
 *
 * Generic over `T` so the result can be substituted into any `IOption<T>`
 * slot. `T` defaults to `unknown` so a bare `ofNone()` slots into any
 * `IOption<X>` declaration via contextual typing — letting the surrounding
 * `const x: IOption<number> = ofNone()` flow without an explicit generic. The
 * `T` parameter is purely a type-level slot marker; the runtime payload
 * carries no value.
 *
 * @typeParam T — The "would-be" value type. Defaults to `unknown` so that
 *   contextual typing (e.g. `const x: IOption<number> = ofNone()`) can flow
 *   without an explicit generic argument.
 *
 * @example
 * ```ts
 * import { ofNone, unwrapOr } from '@sandlada/result/option';
 * import type { IOption } from '@sandlada/result';
 *
 * const typed: IOption<number> = ofNone();
 * const fromContext = unwrapOr(0, typed);
 * // fromContext === 0; contextual typing slots ofNone() into IOption<number>
 *
 * const explicit = ofNone<string>();
 * const fallback = unwrapOr('default', explicit);
 * // fallback === 'default'
 * ```
 */
export function ofNone<T = unknown>(): IOption<T> {
    return noneShape as IOption<T>;
}
