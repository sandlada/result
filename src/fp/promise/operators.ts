import type { IResultOfT } from '../../IResultOfT.js';
import { AsyncResult } from '../../promise/AsyncResult.js';

// ─── map ────────────────────────────────────────────────────────────────────

/**
 * Transforms the success value of an `AsyncResult`.
 *
 * Data-last curried version of {@link AsyncResult.map}.
 *
 * @category Functorial
 */
export function map<A, B>(
    f: (a: A) => B,
): <E>(r: AsyncResult<A, E>) => AsyncResult<B, E>;
export function map<A, B, E>(
    f: (a: A) => B,
    r: AsyncResult<A, E>,
): AsyncResult<B, E>;
export function map<A, B, E>(
    f: (a: A) => B,
    r?: AsyncResult<A, E>,
): AsyncResult<B, E> | (<E>(r: AsyncResult<A, E>) => AsyncResult<B, E>) {
    if (r === undefined) {
        return <E>(r: AsyncResult<A, E>): AsyncResult<B, E> => r.map(f);
    }
    return r.map(f);
}

// ─── mapAsync ───────────────────────────────────────────────────────────────

/**
 * Transforms the success value asynchronously.
 *
 * Data-last curried version of {@link AsyncResult.mapAsync}.
 * Catches callback exceptions and converts to Failure.
 *
 * @category Functorial
 */
export function mapAsync<A, B>(
    f: (a: A) => Promise<B>,
    errorFn?: (error: unknown) => Error,
): <E>(r: AsyncResult<A, E>) => AsyncResult<B, E | Error>;
export function mapAsync<A, B, E, F>(
    f: (a: A) => Promise<B>,
    errorFn: (error: unknown) => F,
    r: AsyncResult<A, E>,
): AsyncResult<B, E | F>;
export function mapAsync<A, B, E>(
    f: (a: A) => Promise<B>,
    r: AsyncResult<A, E>,
): AsyncResult<B, E>;
export function mapAsync<A, B, E, F>(
    f: (a: A) => Promise<B>,
    errorFnOrResult?: ((error: unknown) => F) | AsyncResult<A, E>,
    r?: AsyncResult<A, E>,
): AsyncResult<B, E | F> | (<E>(r: AsyncResult<A, E>) => AsyncResult<B, E | F>) {
    if (r !== undefined) {
        return r.mapAsync(f, errorFnOrResult as (error: unknown) => F);
    }
    if (errorFnOrResult instanceof AsyncResult) {
        return errorFnOrResult.mapAsync(f);
    }
    if (errorFnOrResult === undefined || typeof errorFnOrResult === 'function') {
        return (r: AsyncResult<A, E>): AsyncResult<B, E | F> =>
            r.mapAsync(f, errorFnOrResult as (error: unknown) => F);
    }
    return (errorFnOrResult as AsyncResult<A, E>).mapAsync(f);
}

// ─── mapErr ─────────────────────────────────────────────────────────────────

/**
 * Transforms the error of an `AsyncResult`.
 *
 * Data-last curried version of {@link AsyncResult.mapErr}.
 *
 * @category Functorial
 */
export function mapErr<E, F>(
    f: (e: E) => F,
): <A>(r: AsyncResult<A, E>) => AsyncResult<A, F>;
export function mapErr<A, E, F>(
    f: (e: E) => F,
    r: AsyncResult<A, E>,
): AsyncResult<A, F>;
export function mapErr<A, E, F>(
    f: (e: E) => F,
    r?: AsyncResult<A, E>,
): AsyncResult<A, F> | (<A>(r: AsyncResult<A, E>) => AsyncResult<A, F>) {
    if (r === undefined) {
        return <A>(r: AsyncResult<A, E>): AsyncResult<A, F> => r.mapErr(f);
    }
    return r.mapErr(f);
}

// ─── mapErrAsync ────────────────────────────────────────────────────────────

/**
 * Transforms the error asynchronously.
 *
 * Data-last curried version of {@link AsyncResult.mapErrAsync}.
 * Catches callback exceptions and converts to Failure.
 *
 * @category Functorial
 */
export function mapErrAsync<E, F>(
    f: (e: E) => Promise<F>,
    errorFn?: (error: unknown) => F,
): <A>(r: AsyncResult<A, E>) => AsyncResult<A, F>;
export function mapErrAsync<A, E, F>(
    f: (e: E) => Promise<F>,
    errorFn: (error: unknown) => F,
    r: AsyncResult<A, E>,
): AsyncResult<A, F>;
export function mapErrAsync<A, E, F>(
    f: (e: E) => Promise<F>,
    r: AsyncResult<A, E>,
): AsyncResult<A, F>;
export function mapErrAsync<A, E, F>(
    f: (e: E) => Promise<F>,
    errorFnOrResult?: ((error: unknown) => F) | AsyncResult<A, E>,
    r?: AsyncResult<A, E>,
): AsyncResult<A, F> | (<A>(r: AsyncResult<A, E>) => AsyncResult<A, F>) {
    if (r !== undefined) {
        return r.mapErrAsync(f, errorFnOrResult as (error: unknown) => F);
    }
    if (errorFnOrResult instanceof AsyncResult) {
        return errorFnOrResult.mapErrAsync(f);
    }
    return (r: AsyncResult<A, E>): AsyncResult<A, F> =>
        r.mapErrAsync(f, errorFnOrResult as (error: unknown) => F);
}

// ─── bind ───────────────────────────────────────────────────────────────────

/**
 * Chains an async result-returning function (monadic bind).
 *
 * Data-last curried version of {@link AsyncResult.andThen}.
 * `fn` can return `AsyncResult<B, F>`, `IResultOfT<B, F>` or `Promise<IResultOfT<B, F>>`.
 *
 * The error type widens to `E | F`.
 *
 * @category Monadic
 */
export function bind<A, B, F>(
    f: (a: A) => AsyncResult<B, F> | IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <E>(r: AsyncResult<A, E>) => AsyncResult<B, E | F>;
export function bind<A, B, E, F>(
    f: (a: A) => AsyncResult<B, F> | IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: AsyncResult<A, E>,
): AsyncResult<B, E | F>;
export function bind<A, B, E, F>(
    f: (a: A) => AsyncResult<B, F> | IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r?: AsyncResult<A, E>,
): AsyncResult<B, E | F> | (<E>(r: AsyncResult<A, E>) => AsyncResult<B, E | F>) {
    if (r === undefined) {
        return <E>(r: AsyncResult<A, E>): AsyncResult<B, E | F> => r.andThen(f);
    }
    return r.andThen(f);
}

// ─── orElse ─────────────────────────────────────────────────────────────────

/**
 * Error recovery — tries an alternative path on failure.
 *
 * Data-last curried version of {@link AsyncResult.orElse}.
 * `fn` can return `AsyncResult<B, F>`, `IResultOfT<B, F>` or `Promise<IResultOfT<B, F>>`.
 *
 * The success type widens to `A | B`.
 *
 * @category Monadic
 */
export function orElse<E, B, F>(
    f: (e: E) => AsyncResult<B, F> | IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
): <A>(r: AsyncResult<A, E>) => AsyncResult<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => AsyncResult<B, F> | IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r: AsyncResult<A, E>,
): AsyncResult<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => AsyncResult<B, F> | IResultOfT<B, F> | Promise<IResultOfT<B, F>>,
    r?: AsyncResult<A, E>,
): AsyncResult<A | B, F> | (<A>(r: AsyncResult<A, E>) => AsyncResult<A | B, F>) {
    if (r === undefined) {
        return <A>(r: AsyncResult<A, E>): AsyncResult<A | B, F> => r.orElse(f);
    }
    return r.orElse(f);
}

// ─── match ──────────────────────────────────────────────────────────────────

/**
 * Terminal — pattern-matches on both cases of an `AsyncResult`.
 *
 * Data-last curried version of {@link AsyncResult.match}.
 *
 * Both callbacks must return the same type.
 *
 * @category Terminal
 */
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
): (r: AsyncResult<A, E>) => Promise<C>;
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
    r: AsyncResult<A, E>,
): Promise<C>;
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
    r?: AsyncResult<A, E>,
): Promise<C> | ((r: AsyncResult<A, E>) => Promise<C>) {
    if (r === undefined) {
        return (r: AsyncResult<A, E>): Promise<C> => r.match(onOk, onErr);
    }
    return r.match(onOk, onErr);
}

// ─── tap ────────────────────────────────────────────────────────────────────

/**
 * Side-effect on the success track of an `AsyncResult`.
 *
 * Data-last curried version of {@link AsyncResult.tap}.
 *
 * @category Side-effect
 */
export function tap<A>(
    fn: (a: A) => void,
): <E>(r: AsyncResult<A, E>) => AsyncResult<A, E>;
export function tap<A, E>(
    fn: (a: A) => void,
    r: AsyncResult<A, E>,
): AsyncResult<A, E>;
export function tap<A, E>(
    fn: (a: A) => void,
    r?: AsyncResult<A, E>,
): AsyncResult<A, E> | (<E>(r: AsyncResult<A, E>) => AsyncResult<A, E>) {
    if (r === undefined) {
        return <E>(r: AsyncResult<A, E>): AsyncResult<A, E> => r.tap(fn);
    }
    return r.tap(fn);
}

// ─── tapErr ─────────────────────────────────────────────────────────────────

/**
 * Side-effect on the failure track of an `AsyncResult`.
 *
 * Data-last curried version of {@link AsyncResult.tapErr}.
 *
 * @category Side-effect
 */
export function tapErr<E>(
    fn: (e: E) => void,
): <A>(r: AsyncResult<A, E>) => AsyncResult<A, E>;
export function tapErr<A, E>(
    fn: (e: E) => void,
    r: AsyncResult<A, E>,
): AsyncResult<A, E>;
export function tapErr<A, E>(
    fn: (e: E) => void,
    r?: AsyncResult<A, E>,
): AsyncResult<A, E> | (<A>(r: AsyncResult<A, E>) => AsyncResult<A, E>) {
    if (r === undefined) {
        return <A>(r: AsyncResult<A, E>): AsyncResult<A, E> => r.tapErr(fn);
    }
    return r.tapErr(fn);
}

// ─── unwrapOr ───────────────────────────────────────────────────────────────

/**
 * Extracts the value on success, or returns a default on failure.
 *
 * Data-last curried version of {@link AsyncResult.unwrapOr}.
 * Never throws.
 *
 * @category Terminal
 */
export function unwrapOr<A>(
    defaultValue: A,
): <E>(r: AsyncResult<A, E>) => Promise<A>;
export function unwrapOr<A, E>(
    defaultValue: A,
    r: AsyncResult<A, E>,
): Promise<A>;
export function unwrapOr<A, E>(
    defaultValue: A,
    r?: AsyncResult<A, E>,
): Promise<A> | (<E>(r: AsyncResult<A, E>) => Promise<A>) {
    if (r === undefined) {
        return <E>(r: AsyncResult<A, E>): Promise<A> => r.unwrapOr(defaultValue);
    }
    return r.unwrapOr(defaultValue);
}

// ─── flatten ────────────────────────────────────────────────────────────────

/**
 * Flattens a nested `AsyncResult` or `IResultOfT`.
 */
export function flatten<A, E, F>(
    r: AsyncResult<AsyncResult<A, F> | IResultOfT<A, F>, E>,
): AsyncResult<A, E | F> {
    return r.flatten();
}
