import { describe, it, expectTypeOf } from 'vitest';
import { retry, type RetryOptions } from './retry.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('retry types', () => {
    it('returns Promise<IResultOfT<T, E>>', async () => {
        const p = retry<number, string>(() => ({ isSuccess: true as const, isFailure: false as const, value: 42 }));
        const _check: Promise<IResultOfT<number, string>> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T from the wrapped function', async () => {
        const p = retry<string, Error>(() => ({
            isSuccess: true as const,
            isFailure: false as const,
            value: 'hi',
        }));
        const _check: Promise<IResultOfT<string, Error>> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('RetryOptions has optional fields with sensible types', () => {
        const opts: RetryOptions<string> = {
            times: 3,
            delayMs: (attempt) => 100 * attempt,
            shouldRetry: (e) => e === 'transient',
            onRetry: () => { /* side effect */ },
            signal: new AbortController().signal,
        };
        expectTypeOf(opts).toBeObject();
    });
});
