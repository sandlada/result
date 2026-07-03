/**
 * @fileoverview Combines a tuple of results, preserving heterogeneous types. Returns the first failure or a success tuple.
 *
 * Like `Promise.all` but for Result.
 *
 * @example
 * ```ts
 * import { all, ok, err } from '@sandlada/result';
 * all([ok(1), ok('hi'), ok(true)]);
 * // Ok([1, 'hi', true])
 * ```
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';

export function all<T extends readonly [IResultOfT<unknown, unknown>, ...IResultOfT<unknown, unknown>[]]>(
    results: T,
): IResultOfT<
    { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
    T[number] extends IResultOfT<unknown, infer E> ? E : never
> {
    const values: unknown[] = [];
    for(const r of results) {
        if(!r.isSuccess) return r as unknown as IResultOfT<never, never> as IResultOfT<
            { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
            T[number] extends IResultOfT<unknown, infer E> ? E : never
        >;
        values.push(r.value);
    }
    return ok(values) as unknown as IResultOfT<
        { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
        T[number] extends IResultOfT<unknown, infer E> ? E : never
    >;
}

