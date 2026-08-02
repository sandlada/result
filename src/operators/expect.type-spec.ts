import { describe, it, expectTypeOf } from 'vitest';
import { expect } from './expect.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('expect types', () => {
    it('curried form returns the success value type', () => {
        const fn = expect<number, Error>('value required');
        const _check: (r: IResultOfT<number, Error>) => number = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the success value type', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = expect('value required', input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });

    it('preserves the literal success type (Group B)', () => {
        const input = ok('literal' as const) as IResultOfT<'literal', Error>;
        const result = expect('msg', input);
        const _check: 'literal' = result;
        expectTypeOf(_check).toEqualTypeOf<'literal'>();
    });
});
