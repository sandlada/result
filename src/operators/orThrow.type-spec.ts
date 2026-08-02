import { describe, it, expectTypeOf } from 'vitest';
import { orThrow, orThrowWith } from './orThrow.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('orThrow types', () => {
    it('orThrow returns the success value type', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = orThrow(input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });

    it('orThrowWith curried form returns the success value type', () => {
        const fn = orThrowWith<number, string>((error) => new Error(error));
        const _check: (r: IResultOfT<number, string>) => number = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('orThrowWith direct form accepts non-Error error types', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = orThrowWith((error: string) => new Error(error), input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });

    it('orThrow requires E extends Error (Group B)', () => {
        // @ts-expect-error — non-Error types are not assignable
        orThrow(err('not-an-error' as never) as IResultOfT<number, string>);
    });

    it('orThrowWith accepts unconstrained E and requires (e: E) => Error (Group B)', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = orThrowWith((_e: string): Error => new Error('wrapped'), input);
        expectTypeOf(result).toBeNumber();
    });
});
