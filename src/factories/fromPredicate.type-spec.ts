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
});
