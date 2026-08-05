/**
 * @fileoverview Falls back to an alternative `IOption` if the input is `None`.
 * On `Some`, the input is passed through unchanged.
 *
 * The fallback's value type (`U`) is independent of the input's value type (`T`),
 * so a recovery can return a structurally broader or different value — the
 * resulting carrier is `IOption<T | U>`. Pattern-matching on the result narrows
 * to `T` on the original `Some` and to `U` on the recovered branch.
 *
 * **Generic structure**: the curried return uses a *fresh* `<T>` generic on the
 * inner function rather than pulling `T` from the outer signature. This guarantees
 * that the option's value type is re-inferred at every application site, so
 * `orElse(() => ofSome('hi'))(IOption<User>)` and
 * `orElse(() => ofSome('hi'))(IOption<number>)` both typecheck and the recovery
 * widens to `User | string` and `number | string` respectively.
 *
 * @example
 * ```ts
 * import { orElseOption, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * pipe(ofNone(),         orElseOption(() => ofSome(42))); // Some(42)
 * pipe(ofSome(5),        orElseOption(() => ofSome(42))); // Some(5) (pass-through)
 *
 * // Cross-type recovery — `T = User`, `U = string`, result is `IOption<User | string>`
 * pipe(getUser(),        orElseOption(() => ofSome('anonymous' as string)));
 *
 * // Direct form: `T = 'high' | 'low'`, `U = 'fallback'`
 * orElseOption(() => ofSome('fallback'), ofNone()); // Some('fallback')
 * ```
 *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';
import { ofNone } from './ofNone.js';

/**
 * Curried form. The inner `<T>` is **deferred** so the option's value type is
 * re-inferred at every application site — `orElse(fn)(IOption<User>)` and
 * `orElse(fn)(IOption<number>)` both typecheck.
 */
export function orElse<U>(fn: () => IOption<U>): <T>(opt: IOption<T>) => IOption<T | U>;

/**
 * Direct form. `T` is inferred from the supplied option; the result widens to `T | U`.
 */
export function orElse<T, U>(fn: () => IOption<U>, opt: IOption<T>): IOption<T | U>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
// Each branch is typed via the public overloads above; the cast through `unknown`
// here makes the type honesty visible at the boundary instead of relying on a wide
// return type that masks the curried-vs-direct disambiguation.
export function orElse(fn: () => IOption<unknown>, opt?: IOption<unknown>): unknown {
    if (opt === undefined) {
        // Returning a function whose `<T>` is freshly declared (not pulled from the
        // outer signature) is what lets the option's value type flow per application.
        return (<T, _U>(o: IOption<T>): IOption<T | _U> => {
            if (o.isSome) return o as unknown as IOption<T | _U>;
            try {
                return fn() as IOption<T | _U>;
            } catch {
                return ofNone<T | _U>() as IOption<T | _U>;
            }
        }) as unknown;
    }
    if (opt.isSome) return opt;
    try {
        return fn();
    } catch {
        return ofNone();
    }
}
