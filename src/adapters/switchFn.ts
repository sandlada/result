/**
 * @fileoverview Converts a one-track (plain) function into a switch function — lifts it to return a Result.
 *
 * Optional `errorFn` (when supplied) maps the caught exception to a typed error;
 * without it the error type defaults to `Error` — mirrors `tryCatch`/`fromPromise`.
 *
 * Wlaschin equivalent: `succeed ∘ f`
 *
 * @example
 * ```ts
 * import { switchFn } from '@sandlada/result';
 * const safe = switchFn((x: number) => x * 2);
 * safe(21); // Ok(42)
 * ```
  *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function switchFn<A, B, E = Error>(
    f: (a: A) => B,
    errorFn?: (error: unknown) => E,
): (a: A) => IResultOfT<B, E> {
    return (a: A): IResultOfT<B, E> => {
        try {
            return ok(f(a)) as IResultOfT<B, E>;
        } catch (e: unknown) {
            const caught = errorFn ? errorFn(e) : (e as E);
            return err(caught) as IResultOfT<B, E>;
        }
    };
}

