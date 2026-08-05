/**
 * @fileoverview Extracts the value on Some, or returns a default on None. Never throws.
 *
 * The default value's type (`D`) is independent of the option's value type (`T`), so a
 * sentinel of a different shape — `null`, `undefined`, a default-value object, a string —
 * can be substituted at the call site without re-typing the option. The result is
 * `T | D`, narrowing to `T` on `Some` and to `D` on `None` via standard control-flow
 * analysis at the use site.
 *
 * **Generic structure**: the curried return uses a *fresh* `<T>` generic on the inner
 * function rather than pulling `T` from the outer signature. This guarantees that the
 * type flows from each application site — a stand-alone `unwrapOr(default)` returns a
 * polymorphic function whose `T` is re-inferred every time it is called, so a pipeline
 * like `pipe(getUser(), unwrapOr(null))` correctly widens the result to `User | null`
 * even though `T` is never pinned at the currying boundary.
 *
 * @example
 * ```ts
 * import { unwrapOrOption, pipe } from '@sandlada/result';
 * import { ofSome, ofNone } from '@sandlada/result/option';
 *
 * pipe(ofSome(42), unwrapOrOption(0)); // 42
 * pipe(ofNone(),   unwrapOrOption(0)); // 0
 *
 * // Cross-shape default — `T = User`, `D = null`, result is `User | null`
 * pipe(getUser(), unwrapOrOption(null));
 *
 * // Direct form: `T = 'high' | 'low'`, `D = 'low'`, result narrows naturally
 * unwrapOrOption('low', ofSome('high')); // 'high'
 * unwrapOrOption('low', ofNone());       // 'low'
 * ```
 *
 * @note Ready for Product
 */

import type { IOption } from '../types/Option.js';

/**
 * Curried form. The inner `<T>` is **deferred** so the option's value type is
 * re-inferred at every application site — `unwrapOr(default)(IOption<User>)` and
 * `unwrapOr(default)(IOption<string>)` both typecheck, and both produce
 * `T | D` for their respective `T`.
 */
export function unwrapOr<D>(defaultValue: D): <T>(opt: IOption<T>) => T | D;

/**
 * Direct form. `T` is inferred from the supplied option.
 */
export function unwrapOr<T, D>(defaultValue: D, opt: IOption<T>): T | D;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
// Each branch is typed via the public overloads above; the cast through `unknown`
// here makes the type honesty visible at the boundary instead of relying on a
// wide return type that masks the curried-vs-direct disambiguation.
export function unwrapOr(defaultValue: unknown, opt?: unknown): unknown {
    if (opt === undefined) {
        // Returning a *generic* function whose `<T>` is freshly declared (not pulled
        // from the outer signature) is what lets the option's value type flow per
        // application. The cast bridges through `unknown` because the implementation
        // signature does not declare `<D>` or `<T>` — see the public overloads above.
        return (<T, _D>(o: IOption<T>): T | _D =>
            unwrapOr(defaultValue, o) as T | _D) as unknown;
    }
    const o = opt as IOption<unknown>;
    return o.isSome ? o.value : defaultValue;
}
