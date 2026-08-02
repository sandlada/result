import { describe, it, expectTypeOf } from 'vitest';
import { swapAsync } from './swapAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('swapAsync types', () => {
    it('returns Promise<IResultOfT<E, A>> from Promise<IResultOfT<A, E>>', () => {
        const r = swapAsync(asyncOk<number>(42));
        const _check: Promise<IResultOfT<string, number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('swaps Ok case: Promise<IResultOfT<E, A>>', () => {
        const r = swapAsync(asyncOk<number>(42));
        const _check: Promise<IResultOfT<string, number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input — swapped positions', () => {
        const r = swapAsync(asyncOk<number>(42));
        const _check: Promise<IResultOfT<string, number>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('swaps Err case: Promise<IResultOfT<E, A>>', () => {
        const r = swapAsync(asyncErr<string>('boom'));
        const _check: Promise<IResultOfT<string, number>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
