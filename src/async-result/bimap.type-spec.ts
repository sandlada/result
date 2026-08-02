import { describe, it, expectTypeOf } from 'vitest';
import { bimap } from './bimap.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
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
});
