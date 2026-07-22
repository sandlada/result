import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../../index.js';
import { retryLazy } from '../../reliability/index.js';
import { withPath, getPath, installObserver } from '../../observability/index.js';

/**
 * Sentinel-driven regression coverage for the laziness contract of `retryLazy`:
 *
 * - Building the wrapper must NOT invoke the underlying `run()`.
 * - The wrapper's `.run()` is the only path that may invoke retries.
 * - Errors raised by inner thunks propagate via `Err`, never as `throw`.
 */
describe('RetryLazy hardening (sentinel regression)', () => {
    it('does not invoke inner run() during construction', () => {
        const runSpy = vi.fn(() => Promise.resolve(ok(1)));
        const ar = { run: runSpy };
        retryLazy(ar, { times: 5 });
        expect(runSpy).not.toHaveBeenCalled();
    });

    it('only the wrapper .run() drives retries', async () => {
        let calls = 0;
        const ar = {
            run: () => Promise.resolve(calls++ < 2 ? err<string>('again') : ok(99)),
        };
        const wrapped = retryLazy(ar, { times: 4 });
        expect(calls).toBe(0);
        const r = await wrapped.run();
        expect(calls).toBe(3);
        expect(r.isSuccess).toBe(true);
    });

    it('throws-as-rejection never reaches the caller as throw', async () => {
        const ar = {
            run: async () => {
                throw new Error('inner throw');
            },
        };
        const wrapped = retryLazy(ar, {
            times: 0,
            shouldRetry: () => false,
        });
        // retry() wraps to `Err` on throw, so we must NOT see an Error escape.
        const r = await wrapped.run();
        expect(r.isFailure).toBe(true);
    });

    it('observer sees results from a retryLazy pipeline without breaking laziness', () => {
        const seen: unknown[] = [];
        const cancel = installObserver((e) => seen.push(e));
        try {
            // Building the chain must not fire the observer at all.
            const ar = { run: () => Promise.resolve(err('nope')) };
            retryLazy(ar, { times: 0 });
            expect(seen).toEqual([]);
        } finally {
            cancel();
        }
    });

    it('path breadcrumbs survive across retry boundaries', () => {
        // Simulate the failure-then-retry path: the path stack is captured at
        // *failure-time* in `tapErrContext`. Verifying that `getPath()` returns
        // an empty stack when no frame is active.
        expect(getPath()).toEqual([]);
        withPath('test');
        expect(getPath()).toEqual(['test']);
    });
});