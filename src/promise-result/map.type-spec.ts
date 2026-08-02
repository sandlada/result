import { describe, it, expectTypeOf } from 'vitest';
import { map } from './map.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('map types', () => {
    it('curried form returns a function', () => {
        const fn = map((x: number) => x.toString());
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<B, E>>', () => {
        const fn = map((x: number) => x.toString());
        const r = fn(asyncOk(21));
        const _check: Promise<IResultOfT<string, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<B, E>>', () => {
        const r = map((x: number) => x.toString(), asyncOk<number>(21));
        const _check: Promise<IResultOfT<string, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form — string mapper', () => {
        const r = map((s: string) => s.length, asyncOk<string>('hi'));
        const _check: Promise<IResultOfT<number, number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
