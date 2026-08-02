import { describe, it, expectTypeOf } from 'vitest';
import { mapErrAsync } from './mapErrAsync.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapErrAsync types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, F>', () => {
        const fn = mapErrAsync<number, string, string>(async (e: string) => e.toUpperCase());
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T', () => {
        const fn = mapErrAsync<string, boolean, string>((e: boolean) => (e ? 't' : 'f'));
        const _check: (ar: AsyncResult<string, boolean>) => AsyncResult<string, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, F>', () => {
        const r = mapErrAsync(
            async (e: string) => e.toUpperCase(),
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
