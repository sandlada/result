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
});
