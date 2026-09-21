import type { IResultOfT } from '../types/IResultOfT.js';

export function err<E, T = never>(error: E): IResultOfT<T, E>;
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
 * import { err } from '@sandlada/result/factories';
 * import type { IResultOfT } from '@sandlada/result';
 * const r = err('something went wrong'); // IResultOfT<never, string>
 *
 * // Inside a wider context the T parameter widens automatically:
 * const widen = <T>(): IResultOfT<T, string> => err('boom');
 * ```
 */
export function err<E, T = never>(error: E): IResultOfT<T, E> {
    return { isSuccess: false as const, isFailure: true as const, error } as unknown as IResultOfT<T, E>;
}
