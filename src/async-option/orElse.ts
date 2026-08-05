import type { AsyncOption } from '../types/AsyncOption.js';
import type { IOption } from '../types/Option.js';
import { ofNone } from '../option/index.js';
import { isAsyncCarrier } from '../types/asyncCarrier.js';

/**
 * Recovers from None by chaining to an alternative AsyncOption or Promise<IOption>.
 * Lazy — returns a new AsyncOption without executing the inner computation.
 *
 * The fallback's value type (`U`) is independent of the input's value type (`T`),
 * so a recovery can return a structurally broader or different value — the
 * resulting carrier is `AsyncOption<T | U>`. Pattern-matching on the result narrows
 * to `T` on the original `Some` and to `U` on the recovered branch.
 *
 * @example
 * ```ts
 * import { ofSome, ofNone } from '@sandlada/result/option';
 * import { fromOption, orElse } from '@sandlada/result/async-option';
 *
 * const ao = orElse(() => fromOption(ofSome(0)), fromOption(ofNone()));
 * const result = await ao.run(); // Some(0)
 *
 * // Cross-type recovery — input `AsyncOption<User>`, fallback `AsyncOption<string>`,
 * // result `AsyncOption<User | string>`.
 * const recovered = orElse(
 *     () => fromOption(ofSome('anonymous' as string)),
 *     fromOption(ofNone<User>()),
 * );
 * ```
 *
 * @note Ready for Product
 */

/**
 * Curried form. The inner `<T>` is **deferred** so the AsyncOption's value
 * type is re-inferred at every application site.
 */
export function orElse<U>(
    fn: () => AsyncOption<U> | Promise<IOption<U>>,
): <T>(ao: AsyncOption<T>) => AsyncOption<T | U>;

/**
 * Direct form. `T` is inferred from the supplied AsyncOption; the result widens to `T | U`.
 */
export function orElse<T, U>(
    fn: () => AsyncOption<U> | Promise<IOption<U>>,
    ao: AsyncOption<T>,
): AsyncOption<T | U>;

// Implementation signature — `unknown` opts out of strict overload-shape checks.
// Each branch is typed via the public overloads above; the cast through `unknown`
// here makes the type honesty visible at the boundary instead of relying on a wide
// return type that masks the curried-vs-direct disambiguation.
export function orElse(
    fn: () => AsyncOption<unknown> | Promise<IOption<unknown>>,
    ao?: AsyncOption<unknown>,
): unknown {
    // Curried form — returns an AsyncOption factory whose `<T>` is freshly
    // declared so the AsyncOption's value type flows per application site,
    // matching the sync option/orElse design.
    if (ao === undefined) {
        return (<T>(a: AsyncOption<T>): AsyncOption<T | unknown> => ({
            run: async (): Promise<IOption<T | unknown>> => {
                const opt = await a.run();
                if (opt.isSome) return opt as unknown as IOption<T | unknown>;
                try {
                    const next = await fn();
                    if (isAsyncCarrier(next)) {
                        return (next as AsyncOption<unknown>).run() as Promise<IOption<T | unknown>>;
                    }
                    return next as IOption<T | unknown>;
                } catch {
                    return ofNone() as IOption<T | unknown>;
                }
            },
        })) as unknown;
    }
    // Direct form — both T and U are inferred from the call site.
    return {
        run: async (): Promise<IOption<unknown>> => {
            const opt = await ao.run();
            if (opt.isSome) return opt;
            try {
                const next = await fn();
                if (isAsyncCarrier(next)) {
                    return (next as AsyncOption<unknown>).run();
                }
                return next as IOption<unknown>;
            } catch {
                return ofNone();
            }
        },
    };
}