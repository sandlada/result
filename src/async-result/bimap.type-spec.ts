import { describe, it, expectTypeOf } from 'vitest';
import { bimap } from './bimap.js';
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('bimap types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<U, F>', () => {
        const fn = bimap(
            (v: number) => v.toString(),
            (e: number) => e.toString(),
        );
        const _check: (ar: AsyncResult<number, number>) => AsyncResult<string, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<U, F>', () => {
        const ar: AsyncResult<number, number> = fromResult(ok(5) as IResultOfT<number, number>);
        const r = bimap(
            (v: number) => v.toString(),
            (e: number) => e.toString(),
            ar,
        );
        const _check: AsyncResult<string, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves U from onOk and F from onErr', () => {
        const fn = bimap(
            (s: string) => s.length,
            (e: boolean) => (e ? 't' : 'f'),
        );
        const _check: (ar: AsyncResult<string, boolean>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form widens U and F independently', () => {
        const ar: AsyncResult<number, string> = fromResult(ok(42) as IResultOfT<number, string>);
        const r = bimap(
            (v: number) => v.toString(),
            (e: string) => e.length,
            ar,
        );
        expectTypeOf(r).toEqualTypeOf<AsyncResult<string, number>>();
    });

    it('accepts async handlers in both onOk and onErr', () => {
        const fn = bimap(
            async (v: number) => v.toString(),
            async (e: number) => e.toString(),
        );
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form accepts structured error types', () => {
        type VErr = { code: number };
        const fn = bimap<string, VErr, number, string>(
            (s: string) => s.length,
            (e: VErr) => `${e.code}`,
        );
        const _check: (ar: AsyncResult<string, VErr>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
