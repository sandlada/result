import type { IOption } from '../types/Option.js';
import { someShape } from '../internal/shape.js';

/**
 * Creates a `Some` variant of `IOption` containing a value.
 *
 * @example
 * ```ts
 * import { ofSome } from '@sandlada/result/option';
 * ofSome(42); // { isSome: true, isNone: false, value: 42 }
 * ```
 */
export function ofSome<T>(value: T): IOption<T> {
    return someShape(value);
}
