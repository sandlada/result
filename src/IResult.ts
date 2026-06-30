/**
 * IResult — base result contract.
 *
 * Every result exposes an error, a success flag, and a failure flag.
 * The error is always accessible; on success it returns an internal sentinel.
 * Consumers should check `isSuccess` before interpreting `error`.
 */
export interface IResult<TError = Error> {
    /** Always accessible. On success, returns the NONE sentinel. */
    readonly error: TError;

    /** `true` if the operation succeeded. */
    readonly isSuccess: boolean;

    /** `true` if the operation failed. Always the negation of `isSuccess`. */
    readonly isFailure: boolean;
}
