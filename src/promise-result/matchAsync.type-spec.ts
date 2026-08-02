import { describe, it, expectTypeOf } from 'vitest';
import { matchAsync } from './matchAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('matchAsync types', () => {
    it('curried form returns a function', () => {
        const fn = matchAsync<number, string, string>(
            (x) => `ok: ${x}`,
            (e) => `err: ${e}`,
        );
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<C>', () => {
        const fn = matchAsync<number, string, number>(
            (x) => x,
            (e) => 0,
        );
        const r = fn(asyncOk<number>(42));
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<C>', () => {
        const r = matchAsync(
            (x: number) => `ok: ${x}`,
            (e: string) => `err: ${e}`,
            asyncOk<number>(42),
        );
        const _check: Promise<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = matchAsync<number, string, number>(
            (x) => x,
            (e) => 0,
            asyncOk<number>(42),
        );
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
