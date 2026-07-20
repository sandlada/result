/**
 * @fileoverview Async side-effect on the one-track — calls `f` and returns the value unchanged.
 *
 * **Throw policy**: Unlike railway `tap`, `teeAsync` operates on a plain value with no
 * failure state, so a throwing (or rejecting) `f` **propagates**. Ensure `f` does not throw.
 *
 * @example
 * ```ts
 * import { teeAsync } from '@sandlada/result';
 * const logged = teeAsync(async (x: number) => { await save(x); });
 * await logged(42); // returns 42 after saving
 * ```
  *
 * @note Ready for Product
 */

export function teeAsync<A>(f: (a: A) => void | Promise<void>): (a: A) => Promise<A> {
    return async (a: A): Promise<A> => {
        await f(a);
        return a;
    };
}

