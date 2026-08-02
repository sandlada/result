import { describe, it, expectTypeOf } from 'vitest';
import { flatten } from './flatten.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('flatten types', () => {
    it('flattens AsyncResult<AsyncResult<T, E>, E> to AsyncResult<T, E>', () => {
        const inner: AsyncResult<number, string> = fromResult(ok(42) as unknown as IResultOfT<number, string>);
        const outer: AsyncResult<AsyncResult<number, string>, string> = fromResult({ isSuccess: true as const, isFailure: false as const, value: inner } as IResultOfT<AsyncResult<number, string>, string>);
        const r = flatten(outer);
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
