import { describe, it, expectTypeOf } from 'vitest';
import { timeout, type TimeoutError } from './timeout.js';
import { fromResult } from '../async-result/index.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('timeout types', () => {
    it('returns AsyncResult<T, E | TimeoutError>', () => {
        const ar = timeout(1000, fromResult(ok(42)));
        const _check: AsyncResult<number, never | TimeoutError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input', () => {
        const ar = timeout<string, Error>(1000, fromResult(ok('hi')));
        const _check: AsyncResult<string, Error | TimeoutError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('onTimeout factory can return custom TOE type', () => {
        type CustomError = { kind: 'CustomTimeout'; ms: number };
        const ar = timeout<number, never, CustomError>(
            1000,
            fromResult(ok(42)),
            (ms): CustomError => ({ kind: 'CustomTimeout', ms }),
        );
        const _check: AsyncResult<number, never | CustomError> = ar;
        expectTypeOf(_check).toBeObject();
    });
});
