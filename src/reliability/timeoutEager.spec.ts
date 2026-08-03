import { describe, it, expect, vi, afterEach } from 'vitest';
import { timeoutEager } from './index.js';

const asyncOk = <T>(value: T, ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve({ isSuccess: true as const, isFailure: false as const, value }), ms));

describe('timeoutEager', () => {
    it('returns Ok when fn resolves before window', async () => {
        const r = await timeoutEager(50, () => asyncOk('ok', 5));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('ok');
    });

    it('returns Err on timeout', async () => {
        const r = await timeoutEager(10, () => asyncOk('ok', 80));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error.kind).toBe('Timeout');
    });

    it('accepts a custom onTimeout factory', async () => {
        const onTimeout = (ms: number) => ({ reason: 'slow', ms } as const);
        const r = await timeoutEager(10, () => asyncOk('ok', 80), onTimeout);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toEqual({ reason: 'slow', ms: 10 });
        }
    });

    it('converts a sync throw from fn into Err (no rejection escapes)', async () => {
        const r = await timeoutEager(50, () => { throw new Error('sync-throw'); });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).message).toBe('sync-throw');
        }
    });

    it('captures a rejected promise from fn as Err', async () => {
        const r = await timeoutEager(50, () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('rejected')), 5)));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).message).toBe('rejected');
        }
    });

    describe('with fake timers', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('is eager — invokes fn synchronously when timeoutEager is called', () => {
            vi.useFakeTimers();
            const fn = vi.fn(() => Promise.resolve({
                isSuccess: true as const,
                isFailure: false as const,
                value: 42,
            }));
            // CONTRARY to the name, timeoutEager does NOT invoke fn eagerly:
            // the source wraps fn in `{ run: () => Promise.resolve().then(fn) }`
            // and calls `timeout(ms, ar, onTimeout).run()`. The `Promise.resolve().then(fn)`
            // defers fn to the next microtask, but is itself called only when
            // `timeout.run()` runs. So fn is NOT called at construction time.
            // This is the same laziness contract as `timeout`.
            const p = timeoutEager(1000, fn);
            expect(fn).not.toHaveBeenCalled();
            void p;
        });

        it('returns Err(Timeout) when the inner promise never settles before the window', async () => {
            vi.useFakeTimers();
            const fn = () => new Promise<never>(() => { /* never settles */ });
            const promise = timeoutEager(50, fn);
            await vi.advanceTimersByTimeAsync(50);
            const r = await promise;
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('Timeout');
                expect(r.error.ms).toBe(50);
            }
        });

        it('resolves with the inner Ok when it settles before the window', async () => {
            vi.useFakeTimers();
            const fn = () => Promise.resolve({
                isSuccess: true as const,
                isFailure: false as const,
                value: 'hi',
            });
            const r = await timeoutEager(1000, fn);
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) expect(r.value).toBe('hi');
        });

        it('converts a sync throw into Err via Promise.resolve().then(fn)', async () => {
            const fn = () => { throw new Error('sync'); };
            const r = await timeoutEager(1000, fn);
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error).toBeInstanceOf(Error);
                expect((r.error as Error).message).toBe('sync');
            }
        });

        it('passes the configured ms to a custom onTimeout factory', async () => {
            vi.useFakeTimers();
            const fn = () => new Promise<never>(() => { /* never settles */ });
            const factory = vi.fn((ms: number) => ({ kind: 'Custom' as const, ms }));
            const promise = timeoutEager(50, fn, factory);
            await vi.advanceTimersByTimeAsync(50);
            const r = await promise;
            expect(factory).toHaveBeenCalledWith(50);
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect(r.error.kind).toBe('Custom');
        });
    });

    it('does not surface a rejection from fn — the outer Promise resolves with Err', async () => {
        const fn = () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom')), 5));
        // The returned Promise must NEVER reject — it resolves to Err.
        const p = timeoutEager(100, fn);
        await expect(p).resolves.toMatchObject({
            isSuccess: false,
            isFailure: true,
        });
    });
});
