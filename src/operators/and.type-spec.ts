import { describe, it, expectTypeOf } from 'vitest';
import { and } from './and.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('and types', () => {
    it('curried form returns a function that widens the error type', () => {
        const other = ok('next') as IResultOfT<string, RangeError>;
        const fn = and(other);
        const _check: (r: IResultOfT<number, TypeError>) => IResultOfT<string, TypeError | RangeError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form uses the other success type', () => {
        const input = err(new TypeError('boom')) as IResultOfT<number, TypeError>;
        const other = ok('next') as IResultOfT<string, RangeError>;
        const result = and(other, input);
        const _check: IResultOfT<string, TypeError | RangeError> = result;
        expectTypeOf(_check).toBeObject();
    });
});
