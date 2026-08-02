import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOrElseAsync } from './unwrapOrElseAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrapOrElseAsync types', () => {
    it('curried form returns a function', () => {
        const fn = unwrapOrElseAsync<number, string>((e) => Promise.resolve(0));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<A>', () => {
        const fn = unwrapOrElseAsync<number, string>((e) => Promise.resolve(0));
        const r = fn(asyncOk<number>(42));
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<A>', () => {
        const r = unwrapOrElseAsync(
            (e: string) => Promise.resolve(0),
            asyncOk<number>(42),
        );
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = unwrapOrElseAsync<number, string>(
            (e) => Promise.resolve(0),
            asyncOk<number>(42),
        );
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
