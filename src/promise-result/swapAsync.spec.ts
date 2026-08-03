import { describe, it, expect } from 'vitest';
import { swapAsync } from './index.js';
import { ok, err } from '../factories/index.js';

describe('swapAsync', () => {
    it('swaps success to err', async () => {
        const r = await swapAsync(Promise.resolve(ok(42)));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(42);
    });

    it('swaps err to success', async () => {
        const r = await swapAsync(Promise.resolve(err('oops')));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('oops');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ });
        const result = swapAsync(pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            swapAsync(Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('twice-applying swapAsync is the identity', async () => {
        const a = await swapAsync(Promise.resolve(ok(42)));
        const b = await swapAsync(Promise.resolve(a));
        expect(b.isSuccess).toBe(true);
        if (b.isSuccess) expect(b.value).toBe(42);
    });
});
