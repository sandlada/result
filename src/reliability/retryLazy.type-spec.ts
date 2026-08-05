import { describe, it, expectTypeOf } from 'vitest';
import { retryLazy } from './retryLazy.js';
import type { ThrownError, AbortedError } from './retry.js';
import { fromResult } from '../async-result/index.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('retryLazy types', () => {
    it('mirrors retry’s throw and abort channels', () => {
        const ar = retryLazy(fromResult(ok(42)));
        const _check: AsyncResult<number, ThrownError | AbortedError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input AsyncResult', () => {
        const ar = retryLazy<string, Error>(fromResult(ok('hi')));
        const _check: AsyncResult<string, Error | ThrownError | AbortedError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves literal error types through retryLazy', () => {
        type Err = 'transient' | 'fatal';
        const ar = retryLazy<number, Err>(fromResult(ok(1)));
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, Err | ThrownError | AbortedError>>();
    });

    it('collapses both channels when onThrow and onAborted are supplied', () => {
        type AppError = { readonly kind: 'Boom' | 'Cancelled' };
        const ar = retryLazy<number, AppError, AppError, AppError>(fromResult(ok(1)), {
            onThrow: (): AppError => ({ kind: 'Boom' }),
            onAborted: (): AppError => ({ kind: 'Cancelled' }),
        });
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, AppError>>();
    });

    it('RetryOptions parameter is optional — defaults to {}', () => {
        const ar = retryLazy(fromResult(ok(1)));
        const _check: AsyncResult<number, ThrownError | AbortedError> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('the returned AsyncResult has a .run() method (and nothing else is required)', () => {
        const ar = retryLazy(fromResult(ok(7)));
        expectTypeOf(ar.run).toBeFunction();
    });
});
