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

    it('onTimeout is optional — defaults to TimeoutError factory', async () => {
        const p = timeoutEager<number, never>(1000, () => Promise.resolve({
            isSuccess: true as const,
            isFailure: false as const,
            value: 1,
        }));
        const _check: Promise<IResultOfT<number, never | TimeoutError>> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves literal error types through the union E | TOE', async () => {
        type Err = 'upstream-boom';
        const p = timeoutEager<number, Err, TimeoutError>(
            1000,
            () => Promise.resolve({ isSuccess: true as const, isFailure: false as const, value: 1 }),
        );
        const _check: Promise<IResultOfT<number, Err | TimeoutError>> = p;
        expectTypeOf(_check).toEqualTypeOf<Promise<IResultOfT<number, Err | TimeoutError>>>();
    });

    it('fn signature is () => Promise<IResultOfT<T, E>> — not AsyncResult', async () => {
        // timeoutEager takes the eager form: a function that already returns
        // a Promise, NOT a thunk with .run().
        const fn: () => Promise<IResultOfT<number, string>> = () => Promise.resolve({
            isSuccess: true as const,
            isFailure: false as const,
            value: 1,
        });
        const p = timeoutEager(1000, fn);
        const _check: Promise<IResultOfT<number, string | TimeoutError>> = p;
        expectTypeOf(_check).toBeObject();
    });
});
