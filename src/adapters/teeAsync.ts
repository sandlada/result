/**
 * Async side-effect on the one-track — calls `f` and returns the value unchanged.
 *
 * **Throw policy**: Unlike railway `tap`, `teeAsync` operates on a plain value with no
 * failure state, so a throwing (or rejecting) `f` **propagates**. Ensure `f` does not throw.
 *
 * @example
 * ```ts
 * import { switchFnAsync, teeAsync } from '@sandlada/result/adapters';
 * import { matchAsync } from '@sandlada/result/promise-result';
 *
 * const trace: number[] = [];
 * const input: number = 21;
 * const afterSideEffect = teeAsync(async (n: number) => { trace.push(n); });
 * const lifted = switchFnAsync(async (x: number) => x * 2);
 * const label = await matchAsync(
 *   (n) => `ok:${n}`,
 *   (e) => `err:${String(e)}`,
 *   lifted(await afterSideEffect(input)),
 * );
 * // label === 'ok:42' and trace === [21]; `a` is unchanged after the async side effect
 *
 * const afterTee = await teeAsync(async (_n: number) => { void _n; })(input);
 * const failing = switchFnAsync(async (_x: number) => Promise.reject(new Error('bad')));
 * const captured = await matchAsync(
 *   (n) => `ok:${n}`,
 *   (e) => `err:${(e as Error).message}`,
 *   failing(afterTee),
 * );
 * // captured === 'err:bad'; teeAsync forwards `a` — rejection is captured by switchFnAsync
 * ```
 */

export function teeAsync<A>(f: (a: A) => void | Promise<void>): (a: A) => Promise<A> {
    return async (a: A): Promise<A> => {
        await f(a);
        return a;
    };
}
