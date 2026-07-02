import { NONE } from './internal/sentinel.js';
import type { IResult } from './IResult.js';
import type { IResultOfT } from './IResultOfT.js';

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
export class Result<TError = Error> implements IResult<TError> {
    readonly isSuccess: boolean;
    readonly error: TError;

    /**
     * **Internal.** Validates the mutual-exclusivity invariant.
     *
     * @throws If the invariant is violated (success with real error, or failure with NONE).
     */
    protected constructor(isSuccess: boolean, error?: TError) {
        this.isSuccess = isSuccess;
        if (isSuccess && error !== (NONE as unknown as TError)) {
            throw new TypeError(
                'Result invariant violated: success must not carry a real error.',
            );
        }
        if (!isSuccess && error === (NONE as unknown as TError)) {
            throw new TypeError(
                'Result invariant violated: failure must carry a real error.',
            );
        }
        this.error = error as TError;
    }

    get isFailure(): boolean {
        return !this.isSuccess;
    }

    /** Creates a void success result (no value). */
    static Success(): IResult;
    /** Creates a success result carrying a value. Type is inferred. */
    static Success<TValue>(value: TValue): IResultOfT<TValue>;
    static Success<TValue>(value?: TValue): IResult | IResultOfT<TValue> {
        if (arguments.length === 0) {
            return new Result<Error>(true, (NONE as unknown) as Error);
        }
        return new ResultOfT<TValue, Error>(value!, true);
    }

    /** Creates a void failure result. */
    static Failure(error: Error): IResult;
    /** Creates a typed failure result. `TValue` must be specified. */
    static Failure<TValue, TError>(error: TError): IResultOfT<TValue, TError>;
    static Failure<TValue, TError>(error?: TError): IResult | IResultOfT<TValue, TError> {
        if (error === undefined) {
            throw new TypeError('Result.Failure requires an error argument.');
        }
        return new ResultOfT<TValue, TError>(undefined, false, error);
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
export class ResultOfT<TValue, TError = Error> extends Result<TError> implements IResultOfT<TValue, TError> {
    readonly #value: TValue | undefined;

    /**
     * **Internal.** Constructed by {@link Result} factory methods.
     */
    constructor(value?: TValue, isSuccess?: boolean, error?: TError) {
        const sentinelError = (NONE as unknown) as TError;
        super(
            isSuccess ?? true,
            isSuccess === false ? error! : sentinelError,
        );
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
        return this;
    }

    /**
     * Side-effect on the failure track. Returns `this` for chaining.
     *
     * OOP equivalent of the FP `tapErr` operator.
     */
    tapErr(fn: (error: TError) => void): IResultOfT<TValue, TError> {
        if (!this.isSuccess) fn(this.error);
        return this;
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
}
