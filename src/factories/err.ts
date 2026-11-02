import type { IResultOfT, IResultOfTFailure } from '../types/IResultOfT.js';
import { errShape } from '../internal/shape.js';

export function err<E>(error: E): IResultOfT<never, E>;
export function err<T, E>(error: E): IResultOfT<T, E>;
/**
 * Creates a failure result carrying an error. The value type is `never` as a failure result has no meaningful value.
 *
 * The dual-parameter overload (`err<T, E>(error)`) lets consumers widen the
 * returned type without an explicit cast when the surrounding context already
 * declares a wider value channel. See `ok.ts` for the symmetric rationale.
 *
 * F# equivalent: `Error e`
 *
 * @example
 * ```ts
 * import { err, ok } from '@sandlada/result/factories';
 * import { map, match } from '@sandlada/result/operators';
 * import type { IResultOfT } from '@sandlada/result';
 *
 * const rejected = err('nan');
 * const untouched = map((text: string) => Number(text) * 2, rejected);
 * const label = match(
 *     (n) => `count=${n}`,
 *     (error) => `failed:${error}`,
 *     untouched,
 * );
 * // label === 'failed:nan'
 *
 * const widen = <T>(): IResultOfT<T, string> => err('boom');
 * void ok(1);
 * void widen;
 * ```
 */
export function err<E>(error: E): IResultOfTFailure<E> {
    return errShape(error);
}
