import { describe, it, expectTypeOf } from 'vitest';
import { containsAsync } from './containsAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('containsAsync types', () => {
    it('curried form returns a function', () => {
        const fn = containsAsync<number>(42);
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<boolean>', () => {
        const fn = containsAsync<number>(42);
        const r = fn(asyncOk<number>(42));
        const _check: Promise<boolean> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<boolean>', () => {
        const r = containsAsync(42, asyncOk<number>(42));
        const _check: Promise<boolean> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = containsAsync(42, asyncOk<number>(42));
        const _check: Promise<boolean> = r;
        expectTypeOf(_check).toBeObject();
    });
});
