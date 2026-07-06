import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { contains } from '../../src/async-result/contains.js';

describe('AsyncResult contains', () => {
    it('returns true if success value matches', async () => {
        const result = await contains(42, fromResult(ok(42)));
        expect(result).toBe(true);
    });

    it('returns false if success value does not match', async () => {
        const result = await contains(43, fromResult(ok(42)));
        expect(result).toBe(false);
    });

    it('returns false on failure', async () => {
        const result = await contains(42, fromResult(err<string>('fail')));
        expect(result).toBe(false);
    });

    it('is curried', async () => {
        const is42 = contains(42);
        const result = await is42(fromResult(ok(42)));
        expect(result).toBe(true);
    });
});
