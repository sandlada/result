import { describe, it, expectTypeOf } from 'vitest';
import { tapAsync } from './tapAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tapAsync types', () => {
    it('curried form returns a function', () => {
        const fn = tapAsync((x: number) => undefined);
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, E>>', () => {
        const fn = tapAsync((x: number) => undefined);
        const r = fn(asyncOk(42));
        const _check: Promise<IResultOfT<number, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, E>>', () => {
        const r = tapAsync(
            (x: number) => undefined,
            asyncOk<number>(42),
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = tapAsync<number, string>(
            (x) => undefined,
            asyncOk<number>(42),
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
