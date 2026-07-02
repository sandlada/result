import type { IResultOfT } from '../IResultOfT.js';
import { Result } from '../Result.js';

/**
 * An **asynchronous** Result — a lazy `Promise<IResultOfT<TValue, TError>>`
 * with a fluent, composable API that mirrors {@link ResultOfT}.
 *
 * ## Why AsyncResult?
 *
 * Without `AsyncResult`, async workflows force `Promise<Result<T, E>>`
 * double-wrapping. Every await needs an `isSuccess` check before continuing:
 *
 * ```ts
 * // ❌ Without AsyncResult — nested awaits, noisy
 * const r1 = await fetchUser(id);
 * if (!r1.isSuccess) return r1;
 * const r2 = await enrichProfile(r1.value);
 * if (!r2.isSuccess) return r2;
 * return Result.Success(r2.value);
 *
 * // ✅ With AsyncResult — flat, readable pipeline
 * const result = await AsyncResult.tryCatch(() => fetchUser(id))
 *     .andThen(user => enrichProfile(user))
 *     .map(profile => profile.displayName);
 * ```
 *
 * ## Design
 *
 * - Wraps a `Promise<IResultOfT<TValue, TError>>` internally
 * - Implements the **thenable protocol** (`then()`) — you can `await` it
 *   directly to get the underlying `IResultOfT`
 * - **Static factories use camelCase** (`AsyncResult.success`, etc.)
 * - Instance methods follow the same fluent pattern as `ResultOfT`
 * - `mapAsync` and `mapErrAsync` catch callback exceptions and convert to Failure
 * - `andThen` / `orElse` accept `AsyncResult`, `IResultOfT`, or
 *   `Promise<IResultOfT>` with automatic error-type widening
 *
 * @typeParam TValue — The success value type
 * @typeParam TError — The error type (defaults to `Error`)
 */
export class AsyncResult<TValue, TError = Error> {
    readonly #promise: Promise<IResultOfT<TValue, TError>>;

    private constructor(promise: Promise<IResultOfT<TValue, TError>>) {
        this.#promise = promise;
    }

    // ── Thenable protocol ──────────────────────────────────────────────

    /**
     * Implements the thenable protocol so `AsyncResult` can be `await`ed
     * directly. `await asyncResult` returns `IResultOfT<TValue, TError>`.
     */
    then<TResult1 = IResultOfT<TValue, TError>, TResult2 = never>(
        onfulfilled?:
            | ((value: IResultOfT<TValue, TError>) => TResult1 | PromiseLike<TResult1>)
            | null
            | undefined,
        onrejected?:
            | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
            | null
            | undefined,
    ): Promise<TResult1 | TResult2> {
        return this.#promise.then(onfulfilled, onrejected);
    }

    // ── Static factories (camelCase, per convention for AsyncResult) ───

    /** Creates a void success `AsyncResult`. */
    static success(): AsyncResult<void, never>;
    /** Creates a success `AsyncResult` carrying a value. */
    static success<T>(value: T): AsyncResult<T, never>;
    static success<T>(value?: T): AsyncResult<T | void, never> {
        if (arguments.length === 0) {
            return new AsyncResult(
                Promise.resolve(Result.Success() as unknown as IResultOfT<void, never>),
            );
        }
        return new AsyncResult(
            Promise.resolve(Result.Success(value) as unknown as IResultOfT<T, never>),
        );
    }

    /** Creates a failure `AsyncResult`. */
    static failure<E>(error: E): AsyncResult<never, E> {
        return new AsyncResult(
            Promise.resolve(Result.Failure<never, E>(error)),
        );
    }

    /**
     * Wraps an async function, catching rejections as failures.
     *
     * Delegates to {@link Result.tryCatchAsync}.
     */
    static tryCatch<T, E = Error>(
        fn: () => Promise<T>,
        errorFn?: (error: unknown) => E,
    ): AsyncResult<T, E> {
        return new AsyncResult(Result.tryCatchAsync(fn, errorFn));
    }

    /** Lifts an existing `IResultOfT` into an `AsyncResult`. */
    static from<T, E = Error>(result: IResultOfT<T, E>): AsyncResult<T, E> {
        return new AsyncResult(Promise.resolve(result));
    }

    /**
     * Wraps an existing `Promise<T>` into an `AsyncResult`.
     *
     * Delegates to {@link Result.fromPromise}.
     */
    static fromPromise<T, E = Error>(
        promise: Promise<T>,
        errorFn?: (error: unknown) => E,
    ): AsyncResult<T, E> {
        return new AsyncResult(Result.fromPromise(promise, errorFn));
    }

    // ── Instance methods: transform (return AsyncResult) ───────────────

    /**
     * Transforms the success value synchronously.
     *
     * On failure, passes through unchanged.
     */
    map<U>(fn: (value: TValue) => U): AsyncResult<U, TError> {
        return new AsyncResult(
            this.#promise.then(r =>
                r.isSuccess
                    ? (Result.Success(fn(r.value)) as unknown as IResultOfT<U, TError>)
                    : (r as unknown as IResultOfT<U, TError>),
            ),
        );
    }

    /**
     * Transforms the success value asynchronously.
     *
     * If `fn` throws or rejects, the exception is caught and converted
     * to a Failure (cast to `TError`).
     */
    mapAsync<U>(fn: (value: TValue) => Promise<U>): AsyncResult<U, TError> {
        return new AsyncResult(
            this.#promise.then(async r => {
                if (!r.isSuccess) return r as unknown as IResultOfT<U, TError>;
                try {
                    const value = await fn(r.value);
                    return Result.Success(value) as unknown as IResultOfT<U, TError>;
                } catch (e: unknown) {
                    return Result.Failure<U, TError>(e as TError);
                }
            }),
        );
    }

    /**
     * Transforms the error synchronously.
     *
     * On success, passes through unchanged.
     */
    mapErr<F>(fn: (error: TError) => F): AsyncResult<TValue, F> {
        return new AsyncResult(
            this.#promise.then(r =>
                r.isSuccess
                    ? (r as unknown as IResultOfT<TValue, F>)
                    : Result.Failure<TValue, F>(fn(r.error)),
            ),
        );
    }

    /**
     * Transforms the error asynchronously.
     *
     * If `fn` throws or rejects, the exception is caught and converted
     * to a Failure (cast to `F`).
     */
    mapErrAsync<F>(fn: (error: TError) => Promise<F>): AsyncResult<TValue, F> {
        return new AsyncResult(
            this.#promise.then(async r => {
                if (r.isSuccess) return r as unknown as IResultOfT<TValue, F>;
                try {
                    const err = await fn(r.error);
                    return Result.Failure<TValue, F>(err);
                } catch (e: unknown) {
                    return Result.Failure<TValue, F>(e as F);
                }
            }),
        );
    }

    // ── Instance methods: chain (return AsyncResult with widened error) ─

    /**
     * Chains an async result-returning function (monadic bind).
     *
     * On success, calls `fn` and returns its result.
     * On failure, short-circuits (passes through).
     *
     * `fn` can return:
     * - `AsyncResult<U, F>` — the fluent case
     * - `IResultOfT<U, F>` — lifted automatically
     *
     * The error type widens to `TError | F`.
     */
    andThen<U, F>(
        fn: (value: TValue) => AsyncResult<U, F> | IResultOfT<U, F>,
    ): AsyncResult<U, TError | F> {
        return new AsyncResult(
            this.#promise.then(async r => {
                if (!r.isSuccess) return r as unknown as IResultOfT<U, TError | F>;
                const result = fn(r.value);
                if (result instanceof AsyncResult) {
                    return result.toPromise() as Promise<IResultOfT<U, TError | F>>;
                }
                return result as unknown as IResultOfT<U, TError | F>;
            }),
        );
    }

    /**
     * Error recovery — tries an alternative path on failure.
     *
     * On failure, calls `fn` with the error; its result replaces this one.
     * On success, passes through unchanged.
     *
     * `fn` can return:
     * - `AsyncResult<U, F>` — the fluent case
     * - `IResultOfT<U, F>` — lifted automatically
     */
    orElse<U, F>(
        fn: (error: TError) => AsyncResult<U, F> | IResultOfT<U, F>,
    ): AsyncResult<TValue | U, F> {
        return new AsyncResult(
            this.#promise.then(async r => {
                if (r.isSuccess) return r as unknown as IResultOfT<TValue | U, F>;
                const result = fn(r.error);
                if (result instanceof AsyncResult) {
                    return result.toPromise() as Promise<IResultOfT<TValue | U, F>>;
                }
                return result as unknown as IResultOfT<TValue | U, F>;
            }),
        );
    }

    // ── Instance methods: side-effects (return AsyncResult) ────────────

    /**
     * Side-effect on the success track. Returns `this` (via new wrapper)
     * for chaining. The side-effect runs when the promise settles.
     */
    tap(fn: (value: TValue) => void): AsyncResult<TValue, TError> {
        return new AsyncResult(
            this.#promise.then(r => {
                if (r.isSuccess) fn(r.value);
                return r;
            }),
        );
    }

    /**
     * Side-effect on the failure track. Returns `this` (via new wrapper)
     * for chaining. The side-effect runs when the promise settles.
     */
    tapErr(fn: (error: TError) => void): AsyncResult<TValue, TError> {
        return new AsyncResult(
            this.#promise.then(r => {
                if (!r.isSuccess) fn(r.error);
                return r;
            }),
        );
    }

    // ── Instance methods: terminal (return Promise, not AsyncResult) ───

    /**
     * Terminal — pattern-matches on both cases.
     *
     * Both callbacks must return the same type.
     */
    match<U>(
        onSuccess: (value: TValue) => U,
        onFailure: (error: TError) => U,
    ): Promise<U> {
        return this.#promise.then(r =>
            r.isSuccess ? onSuccess(r.value) : onFailure(r.error),
        );
    }

    /**
     * Extracts the value on success, or returns a default on failure.
     *
     * Never throws — safe extraction without pattern-matching.
     */
    unwrapOr(defaultValue: TValue): Promise<TValue> {
        return this.#promise.then(r => (r.isSuccess ? r.value : defaultValue));
    }

    /**
     * Returns the underlying `Promise<IResultOfT<TValue, TError>>`.
     *
     * Use this when you need to escape the `AsyncResult` wrapper
     * and work with the raw promise.
     */
    toPromise(): Promise<IResultOfT<TValue, TError>> {
        return this.#promise;
    }

    // ── Static utilities: parallel combination ─────────────────────────

    /**
     * Combines an array of `AsyncResult<T, E>` into an
     * `AsyncResult<T[], E>`.
     *
     * Short-circuits on the first failure.
     */
    static combine<T, E>(
        results: readonly AsyncResult<T, E>[],
    ): AsyncResult<T[], E> {
        return new AsyncResult(
            Promise.all(results.map(r => r.#promise)).then(combined =>
                Result.combine(combined),
            ),
        );
    }

    /**
     * Combines a **tuple** of `AsyncResult`s, preserving heterogeneous
     * types.
     *
     * Like `Promise.all` but for AsyncResult — each element's type is
     * preserved.
     */
    static all<
        TResults extends readonly [
            AsyncResult<unknown, unknown>,
            ...AsyncResult<unknown, unknown>[],
        ],
    >(
        results: TResults,
    ): AsyncResult<
        {
            [K in keyof TResults]: TResults[K] extends AsyncResult<infer V, unknown>
                ? V
                : never;
        },
        TResults[number] extends AsyncResult<unknown, infer E> ? E : never
    > {
        return new AsyncResult(
            Promise.all(results.map(r => r.#promise)).then(combined => {
                type Out = {
                    [K in keyof TResults]: TResults[K] extends AsyncResult<infer V, unknown>
                        ? V
                        : never;
                };
                type Err =
                    TResults[number] extends AsyncResult<unknown, infer E> ? E : never;
                return Result.all(
                    combined as unknown as readonly [
                        IResultOfT<unknown, unknown>,
                        ...IResultOfT<unknown, unknown>[],
                    ],
                ) as unknown as IResultOfT<Out, Err>;
            }),
        );
    }

    /**
     * Combines `AsyncResult`s, accumulating **all** errors (validation
     * aggregation pattern).
     *
     * Unlike {@link AsyncResult.combine} (which short-circuits on the first
     * failure), this collects every error from every failed result.
     */
    static combineWithAllErrors<T, E>(
        results: readonly AsyncResult<T, E>[],
    ): AsyncResult<T[], E[]> {
        return new AsyncResult(
            Promise.all(results.map(r => r.#promise)).then(combined =>
                Result.combineWithAllErrors(combined),
            ),
        );
    }
}
