import { describe, it, expect, vi } from 'vitest';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../index.js';
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
});