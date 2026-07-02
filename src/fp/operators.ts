import type { IResultOfT } from '../IResultOfT.js';
import { err, ok } from './core.js';

// ─── map ────────────────────────────────────────────────────────────────────

/**
 * Transforms the success value.
 *
 * F# equivalent: `Result.map f r`
 *
 * If the result is a failure, it is passed through unchanged.
 * The mapping function **must not throw** — if it does, the exception propagates.
 *
 * @category Functorial
 */
export function map<A, B>(f: (a: A) => B): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E>;
export function map<A, B, E>(f: (a: A) => B, r: IResultOfT<A, E>): IResultOfT<B, E>;
export function map<A, B, E>(f: (a: A) => B, r?: IResultOfT<A, E>): IResultOfT<B, E> | (<E>(r: IResultOfT<A, E>) => IResultOfT<B, E>) {
    if (r === undefined) {
        return <E>(r: IResultOfT<A, E>): IResultOfT<B, E> => map(f, r);
    }
    if (!r.isSuccess) return r as unknown as IResultOfT<B, E>;
    return ok(f(r.value)) as unknown as IResultOfT<B, E>;
}

// ─── mapErr ─────────────────────────────────────────────────────────────────

/**
 * Transforms the error value.
 *
 * F# equivalent: `Result.mapError f r`
 *
 * If the result is a success, it is passed through unchanged.
 * The internal sentinel on a success result is **not** passed to the mapping function.
 *
 * @category Functorial
 */
export function mapErr<E, F>(f: (e: E) => F): <A>(r: IResultOfT<A, E>) => IResultOfT<A, F>;
export function mapErr<A, E, F>(f: (e: E) => F, r: IResultOfT<A, E>): IResultOfT<A, F>;
export function mapErr<A, E, F>(f: (e: E) => F, r?: IResultOfT<A, E>): IResultOfT<A, F> | (<A>(r: IResultOfT<A, E>) => IResultOfT<A, F>) {
    if (r === undefined) {
        return <A>(r: IResultOfT<A, E>): IResultOfT<A, F> => mapErr(f, r);
    }
    if (r.isSuccess) return r as unknown as IResultOfT<A, F>;
    return err(f(r.error)) as unknown as IResultOfT<A, F>;
}

// ─── bind ───────────────────────────────────────────────────────────────────

/**
 * Chains a result-producing function.
 *
 * F# equivalent: `Result.bind f r`
 *
 * On success, calls `f` with the value and returns its result.
 * On failure, short-circuits and passes through.
 *
 * The error type widens to `E | F` because chained operations may produce a
 * different error type.
 *
 * @category Monadic
 */
export function bind<A, B, F>(
    f: (a: A) => IResultOfT<B, F>,
): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>;
export function bind<A, B, E, F>(
    f: (a: A) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
): IResultOfT<B, E | F>;
export function bind<A, B, E, F>(
    f: (a: A) => IResultOfT<B, F>,
    r?: IResultOfT<A, E>,
): IResultOfT<B, E | F> | (<E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>) {
    if (r === undefined) {
        return <E>(r: IResultOfT<A, E>): IResultOfT<B, E | F> => bind(f, r);
    }
    if (!r.isSuccess) return r as unknown as IResultOfT<B, E | F>;
    return f(r.value) as unknown as IResultOfT<B, E | F>;
}

// ─── orElse ─────────────────────────────────────────────────────────────────

/**
 * Error recovery — tries an alternative path on failure.
 *
 * F# equivalent: pattern `Error e → alt e`
 *
 * On failure, calls `f` with the error; its result replaces this one.
 * On success, passes through unchanged.
 *
 * The success type widens to `A | B` because the recovery may produce a
 * different success type.
 *
 * @category Monadic
 */
export function orElse<E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
): <A>(r: IResultOfT<A, E>) => IResultOfT<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    r: IResultOfT<A, E>,
): IResultOfT<A | B, F>;
export function orElse<A, E, B, F>(
    f: (e: E) => IResultOfT<B, F>,
    r?: IResultOfT<A, E>,
): IResultOfT<A | B, F> | (<A>(r: IResultOfT<A, E>) => IResultOfT<A | B, F>) {
    if (r === undefined) {
        return <A>(r: IResultOfT<A, E>): IResultOfT<A | B, F> => orElse(f, r);
    }
    if (r.isSuccess) return r as unknown as IResultOfT<A | B, F>;
    return f(r.error) as unknown as IResultOfT<A | B, F>;
}

// ─── match ──────────────────────────────────────────────────────────────────

/**
 * Terminal handler — pattern-matches on both cases.
 *
 * F# equivalent: `function Ok v → onOk v | Error e → onErr e`
 *
 * Both callbacks must return the same type. This is the fundamental
 * catamorphism (fold) for Result.
 *
 * @category Terminal
 */
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
): (r: IResultOfT<A, E>) => C;
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
    r: IResultOfT<A, E>,
): C;
export function match<A, E, C>(
    onOk: (a: A) => C,
    onErr: (e: E) => C,
    r?: IResultOfT<A, E>,
): C | ((r: IResultOfT<A, E>) => C) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): C => match(onOk, onErr, r);
    }
    return r.isSuccess ? onOk(r.value) : onErr(r.error);
}

// ─── tap ────────────────────────────────────────────────────────────────────

/**
 * Side-effect on the success track.
 *
 * F# / Wlaschin equivalent: `successTee f r` (or `tee`)
 *
 * Calls `fn` with the value on success, ignores its return value,
 * and passes the original result through unchanged.
 * On failure, does nothing.
 *
 * @category Side-effect
 */
export function tap<A>(fn: (a: A) => void): <E>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tap<A, E>(fn: (a: A) => void, r: IResultOfT<A, E>): IResultOfT<A, E>;
export function tap<A, E>(fn: (a: A) => void, r?: IResultOfT<A, E>): IResultOfT<A, E> | (<E>(r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    if (r === undefined) {
        return <E>(r: IResultOfT<A, E>): IResultOfT<A, E> => tap(fn, r);
    }
    if (r.isSuccess) fn(r.value);
    return r;
}

// ─── tapErr ─────────────────────────────────────────────────────────────────

/**
 * Side-effect on the failure track.
 *
 * F# / Wlaschin equivalent: `failureTee f r`
 *
 * Calls `fn` with the error on failure, ignores its return value,
 * and passes the original result through unchanged.
 * On success, does **not** call `fn` (the internal sentinel is not a real error).
 *
 * @category Side-effect
 */
export function tapErr<E>(fn: (e: E) => void): <A>(r: IResultOfT<A, E>) => IResultOfT<A, E>;
export function tapErr<A, E>(fn: (e: E) => void, r: IResultOfT<A, E>): IResultOfT<A, E>;
export function tapErr<A, E>(fn: (e: E) => void, r?: IResultOfT<A, E>): IResultOfT<A, E> | (<A>(r: IResultOfT<A, E>) => IResultOfT<A, E>) {
    if (r === undefined) {
        return <A>(r: IResultOfT<A, E>): IResultOfT<A, E> => tapErr(fn, r);
    }
    if (!r.isSuccess) fn(r.error);
    return r;
}

// ─── unwrapOr ───────────────────────────────────────────────────────────────

/**
 * Extracts the value on success, or returns a default on failure.
 *
 * F# equivalent: `Result.defaultValue def r`
 *
 * Never throws — this is the safe way to extract a value without
 * pattern matching.
 *
 * @category Terminal
 */
export function unwrapOr<A>(defaultValue: A): <E>(r: IResultOfT<A, E>) => A;
export function unwrapOr<A, E>(defaultValue: A, r: IResultOfT<A, E>): A;
export function unwrapOr<A, E>(defaultValue: A, r?: IResultOfT<A, E>): A | (<E>(r: IResultOfT<A, E>) => A) {
    if (r === undefined) {
        return <E>(r: IResultOfT<A, E>): A => unwrapOr(defaultValue, r);
    }
    return r.isSuccess ? r.value : defaultValue;
}

// ─── flatten ────────────────────────────────────────────────────────────────

/**
 * Flattens a nested result.
 *
 * F# equivalent: `Result.flatten`.
 *
 * @category Monadic
 */
export function flatten<A, E, F>(r: IResultOfT<IResultOfT<A, F>, E>): IResultOfT<A, E | F> {
    return r.flatten();
}
