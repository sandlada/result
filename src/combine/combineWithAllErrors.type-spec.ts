import { describe, it, expectTypeOf } from 'vitest';
import { combineWithAllErrors } from './combineWithAllErrors.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('combineWithAllErrors types', () => {
    it('returns IResultOfT<A[], E[]> for homogeneous array', () => {
        const r = combineWithAllErrors([ok(1), ok(2), ok(3)]);
        const _check: IResultOfT<number[], never[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves A and E from input', () => {
        const r = combineWithAllErrors<number, string>([]);
        const _check: IResultOfT<number[], string[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IResultOfT<A[], E[]> on accumulated failures', () => {
        const r = combineWithAllErrors([ok(1), err<string>('a'), err<string>('b')]);
        const _check: IResultOfT<number[], string[]> = r;
        expectTypeOf(_check).toBeObject();
    });
});
