import type { IResultOfT } from './IResultOfT.js';

/**
 * Runtime guard for the `IResultOfT` shape.
 *
 * A Result is a plain discriminated union, so its shape can only be checked at
 * runtime. Modules that accept values from the outside (an `AsyncResult`
 * carrier, a generator's return value) use this guard to recognise a value
 * that is not a Result instead of dereferencing it blindly - dereferencing it
 * throws inside a callback, which neither settles the surrounding promise nor
 * reaches the caller.
 *
 * @internal
 */
export const isResultLike = <T, E>(value: unknown): value is IResultOfT<T, E> =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { isSuccess?: unknown }).isSuccess === 'boolean';
