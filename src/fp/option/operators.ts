/**
 * Option FP operators — curried, data-last functions for use with `pipe`.
 *
 * Each operator takes the function(s) first, then the Option:
 * ```ts
 * pipe(Option.Some(5), map(x => x * 2)); // IOption<number> (Some(10))
 * ```
 *
 * Unlike the class instance methods, these operators work with the
 * discriminated union `IOption<T>` directly by checking `isSome`.
 */

import type { IOption } from '../../Option.js';
import { Option } from '../../Option.js';

/**
 * Transforms the value if Some. On None, passes through unchanged.
 */
export function map<T, U>(fn: (value: T) => U): (opt: IOption<T>) => IOption<U> {
    return opt => {
        if (!opt.isSome) return opt as unknown as IOption<U>;
        return Option.Some(fn(opt.value));
    };
}

/**
 * Chains an Option-returning function (monadic bind).
 */
export function andThen<T, U>(
    fn: (value: T) => IOption<U>,
): (opt: IOption<T>) => IOption<U> {
    return opt => {
        if (!opt.isSome) return opt as unknown as IOption<U>;
        return fn(opt.value);
    };
}

/**
 * Falls back to an alternative Option if None. On Some, passes through.
 */
export function orElse<T>(
    fn: () => IOption<T>,
): (opt: IOption<T>) => IOption<T> {
    return opt => {
        if (opt.isSome) return opt;
        return fn();
    };
}

/**
 * Terminal — pattern-matches on both cases.
 */
export function match<T, U>(
    onSome: (value: T) => U,
    onNone: () => U,
): (opt: IOption<T>) => U {
    return opt => {
        if (opt.isSome) return onSome(opt.value);
        return onNone();
    };
}

/**
 * Side-effect on the Some track.
 */
export function tap<T>(fn: (value: T) => void): (opt: IOption<T>) => IOption<T> {
    return opt => {
        if (opt.isSome) fn(opt.value);
        return opt;
    };
}

/**
 * Extracts the value on Some, or returns a default on None.
 */
export function unwrapOr<T>(defaultValue: T): (opt: IOption<T>) => T {
    return opt => (opt.isSome ? opt.value : defaultValue);
}

/**
 * Returns None if the predicate returns `false`. Otherwise passes through.
 */
export function filter<T>(
    predicate: (value: T) => boolean,
): (opt: IOption<T>) => IOption<T> {
    return opt => {
        if (!opt.isSome) return opt as unknown as IOption<T>;
        if (!predicate(opt.value)) return Option.None() as unknown as IOption<T>;
        return opt;
    };
}

/**
 * Flattens a nested Option: `Option<Option<U>>` → `Option<U>`.
 */
export function flatten<T>(opt: IOption<IOption<T>>): IOption<T> {
    if (!opt.isSome) return opt as unknown as IOption<T>;
    return opt.value;
}

/**
 * Returns `true` if the Option is Some and the value equals `target`.
 */
export function contains<T>(target: T): (opt: IOption<T>) => boolean {
    return opt => opt.isSome && opt.value === target;
}
