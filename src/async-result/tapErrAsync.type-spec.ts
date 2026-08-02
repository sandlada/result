import { describe, it, expectTypeOf } from 'vitest';
import { tapErrAsync } from './tapErrAsync.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tapErrAsync types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, E>', () => {
        const fn = tapErrAsync<number, string>(async (e: string) => {
            await Promise.resolve();
        });
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T and E', () => {
        const fn = tapErrAsync<string, number>(async (e: number) => {
            await Promise.resolve(e);
        });
        const _check: (ar: AsyncResult<string, number>) => AsyncResult<string, number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E>', () => {
        const r = tapErrAsync<number, string>(
            async (e: string) => {
                await Promise.resolve();
            },
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
