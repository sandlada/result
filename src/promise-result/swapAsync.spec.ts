import { describe, it, expect } from 'vitest';
import { ok, err, swapAsync } from '../../src/index.js';

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
});
