import { describe, it, expectTypeOf } from 'vitest';
import { bindThroughAsync } from './bindThroughAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('bindThroughAsync types', () => {
    it('curried form returns a function', () => {
        const fn = bindThroughAsync<number, void, string>((x) => asyncOk<void>(undefined));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<IResultOfT<A, E | F>>', () => {
        const fn = bindThroughAsync<number, void, string>((x) => asyncOk<void>(undefined));
        const r = fn(asyncOk<number>(21));
        const _check: Promise<IResultOfT<number, string | never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<IResultOfT<A, E | F>>', () => {
        const r = bindThroughAsync(
            (x: number) => asyncOk<void>(undefined),
            asyncOk<number>(21),
        );
        const _check: Promise<IResultOfT<number, string | never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = bindThroughAsync(
            (x: number) => asyncOk<void>(undefined),
            asyncOk<number>(21),
        );
        const _check: Promise<IResultOfT<number, string | boolean>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
