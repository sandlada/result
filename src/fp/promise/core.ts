import { AsyncResult } from '../../promise/AsyncResult.js';

/**
 * Creates a success `AsyncResult` carrying a value.
 *
 * F# equivalent (async): `async { return Ok value }`
 *
 * @returns An `AsyncResult` in the success state. The error type is `never`
 *          since a success result has no meaningful error.
 */
export function asyncOk<T>(value: T): AsyncResult<T, never> {
    return AsyncResult.success(value);
}

/**
 * Creates a failure `AsyncResult` carrying an error.
 *
 * F# equivalent (async): `async { return Error e }`
 *
 * @returns An `AsyncResult` in the failure state. The value type is `never`
 *          since a failure result has no meaningful value.
 */
export function asyncErr<E>(error: E): AsyncResult<never, E> {
    return AsyncResult.failure(error);
}
