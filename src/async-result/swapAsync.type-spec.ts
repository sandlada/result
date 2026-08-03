import { describe, it, expectTypeOf } from 'vitest';
import { swapAsync } from './swapAsync.js';
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('swapAsync types', () => {
    it('returns AsyncResult<E, T> when source is AsyncResult<T, E>', () => {
        const r = swapAsync(fromResult(ok(5) as unknown as IResultOfT<number, string>));
        const _check: AsyncResult<string, number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('double swap restores AsyncResult<T, E>', () => {
        const r = swapAsync(swapAsync(fromResult(ok(42) as IResultOfT<number, string>)));
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, string>>();
    });

    it('double swap restores AsyncResult<T, E> even on failure input', () => {
        const r = swapAsync(swapAsync(fromResult(err<number, string>('orig'))));
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, string>>();
    });

    it('preserves structured payload types through swap', () => {
        type VErr = { code: number };
        const r = swapAsync(fromResult(err<number, VErr>({ code: 0 })));
        expectTypeOf(r).toEqualTypeOf<AsyncResult<VErr, number>>();
    });
});
