import { describe, it, expectTypeOf } from 'vitest';
import { match } from './match.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('match types', () => {
    it('curried form returns a function', () => {
        const fn = match<number, string, string>({
            ok: (x) => `got ${x}`,
            err: (e) => `err: ${e}`,
        });
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied returns Promise<U>', () => {
        const fn = match<number, string, string>({
            ok: (x) => `got ${x}`,
            err: (e) => `err: ${e}`,
        });
        const r = fn(ok<number>(42));
        const _check: Promise<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('direct form returns Promise<U>', () => {
        const handlers = {
            ok: (x: number) => `got ${x}`,
            err: (e: string) => `err: ${e}`,
        };
        const r = match(handlers, ok<number>(42));
        const _check: Promise<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form', () => {
        const r = match<number, string, number>(
            { ok: (x) => x, err: (e) => 0 },
            err<string>('boom'),
        );
        const _check: Promise<number> = r;
        expectTypeOf(_check).toBeObject();
    });
});
