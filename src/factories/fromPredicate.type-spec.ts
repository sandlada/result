import { describe, it, expectTypeOf } from 'vitest';
import { fromPredicate } from './fromPredicate.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('fromPredicate types', () => {
    it('curried form returns (value: T) => IResultOfT<T, E>', () => {
        const fn = fromPredicate((n: number) => n > 0, 'must be positive');
        expectTypeOf(fn).toEqualTypeOf<(value: number) => IResultOfT<number, string>>();
    });

    it('direct form returns IResultOfT<T, E>', () => {
        const r = fromPredicate((n: number) => n > 0, 'must be positive', 5);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, string>>();
    });

    it('preserves T from predicate argument type', () => {
        const r = fromPredicate((s: string) => s.length > 0, 'empty', 'hi');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, string>>();
    });

    it('infers E from errorOnFalse argument', () => {
        const r = fromPredicate((n: number) => n > 0, new Error('not positive'), 5);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, Error>>();
    });

    it('preserves complex object T', () => {
        type User = { age: number };
        const r = fromPredicate((u: User) => u.age >= 18, 'underage', { age: 21 });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<User, string>>();
    });

    // ─── Curried / direct discrimination ───────────────────────────────────

    it('the curried form returns a function (not an IResultOfT) when value is omitted', () => {
        // Two-argument form must return a function — verifies the discrimination.
        const fn = fromPredicate((n: number) => n > 0, 'no');
        expectTypeOf(fn).toEqualTypeOf<(value: number) => IResultOfT<number, string>>();
        // The return is callable; invoking it yields IResultOfT<number, string>.
        const r = fn(1);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, string>>();
    });

    it('the direct form returns IResultOfT<T, E> when value is supplied', () => {
        // Three-argument form must return an IResultOfT — not a function.
        const r = fromPredicate((n: number) => n > 0, 'no', 1);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, string>>();
        // r is not callable — invoking it is a type error.
        // @ts-expect-error r is IResultOfT, not a function
        r(1);
    });

    it('discrimination works even when T includes undefined (direct form)', () => {
        // arguments.length counts the number of arguments, so passing
        // `undefined` as the third argument still selects the direct form.
        const r = fromPredicate(
            (v: string | undefined) => v !== undefined,
            'empty',
            undefined,
        );
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string | undefined, string>>();
    });

    it('discrimination works even when E is undefined (direct form)', () => {
        // Same: passing `undefined` as the second argument (errorOnFalse) still
        // picks the 3-argument overload, since we count arguments not values.
        const r = fromPredicate(
            (n: number) => n > 0,
            undefined as undefined,
            5,
        );
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, undefined>>();
    });

    it('the curried wrapper preserves the predicate argument type', () => {
        const fn = fromPredicate(
            (s: { id: number }) => s.id > 0,
            'invalid',
        );
        // The wrapper's parameter must match the predicate's argument type.
        type Param = Parameters<typeof fn>[0];
        expectTypeOf<Param>().toEqualTypeOf<{ id: number }>();
    });

    it('rejects a predicate that returns Promise<boolean> (predicate must be synchronous)', () => {
        // fromPredicate is synchronous; async predicates are not supported.
        fromPredicate(
            // @ts-expect-error predicate must return boolean, not Promise<boolean>
            async (_n: number) => true,
            'no',
            1,
        );
    });

    it('rejects a predicate that returns a non-boolean value', () => {
        fromPredicate(
            // @ts-expect-error predicate must return boolean
            (_n: number) => 'yes',
            'no',
            1,
        );
    });

    it('rejects a predicate that takes the wrong argument type', () => {
        // The predicate must accept a single argument of type T.
        fromPredicate(
            (_s: string) => true,
            'no',
            // @ts-expect-error predicate argument type does not match the value type
            1, // value type is number, not string
        );
    });

    it('preserves literal T types through inference', () => {
        const r = fromPredicate(
            (s: 'a' | 'b') => s === 'a',
            'not a',
            'a' as const,
        );
        expectTypeOf(r).toMatchTypeOf<IResultOfT<'a' | 'b', string>>();
    });
});