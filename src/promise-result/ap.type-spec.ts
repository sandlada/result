import { describe, it, expectTypeOf } from 'vitest';
import { ap } from './ap.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('ap types', () => {
    it('curried form returns a function', () => {
        const fn = ap(asyncOk((x: number) => x.toString()));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<B, E>>', () => {
        const fn = ap(asyncOk((x: number) => x.toString()));
        const r = fn(asyncOk(21));
        const _check: Promise<IResultOfT<string, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<B, E>>', () => {
        const r = ap(asyncOk((x: number) => x * 2), asyncOk(21));
        const _check: Promise<IResultOfT<number, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const fnResult = asyncOk((x: number) => x.toString()) as Promise<IResultOfT<(a: number) => string, string>>;
        const value = asyncOk(21) as Promise<IResultOfT<number, string>>;
        const r = ap(fnResult, value);
        const _check: Promise<IResultOfT<string, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
