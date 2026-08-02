import { describe, it, expectTypeOf } from 'vitest';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
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
});
