/**
 * @fileoverview Converts a one-track (plain) function into a switch function — lifts it to return a Result.
 *
 * Wlaschin equivalent: `succeed ∘ f`
 *
 * @example
 * ```ts
 * import { switchFn } from '@sandlada/result';
 * const safe = switchFn((x: number) => x * 2);
 * safe(21); // Ok(42)
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

export function switchFn<A, B>(f: (a: A) => B): (a: A) => IResultOfT<B, never> {
    return (a: A): IResultOfT<B, never> => {
        try {
            return ok(f(a)) as IResultOfT<B, never>;
        } catch(e: unknown) {
            return err(e as never) as IResultOfT<B, never>;
        }
    };
}

