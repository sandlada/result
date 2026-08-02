import { describe, it, expectTypeOf } from 'vitest';
import { bimapAsync } from './bimapAsync.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('bimapAsync types', () => {
    it('curried form returns a function', () => {
        const fn = bimapAsync(
            (x: number) => x.toString(),
            (e: string) => e.length,
        );
        const _check: (r: Promise<IResultOfT<number, string>>) => Promise<IResultOfT<string, number>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<B, F>>', () => {
        const fn = bimapAsync(
            (x: number) => x.toString(),
            (e: string) => e.length,
        );
        const r = fn(Promise.resolve(ok<number>(21) as IResultOfT<number, string>));
        const _check: Promise<IResultOfT<string, number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<B, F>>', () => {
        const r = bimapAsync(
            (x: number) => x.toString(),
            (e: string) => e.length,
            Promise.resolve(ok<number>(21) as IResultOfT<number, string>),
        );
        const _check: Promise<IResultOfT<string, number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = bimapAsync(
            (x: number) => x.toString(),
            (e: string) => e.length,
            Promise.resolve(ok<number>(42) as IResultOfT<number, string>),
        );
        const _check: Promise<IResultOfT<string, number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});

