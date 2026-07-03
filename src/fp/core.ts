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

/**
 * Tests a value against a predicate and wraps it in a Result.
 *
 * F# equivalent: `Result.fromPredicate` (custom)
 *
 * - `predicate(value) === true` → `Ok(value)`
 * - `predicate(value) === false` → `Err(errorOnFalse)`
 *
 * @category Constructor
 */
export function fromPredicate<T, E>(
    predicate: (v: T) => boolean,
    errorOnFalse: E,
): (value: T) => IResultOfT<T, E>;
export function fromPredicate<T, E>(
    predicate: (v: T) => boolean,
    errorOnFalse: E,
    value: T,
): IResultOfT<T, E>;
export function fromPredicate<T, E>(
    predicate: (v: T) => boolean,
    errorOnFalse: E,
    value?: T,
): IResultOfT<T, E> | ((value: T) => IResultOfT<T, E>) {
    if (arguments.length < 3) {
        return (value: T): IResultOfT<T, E> =>
            fromPredicate(predicate, errorOnFalse, value);
    }
    if (predicate(value!)) {
        return Result.Success(value!) as unknown as IResultOfT<T, E>;
    }
    return Result.Failure<T, E>(errorOnFalse);
}

/**
 * Wraps a synchronous throwing function into a Result-returning function.
 *
 * Unlike `tryCatch` (which executes immediately), `fromThrowable` returns
 * a new function that returns `Result`. Ideal for wrapping existing sync
 * functions at definition time.
 *
 * FP equivalent: lift a throwing function into the Result world.
 *
 * @category Constructor
 */
export function fromThrowable<A extends unknown[], T, E = Error>(
    fn: (...args: A) => T,
    errorFn?: (error: unknown) => E,
): (...args: A) => IResultOfT<T, E> {
    return (...args: A): IResultOfT<T, E> => {
        try {
            return Result.Success<T>(fn(...args)) as unknown as IResultOfT<T, E>;
        } catch (e: unknown) {
            const innerError = errorFn ? errorFn(e) : (e as E);
            return Result.Failure<T, E>(innerError);
        }
    };
}
