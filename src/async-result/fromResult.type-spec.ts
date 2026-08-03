import { describe, it, expectTypeOf } from 'vitest';
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('fromResult types', () => {
    it('returns AsyncResult<T, E>', () => {
        const result = { isSuccess: true as const, isFailure: false as const, value: 42 } as IResultOfT<number, string>;
        const ar = fromResult(result);
        const _check: AsyncResult<number, string> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('returns AsyncResult<T> defaulting E to unknown', () => {
        const ar = fromResult(ok(42) as IResultOfT<number, never>);
        const _check: AsyncResult<number, unknown> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves structured error type from a failure input', () => {
        type VErr = { field: string; message: string };
        const failure = { isSuccess: false as const, isFailure: true as const, error: { field: 'name', message: 'required' } } as IResultOfT<number, VErr>;
        const ar = fromResult(failure);
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, VErr>>();
    });

    it('unifies with the AsyncResult shape produced by `from`', () => {
        const okInput = ok(42) as IResultOfT<number, string>;
        const ar = fromResult(okInput);
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, string>>();
    });

    it('supports Err narrowing via generic E', () => {
        const failure = err<string, number>(7) as IResultOfT<string, number>;
        const ar = fromResult(failure);
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<string, number>>();
    });
});
