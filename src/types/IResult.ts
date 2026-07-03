/**
 * @fileoverview IResult — the void result discriminated union.
 *
 * A result is **either** a success ({@link IResultSuccess}, no error)
 * **or** a failure ({@link IResultFailure}, carrying the error).
 *
 * Check `isSuccess` to narrow before accessing `error`:
 *
 * ```ts
 * if (result.isSuccess) {
 *   // result.error — type error: not on the success variant
 * } else {
 *   console.log(result.error); // safe — narrowed to failure
 * }
 * ```
 *
 * @typeParam TError — The error type. Defaults to `Error`.
 */

/**
 * IResultSuccess — the success variant of {@link IResult}.
 *
 * Carries no `error`. The `isSuccess: true` literal discriminates this
 * variant within the {@link IResult} union, enabling TypeScript narrowing.
 */
export interface IResultSuccess {
    readonly isSuccess: true;
    readonly isFailure: false;
}

/**
 * IResultFailure — the failure variant of {@link IResult}.
 *
 * Carries the `error`. The `isSuccess: false` literal discriminates this
 * variant within the {@link IResult} union, enabling TypeScript narrowing.
 */
export interface IResultFailure<TError = Error> {
    readonly isSuccess: false;
    readonly isFailure: true;
    readonly error: TError;
}

/**
 * IResult — base result contract as a **discriminated union**.
 *
 * @typeParam TError — The error type. Defaults to `Error`.
 */
export type IResult<TError = Error> = IResultSuccess | IResultFailure<TError>;
