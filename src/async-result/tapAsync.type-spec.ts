import { describe, it, expectTypeOf } from 'vitest';
import { tapAsync } from './tapAsync.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tapAsync types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, E>', () => {
        const fn = tapAsync<number, string>(async (v: number) => {
            await Promise.resolve();
        });
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T and E', () => {
        const fn = tapAsync<string, number>(async (s: string) => {
            await Promise.resolve(s);
        });
        const _check: (ar: AsyncResult<string, number>) => AsyncResult<string, number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E>', () => {
        const r = tapAsync<number, string>(
            async (v: number) => {
                await Promise.resolve();
            },
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
