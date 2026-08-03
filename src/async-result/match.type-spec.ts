import { describe, it, expectTypeOf } from 'vitest';
import { match } from './match.js';
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('match types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<U>', () => {
        const fn = match({
            ok: (v: number) => `got ${v}`,
            err: (e: string) => `error: ${e}`,
        });
        const _check: (ar: AsyncResult<number, string>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const r = match(
            { ok: (x: number) => `got ${x}`, err: (e: string) => `error: ${e}` },
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<string>>();
    });

    it('unifies U across ok and err handlers', () => {
        const r = match(
            { ok: (x: number) => x.toString(), err: (e: string) => e.length },
            fromResult(ok(42) as IResultOfT<number, string>),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<number>>();
    });

    it('accepts Promise<U> return types from handlers', () => {
        const r = match(
            { ok: (x: number) => Promise.resolve(x.toString()), err: (e: string) => Promise.resolve(e.length) },
            fromResult(ok(1) as IResultOfT<number, string>),
        );
        expectTypeOf(r).toEqualTypeOf<Promise<string | number>>();
    });
});
