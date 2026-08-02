import { describe, it, expectTypeOf } from 'vitest';
import { exists } from './exists.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('exists types', () => {
    it('curried form accepts any error type and returns boolean', () => {
        const fn = exists((value: number) => value > 0);
        const _check: (r: IResultOfT<number, Error>) => boolean = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns boolean', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = exists((value: number) => value > 0, input);
        const _check: boolean = result;
        expectTypeOf(_check).toBeBoolean();
    });

    it('preserves generic narrowing through the predicate (Group B)', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = exists((value: number) => value > 0, input);
        expectTypeOf(result).toBeBoolean();
    });
});
