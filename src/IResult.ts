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

    // ── Side-effect (void result) ──────────────────────────────────────

    /** Side-effect on the success track. Returns `this` for chaining. */
    tap(fn: () => void): IResult<TError>;

    // ── Escape hatches ─────────────────────────────────────────────────

    /**
     * Panics on failure — throws a `TypeError` with the error payload.
     * Use when success is logically guaranteed (tests, prototypes, invariant
     * paths).
     */
    unwrap(): void;

    /**
     * Panics on failure — throws a `TypeError` with the given message.
     * Like {@link unwrap} but with a custom error message.
     */
    expect(msg: string): void;

    /**
     * Panics on success — throws a `TypeError`.
     * Use when failure is logically guaranteed.
     */
    unwrapErr(): TError;

    /**
     * Panics on success — throws a `TypeError` with the given message.
     * Like {@link unwrapErr} but with a custom error message.
     */
    expectErr(msg: string): TError;

    // ── Display ────────────────────────────────────────────────────────

    /** Pretty-print: `Ok` or `Err(error)`. */
    toString(): string;

    /**
     * Serializes to a plain object for `JSON.stringify`.
     * Success returns `{ isSuccess: true }`.
     * Failure returns `{ isSuccess: false, error }`.
     */
    toJSON(): { isSuccess: true } | { isSuccess: false; error: TError };
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
