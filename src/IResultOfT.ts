import type { IResultBase } from './IResult.js';

/**
 * IResultOfTBase — internal flat interface for class implementation.
 *
 * A class cannot `implements` a union type, so this flat base provides the
 * full shape (including all instance method signatures) that the
 * {@link ResultOfT} class implements internally.
 *
 * The method signatures here are what make the {@link Omit} pattern work:
 * the exported {@link IResultOfTSuccess} and {@link IResultOfTFailure}
 * variants `extends Omit<IResultOfTBase, ...>` and thereby **inherit every
 * method**, so fluent calls like `result.map(...)` remain available on the
 * union type — even though `value` and `error` are restricted to their
 * respective variants.
 *
 * @internal
 */
export interface IResultOfTBase<TValue, TError = Error> extends IResultBase<TError> {
    /** The success payload. Throws `TypeError` if accessed on a failure. */
    readonly value: TValue;

    // ── Instance methods (OOP / fluent API) ─────────────────────────────

    /** Transforms the success value. On failure, passes through unchanged. */
    map<U>(fn: (value: TValue) => U): IResultOfT<U, TError>;

    /** Transforms the error. On success, passes through unchanged. */
    mapErr<F>(fn: (error: TError) => F): IResultOfT<TValue, F>;

    /** Chains a result-returning function (monadic bind). */
    andThen<U, F>(fn: (value: TValue) => IResultOfT<U, F>): IResultOfT<U, TError | F>;

    /** Error recovery — tries an alternative path on failure. */
    orElse<U, F>(fn: (error: TError) => IResultOfT<U, F>): IResultOfT<TValue | U, F>;

    /** Terminal — pattern-matches on both cases. */
    match<U>(onSuccess: (value: TValue) => U, onFailure: (error: TError) => U): U;

    /** Side-effect on the success track. Returns `this` for chaining. */
    tap(fn: (value: TValue) => void): IResultOfT<TValue, TError>;

    /** Side-effect on the failure track. Returns `this` for chaining. */
    tapErr(fn: (error: TError) => void): IResultOfT<TValue, TError>;

    /** Extracts the value on success, or returns a default on failure. */
    unwrapOr(defaultValue: TValue): TValue;
}

/**
 * IResultOfTSuccess — the success variant of {@link IResultOfT}.
 *
 * Uses the **Omit pattern** (inspired by true-myth): extends
 * `Omit<IResultOfTBase, 'error' | 'isSuccess' | 'isFailure'>` so that all
 * instance methods are inherited, then re-declares `isSuccess`/`isFailure`
 * as literal types for discrimination and keeps `value`. The `error`
 * property is **omitted** — it is not accessible on the success variant.
 */
export interface IResultOfTSuccess<TValue, TError = Error>
    extends Omit<IResultOfTBase<TValue, TError>, 'error' | 'isSuccess' | 'isFailure'> {
    /** `true` — discriminates this success variant. */
    readonly isSuccess: true;

    /** `false` — always the negation of `isSuccess`. */
    readonly isFailure: false;

    /** The success payload. */
    readonly value: TValue;
}

/**
 * IResultOfTFailure — the failure variant of {@link IResultOfT}.
 *
 * Uses the **Omit pattern** (inspired by true-myth): extends
 * `Omit<IResultOfTBase, 'value' | 'isSuccess' | 'isFailure'>` so that all
 * instance methods are inherited, then re-declares `isSuccess`/`isFailure`
 * as literal types for discrimination and keeps `error`. The `value`
 * property is **omitted** — it is not accessible on the failure variant.
 */
export interface IResultOfTFailure<TValue, TError = Error>
    extends Omit<IResultOfTBase<TValue, TError>, 'value' | 'isSuccess' | 'isFailure'> {
    /** `false` — discriminates this failure variant. */
    readonly isSuccess: false;

    /** `true` — always the negation of `isSuccess`. */
    readonly isFailure: true;

    /** The error payload. */
    readonly error: TError;
}

/**
 * IResultOfT<TValue, TError> — a result that carries a success value,
 * expressed as a **discriminated union**.
 *
 * A result is **either** a success ({@link IResultOfTSuccess}, carrying
 * `value`, no `error`) **or** a failure ({@link IResultOfTFailure},
 * carrying `error`, no `value`).
 *
 * Check `isSuccess` to narrow before accessing `value` or `error`:
 *
 * ```ts
 * if (result.isSuccess) {
 *     console.log(result.value); // safe — narrowed to success
 * } else {
 *     console.log(result.error); // safe — narrowed to failure
 * }
 * ```
 *
 * Instance methods (`.map()`, `.andThen()`, `.match()`, etc.) remain
 * available on the union type because both variants inherit them via the
 * `Omit` pattern from {@link IResultOfTBase}.
 *
 * @typeParam TValue - The success value type.
 * @typeParam TError - The error type. Defaults to `Error`.
 */
export type IResultOfT<TValue, TError = Error> =
    | IResultOfTSuccess<TValue, TError>
    | IResultOfTFailure<TValue, TError>;
