import type { IResultOfT } from '../IResultOfT.js';
import { ok } from './core.js';
import { map } from './operators.js';
import { Option } from '../Option.js';
import type { IOption } from '../Option.js';
import { Result } from '../Result.js';

// ─── Wlaschin's Three Function Shapes ──────────────────────────────────────
//
// One-track:  (a: A) => B              — plain transformation
// Switch:     (a: A) => Result<B, E>   — can fail
// Two-track:  Result<A, E> => Result<B, E> — operates on the railway
//
// Adapt blocks convert between shapes.

// ─── switchFn ───────────────────────────────────────────────────────────────

/**
 * Converts a one-track function into a switch function.
 *
 * Wlaschin equivalent: `succeed ∘ f` — lift a plain function to return a Result.
 *
 * @category Adapter: 1-track → switch
 */
export function switchFn<A, B>(f: (a: A) => B): (a: A) => IResultOfT<B, never> {
    return (a: A): IResultOfT<B, never> => ok(f(a));
}

// ─── liftMap ────────────────────────────────────────────────────────────────

/**
 * Converts a one-track function into a two-track function.
 *
 * Wlaschin equivalent: `map` applied to a one-track function.
 * This is an alias for `map` — it's a teaching aid for the three-shape model.
 *
 * @category Adapter: 1-track → 2-track
 */
export function liftMap<A, B>(f: (a: A) => B): <E>(r: IResultOfT<A, E>) => IResultOfT<B, E>;
export function liftMap<A, B, E>(f: (a: A) => B, r: IResultOfT<A, E>): IResultOfT<B, E>;
export function liftMap<A, B, E>(f: (a: A) => B, r?: IResultOfT<A, E>): IResultOfT<B, E> | (<E>(r: IResultOfT<A, E>) => IResultOfT<B, E>) {
    if (r === undefined) {
        return <E>(r: IResultOfT<A, E>): IResultOfT<B, E> => map(f, r);
    }
    return map(f, r);
}

// ─── tee ────────────────────────────────────────────────────────────────────

/**
 * Side-effect on the one-track — calls `f`, returns the value unchanged.
 *
 * Wlaschin equivalent: `tee` (one-track dead-end function).
 *
 * Unlike {@link tap} (which operates on the success track of a Result),
 * `tee` operates on a plain value outside the railway.
 *
 * @category Adapter: dead-end → 1-track
 */
export function tee<A>(f: (a: A) => void): (a: A) => A {
    return (a: A): A => {
        f(a);
        return a;
    };
}

// ─── toOption ──────────────────────────────────────────────────────────────

/**
 * Converts a Result to an Option.
 *
 * - `Ok(value)` → `Some(value)`
 * - `Err(_)` → `None`
 *
 * Discards the error information.
 *
 * @category Adapter: 2-track → Option
 */
export function toOption<A, E>(r: IResultOfT<A, E>): IOption<A> {
    if (!r.isSuccess) return Option.None() as unknown as IOption<A>;
    return Option.Some(r.value);
}

// ─── fromOption ─────────────────────────────────────────────────────────────

/**
 * Converts an Option to a Result, providing an error for the None case.
 *
 * - `Some(value)` → `Ok(value)`
 * - `None` → `Err(errorOnNone)`
 *
 * @category Adapter: Option → 2-track
 */
export function fromOption<E>(errorOnNone: E): <A>(opt: IOption<A>) => IResultOfT<A, E>;
export function fromOption<A, E>(errorOnNone: E, opt: IOption<A>): IResultOfT<A, E>;
export function fromOption<A, E>(errorOnNone: E, opt?: IOption<A>): IResultOfT<A, E> | ((opt: IOption<A>) => IResultOfT<A, E>) {
    if (opt === undefined) {
        return (opt: IOption<A>): IResultOfT<A, E> => fromOption(errorOnNone, opt);
    }
    if (opt.isSome) return ok(opt.value) as unknown as IResultOfT<A, E>;
    return Result.Failure<A, E>(errorOnNone);
}
