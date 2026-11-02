import type { IOption } from '../types/Option.js';
import { someShape } from '../internal/shape.js';

/**
 * Creates a `Some` variant of `IOption` containing a value.
 *
 * @example
 * ```ts
 * import { ofSome, map } from '@sandlada/result/option';
 *
 * const input = ofSome(42);
 * const doubled = map((n) => n * 2, input);
 * // doubled is Some(84)
 * ```
 */
export function ofSome<T>(value: T): IOption<T> {
    return someShape(value);
}
