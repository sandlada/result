import { NONE } from './internal/sentinel.js';
import { assertResultInvariant } from './internal/invariant.js';
import type { IResult, IResultBase } from './IResult.js';
import type { IResultOfT, IResultOfTBase } from './IResultOfT.js';
import { Option } from './Option.js';
import type { IOption } from './Option.js';

/**
 * Base class implementing the core result invariant.
 *
 * ## Invariant (enforced by constructor)
 * - `isSuccess && error !== NONE` → **throw** (success must not carry a real error)
 * - `!isSuccess && error === NONE` → **throw** (failure must carry a real error)
 *
 * Users do not instantiate this class directly.
 * Use the static factory methods: {@link Result.Success}, {@link Result.Failure}.
 */
export class Result<TError = Error> implements IResultBase<TError> {
    readonly isSuccess: boolean;
    readonly error: TError;

    /**
     * **Internal.** Validates the mutual-exclusivity invariant.
     *
     * @throws If the invariant is violated (success with real error, or failure with NONE).
     */
    protected constructor(isSuccess: boolean, error?: TError) {
        this.isSuccess = isSuccess;
        if (error === undefined) {
            this.error = NONE as unknown as TError;
        } else {
            assertResultInvariant(isSuccess, error);
            this.error = error;
        }
    }

    get isFailure(): boolean {
        return !this.isSuccess;
    }

    // ── Escape hatches (void result) ───────────────────────────────────

    /**
     * Panics on failure — throws a `TypeError` with the error payload.
     * Has no effect on success (void result).
     */
    unwrap(): void {
        if (!this.isSuccess) {
            throw new TypeError(
                `Called unwrap() on a failure result. Error: ${String(this.error)}`,
            );
        }
    }

    /**
     * Panics on failure — throws a `TypeError` with the given message.
     */
    expect(msg: string): void {
        if (!this.isSuccess) {
            throw new TypeError(`${msg}: ${String(this.error)}`);
        }
    }

    /**
     * Panics on success — throws a `TypeError`.
     * Returns the error on failure.
     */
    unwrapErr(): TError {
        if (this.isSuccess) {
            throw new TypeError('Called unwrapErr() on a success result.');
        }
        return this.error;
    }

    /**
     * Panics on success — throws a `TypeError` with the given message.
     * Returns the error on failure.
     */
    expectErr(msg: string): TError {
        if (this.isSuccess) {
            throw new TypeError(msg);
        }
        return this.error;
    }

    // ── Side-effect (void result) ──────────────────────────────────────

    /** Side-effect on the success track. Returns `this` for chaining. */
    tap(fn: () => void): IResult<TError> {
        if (this.isSuccess) fn();
        return this as unknown as IResult<TError>;
    }

    // ── Display ────────────────────────────────────────────────────────

    /** Pretty-print: `Ok` or `Err(error)`. */
    toString(): string {
        return this.isSuccess
            ? 'Ok'
            : `Err(${String(this.error)})`;
    }

    /** Serializes to a plain object for JSON.stringify. */
    toJSON(): { isSuccess: true } | { isSuccess: false; error: TError } {
        return this.isSuccess
            ? { isSuccess: true as const }
            : { isSuccess: false as const, error: this.error };
    }

    /** Creates a void success result (no value). */
    static Success(): IResult;
    /** Creates a success result carrying a value. Type is inferred. */
    static Success<TValue>(value: TValue): IResultOfT<TValue>;
    static Success<TValue>(value?: TValue): IResult | IResultOfT<TValue> {
        if (arguments.length === 0) {
            return new Result<Error>(true, (NONE as unknown) as Error) as unknown as IResult;
        }
        return new ResultOfT<TValue, Error>(value!, true) as unknown as IResultOfT<TValue>;
    }

    /** Creates a void failure result. */
    static Failure(error: Error): IResult;
    /** Creates a typed failure result. `TValue` must be specified. */
    static Failure<TValue, TError>(error: TError): IResultOfT<TValue, TError>;
    static Failure<TValue, TError>(error?: TError): IResult | IResultOfT<TValue, TError> {
        if (error === undefined) {
            throw new TypeError('Result.Failure requires an error argument.');
        }
        return new ResultOfT<TValue, TError>(undefined, false, error) as unknown as IResultOfT<TValue, TError>;
    }

    // ── Static helpers ──────────────────────────────────────────────────

    /**
     * Wraps a synchronous function that may throw.
     *
     * @param fn  The function to execute.
     * @param errorFn  Optional mapper to convert thrown `unknown` to your error type.
     *                 If omitted, the caught value is cast directly (default `TError = Error`).
     */
    static tryCatch<T, E = Error>(
        fn: () => T,
        errorFn?: (error: unknown) => E,
    ): IResultOfT<T, E> {
        try {
            return Result.Success<T>(fn()) as unknown as IResultOfT<T, E>;
        } catch (e: unknown) {
            const innerError = errorFn ? errorFn(e) : (e as E);
            return Result.Failure<T, E>(innerError);
        }
    }

    /**
     * Wraps an **asynchronous** function that may throw.
     *
     * This is the async counterpart of {@link Result.tryCatch} — it bridges
     * the `Promise` world into the `Result` world. The returned `Promise`
     * always resolves; rejected promises are caught and converted to
     * `IResultOfT` failures.
     *
     * @param fn  The async function to execute.
     * @param errorFn  Optional mapper to convert thrown `unknown` to your error type.
     *                 If omitted, the caught value is cast directly (default `TError = Error`).
     * @returns A `Promise` that resolves to a success result (if `fn` fulfills)
     *          or a failure result (if `fn` rejects / throws).
     *
     * @example
     * ```ts
     * const user = await Result.tryCatchAsync(
     *     () => fetch('/api/user/42').then(r => r.json()),
     *     (e) => ({ kind: 'NetworkError' as const, cause: String(e) }),
     * );
     * // user: IResultOfT<User, { kind: 'NetworkError'; cause: string }>
     * ```
     */
    static async tryCatchAsync<T, E = Error>(
        fn: () => Promise<T>,
        errorFn?: (error: unknown) => E,
    ): Promise<IResultOfT<T, E>> {
        try {
            const value = await fn();
            return Result.Success<T>(value) as unknown as IResultOfT<T, E>;
        } catch (e: unknown) {
            const innerError = errorFn ? errorFn(e) : (e as E);
            return Result.Failure<T, E>(innerError);
        }
    }

    /**
     * Converts a `Promise<T>` into a `Promise<IResultOfT<T, E>>`.
     *
     * Convenience wrapper around {@link Result.tryCatchAsync} for cases
     * where you already have a `Promise<T>` (e.g. from an API client)
     * and want to wrap it in a Result without an explicit `async () =>`.
     *
     * @param promise  The promise to wrap.
     * @param errorFn  Optional mapper to convert thrown `unknown` to your error type.
     * @returns A `Promise` that always resolves to `IResultOfT<T, E>`.
     *
     * @example
     * ```ts
     * const raw = fetch('/api/user/42').then(r => r.json()); // Promise<User>
     * const user = await Result.fromPromise(raw, (e) => ({ kind: 'FetchError', cause: String(e) }));
     * // user: IResultOfT<User, { kind: 'FetchError'; cause: string }>
     * ```
     */
    static fromPromise<T, E = Error>(
        promise: Promise<T>,
        errorFn?: (error: unknown) => E,
    ): Promise<IResultOfT<T, E>> {
        return Result.tryCatchAsync<T, E>(() => promise, errorFn);
    }

    /**
     * Combines an **array** of results — short-circuits on the first failure.
     *
     * Rust equivalent: `Iterator::collect::<Result<Vec<_>, _>>()`
     */
    static combine<T, E>(results: readonly IResultOfT<T, E>[]): IResultOfT<T[], E> {
        const values: T[] = [];
        for (const r of results) {
            if (!r.isSuccess) return r as unknown as IResultOfT<T[], E>;
            values.push(r.value);
        }
        return Result.Success(values) as unknown as IResultOfT<T[], E>;
    }

    /**
     * Combines a **tuple** of results, preserving heterogeneous types.
     *
     * Like `Promise.all` but for Result — each element's type is preserved.
     */
    static all<
        T extends readonly [IResultOfT<unknown, unknown>, ...IResultOfT<unknown, unknown>[]],
    >(
        results: T,
    ): IResultOfT<
        { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
        T[number] extends IResultOfT<unknown, infer E> ? E : never
    > {
        const values: unknown[] = [];
        for (const r of results) {
            if (!r.isSuccess) {
                return r as unknown as IResultOfT<never, never> as IResultOfT<
                    { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
                    T[number] extends IResultOfT<unknown, infer E> ? E : never
                >;
            }
            values.push(r.value);
        }
        return Result.Success(values) as unknown as IResultOfT<
            { [K in keyof T]: T[K] extends IResultOfT<infer V, unknown> ? V : never },
            T[number] extends IResultOfT<unknown, infer E> ? E : never
        >;
    }

    /**
     * Combines results, accumulating **all** errors (validation aggregation
     * pattern).
     *
     * Unlike {@link Result.combine} (which short-circuits on the first failure),
     * this collects every error from every failed result.
     */
    static combineWithAllErrors<T, E>(
        results: readonly IResultOfT<T, E>[],
    ): IResultOfT<T[], E[]> {
        const values: T[] = [];
        const errors: E[] = [];
        for (const r of results) {
            if (r.isSuccess) {
                values.push(r.value);
            } else {
                errors.push(r.error);
            }
        }
        if (errors.length > 0) {
            return Result.Failure<T[], E[]>(errors);
        }
        return Result.Success(values) as unknown as IResultOfT<T[], E[]>;
    }

    /**
     * Converts an {@link Option} to a {@link Result}.
     *
     * - `Some(value)` → `Success(value)`
     * - `None` → `Failure(errorOnNone)`
     *
     * @param option  The Option to convert.
     * @param errorOnNone  The error to use when the Option is None.
     */
    static fromOption<T, E>(option: IOption<T>, errorOnNone: E): IResultOfT<T, E> {
        if (option.isSome) {
            return Result.Success<T>(option.value) as unknown as IResultOfT<T, E>;
        }
        return Result.Failure<T, E>(errorOnNone);
    }

    /**
     * Tests a value against a predicate. If the predicate returns `true`,
     * wraps the value in a success; otherwise, returns a failure with
     * `errorOnFalse`.
     *
     * Useful for inline validation at API boundaries:
     *
     * ```ts
     * const r = Result.fromPredicate(input, isValid, { kind: 'InvalidInput' });
     * ```
     *
     * @param value  The value to test.
     * @param predicate  The validation function.
     * @param errorOnFalse  The error to embed if the predicate returns `false`.
     */
    static fromPredicate<T, E>(
        value: T,
        predicate: (v: T) => boolean,
        errorOnFalse: E,
    ): IResultOfT<T, E> {
        if (predicate(value)) {
            return Result.Success<T>(value) as unknown as IResultOfT<T, E>;
        }
        return Result.Failure<T, E>(errorOnFalse);
    }

    /**
     * Wraps a synchronous throwing function into a Result-returning function.
     *
     * Unlike {@link Result.tryCatch} (which executes immediately),
     * `fromThrowable` returns a new function that returns `Result`.
     * Ideal for wrapping existing sync functions at definition time.
     *
     * @param fn  The function that may throw.
     * @param errorFn  Optional mapper to convert thrown `unknown` to your error type.
     * @returns A function with the same signature, but returning `IResultOfT`.
     *
     * @example
     * ```ts
     * const safeParse = Result.fromThrowable(JSON.parse, (e) => ({
     *     kind: 'ParseError' as const,
     *     message: String(e),
     * }));
     * const r = safeParse('{"valid": true}');
     * ```
     */
    static fromThrowable<A extends unknown[], T, E = Error>(
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
}

/**
 * Generic result carrying a success value.
 *
 * Extends the {@link Result} base class and implements
 * {@link IResultOfT}.
 *
 * Users do not instantiate this class directly.
 * Use {@link Result.Success} or {@link Result.Failure}.
 */
export class ResultOfT<TValue, TError = Error> implements IResultOfTBase<TValue, TError> {
    readonly isSuccess: boolean;
    readonly isFailure: boolean;
    readonly error: TError;
    readonly #value: TValue | undefined;

    /**
     * **Internal.** Constructed by {@link Result} factory methods.
     */
    constructor(value?: TValue, isSuccess?: boolean, error?: TError) {
        const success = isSuccess ?? true;
        this.isSuccess = success;
        this.isFailure = !success;

        const actualError = error !== undefined ? error : (NONE as unknown as TError);
        assertResultInvariant(success, actualError);
        this.error = actualError;

        this.#value = value;
    }

    /**
     * The success payload.
     * @throws {TypeError} If this result represents a failure.
     */
    get value(): TValue {
        if (!this.isSuccess) {
            throw new TypeError(
                'Cannot access value on a failure result. Check isSuccess before accessing value.',
            );
        }
        return this.#value as TValue;
    }

    // ── Instance methods (OOP / fluent API) ─────────────────────────────

    /**
     * Transforms the success value. On failure, passes through unchanged.
     *
     * OOP equivalent of the FP `map` operator.
     */
    map<U>(fn: (value: TValue) => U): IResultOfT<U, TError> {
        if (!this.isSuccess) return this as unknown as IResultOfT<U, TError>;
        return Result.Success<U>(fn(this.#value as TValue)) as unknown as IResultOfT<U, TError>;
    }

    /**
     * Transforms the error. On success, passes through unchanged.
     *
     * OOP equivalent of the FP `mapErr` operator.
     */
    mapErr<F>(fn: (error: TError) => F): IResultOfT<TValue, F> {
        if (this.isSuccess) return this as unknown as IResultOfT<TValue, F>;
        return Result.Failure<TValue, F>(fn(this.error));
    }

    /**
     * Chains a result-returning function (monadic bind).
     *
     * On success, calls `fn` and returns its result.
     * On failure, short-circuits (passes through).
     *
     * OOP equivalent of the FP `bind` operator.
     */
    andThen<U, F>(
        fn: (value: TValue) => IResultOfT<U, F>,
    ): IResultOfT<U, TError | F> {
        if (!this.isSuccess) return this as unknown as IResultOfT<U, TError | F>;
        return fn(this.#value as TValue) as unknown as IResultOfT<U, TError | F>;
    }

    /**
     * Error recovery — tries an alternative path on failure.
     *
     * On failure, calls `fn` with the error; its result replaces this one.
     * On success, passes through unchanged.
     *
     * OOP equivalent of the FP `orElse` operator.
     */
    orElse<U, F>(
        fn: (error: TError) => IResultOfT<U, F>,
    ): IResultOfT<TValue | U, F> {
        if (this.isSuccess) return this as unknown as IResultOfT<TValue | U, F>;
        return fn(this.error) as unknown as IResultOfT<TValue | U, F>;
    }

    /**
     * Terminal — pattern-matches on both cases.
     *
     * Both callbacks must return the same type.
     *
     * OOP equivalent of the FP `match` function.
     */
    match<U>(onSuccess: (value: TValue) => U, onFailure: (error: TError) => U): U {
        return this.isSuccess
            ? onSuccess(this.#value as TValue)
            : onFailure(this.error);
    }

    /**
     * Side-effect on the success track. Returns `this` for chaining.
     *
     * OOP equivalent of the FP `tap` operator.
     */
    tap(fn: (value: TValue) => void): IResultOfT<TValue, TError> {
        if (this.isSuccess) fn(this.#value as TValue);
        return this as unknown as IResultOfT<TValue, TError>;
    }

    /**
     * Side-effect on the failure track. Returns `this` for chaining.
     *
     * OOP equivalent of the FP `tapErr` operator.
     */
    tapErr(fn: (error: TError) => void): IResultOfT<TValue, TError> {
        if (!this.isSuccess) fn(this.error);
        return this as unknown as IResultOfT<TValue, TError>;
    }

    /**
     * Extracts the value on success, or returns a default on failure.
     *
     * Never throws — safe extraction without pattern-matching.
     *
     * OOP equivalent of the FP `unwrapOr` function.
     */
    unwrapOr(defaultValue: TValue): TValue {
        return this.isSuccess ? (this.#value as TValue) : defaultValue;
    }

    /**
     * Extracts the value on success, or computes a default from the error on
     * failure. Never throws.
     */
    unwrapOrElse(fn: (error: TError) => TValue): TValue {
        return this.isSuccess ? (this.#value as TValue) : fn(this.error);
    }

    // ── Escape hatches ─────────────────────────────────────────────────

    /**
     * Panics on failure — throws a `TypeError` with the error payload.
     * Returns the value on success.
     */
    unwrap(): TValue {
        if (!this.isSuccess) {
            throw new TypeError(
                `Called unwrap() on a failure result. Error: ${String(this.error)}`,
            );
        }
        return this.#value as TValue;
    }

    /**
     * Panics on failure — throws a `TypeError` with the given message.
     * Returns the value on success.
     */
    expect(msg: string): TValue {
        if (!this.isSuccess) {
            throw new TypeError(`${msg}: ${String(this.error)}`);
        }
        return this.#value as TValue;
    }

    /**
     * Panics on success — throws a `TypeError`.
     * Returns the error on failure.
     */
    unwrapErr(): TError {
        if (this.isSuccess) {
            throw new TypeError('Called unwrapErr() on a success result.');
        }
        return this.error;
    }

    /**
     * Panics on success — throws a `TypeError` with the given message.
     * Returns the error on failure.
     */
    expectErr(msg: string): TError {
        if (this.isSuccess) {
            throw new TypeError(msg);
        }
        return this.error;
    }

    // ── Conversion ─────────────────────────────────────────────────────

    /**
     * Converts to an {@link IOption}:
     * - `Success(value)` → `Some(value)`
     * - `Failure(_)` → `None`
     */
    toOption(): IOption<TValue> {
        if (!this.isSuccess) return Option.None() as unknown as IOption<TValue>;
        return Option.Some(this.#value as TValue);
    }

    // ── Combinators ────────────────────────────────────────────────────

    /**
     * Flattens a nested result: `Result<Result<U, E>, E>` → `Result<U, E>`.
     */
    flatten<U>(this: IResultOfT<IResultOfT<U, TError>, TError>): IResultOfT<U, TError> {
        if (!this.isSuccess) return this as unknown as IResultOfT<U, TError>;
        return this.value;
    }

    /**
     * Logical AND: returns `other` if this is success, otherwise returns
     * this failure.
     */
    and<U, F>(other: IResultOfT<U, F>): IResultOfT<U, TError | F> {
        if (!this.isSuccess) return this as unknown as IResultOfT<U, TError | F>;
        return other as unknown as IResultOfT<U, TError | F>;
    }

    /**
     * Logical OR: returns `other` if this is failure, otherwise returns
     * this success.
     */
    or<F>(other: IResultOfT<TValue, F>): IResultOfT<TValue, F> {
        if (this.isSuccess) return this as unknown as IResultOfT<TValue, F>;
        return other as unknown as IResultOfT<TValue, F>;
    }

    /**
     * Returns `true` if the result is success and the value equals `value`.
     */
    contains(value: TValue): boolean {
        return this.isSuccess && this.#value === value;
    }

    /**
     * Returns `true` if the result is success and the predicate holds.
     */
    exists(predicate: (value: TValue) => boolean): boolean {
        return this.isSuccess && predicate(this.#value as TValue);
    }

    /**
     * Simultaneous map over both variants.
     */
    bimap<U, F>(
        onSuccess: (value: TValue) => U,
        onFailure: (error: TError) => F,
    ): IResultOfT<U, F> {
        if (this.isSuccess) {
            return Result.Success<U>(onSuccess(this.#value as TValue)) as unknown as IResultOfT<U, F>;
        }
        return Result.Failure<U, F>(onFailure(this.error));
    }

    /**
     * Swaps success and failure: `Ok(v)` → `Err(v)`, `Err(e)` → `Ok(e)`.
     */
    swap(): IResultOfT<TError, TValue> {
        if (this.isSuccess) {
            return Result.Failure<TError, TValue>(this.#value as unknown as TValue);
        }
        return Result.Success<TError>(this.error) as unknown as IResultOfT<TError, TValue>;
    }

    // ── Extraction shortcuts ───────────────────────────────────────────

    /** Extracts the value on success, or `null` on failure. */
    getOrNull(): TValue | null {
        return this.isSuccess ? (this.#value as TValue) : null;
    }

    /** Extracts the value on success, or `undefined` on failure. */
    getOrUndefined(): TValue | undefined {
        return this.isSuccess ? (this.#value as TValue) : undefined;
    }

    // ── Map + default ──────────────────────────────────────────────────

    /**
     * Maps the success value, or returns `defaultValue` on failure.
     * Equivalent to `map(fn).unwrapOr(defaultValue)` but in one call.
     */
    mapOr<U>(defaultValue: U, fn: (value: TValue) => U): U {
        if (!this.isSuccess) return defaultValue;
        return fn(this.#value as TValue);
    }

    /**
     * Maps the success value, or computes a default from the error on
     * failure. Equivalent to `map(fn).unwrapOrElse(onErr)`.
     */
    mapOrElse<U>(onErr: (error: TError) => U, fn: (value: TValue) => U): U {
        if (!this.isSuccess) return onErr(this.error);
        return fn(this.#value as TValue);
    }

    // ── Display ────────────────────────────────────────────────────────

    /** Pretty-print: `Ok(value)` or `Err(error)`. */
    toString(): string {
        return this.isSuccess
            ? `Ok(${String(this.#value as TValue)})`
            : `Err(${String(this.error)})`;
    }

    /**
     * Serializes to a plain object for `JSON.stringify`.
     *
     * Success serializes as `{ isSuccess: true, value }`.
     * Failure serializes as `{ isSuccess: false, error }`.
     */
    toJSON(): { isSuccess: true; value: TValue } | { isSuccess: false; error: TError } {
        return this.isSuccess
            ? { isSuccess: true as const, value: this.#value as TValue }
            : { isSuccess: false as const, error: this.error };
    }
}
