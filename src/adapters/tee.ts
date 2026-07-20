/**
 * @fileoverview Side-effect on the one-track — calls `f` and returns the value unchanged.
 * Unlike `tap` (which operates on the success track of a Result), `tee` operates on a
 * plain value outside the railway.
 *
 * **Throw policy**: Unlike railway `tap`, `tee` operates on a plain value with no failure
 * state, so a throwing `f` **propagates**. Ensure `f` does not throw.
 *
 * Wlaschin equivalent: `tee` (dead-end function)
 *
 * @example
 * ```ts
 * import { tee } from '@sandlada/result';
 * const logged = tee((x: number) => console.log('got:', x));
 * logged(42); // logs "got: 42", returns 42
 * ```
  *
 * @note Ready for Product
 */

export function tee<A>(f: (a: A) => void): (a: A) => A {
    return (a: A): A => {
        f(a);
        return a;
    };
}

