/**
 * Option FP core — curried factory functions.
 *
 * Provides the functional-style `some()` and `none()` constructors
 * that can be used in point-free pipelines.
 */

import type { IOption } from '../../Option.js';
import { Option } from '../../Option.js';

/**
 * Creates a Some (contains a value).
 *
 * ```ts
 * pipe(42, ofSome); // IOption<number>
 * ```
 */
export function ofSome<T>(value: T): IOption<T> {
    return Option.Some(value);
}

/**
 * Creates a None (no value).
 *
 * ```ts
 * const result: IOption<never> = ofNone();
 * ```
 */
export function ofNone(): IOption<never> {
    return Option.None();
}
