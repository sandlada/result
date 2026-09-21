/**
 * Async side-effect on the one-track — calls `f` and returns the value unchanged.
 *
 * **Throw policy**: Unlike railway `tap`, `teeAsync` operates on a plain value with no
 * failure state, so a throwing (or rejecting) `f` **propagates**. Ensure `f` does not throw.
 *
 * @example
 * ```ts
 * import { teeAsync } from '@sandlada/result/adapters';
 * const logged = teeAsync(async (x: number) => { console.log('got:', x); });
 * await logged(42); // returns 42 after the side effect
 * ```
 */

export function teeAsync<A>(f: (a: A) => void | Promise<void>): (a: A) => Promise<A> {
    return async (a: A): Promise<A> => {
        await f(a);
        return a;
    };
}
