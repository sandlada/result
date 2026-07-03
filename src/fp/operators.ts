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

// ─── unwrapOrElse ───────────────────────────────────────────────────────────

/**
 * Extracts the value on success, or computes a default from the error on
 * failure. The callback is only called in the failure case (lazy).
 *
 * F# equivalent: `Result.defaultWith f r`
 *
 * Never throws — this is the safe way to extract a value with a lazy fallback.
 *
 * @category Terminal
 */
export function unwrapOrElse<A, E>(onErr: (e: E) => A): (r: IResultOfT<A, E>) => A;
export function unwrapOrElse<A, E>(onErr: (e: E) => A, r: IResultOfT<A, E>): A;
export function unwrapOrElse<A, E>(onErr: (e: E) => A, r?: IResultOfT<A, E>): A | ((r: IResultOfT<A, E>) => A) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): A => unwrapOrElse(onErr, r);
    }
    return r.isSuccess ? r.value : onErr(r.error);
}

// ─── flatten ────────────────────────────────────────────────────────────────

/**
 * Flattens a nested result: `Result<Result<U, E>, E>` → `Result<U, E>`.
 *
 * Rust equivalent: `result.flatten()`
 *
 * @category Combinator
 */
export function flatten<A, E>(r: IResultOfT<IResultOfT<A, E>, E>): IResultOfT<A, E> {
    if (!r.isSuccess) return r as unknown as IResultOfT<A, E>;
    return r.value;
}

// ─── and ────────────────────────────────────────────────────────────────────

/**
 * Logical AND: returns `other` if `r` is success, otherwise returns `r`.
 *
 * Rust equivalent: `result.and(other)`
 *
 * @category Combinator
 */
export function and<B, F>(other: IResultOfT<B, F>): <A, E>(r: IResultOfT<A, E>) => IResultOfT<B, E | F>;
export function and<A, E, B, F>(other: IResultOfT<B, F>, r: IResultOfT<A, E>): IResultOfT<B, E | F>;
export function and<A, E, B, F>(other: IResultOfT<B, F>, r?: IResultOfT<A, E>): IResultOfT<B, E | F> | ((r: IResultOfT<A, E>) => IResultOfT<B, E | F>) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): IResultOfT<B, E | F> => and(other, r);
    }
    if (!r.isSuccess) return r as unknown as IResultOfT<B, E | F>;
    return other as unknown as IResultOfT<B, E | F>;
}

// ─── or ─────────────────────────────────────────────────────────────────────

/**
 * Logical OR: returns `other` if `r` is failure, otherwise returns `r`.
 *
 * Rust equivalent: `result.or(other)`
 *
 * @category Combinator
 */
export function or<A, F>(other: IResultOfT<A, F>): <E>(r: IResultOfT<A, E>) => IResultOfT<A, F>;
export function or<A, E, F>(other: IResultOfT<A, F>, r: IResultOfT<A, E>): IResultOfT<A, F>;
export function or<A, E, F>(other: IResultOfT<A, F>, r?: IResultOfT<A, E>): IResultOfT<A, F> | ((r: IResultOfT<A, E>) => IResultOfT<A, F>) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): IResultOfT<A, F> => or(other, r);
    }
    if (r.isSuccess) return r as unknown as IResultOfT<A, F>;
    return other as unknown as IResultOfT<A, F>;
}

// ─── contains ───────────────────────────────────────────────────────────────

/**
 * Returns `true` if the result is success and the value equals `target`.
 *
 * Rust equivalent: `result.contains(target)`
 *
 * @category Query
 */
export function contains<A>(target: A): <E>(r: IResultOfT<A, E>) => boolean;
export function contains<A, E>(target: A, r: IResultOfT<A, E>): boolean;
export function contains<A, E>(target: A, r?: IResultOfT<A, E>): boolean | ((r: IResultOfT<A, E>) => boolean) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): boolean => contains(target, r);
    }
    return r.isSuccess && r.value === target;
}

// ─── exists ─────────────────────────────────────────────────────────────────

/**
 * Returns `true` if the result is success and the predicate holds.
 *
 * Rust equivalent: `result.is_ok_and(predicate)`
 *
 * @category Query
 */
export function exists<A>(predicate: (a: A) => boolean): <E>(r: IResultOfT<A, E>) => boolean;
export function exists<A, E>(predicate: (a: A) => boolean, r: IResultOfT<A, E>): boolean;
export function exists<A, E>(predicate: (a: A) => boolean, r?: IResultOfT<A, E>): boolean | ((r: IResultOfT<A, E>) => boolean) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): boolean => exists(predicate, r);
    }
    return r.isSuccess && predicate(r.value);
}

// ─── bimap ──────────────────────────────────────────────────────────────────

/**
 * Simultaneous map over both variants.
 *
 * Rust equivalent: `result.map_or_else(onErr, onOk)` — note reversed order!
 * (Rust's `map_or_else` takes the error handler first.)
 *
 * @category Functorial
 */
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
): (r: IResultOfT<A, E>) => IResultOfT<C, F>;
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    r: IResultOfT<A, E>,
): IResultOfT<C, F>;
export function bimap<A, E, C, F>(
    onOk: (a: A) => C,
    onErr: (e: E) => F,
    r?: IResultOfT<A, E>,
): IResultOfT<C, F> | ((r: IResultOfT<A, E>) => IResultOfT<C, F>) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): IResultOfT<C, F> => bimap(onOk, onErr, r);
    }
    if (r.isSuccess) {
        return ok(onOk(r.value)) as unknown as IResultOfT<C, F>;
    }
    return err(onErr(r.error)) as unknown as IResultOfT<C, F>;
}

// ─── swap ───────────────────────────────────────────────────────────────────

/**
 * Swaps success and failure: `Ok(v)` → `Err(v)`, `Err(e)` → `Ok(e)`.
 *
 * Rust equivalent: `result.swap()` — but in Rust, both sides must have
 * the same type. TypeScript's swap freely exchanges `TValue` and `TError`.
 *
 * @category Combinator
 */
export function swap<A, E>(r: IResultOfT<A, E>): IResultOfT<E, A> {
    if (r.isSuccess) {
        return err(r.value) as unknown as IResultOfT<E, A>;
    }
    return ok(r.error) as unknown as IResultOfT<E, A>;
}

// ─── mapOr ──────────────────────────────────────────────────────────────────

/**
 * Maps the success value, or returns `defaultValue` on failure.
 *
 * Equivalent to `map(fn).unwrapOr(defaultValue)` but more efficient.
 *
 * @category Terminal
 */
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
): (r: IResultOfT<A, E>) => B;
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
    r: IResultOfT<A, E>,
): B;
export function mapOr<A, B, E>(
    defaultValue: B,
    fn: (a: A) => B,
    r?: IResultOfT<A, E>,
): B | ((r: IResultOfT<A, E>) => B) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): B => mapOr(defaultValue, fn, r);
    }
    return r.isSuccess ? fn(r.value) : defaultValue;
}

// ─── mapOrElse ──────────────────────────────────────────────────────────────

/**
 * Maps the success value, or computes a default from the error on failure.
 *
 * Equivalent to `map(fn).unwrapOrElse(onErr)` but more efficient.
 *
 * @category Terminal
 */
export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
): (r: IResultOfT<A, E>) => B;
export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
    r: IResultOfT<A, E>,
): B;
export function mapOrElse<A, B, E>(
    onErr: (e: E) => B,
    fn: (a: A) => B,
    r?: IResultOfT<A, E>,
): B | ((r: IResultOfT<A, E>) => B) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): B => mapOrElse(onErr, fn, r);
    }
    return r.isSuccess ? fn(r.value) : onErr(r.error);
}

// ─── unwrap ─────────────────────────────────────────────────────────────────

/**
 * Panics on failure — throws a `TypeError` with the error payload.
 * Returns the value on success.
 *
 * Rust equivalent: `result.unwrap()`
 *
 * @category Terminal
 */
export function unwrap<A, E>(r: IResultOfT<A, E>): A {
    if (!r.isSuccess) {
        throw new TypeError(
            `Called unwrap() on a failure result. Error: ${String(r.error)}`,
        );
    }
    return r.value;
}

// ─── expect ─────────────────────────────────────────────────────────────────

/**
 * Panics on failure — throws a `TypeError` with the given message.
 * Returns the value on success.
 *
 * Rust equivalent: `result.expect("msg")`
 *
 * @category Terminal
 */
export function expect<A, E>(msg: string): (r: IResultOfT<A, E>) => A;
export function expect<A, E>(msg: string, r: IResultOfT<A, E>): A;
export function expect<A, E>(msg: string, r?: IResultOfT<A, E>): A | ((r: IResultOfT<A, E>) => A) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): A => expect(msg, r);
    }
    if (!r.isSuccess) {
        throw new TypeError(`${msg}: ${String(r.error)}`);
    }
    return r.value;
}

// ─── unwrapErr ──────────────────────────────────────────────────────────────

/**
 * Panics on success — throws a `TypeError`.
 * Returns the error on failure.
 *
 * Rust equivalent: `result.unwrap_err()`
 *
 * @category Terminal
 */
export function unwrapErr<A, E>(r: IResultOfT<A, E>): E {
    if (r.isSuccess) {
        throw new TypeError('Called unwrapErr() on a success result.');
    }
    return r.error;
}

// ─── expectErr ──────────────────────────────────────────────────────────────

/**
 * Panics on success — throws a `TypeError` with the given message.
 * Returns the error on failure.
 *
 * Rust equivalent: `result.expect_err("msg")`
 *
 * @category Terminal
 */
export function expectErr<A, E>(msg: string): (r: IResultOfT<A, E>) => E;
export function expectErr<A, E>(msg: string, r: IResultOfT<A, E>): E;
export function expectErr<A, E>(msg: string, r?: IResultOfT<A, E>): E | ((r: IResultOfT<A, E>) => E) {
    if (r === undefined) {
        return (r: IResultOfT<A, E>): E => expectErr(msg, r);
    }
    if (r.isSuccess) {
        throw new TypeError(msg);
    }
    return r.error;
}
