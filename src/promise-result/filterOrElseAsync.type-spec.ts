import { describe, it, expectTypeOf } from 'vitest';
import { filterOrElseAsync } from './filterOrElseAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('filterOrElseAsync types', () => {
    it('curried form returns a function', () => {
        const fn = filterOrElseAsync<number, string>(
            (x) => x > 0,
            (x) => `${x} not positive`,
        );
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, E>>', () => {
        const fn = filterOrElseAsync<number, string>(
            (x) => x > 0,
            (x) => `${x} bad`,
        );
        const r = fn(asyncOk<number>(42));
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, E>>', () => {
        const r = filterOrElseAsync(
            (x: number) => x > 0,
            (x: number) => `${x} not positive`,
            asyncOk<number>(42),
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = filterOrElseAsync<number, string>(
            (x) => x > 0,
            (x) => `${x} bad`,
            asyncOk<number>(42),
        );
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
