/**
 * IResultBase — internal flat interface for class implementation.
 *
 * A class cannot `implements` a union type, so this flat base provides
 * the full shape that the {@link Result} class implements internally.
 * Consumers should use the {@link IResult} union type instead.
 *
 * @internal
 */
export interface IResultBase<TError = Error> {
    /** Always accessible at runtime. On success, returns the NONE sentinel. */
    readonly error: TError;

    /** `true` if the operation succeeded. */
    readonly isSuccess: boolean;

    /** `true` if the operation failed. Always the negation of `isSuccess`. */
    readonly isFailure: boolean;
}

/**
 * IResultSuccess — the success variant of {@link IResult}.
 *
 * Carries no `error`. The `isSuccess: true` literal discriminates this
 * variant within the {@link IResult} union, enabling TypeScript narrowing.
 */
export interface IResultSuccess {
    /** `true` — discriminates this success variant. */
    readonly isSuccess: true;

    /** `false` — always the negation of `isSuccess`. */
    readonly isFailure: false;
}

/**
 * IResultFailure — the failure variant of {@link IResult}.
 *
 * Carries the `error`. The `isSuccess: false` literal discriminates this
 * variant within the {@link IResult} union, enabling TypeScript narrowing.
 */
export interface IResultFailure<TError = Error> {
    /** `false` — discriminates this failure variant. */
    readonly isSuccess: false;

    /** `true` — always the negation of `isSuccess`. */
    readonly isFailure: true;

    /** The error payload. */
    readonly error: TError;
}

/**
 * IResult — base result contract as a **discriminated union**.
 *
 * A result is **either** a success ({@link IResultSuccess}, no `error`)
 * **or** a failure ({@link IResultFailure}, carrying `error`).
 *
 * Check `isSuccess` to narrow before accessing `error`:
 *
 * ```ts
 * if (result.isSuccess) {
 *     // result.error — type error: not on the success variant
 * } else {
 *     console.log(result.error); // safe — narrowed to failure
 * }
 * ```
 *
 * At runtime, the `error` property on a success result still returns the
 * internal sentinel, but the type system does not expose it.
 *
 * @typeParam TError - The error type. Defaults to `Error`.
 */
export type IResult<TError = Error> = IResultSuccess | IResultFailure<TError>;
