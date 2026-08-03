import { describe, it, expectTypeOf } from 'vitest';
import { mapOr } from './mapOr.js';
import { err, ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapOr types', () => {
    it('curried form returns the mapped/default type', () => {
        const fn = mapOr<number, string, Error>('fallback', (value: number) => value.toString());
        const _check: (r: IResultOfT<number, Error>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the mapped type', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = mapOr('fallback', (value: number) => value.toString(), input);
        const _check: string = result;
        expectTypeOf(_check).toBeString();
    });

    it('default and fn return type are unified into a single B (Group B)', () => {
        // `mapOr<A, B, E>(defaultValue: B, fn: (a: A) => B, r)` binds one `B`.
        // A literal default does not survive next to a widened fn return — the
        // two candidates unify, and the widest one wins.
        const input = err('e') as IResultOfT<number, string>;
        const result = mapOr(0 as const, (v: number) => v * 2, input);
        expectTypeOf(result).toEqualTypeOf<number>();
    });
});
