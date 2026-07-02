import { Result } from '../Result.js';
import type { IResult } from '../IResult.js';
import type { IResultOfT } from '../IResultOfT.js';

/**
 * Creates a success result carrying a value.
 *
 * F# equivalent: `Ok value`
 *
 * @returns A result in the success state. The error type is `never`
 *          since a success result has no meaningful error.
 */
export function ok(): IResult<never>;
export function ok<T>(value: T): IResultOfT<T, never>;
export function ok<T>(value?: T): IResult<never> | IResultOfT<T, never> {
    if (arguments.length === 0) {
        return Result.Success() as unknown as IResult<never>;
    }
    return Result.Success(value!) as unknown as IResultOfT<T, never>;
}

/**
 * Creates a failure result carrying an error.
 *
 * F# equivalent: `Error e`
 *
 * @returns A result in the failure state. The value type is `never`
 *          since a failure result has no meaningful value.
 */
export function err<E>(error: E): IResultOfT<never, E> {
    return Result.Failure<never, E>(error);
}
