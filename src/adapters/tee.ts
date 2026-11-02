/**
 * Side-effect on the one-track — calls `f` and returns the value unchanged.
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
 * import { switchFn, tee } from '@sandlada/result/adapters';
 * import { pipe } from '@sandlada/result/composition';
 * import { match } from '@sandlada/result/operators';
 *
 * const trace: number[] = [];
 * const input = 21;
 * const label = pipe(
 *   input,
 *   tee((n) => { trace.push(n); }),
 *   switchFn((x: number) => x * 2),
 *   match((n) => `ok:${n}`, (e) => `err:${String(e)}`),
 * );
 * // label === 'ok:42' and trace === [21]; `a` passes through tee before switchFn lifts
 *
 * const afterTee = pipe(input, tee((_n: number) => { void _n; }));
 * const failed = switchFn((_x: number) => { throw new Error('bad'); })(afterTee);
 * const captured = match((n) => `ok:${n}`, (e) => `err:${(e as Error).message}`, failed);
 * // captured === 'err:bad'; tee still forwards `a` — the throw is captured downstream
 * ```
 */

export function tee<A>(f: (a: A) => void): (a: A) => A {
    return (a: A): A => {
        f(a);
        return a;
    };
}
