import { describe, it, expectTypeOf } from 'vitest';
import { combineWithAllErrors } from './combineWithAllErrors.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('combineWithAllErrors types', () => {
    it('returns Promise<IResultOfT<A[], E[]>> for homogeneous array', () => {
        const r = combineWithAllErrors([asyncOk(1), asyncOk(2), asyncOk(3)]);
        const _check: Promise<IResultOfT<number[], never[]>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from input array as E[] in failure', () => {
        const r = combineWithAllErrors<number, string>([asyncOk(1), asyncOk(2)]);
        const _check: Promise<IResultOfT<number[], string[]>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns Promise<IResultOfT<A[], E[]>> on failure', () => {
        const r = combineWithAllErrors([asyncOk(1), asyncErr<string>('a'), asyncErr<string>('b')]);
        const _check: Promise<IResultOfT<number[], string[]>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input', () => {
        const r = combineWithAllErrors<number, string>([asyncOk(1), asyncOk(2)]);
        const _check: Promise<IResultOfT<number[], string[]>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
