import { describe, it, expectTypeOf } from 'vitest';
import { bindAsync } from './bindAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('bindAsync types', () => {
    it('curried form returns a function', () => {
        const fn = bindAsync<number, string, string>((x) => asyncOk<string>(`${x}`));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<B, E | F>>', () => {
        const fn = bindAsync<number, string, string>((x) => asyncOk<string>(`${x}`));
        const r = fn(asyncOk<number>(21));
        const _check: Promise<IResultOfT<string, string | never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<B, E | F>>', () => {
        const r = bindAsync(
            (x: number) => asyncOk<string>(`${x}`),
            asyncOk<number>(21),
        );
        const _check: Promise<IResultOfT<string, string | never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = bindAsync(
            (x: number) => asyncOk<string>(`${x}`),
            asyncOk<number>(21),
        );
        const _check: Promise<IResultOfT<string, string | boolean>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
