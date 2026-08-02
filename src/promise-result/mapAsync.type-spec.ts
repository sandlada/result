import { describe, it, expectTypeOf } from 'vitest';
import { mapAsync } from './mapAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapAsync types', () => {
    it('curried form returns a function', () => {
        const fn = mapAsync((x: number) => Promise.resolve(x.toString()));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<B, E>>', () => {
        const fn = mapAsync((x: number) => Promise.resolve(x.toString()));
        const r = fn(asyncOk(42));
        const _check: Promise<IResultOfT<string, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<B, E>>', () => {
        const r = mapAsync(
            (x: number) => Promise.resolve(x.toString()),
            asyncOk<number>(42),
        );
        const _check: Promise<IResultOfT<string, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = mapAsync(
            (x: number) => Promise.resolve(x.toString()),
            asyncOk<number>(42),
        );
        const _check: Promise<IResultOfT<string, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
