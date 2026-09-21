import type { IOption } from '../types/Option.js';

export function unwrapOr<D>(defaultValue: D): <T>(opt: IOption<T>) => T | D;

/**
 * Direct form. `T` is inferred from the supplied option.
 */
export function unwrapOr<T, D>(defaultValue: D, opt: IOption<T>): T | D;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
// Each branch is typed via the public overloads above; the cast through `unknown`
// here makes the type honesty visible at the boundary instead of relying on a
// wide return type that masks the curried-vs-direct disambiguation.
/**
 * Extracts the value on Some, or returns a default on None. Never throws.
 *
 * The default value's type (`D`) is independent of the option's value type (`T`), so a
 * sentinel of a different shape — `null`, `undefined`, a default-value object, a string —
 * can be substituted at the call site without re-typing the option. The result is
 * `T | D`, narrowing to `T` on `Some` and to `D` on `None` via standard control-flow
 * analysis at the use site.
 *
 * Curried form. The inner `<T>` is **deferred** so the option's value type is
 * re-inferred at every application site — `unwrapOr(default)(IOption<User>)` and
 * `unwrapOr(default)(IOption<string>)` both typecheck, and both produce
 * `T | D` for their respective `T`.
 *
 * @example
 * ```ts
 * import { unwrapOr, ofSome, ofNone } from '@sandlada/result/option';
 * import { pipe } from '@sandlada/result/composition';
 *
 * pipe(ofSome(42), unwrapOr(0)); // 42
 * pipe(ofNone(),   unwrapOr(0)); // 0
 *
 * // Cross-shape default — `T = number`, `D = null`, result is `number | null`
 * pipe(ofSome(1), unwrapOr(null));
 *
 * // Direct form: `T = 'high' | 'low'`, `D = 'low'`, result narrows naturally
 * unwrapOr('low', ofSome('high')); // 'high'
 * unwrapOr('low', ofNone());       // 'low'
 * ```
 */
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
