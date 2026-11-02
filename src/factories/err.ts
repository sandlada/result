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
 * import { err } from '@sandlada/result/factories';
 * import type { IResultOfT } from '@sandlada/result';
 * const r = err('something went wrong'); // IResultOfT<never, string>
 *
 * // Inside a wider context the T parameter widens automatically:
 * const widen = <T>(): IResultOfT<T, string> => err('boom');
 * ```
 */
export function err<E>(error: E): IResultOfTFailure<E> {
    return errShape(error);
}
