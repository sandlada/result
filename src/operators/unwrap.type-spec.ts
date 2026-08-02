import { describe, it, expectTypeOf } from 'vitest';
import { unwrap } from './unwrap.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrap types', () => {
    it('returns the success value type', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = unwrap(input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });

    it('is independent of the error type', () => {
        const input = ok('value') as IResultOfT<string, Error>;
        const result = unwrap(input);
        const _check: string = result;
        expectTypeOf(_check).toBeString();
    });
});
