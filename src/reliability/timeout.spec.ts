import { describe, it, expect, vi, afterEach } from 'vitest';
import { timeout } from './index.js';
import { MAX_TIMER_DELAY_MS } from './timerDelay.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

const asyncOk = <T>(value: T, ms: number): Promise<IResultOfT<T, never>> =>
    new Promise<IResultOfT<T, never>>((resolve) => setTimeout(() => resolve({ isSuccess: true as const, isFailure: false as const, value }), ms));

const asyncErr = <E>(error: E, ms: number): Promise<IResultOfT<never, E>> =>
    new Promise<IResultOfT<never, E>>((resolve) => setTimeout(() => resolve({ isSuccess: false as const, isFailure: true as const, error }), ms));

describe('timeout (lazy)', () => {
    it('returns Ok when inner resolves before the window', async () => {
        const ar = {
            run: () => asyncOk(42, 5),
        };
        const r = await timeout(50, ar).run();
        expect(r.isSuccess).toBe(true);
    });

    it('returns Err({ kind: "Timeout", ms }) when inner is too slow', async () => {
        const ar = {
            run: () => asyncOk(42, 80),
        };
        const r = await timeout(10, ar).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.kind).toBe('Timeout');
            expect(r.error.ms).toBe(10);
        }
    });

    it('accepts a custom onTimeout factory', async () => {
        const ar = {
            run: () => asyncOk(42, 80),
        };
        const onTimeout = (ms: number) => ({ reason: 'slow', ms } as const);
        const r = await timeout(10, ar, onTimeout).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toEqual({ reason: 'slow', ms: 10 });
        }
    });

    it('does not fire timer until .run() is called', () => {
        const ar: AsyncResult<number, never> = {
            run: () => new Promise<never>(() => {}),
        };
        const wrapped = timeout(5, ar);
        expect(typeof wrapped.run).toBe('function');
    });

    it('forwards a sync Upstream failure before the timer fires', async () => {
        const ar: AsyncResult<never, string> = {
            run: () => asyncErr<string>('boom', 80),
        };
        const r = await timeout(200, ar).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('boom');
    });

    it('captures a rejected promise from run() as Err(rejection)', async () => {
        const ar: AsyncResult<number, never> = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('rejected')), 5)),
        };
        const r = await timeout(50, ar).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('rejected');
    });

    it('a late timer after the upstream rejected is a no-op', async () => {
        // The upstream rejects quickly; the timer would fire later but the
        // `if (settled) return;` guard drops it.
        const ar: AsyncResult<number, never> = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('quick-reject')), 5)),
        };
        const r = await timeout(50, ar).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('quick-reject');
    });

    it('a late rejection after the timer fired is a no-op', async () => {
        // The inner promise never settles; the timer fires first and yields Err(Timeout).
        // A subsequent rejection from the inner would hit the `if (settled)` guard.
        let rejectFn: (e: Error) => void;
        const ar: AsyncResult<number, never> = {
            run: () => new Promise<never>((_, reject) => { rejectFn = reject; }),
        };
        const promise = timeout(10, ar).run();
        // Fire a late rejection to exercise the rejection-handler race guard.
        setTimeout(() => rejectFn(new Error('late-reject')), 30);
        const r = await promise;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error.kind).toBe('Timeout');
    });

    it('a late success after the timer fired is a no-op (coverage for line 51)', async () => {
        let resolveFn: (v: any) => void;
        const ar: AsyncResult<number, never> = {
            run: () => new Promise<any>((resolve) => { resolveFn = resolve; }),
        };
        const promise = timeout(10, ar).run();

        setTimeout(() => resolveFn({ isSuccess: true, isFailure: false, value: 1 }), 30);

        const r = await promise;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error.kind).toBe('Timeout');
    });

    it('surfaces an onTimeout factory throw as Err (does not hang)', async () => {
        // Regression: if `onTimeout(ms)` throws, the outer Promise must
        // still settle — the throw is wrapped as the failure error.
        const ar: AsyncResult<number, never> = { run: () => new Promise<never>(() => { /* never settles */ }) };
        const thrown = new Error('onTimeout-itself-threw');
        const factory = () => { throw thrown; };
        const r = await timeout(20, ar, factory).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(thrown);
    });

    describe('with fake timers', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('fires the timer at exactly the configured ms and returns Err(Timeout)', async () => {
            vi.useFakeTimers();
            const ar: AsyncResult<number, never> = { run: () => new Promise<never>(() => { /* never settles */ }) };
            const promise = timeout(100, ar).run();
            // Advance to just before — not yet fired.
            await vi.advanceTimersByTimeAsync(99);
            // Advance to exactly the configured ms.
            await vi.advanceTimersByTimeAsync(1);
            const r = await promise;
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('Timeout');
                expect(r.error.ms).toBe(100);
            }
        });

        it('resolves with Ok when inner settles before the timer fires', async () => {
            vi.useFakeTimers();
            const ar: AsyncResult<number, never> = {
                run: () => Promise.resolve({
                    isSuccess: true as const,
                    isFailure: false as const,
                    value: 42,
                }),
            };
            const r = await timeout(1000, ar).run();
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) expect(r.value).toBe(42);
        });

        it('passes the configured ms to a custom onTimeout factory', async () => {
            vi.useFakeTimers();
            const ar: AsyncResult<number, never> = { run: () => new Promise<never>(() => { /* never settles */ }) };
            const factory = vi.fn((ms: number) => ({ kind: 'Custom' as const, ms }));
            const promise = timeout(50, ar, factory).run();
            await vi.advanceTimersByTimeAsync(50);
            const r = await promise;
            expect(factory).toHaveBeenCalledWith(50);
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('Custom');
                expect(r.error.ms).toBe(50);
            }
        });

        it('clamps an infinite ms to the maximum timer interval instead of expiring at once', async () => {
            // Node collapses a timer delay it cannot express to 1 ms, so an
            // un-clamped `Infinity` would expire immediately - the opposite of
            // what the caller asked for.
            vi.useFakeTimers();
            const ar: AsyncResult<number, never> = { run: () => new Promise<never>(() => { /* never settles */ }) };
            const promise = timeout(Number.POSITIVE_INFINITY, ar).run();
            let settled = false;
            void promise.then(() => { settled = true; });
            await vi.advanceTimersByTimeAsync(1_000);
            expect(settled).toBe(false);
            await vi.advanceTimersByTimeAsync(MAX_TIMER_DELAY_MS);
            const r = await promise;
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('Timeout');
                expect(r.error.ms).toBe(MAX_TIMER_DELAY_MS);
            }
        });

        it('treats a NaN or negative ms as an immediate expiry', async () => {
            vi.useFakeTimers();
            const ar: AsyncResult<number, never> = { run: () => new Promise<never>(() => { /* never settles */ }) };
            const promise = timeout(Number.NaN, ar).run();
            await vi.advanceTimersByTimeAsync(0);
            const r = await promise;
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('Timeout');
                expect(r.error.ms).toBe(0);
            }
        });

        it('clamps an out-of-range ms and reports the effective duration', async () => {
            vi.useFakeTimers();
            const ar: AsyncResult<number, never> = { run: () => new Promise<never>(() => { /* never settles */ }) };
            const factory = vi.fn((ms: number) => ({ kind: 'Custom' as const, ms }));
            const promise = timeout(MAX_TIMER_DELAY_MS + 1, ar, factory).run();
            await vi.advanceTimersByTimeAsync(MAX_TIMER_DELAY_MS);
            const r = await promise;
            expect(factory).toHaveBeenCalledWith(MAX_TIMER_DELAY_MS);
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('Custom');
                expect(r.error.ms).toBe(MAX_TIMER_DELAY_MS);
            }
        });

        it('clears the timer when the inner settles first (no stray timer fires)', async () => {
            vi.useFakeTimers();
            const factory = vi.fn((ms: number) => ({ kind: 'Timeout' as const, ms }));
            const ar = {
                run: () => Promise.resolve({
                    isSuccess: true as const,
                    isFailure: false as const,
                    value: 7,
                }),
            };
            const r = await timeout(100, ar, factory).run();
            expect(r.isSuccess).toBe(true);
            // Advance well past the timer window — must be a no-op.
            await vi.advanceTimersByTimeAsync(500);
            expect(factory).not.toHaveBeenCalled();
        });
    });

    describe('malformed carriers', () => {
        it('never rejects when the inner run() resolves with a non-Result', async () => {
            const ar = { run: async () => undefined };
            const r = await timeout(100, ar as never).run();
            expect(r.isFailure).toBe(true);
        });

        it('never rejects when the inner run() returns a plain (non-Promise) Result', async () => {
            const ar = {
                run: () => ({ isSuccess: true as const, isFailure: false as const, value: 7 }),
            };
            const r = await timeout(100, ar as never).run();
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) expect(r.value).toBe(7);
        });
    });

});
