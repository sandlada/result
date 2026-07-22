/**
 * @fileoverview Races an `AsyncResult` against a timeout. If the inner result does not
 * settle before `ms` milliseconds have elapsed, the returned AsyncResult resolves to
 * an `Err` produced by the optional `onTimeout` factory. The default factory yields
 * `{ kind: 'Timeout', ms }`.
 *
 * `timeout` is **lazy** — it never triggers `ar.run()` until `.run()` is invoked.
 *
 * @example
 * ```ts
 * import { timeout } from '@sandlada/result/reliability';
 * import { fromPromise } from '@sandlada/result/async-result';
 *
 * const safe = timeout(2000, fromPromise(() => fetch('/slow').then(r => r.json())));
 * const r = await safe.run();
 * // r is Ok(...) if fetch completed within 2000ms, else Err({ kind: 'Timeout', ms: 2000 }).
 * ```
 *
 * @note Ready for Product
 */

import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Default shape of the error produced by {@link timeout} when no factory is given.
 * Library consumers can extend, narrow, or replace it via the `onTimeout` hook.
 */
export interface TimeoutError {
    readonly kind: 'Timeout';
    readonly ms: number;
}

const defaultOnTimeout = (ms: number): TimeoutError => ({ kind: 'Timeout', ms });

/**
 * Wraps an AsyncResult so that slow runs turn into `Err(onTimeout(ms))` after
 * `ms` milliseconds have elapsed. The inner `run()` keeps going in the
 * background — its eventual settlement is ignored.
 */
export function timeout<T, E, TOE = TimeoutError>(
    ms: number,
    ar: AsyncResult<T, E>,
    onTimeout: (ms: number) => TOE = defaultOnTimeout as (ms: number) => TOE,
): AsyncResult<T, E | TOE> {
    const arRun = ar.run;
    return {
        run: (): Promise<IResultOfT<T, E | TOE>> => new Promise<IResultOfT<T, E | TOE>>((resolve) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                resolve({ isSuccess: false as const, isFailure: true as const, error: onTimeout(ms) });
            }, ms);
            arRun().then(
                (r) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    resolve(r as IResultOfT<T, E | TOE>);
                },
                (err: unknown) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    resolve({ isSuccess: false as const, isFailure: true as const, error: err as E } as IResultOfT<T, E | TOE>);
                },
            );
        }),
    };
}