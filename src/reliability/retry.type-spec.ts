import { describe, it, expectTypeOf } from 'vitest';
import { retry, type RetryOptions } from './retry.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('retry types', () => {
    it('returns Promise<IResultOfT<T, E>> (E preserved — no library-defined widening)', async () => {
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
            // Developer defines their own error shape here. With `E = string`,
            // the factory must return a string.
            onAborted: () => 'aborted',
        };
        expectTypeOf(opts).toBeObject();
    });

    it('delayMs accepts both a number and a function of (attempt, error)', () => {
        const numberOpts: RetryOptions<string> = { delayMs: 50 };
        const fnOpts: RetryOptions<string> = {
            delayMs: (attempt: number, error: string) => 10 * attempt + error.length,
        };
        expectTypeOf(numberOpts.delayMs).toEqualTypeOf<number | ((attempt: number, error: string) => number) | undefined>();
        expectTypeOf(fnOpts.delayMs).toEqualTypeOf<number | ((attempt: number, error: string) => number) | undefined>();
    });

    it('shouldRetry predicate receives (error, attempt) and returns boolean', () => {
        const opts: RetryOptions<string> = {
            shouldRetry: (error: string, attempt: number): boolean => attempt < 3 && error === 'transient',
        };
        expectTypeOf(opts.shouldRetry).toEqualTypeOf<((error: string, attempt: number) => boolean) | undefined>();
    });

    it('onRetry hook receives (error, attempt) and may return void', () => {
        const opts: RetryOptions<string> = {
            onRetry: (error: string, attempt: number): void => { void error; void attempt; },
        };
        expectTypeOf(opts.onRetry).toEqualTypeOf<((error: string, attempt: number) => void) | undefined>();
    });

    it('onAborted factory is typed to return E (developer owns the shape)', () => {
        const stringErr: RetryOptions<string> = {
            // The factory's return type matches the surrounding E (`string`).
            onAborted: () => 'aborted-message',
        };
        const numberErr: RetryOptions<number> = {
            onAborted: () => 42,
        };
        const objectErr: RetryOptions<{ kind: 'Aborted' }> = {
            onAborted: () => ({ kind: 'Aborted' as const }),
        };
        expectTypeOf(stringErr.onAborted).toEqualTypeOf<((reason: unknown, times: number) => string) | undefined>();
        expectTypeOf(numberErr.onAborted).toEqualTypeOf<((reason: unknown, times: number) => number) | undefined>();
        expectTypeOf(objectErr.onAborted).toEqualTypeOf<((reason: unknown, times: number) => { kind: 'Aborted' }) | undefined>();
    });

    it('signal field accepts an AbortSignal', () => {
        const opts: RetryOptions<string> = { signal: new AbortController().signal };
        expectTypeOf(opts.signal).toEqualTypeOf<AbortSignal | undefined>();
    });

    it('all RetryOptions fields are readonly', () => {
        type Keys = keyof RetryOptions<string>;
        // The fields are typed `readonly?` — verify the structural shape.
        const opts: RetryOptions<string> = {};
        expectTypeOf<Keys>().toEqualTypeOf<'times' | 'delayMs' | 'shouldRetry' | 'onRetry' | 'signal' | 'onAborted'>();
        expectTypeOf(opts).toBeObject();
    });

    it('preserves literal error types through shouldRetry', () => {
        type Err = 'transient' | 'fatal';
        const opts: RetryOptions<Err> = {
            shouldRetry: (e): e is 'transient' => e === 'transient',
        };
        const r = retry<number, Err>(() => ({
            isSuccess: true as const,
            isFailure: false as const,
            value: 1,
        }), opts);
        expectTypeOf(r).toEqualTypeOf<Promise<IResultOfT<number, Err>>>();
    });
});
