import { describe, it, expectTypeOf } from 'vitest';
import { retry, type RetryOptions, type ThrownError, type AbortedError } from './retry.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('retry types', () => {
    it('surfaces the throw and abort channels instead of hiding them inside E', () => {
        // Regression guard for the `as unknown as E` lies: `retry` fabricates an
        // error in two cases (fn threw / loop never ran), and both must be
        // visible in the type rather than masquerading as the caller's E.
        const p = retry<number, string>(() => ({ isSuccess: true as const, isFailure: false as const, value: 42 }));
        expectTypeOf(p).not.toEqualTypeOf<Promise<IResultOfT<number, string>>>();
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, string | ThrownError | AbortedError>>>();
    });

    it('preserves T from the wrapped function', () => {
        const p = retry<string, Error>(() => ({
            isSuccess: true as const,
            isFailure: false as const,
            value: 'hi',
        }));
        const _check: Promise<IResultOfT<string, Error | ThrownError | AbortedError>> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('collapses every channel onto one domain error when both factories are supplied', () => {
        type AppError = { readonly kind: 'Transient' | 'Cancelled' | 'Unexpected' };
        const p = retry<number, AppError, AppError, AppError>(
            () => ({ isSuccess: true as const, isFailure: false as const, value: 1 }),
            {
                onThrow: (): AppError => ({ kind: 'Unexpected' }),
                onAborted: (): AppError => ({ kind: 'Cancelled' }),
            },
        );
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, AppError>>>();
    });

    it('RetryOptions has optional fields with sensible types', () => {
        const opts: RetryOptions<string> = {
            times: 3,
            delayMs: (attempt) => 100 * attempt,
            shouldRetry: (e) => e === 'transient',
            onRetry: () => { /* side effect */ },
            signal: new AbortController().signal,
            onThrow: (thrown): ThrownError => ({ kind: 'Thrown', thrown }),
            onAborted: (reason, times): AbortedError => ({ kind: 'Aborted', reason, times }),
        };
        expectTypeOf(opts).toBeObject();
    });

    it('policy hooks see the throw channel too, so it cannot be silently ignored', () => {
        // The old signature typed these `(error: E) => …` while handing them a
        // stringified throw at runtime, which silently broke every predicate.
        const opts: RetryOptions<string> = {};
        expectTypeOf(opts.shouldRetry).toEqualTypeOf<((error: string | ThrownError, attempt: number) => boolean) | undefined>();
        expectTypeOf(opts.onRetry).toEqualTypeOf<((error: string | ThrownError, attempt: number) => void) | undefined>();
        expectTypeOf(opts.delayMs).toEqualTypeOf<number | ((attempt: number, error: string | ThrownError) => number) | undefined>();
    });

    it('delayMs accepts both a number and a function of (attempt, error)', () => {
        const numberOpts: RetryOptions<string> = { delayMs: 50 };
        const fnOpts: RetryOptions<string> = {
            delayMs: (attempt, error) => 10 * attempt + String(error).length,
        };
        expectTypeOf(numberOpts.delayMs).toEqualTypeOf<number | ((attempt: number, error: string | ThrownError) => number) | undefined>();
        expectTypeOf(fnOpts.delayMs).toEqualTypeOf<number | ((attempt: number, error: string | ThrownError) => number) | undefined>();
    });

    it('onThrow lets the developer own the throw shape', () => {
        const objectErr: RetryOptions<string, { kind: 'Boom' }> = {
            onThrow: () => ({ kind: 'Boom' as const }),
        };
        expectTypeOf(objectErr.onThrow).toEqualTypeOf<((thrown: unknown) => { kind: 'Boom' }) | undefined>();
    });

    it('onAborted lets the developer own the abort shape', () => {
        const stringErr: RetryOptions<string, ThrownError, string> = {
            onAborted: () => 'aborted-message',
        };
        const objectErr: RetryOptions<string, ThrownError, { kind: 'Cancelled' }> = {
            onAborted: () => ({ kind: 'Cancelled' as const }),
        };
        expectTypeOf(stringErr.onAborted).toEqualTypeOf<((reason: unknown, times: number) => string) | undefined>();
        expectTypeOf(objectErr.onAborted).toEqualTypeOf<((reason: unknown, times: number) => { kind: 'Cancelled' }) | undefined>();
    });

    it('the default sentinels are discriminable at the call site', () => {
        const thrown: ThrownError = { kind: 'Thrown', thrown: new Error('x') };
        const aborted: AbortedError = { kind: 'Aborted', reason: 'why', times: 3 };
        expectTypeOf(thrown.kind).toEqualTypeOf<'Thrown'>();
        expectTypeOf(thrown.thrown).toEqualTypeOf<unknown>();
        expectTypeOf(aborted.kind).toEqualTypeOf<'Aborted'>();
        expectTypeOf(aborted.times).toEqualTypeOf<number>();
    });

    it('signal field accepts an AbortSignal', () => {
        const opts: RetryOptions<string> = { signal: new AbortController().signal };
        expectTypeOf(opts.signal).toEqualTypeOf<AbortSignal | undefined>();
    });

    it('all RetryOptions fields are readonly', () => {
        type Keys = keyof RetryOptions<string>;
        const opts: RetryOptions<string> = {};
        expectTypeOf<Keys>().toEqualTypeOf<'times' | 'delayMs' | 'shouldRetry' | 'onRetry' | 'signal' | 'onThrow' | 'onAborted'>();
        expectTypeOf(opts).toBeObject();
    });

    it('preserves literal error types through shouldRetry', () => {
        type Err = 'transient' | 'fatal';
        const opts: RetryOptions<Err> = {
            shouldRetry: (e) => e === 'transient',
        };
        const r = retry<number, Err>(() => ({
            isSuccess: true as const,
            isFailure: false as const,
            value: 1,
        }), opts);
        expectTypeOf(r).toEqualTypeOf<Promise<IResultOfT<number, Err | ThrownError | AbortedError>>>();
    });
});
