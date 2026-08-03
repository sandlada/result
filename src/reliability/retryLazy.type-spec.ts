import { describe, it, expectTypeOf } from 'vitest';
import { retryLazy } from './retryLazy.js';
import { fromResult } from '../async-result/index.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('retryLazy types', () => {
    it('returns AsyncResult<T, E>', () => {
        const ar = retryLazy(fromResult(ok(42)));
        const _check: AsyncResult<number, never> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input AsyncResult', () => {
        const ar = retryLazy<string, Error>(fromResult(ok('hi')));
        const _check: AsyncResult<string, Error> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves literal error types through retryLazy', () => {
        type Err = 'transient' | 'fatal';
        const ar = retryLazy<number, Err>(fromResult(ok(1)));
        const _check: AsyncResult<number, Err> = ar;
        expectTypeOf(_check).toEqualTypeOf<AsyncResult<number, Err>>();
    });

    it('RetryOptions parameter is optional — defaults to {}', () => {
        const ar = retryLazy(fromResult(ok(1)));
        const _check: AsyncResult<number, never> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('the returned AsyncResult has a .run() method (and nothing else is required)', () => {
        const ar = retryLazy(fromResult(ok(7)));
        expectTypeOf(ar.run).toBeFunction();
    });
});
