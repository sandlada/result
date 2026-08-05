import { describe, it, expect, vi, afterEach } from 'vitest';
import { ok, err } from '../factories/index.js';
import { retry } from './index.js';

describe('retry', () => {
    it('returns immediately on first success', async () => {
        const fn = vi.fn(() => ok(42));
        const r = await retry(fn);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('retries up to times+1 attempts on failures', async () => {
        const sequence: Array<ReturnType<typeof ok> | ReturnType<typeof err>> = [err('a'), err('b'), err('c'), ok(99)];
        let i = 0;
        const fn = vi.fn(() => sequence[i++] ?? ok(0));
        const r = await retry(fn, { times: 5 });
        expect(fn).toHaveBeenCalledTimes(4);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(99);
    });

    it('stops after times attempts', async () => {
        const fn = vi.fn(() => err<string>('always'));
        const r = await retry(fn, { times: 3 });
        expect(fn).toHaveBeenCalledTimes(4);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('always');
    });

    it('respects shouldRetry predicate', async () => {
        const fn = vi.fn(() => err<'fatal' | 'transient'>('transient'));
        const shouldRetry = vi.fn((e: 'fatal' | 'transient', _n: number) => e === 'transient');
        await retry(fn, { times: 4, shouldRetry });
        expect(shouldRetry).toHaveBeenCalledTimes(4);
    });

    it('aborts early when shouldRetry returns false', async () => {
        const fn = vi.fn(() => err<'fatal' | 'transient'>('fatal'));
        const r = await retry(fn, {
            times: 4,
            shouldRetry: (e) => e === 'transient',
        });
        expect(fn).toHaveBeenCalledTimes(1);
        expect(r.isFailure).toBe(true);
    });

    it('calls onRetry before each retry', async () => {
        const onRetry = vi.fn();
        const sequence: Array<ReturnType<typeof ok> | ReturnType<typeof err>> = [err('a'), err('b'), ok(3)];
        let i = 0;
        const fn = vi.fn(() => sequence[i++] ?? ok(0));
        await retry(fn, { times: 5, onRetry });
        expect(onRetry.mock.calls).toEqual([
            ['a', 0],
            ['b', 1],
        ]);
    });

    it('handles async source fn', async () => {
        let i = 0;
        const fn = async () => {
            if (i++ < 2) return err<string>('again');
            return ok(7);
        };
        const r = await retry(fn, { times: 3 });
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(7);
    });

    it('observes delayMs as a function of attempt', async () => {
        const fn = vi.fn(() => err<string>('try'));
        await retry(fn, {
            times: 2,
            delayMs: (n) => 5 * (n + 1),
            onRetry: () => {},
        });
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('times=0 still invokes fn exactly once', async () => {
        const fn = vi.fn(() => err<string>('nope'));
        const r = await retry(fn, { times: 0 });
        expect(fn).toHaveBeenCalledTimes(1);
        expect(r.isFailure).toBe(true);
    });

    it('catches sync throw from fn and converts to Err', async () => {
        const boom = new Error('sync-throw');
        const fn = vi.fn(() => { throw boom; });
        const r = await retry(fn, { times: 1 });
        expect(fn).toHaveBeenCalledTimes(2);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toEqual({ kind: 'Thrown', thrown: boom });
    });

    it('catches promise rejection from fn and converts to Err', async () => {
        const boom = new Error('rejected');
        const fn = vi.fn(async () => { throw boom; });
        const r = await retry(fn, { times: 1 });
        expect(fn).toHaveBeenCalledTimes(2);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toEqual({ kind: 'Thrown', thrown: boom });
    });

    it('preserves an Error subclass instance with an empty message', async () => {
        class CustomBoom extends Error {}
        const fn = vi.fn(() => { throw new CustomBoom(); });
        const r = await retry(fn, { times: 0 });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as { thrown: unknown }).thrown).toBeInstanceOf(CustomBoom);
    });

    it('preserves a non-Error throw value without stringifying it', async () => {
        const fn = vi.fn(() => { throw 'plain string'; });
        const r = await retry(fn, { times: 0 });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as { thrown: unknown }).thrown).toBe('plain string');
    });

    it('does not invoke fn when signal is already aborted', async () => {
        const fn = vi.fn(() => ok(1));
        const controller = new AbortController();
        controller.abort();
        await retry(fn, { times: 3, signal: controller.signal });
        expect(fn).not.toHaveBeenCalled();
    });

    it('aborts during the delay window — fn is not retried', async () => {
        const fn = vi.fn(() => err<string>('try'));
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5);
        const r = await retry(fn, {
            times: 5,
            delayMs: 50,
            signal: controller.signal,
        });
        expect(fn.mock.calls.length).toBeLessThanOrEqual(2);
        expect(r.isFailure).toBe(true);
    });

    describe('with fake timers', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('honors a fixed delayMs between attempts', async () => {
            vi.useFakeTimers();
            const fn = vi.fn(() => err<string>('again'));
            const promise = retry(fn, { times: 2, delayMs: 100 });
            await vi.advanceTimersByTimeAsync(300);
            const r = await promise;
            expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect(r.error).toBe('again');
        });

        it('clamps negative delayMs to zero — retries without delay', async () => {
            vi.useFakeTimers();
            const fn = vi.fn(() => err<string>('try'));
            const promise = retry(fn, { times: 3, delayMs: -100 });
            await vi.advanceTimersByTimeAsync(0);
            const r = await promise;
            expect(fn).toHaveBeenCalledTimes(4);
            expect(r.isFailure).toBe(true);
        });

        it('passes zero-based attempt index and error to the delayMs function', async () => {
            vi.useFakeTimers();
            const errors: string[] = ['a', 'b', 'c'];
            let i = 0;
            const fn = vi.fn(() => err<string>(errors[i++] ?? 'z'));
            const delaysSeen: number[] = [];
            const promise = retry(fn, {
                times: 3,
                delayMs: (attempt, error) => {
                    delaysSeen.push(attempt);
                    expect(error).toBe(errors[attempt]);
                    return 25;
                },
            });
            await vi.advanceTimersByTimeAsync(200);
            await promise;
            expect(delaysSeen).toEqual([0, 1, 2]);
        });

        it('returns early when fn succeeds before all retries are consumed', async () => {
            vi.useFakeTimers();
            const fn = vi.fn(() => ok(99));
            const promise = retry(fn, { times: 5, delayMs: 1000 });
            const r = await promise;
            expect(fn).toHaveBeenCalledTimes(1);
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) expect(r.value).toBe(99);
        });

        it('invokes onRetry with (error, attempt) for each retry attempt', async () => {
            vi.useFakeTimers();
            const fn = vi.fn(() => err<string>('try'));
            const onRetry = vi.fn();
            const promise = retry(fn, { times: 3, delayMs: 10, onRetry });
            await vi.advanceTimersByTimeAsync(100);
            await promise;
            expect(onRetry.mock.calls).toEqual([
                ['try', 0],
                ['try', 1],
                ['try', 2],
            ]);
        });

        it('respects signal aborted during the delay window (fake-timer-driven)', async () => {
            vi.useFakeTimers();
            const fn = vi.fn(() => err<string>('try'));
            const controller = new AbortController();
            const promise = retry(fn, { times: 5, delayMs: 100, signal: controller.signal });
            // Allow the first attempt to run, then abort partway through the delay.
            await vi.advanceTimersByTimeAsync(0);
            controller.abort();
            await vi.advanceTimersByTimeAsync(200);
            const r = await promise;
            expect(fn.mock.calls.length).toBeLessThanOrEqual(2);
            expect(r.isFailure).toBe(true);
        });
    });

    it('is eager — the first invocation of fn happens synchronously when retry is called', () => {
        // Eagerness contract: a synchronous-Ok fn is invoked immediately by `retry`,
        // before any `await` on the returned promise. This mirrors the documented
        // contract and is the difference vs `retryLazy`.
        const fn = vi.fn(() => ok(7));
        const p = retry(fn, { times: 3 });
        expect(fn).toHaveBeenCalledTimes(1);
        // The returned promise has not been awaited yet; the call already happened.
        // Reclaim the value to silence the linter.
        void p;
    });

    it('lastResult error is the final failure error after exhausting all retries', async () => {
        const sequence: Array<ReturnType<typeof ok> | ReturnType<typeof err>> = [err('a'), err('b'), err('c')];
        let i = 0;
        const fn = vi.fn(() => sequence[i++] ?? err('overflow'));
        const r = await retry(fn, { times: 2 });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('c');
    });

    it('returns the Ok from a later attempt and stops immediately', async () => {
        const sequence: Array<ReturnType<typeof ok> | ReturnType<typeof err>> = [err('a'), err('b'), ok('late')];
        let i = 0;
        const fn = vi.fn(() => sequence[i++] ?? ok(0));
        const r = await retry(fn, { times: 5 });
        expect(fn).toHaveBeenCalledTimes(3);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('late');
    });

    it('keeps retrying when shouldRetry returns true (does not invoke after times are exhausted)', async () => {
        const fn = vi.fn(() => err<string>('try'));
        await retry(fn, { times: 2, shouldRetry: () => true });
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('preserves the thrown Error instance (not just its message) for a real Error throw', async () => {
        const boom = new TypeError('bad-type');
        const fn = vi.fn(() => { throw boom; });
        const r = await retry(fn, { times: 0 });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as { thrown: unknown }).thrown).toBe(boom);
    });

    it('preserves a thrown number as a number', async () => {
        const fn = vi.fn(() => { throw 42; });
        const r = await retry(fn, { times: 0 });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as { thrown: unknown }).thrown).toBe(42);
    });

    // ---- Bug 1 contract: never returns undefined ----

    it('returns Err({ kind: "Aborted" }) when signal is already aborted', async () => {
        const fn = vi.fn(() => ok(1));
        const controller = new AbortController();
        controller.abort();
        const r = await retry(fn, { times: 3, signal: controller.signal });
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as { kind?: unknown };
            expect(e.kind).toBe('Aborted');
        }
    });

    it('returns Err({ kind: "Aborted" }) for negative times without invoking fn', async () => {
        const fn = vi.fn(() => ok(1));
        const r = await retry(fn, { times: -1 });
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as { kind?: unknown };
            expect(e.kind).toBe('Aborted');
        }
    });

    it('returns Err({ kind: "Aborted" }) for NaN times without invoking fn', async () => {
        const fn = vi.fn(() => ok(1));
        const r = await retry(fn, { times: Number.NaN });
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as { kind?: unknown };
            expect(e.kind).toBe('Aborted');
        }
    });

    it('honors a custom onAborted factory for pre-aborted signal', async () => {
        const fn = vi.fn(() => ok(1));
        const controller = new AbortController();
        controller.abort();
        const r = await retry(fn, {
            signal: controller.signal,
            onAborted: (reason) => ({ kind: 'Custom', reason }),
        });
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as { kind?: unknown };
            expect(e.kind).toBe('Custom');
        }
    });

    describe('thrown-error identity', () => {
        type DomainError = { readonly kind: 'Transient' | 'Fatal' };

        it('hands shouldRetry a structured error, not a stringified one', async () => {
            const seen: unknown[] = [];
            const fn = () => { throw new Error('boom'); };
            await retry<number, DomainError>(fn, {
                times: 2,
                shouldRetry: (e) => { seen.push(e); return true; },
            });
            expect(seen[0]).toEqual({ kind: 'Thrown', thrown: expect.any(Error) });
        });

        it('keeps retrying a thrown failure when shouldRetry says so', async () => {
            // The stringify-and-cast bug made every predicate that inspected the
            // error shape return false, silently disabling retry on throws.
            const fn = vi.fn(() => { throw new Error('transient-blip'); });
            await retry<number, DomainError>(fn, {
                times: 3,
                shouldRetry: (e) => 'kind' in e && e.kind === 'Thrown',
            });
            expect(fn).toHaveBeenCalledTimes(4);
        });

        it('preserves the original Error instance, stack and cause', async () => {
            const original = new TypeError('bad-type', { cause: 'root-cause' });
            const r = await retry(() => { throw original; }, { times: 0 });
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                const e = r.error as { kind: string; thrown: unknown };
                expect(e.kind).toBe('Thrown');
                expect(e.thrown).toBe(original);
                expect((e.thrown as TypeError).cause).toBe('root-cause');
                expect((e.thrown as TypeError).stack).toBeDefined();
            }
        });

        it('preserves a non-Error throw verbatim rather than stringifying it', async () => {
            const r = await retry(() => { throw 42; }, { times: 0 });
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect((r.error as { thrown: unknown }).thrown).toBe(42);
        });

        it('lets onThrow map the throw onto the caller error type', async () => {
            const fn = () => { throw new Error('boom'); };
            const r = await retry<number, DomainError, DomainError>(fn, {
                times: 0,
                onThrow: (): DomainError => ({ kind: 'Transient' }),
            });
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect(r.error).toEqual({ kind: 'Transient' });
        });
    });

    describe('never rejects, even when a caller hook throws', () => {
        it('survives a throwing shouldRetry', async () => {
            const r = await retry(() => err('nope'), {
                times: 2,
                shouldRetry: () => { throw new Error('predicate exploded'); },
            });
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect((r.error as { thrown: unknown }).thrown).toBeInstanceOf(Error);
            }
        });

        it('survives a throwing onRetry', async () => {
            const r = await retry(() => err('nope'), {
                times: 2,
                onRetry: () => { throw new Error('hook exploded'); },
            });
            expect(r.isFailure).toBe(true);
        });

        it('survives a throwing delayMs', async () => {
            const r = await retry(() => err('nope'), {
                times: 2,
                delayMs: () => { throw new Error('backoff exploded'); },
            });
            expect(r.isFailure).toBe(true);
        });

        it('survives a throwing onAborted', async () => {
            const controller = new AbortController();
            controller.abort();
            const r = await retry(() => ok(1), {
                signal: controller.signal,
                onAborted: () => { throw new Error('factory exploded'); },
            });
            expect(r.isFailure).toBe(true);
        });
    });

    it('floors a fractional `times` instead of scheduling a delay after the last attempt', async () => {
        vi.useFakeTimers();
        const fn = vi.fn(() => err('nope'));
        const delayMs = vi.fn(() => 1000);
        const p = retry(fn, { times: 0.5, delayMs });
        await vi.advanceTimersByTimeAsync(5000);
        await p;
        vi.useRealTimers();
        expect(fn).toHaveBeenCalledTimes(1);
        expect(delayMs).not.toHaveBeenCalled();
    });
});
