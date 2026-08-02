import { describe, it, expectTypeOf } from 'vitest';
import { mapAsync } from './mapAsync.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapAsync types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<U, E>', () => {
        const fn = mapAsync<number, string, string>((x: number) => x.toString());
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<string, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from wrapped function return (sync)', () => {
        const fn = mapAsync<string, number, string>((s: string) => s.length);
        const _check: (ar: AsyncResult<string, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from wrapped async function return', () => {
        const fn = mapAsync<string, number, string>(async (s: string) => s.length);
        const _check: (ar: AsyncResult<string, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<U, E>', () => {
        const r = mapAsync(
            (x: number) => x * 2,
            fromResult(ok(21) as unknown as IResultOfT<number, string>),
        );
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
