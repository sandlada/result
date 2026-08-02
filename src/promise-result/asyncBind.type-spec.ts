import { describe, it, expectTypeOf } from 'vitest';
import { asyncBind } from './asyncBind.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncBind types', () => {
    it('curried form returns a function', () => {
        const fn = asyncBind((x: number) => Promise.resolve(ok<number>(x * 2)));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<B, F>>', () => {
        const fn = asyncBind((x: number) => Promise.resolve(ok<number>(x * 2)));
        const r = fn(ok(21));
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<B, F>>', () => {
        const r = asyncBind((x: number) => Promise.resolve(ok<number>(x * 2)), ok(21));
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and F from input on direct form', () => {
        const f = (x: number) => Promise.resolve(ok<number>(x * 2));
        const r = asyncBind(f, ok<number>(21));
        const _check: Promise<IResultOfT<number, boolean>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
