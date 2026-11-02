import { describe, it, expectTypeOf } from 'vitest';
import { map } from './map.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('map types', () => {
    it('curried form returns a function', () => {
        const fn = map((x: number) => Promise.resolve(x.toString()));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<B, E>>', () => {
        const fn = map((x: number) => Promise.resolve(x.toString()));
        const r = fn(ok(21));
        const _check: Promise<IResultOfT<string, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<B, E>>', () => {
        const r = map((x: number) => Promise.resolve(x.toString()), ok<number>(21));
        const _check: Promise<IResultOfT<string, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = map((x: number) => Promise.resolve(x.toString()), ok<number>(42));
        const _check: Promise<IResultOfT<string, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
