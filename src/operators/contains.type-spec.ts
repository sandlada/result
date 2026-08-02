import { describe, it, expectTypeOf } from 'vitest';
import { contains } from './contains.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('contains types', () => {
    it('curried form accepts any error type and returns boolean', () => {
        const fn = contains(42);
        const _check: (r: IResultOfT<number, Error>) => boolean = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns boolean', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = contains(42, input);
        const _check: boolean = result;
        expectTypeOf(_check).toBeBoolean();
    });
});
