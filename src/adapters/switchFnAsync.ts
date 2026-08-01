/**
 * @fileoverview Converts a one-track async function into an async switch function — lifts it to return a `Promise<IResultOfT>`.
 *
 * Optional `errorFn` (when supplied) maps the caught exception to a typed error;
 * without it the error type defaults to `unknown` — mirrors `tryCatchAsync`/`fromPromise`.
 *
 * @example
 * ```ts
 * import { switchFnAsync } from '@sandlada/result';
 * const safeFetch = switchFnAsync(async (url: string) => fetch(url).then(r => r.json()));
 * await safeFetch('https://api.example.com/data');
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function switchFnAsync<A, B, E = unknown>(
    f: (a: A) => B | Promise<B>,
    errorFn?: (error: unknown) => E,
): (a: A) => Promise<IResultOfT<B, E>> {
    return async (a: A): Promise<IResultOfT<B, E>> => {
        try {
            return ok(await f(a)) as unknown as IResultOfT<B, E>;
        } catch (e: unknown) {
            // No `errorFn`: pass through the raw rejection. The cast goes
            // through `unknown` to make the type honesty visible.
            const caught = errorFn ? errorFn(e) : (e as unknown as E);
            return err(caught) as unknown as IResultOfT<B, E>;
        }
    };
}

