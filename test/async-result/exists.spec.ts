import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { exists } from '../../src/async-result/exists.js';

describe('AsyncResult exists', () => {
    it('returns true if predicate holds on success', async () => {
        const result = await exists((x: number) => x > 0, fromResult(ok(42)));
        expect(result).toBe(true);
    });

    it('returns false if predicate fails on success', async () => {
        const result = await exists((x: number) => x < 0, fromResult(ok(42)));
        expect(result).toBe(false);
    });

    it('returns false on failure', async () => {
        const result = await exists((x: number) => x > 0, fromResult(err<string>('fail')));
        expect(result).toBe(false);
    });

    it('supports async predicate', async () => {
        const result = await exists(async (x: number) => x > 0, fromResult(ok(42)));
        expect(result).toBe(true);
    });

    it('is curried', async () => {
        const positive = exists((x: number) => x > 0);
        const result = await positive(fromResult(ok(42)));
        expect(result).toBe(true);
    });
});
