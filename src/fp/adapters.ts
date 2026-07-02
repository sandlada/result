import type { IResultOfT } from '../IResultOfT.js';
import { ok } from './core.js';
import { map } from './operators.js';

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
