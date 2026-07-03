/**
 * @fileoverview Side-effect on the one-track — calls `f` and returns the value unchanged. Unlike `tap` (which operates on the success track of a Result), `tee` operates on a plain value outside the railway.
 *
 * Wlaschin equivalent: `tee` (dead-end function)
 *
 * @example
 * ```ts
 * import { tee } from '@sandlada/result';
 * const logged = tee((x: number) => console.log('got:', x));
 * logged(42); // logs "got: 42", returns 42
 * ```
 */

export function tee<A>(f: (a: A) => void): (a: A) => A {
    return (a: A): A => {
        f(a);
        return a;
    };
}

