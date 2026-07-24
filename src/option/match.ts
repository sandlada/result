/**
 * @fileoverview Terminal — pattern-matches on both Some and None. Supports both
 * positional `(onSome, onNone, opt?)` and object `({ some, none }, opt?)`
 * handler shapes, matching the convention used by
 * `match` in `@sandlada/result/async-option`. Prefer the object form.
 *
 * @example
 * ```ts
 * import { match, pipe } from '@sandlada/result';
 * import { ofSome } from '@sandlada/result/option';
 *
 * // Positional form (back-compatible):
 * pipe(ofSome(42), match(v => `value: ${v}`, () => 'nothing')); // "value: 42"
 *
 * // Object form (preferred):
 * match({ some: v => `value: ${v}`, none: () => 'nothing' }, ofSome(42));
 * // "value: 42"
 * ```
  *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';

export interface MatchOptionHandlers<T, U> {
    readonly some: (value: T) => U;
    readonly none: () => U;
}

export function match<T, U>(
    onSome: (value: T) => U,
    onNone: () => U,
): (opt: IOption<T>) => U;
export function match<T, U>(
    onSome: (value: T) => U,
    onNone: () => U,
    opt: IOption<T>,
): U;
export function match<T, U>(
    handlers: MatchOptionHandlers<T, U>,
): (opt: IOption<T>) => U;
export function match<T, U>(
    handlers: MatchOptionHandlers<T, U>,
    opt: IOption<T>,
): U;
export function match<T, U>(
    onSomeOrHandlers: ((value: T) => U) | MatchOptionHandlers<T, U>,
    onNoneOrOpt?: (() => U) | IOption<T>,
    opt?: IOption<T>,
): U | ((opt: IOption<T>) => U) {
    if (typeof onSomeOrHandlers === 'function') {
        const onSome = onSomeOrHandlers as (value: T) => U;
        const onNone = onNoneOrOpt as () => U;
        if (opt === undefined) {
            return (o: IOption<T>): U => match(onSome, onNone, o);
        }
        return opt.isSome ? onSome(opt.value) : onNone();
    }
    const handlers = onSomeOrHandlers;
    const direct = onNoneOrOpt;
    if (direct === undefined) {
        return (o: IOption<T>): U => match(handlers, o);
    }
    const target = direct as IOption<T>;
    return target.isSome ? handlers.some(target.value) : handlers.none();
}

