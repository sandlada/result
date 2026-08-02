import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOr } from './unwrapOr.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrapOr types', () => {
    it('curried form returns a function', () => {
        const fn = unwrapOr<number>(0);
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<A>', () => {
        const fn = unwrapOr<number>(0);
        const r = fn(asyncOk<number>(42));
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<A>', () => {
        const r = unwrapOr(0, asyncOk<number>(42));
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = unwrapOr<number, string>(0, asyncOk<number>(42));
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
