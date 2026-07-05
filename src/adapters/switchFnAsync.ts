/**
 * @fileoverview Converts a one-track async function into an async switch function — lifts it to return a `Promise<IResultOfT>`.
 *
 * @example
 * ```ts
 * import { switchFnAsync } from '@sandlada/result';
 * const safeFetch = switchFnAsync(async (url: string) => fetch(url).then(r => r.json()));
 * await safeFetch('https://api.example.com/data');
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function switchFnAsync<A, B>(
    f: (a: A) => B | Promise<B>,
): (a: A) => Promise<IResultOfT<B, never>> {
    return async (a: A): Promise<IResultOfT<B, never>> => {
        try { return ok(await f(a)) as IResultOfT<B, never>; }
        catch { return err(undefined as never) as IResultOfT<B, never>; }
    };
}

