import type { AsyncResult } from '../../promise/AsyncResult.js';
import { asyncOk } from './core.js';

// ─── switchFnAsync ──────────────────────────────────────────────────────────

/**
 * Converts a one-track async function into an async switch function.
 *
 * Wlaschin equivalent (async): `success ∘ f` — lift a plain async function
 * to return an `AsyncResult`.
 *
 * @category Adapter: 1-track → async switch
 */
export function switchFnAsync<A, B>(
    f: (a: A) => Promise<B>,
): (a: A) => AsyncResult<B, never> {
    return (a: A): AsyncResult<B, never> => asyncOk<A>(a).mapAsync(f) as AsyncResult<B, never>;
}

// ─── teeAsync ───────────────────────────────────────────────────────────────

/**
 * Async side-effect on the one-track — calls `f`, returns the value unchanged.
 *
 * Wlaschin equivalent (async): `tee` in async context.
 *
 * @category Adapter: async dead-end → 1-track
 */
export function teeAsync<A>(f: (a: A) => Promise<void>): (a: A) => Promise<A> {
    return async (a: A): Promise<A> => {
        await f(a);
        return a;
    };
}
