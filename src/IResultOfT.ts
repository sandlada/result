import type { IResult } from './IResult.js';

/**
 * IResultOfT<TValue, TError> — a result that carries a success value.
 *
 * Extends the base {@link IResult} contract with a `value` property.
 * Accessing `value` on a failure result throws a TypeError.
 */
export interface IResultOfT<TValue, TError = Error> extends IResult<TError> {
    /** The success payload. Throws `TypeError` if accessed on a failure. */
    readonly value: TValue;
}
