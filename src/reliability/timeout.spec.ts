import { describe, it, expect } from 'vitest';
import { timeout, timeoutEager } from './index.js';

const asyncOk = <T>(value: T, ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve({ isSuccess: true as const, isFailure: false as const, value }), ms));

const asyncErr = <E>(error: E, ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve({ isSuccess: false as const, isFailure: true as const, error }), ms));

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
        const ar = {
            run: () => new Promise<never>(() => {}),
        };
        const wrapped = timeout(5, ar);
        expect(typeof wrapped.run).toBe('function');
    });

    it('forwards a sync Upstream failure before the timer fires', async () => {
        const ar = {
            run: () => asyncErr<string>('boom', 80),
        };
        const r = await timeout(200, ar).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('boom');
    });

    it('captures a rejected promise from run() as Err(rejection)', async () => {
        const ar = {
            run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('rejected')), 5)),
        };
        const r = await timeout(50, ar).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('rejected');
    });

    it('a late timer after the upstream rejected is a no-op', async () => {
        // The upstream rejects quickly; the timer would fire later but the
        // `if (settled) return;` guard drops it.
        const ar = {
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
        const ar = {
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
        const ar = {
            run: () => new Promise<any>((resolve) => { resolveFn = resolve; }),
        };
        const promise = timeout(10, ar).run();

        setTimeout(() => resolveFn({ isSuccess: true, isFailure: false, value: 1 }), 30);

        const r = await promise;
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error.kind).toBe('Timeout');
    });

});

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
});
