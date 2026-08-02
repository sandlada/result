import { describe, it, expectTypeOf } from 'vitest';
import { mapErr } from './mapErr.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapErr types', () => {
    it('curried form returns a function', () => {
        const fn = mapErr<number, string, number>((e) => e.length);
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<T, F>>', () => {
        const fn = mapErr<number, string, number>((e) => e.length);
        const r = fn(asyncOk<number>(42));
        const _check: Promise<IResultOfT<number, number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<T, F>>', () => {
        const r = mapErr(
            (e: string) => e.toUpperCase(),
            asyncErr<string>('boom'),
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form — string-to-number transform', () => {
        const r = mapErr((e: string) => e.length, asyncErr<string>('boom'));
        const _check: Promise<IResultOfT<number, number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
