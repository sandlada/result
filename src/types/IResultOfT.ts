/**
 * @fileoverview IResultOfT — the value-bearing result discriminated union.
 *
 * A value-bearing result is **either** a success ({@link IResultOfTSuccess},
 * carrying `value`) **or** a failure ({@link IResultOfTFailure}, carrying
 * `error`).
 *
 * Check `isSuccess` to narrow before accessing `value` or `error`:
 *
 * ```ts
 * if (result.isSuccess) {
 *   console.log(result.value); // safe — narrowed to success
 * } else {
 *   console.log(result.error); // safe — narrowed to failure
 * }
 * ```
 *
 * @typeParam TValue — The success value type.
 * @typeParam TError  — The error type. Defaults to `Error`.
 *
 * @note Ready for Product
 */

/**
 * IResultOfTSuccess — the success variant of {@link IResultOfT}.
 */
export interface IResultOfTSuccess<TValue> {
    readonly isSuccess: true;
    readonly isFailure: false;
    readonly value: TValue;
}

/**
 * IResultOfTFailure — the failure variant of {@link IResultOfT}.
 */
export interface IResultOfTFailure<TError = Error> {
    readonly isSuccess: false;
    readonly isFailure: true;
    readonly error: TError;
}

/**
 * IResultOfT — value-bearing result contract as a **discriminated union**.
 *
 * @typeParam TValue — The success value type.
 * @typeParam TError  — The error type. Defaults to `Error`.
 *
 * @note Ready for Product
 */
export type IResultOfT<TValue, TError = Error> =
    | IResultOfTSuccess<TValue>
    | IResultOfTFailure<TError>;
