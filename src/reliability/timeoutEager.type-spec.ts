import { describe, it, expectTypeOf } from 'vitest';
import { timeoutEager } from './timeoutEager.js';
import { type TimeoutError } from './timeout.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('timeoutEager types', () => {
    it('returns Promise<IResultOfT<T, E | TimeoutError>>', async () => {
        const p = timeoutEager<number, never>(1000, () => Promise.resolve({
            isSuccess: true as const,
            isFailure: false as const,
            value: 42,
        }));
        const _check: Promise<IResultOfT<number, never | TimeoutError>> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from fn return', async () => {
        const p = timeoutEager<string, Error>(1000, () => Promise.resolve({
            isSuccess: true as const,
            isFailure: false as const,
            value: 'hi',
        }));
        const _check: Promise<IResultOfT<string, Error | TimeoutError>> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('onTimeout factory narrows TOE', async () => {
        type CustomError = { kind: 'CustomTimeout'; ms: number };
        const p = timeoutEager<number, never, CustomError>(
            1000,
            () => Promise.resolve({ isSuccess: true as const, isFailure: false as const, value: 42 }),
            (ms): CustomError => ({ kind: 'CustomTimeout', ms }),
        );
        const _check: Promise<IResultOfT<number, never | CustomError>> = p;
        expectTypeOf(_check).toBeObject();
    });
});
