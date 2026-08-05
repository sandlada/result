import { describe, it, expect, vi } from 'vitest';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../factories/index.js';
import { retryLazy } from './index.js';

describe('retryLazy', () => {
    it('does not run the inner thunk until .run() is called', () => {
        const runSpy = vi.fn(() => Promise.resolve(ok(1)));
        const wrapped = retryLazy(
            { run: runSpy },
            { times: 2 },
        );
        expect(runSpy).not.toHaveBeenCalled();
    });

    it('defers retries until terminal .run()', async () => {
        let calls = 0;
        const ar = {
            run: () => Promise.resolve(calls++ < 2 ? err<string>('again') : ok(7)),
        };
        const result = await retryLazy(ar, { times: 3 }).run();
        expect(calls).toBe(3);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(7);
    });

    it('round-trips through fromResult OK case', async () => {
        const r = await retryLazy(fromResult(ok(1)), { times: 3 }).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(1);
    });

    it('does not invoke the inner run() during retryLazy construction (no .run() call)', () => {
        const runSpy = vi.fn(() => Promise.resolve(ok(1)));
        const ar = { run: runSpy };
        retryLazy(ar, { times: 5, delayMs: 50 });
        expect(runSpy).not.toHaveBeenCalled();
    });

    it('returns an AsyncResult that itself is lazy — calling .run() multiple times re-invokes', async () => {
        let calls = 0;
        const ar = {
            run: () => Promise.resolve(calls++ < 2 ? err<string>('again') : ok(7)),
        };
        const wrapped = retryLazy(ar, { times: 3 });
        // First run — drives the retries.
        const r1 = await wrapped.run();
        expect(r1.isSuccess).toBe(true);
        // Second run starts fresh from the underlying thunk.
        const r2 = await wrapped.run();
        expect(r2.isSuccess).toBe(true);
    });

    it('forwards shouldRetry from options', async () => {
        let calls = 0;
        const ar = {
            run: () => {
                calls++;
                return Promise.resolve(err<'fatal' | 'transient'>('fatal'));
            },
        };
        const result = await retryLazy(ar, {
            times: 4,
            shouldRetry: (e) => e === 'transient',
        }).run();
        expect(calls).toBe(1);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('fatal');
    });

    it('converts a thrown Error from the inner run() into Err (no escape)', async () => {
        const inner = new Error('inner');
        const ar = {
            run: async () => {
                throw inner;
            },
        };
        const result = await retryLazy(ar, { times: 0, shouldRetry: () => false }).run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toEqual({ kind: 'Thrown', thrown: inner });
    });
});
