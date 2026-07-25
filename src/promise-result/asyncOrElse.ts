/**
 * @fileoverview Async `orElse` for sync `IResultOfT`. Lifts a sync Result into
 * the async world and recovers from failure via an async callback.
 *
 * Companion to {@link asyncBind} — asyncBind chains forward on Ok; asyncOrElse
 * recovers on Err.
 *
 * @example
 * ```ts
 * import { asyncOrElse, ok, err } from '@sandlada/result';
 * await asyncOrElse(async (e: string) => ok(0), err('boom')); // Ok(0)
 * await asyncOrElse(async (e: string) => ok(0), ok(42));       // Ok(42)
 * ```
 *
 * @note Ready for Product
 */
import type { IResultOfT } from '../types/IResultOfT.js';

export function asyncOrElse<T, E, F>(
    f: (e: E) => Promise<IResultOfT<T, F>>,
): (r: IResultOfT<T, E>) => Promise<IResultOfT<T, E | F>>;
export function asyncOrElse<T, E, F>(
    f: (e: E) => Promise<IResultOfT<T, F>>,
    r: IResultOfT<T, E>,
): Promise<IResultOfT<T, E | F>>;
export function asyncOrElse<T, E, F>(
    f: (e: E) => Promise<IResultOfT<T, F>>,
    r?: IResultOfT<T, E>,
): Promise<IResultOfT<T, E | F>> | ((r: IResultOfT<T, E>) => Promise<IResultOfT<T, E | F>>) {
    if (r === undefined) return (r: IResultOfT<T, E>) => asyncOrElse(f, r);
    if (r.isSuccess) return Promise.resolve(r as unknown as IResultOfT<T, E | F>);
    return Promise.resolve().then(() => f(r.error)) as unknown as Promise<IResultOfT<T, E | F>>;
}