import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { unwrapOr } from '../../src/async-result/unwrapOr.js';

describe('AsyncResult unwrapOr', () => {
    it('returns the success value', async () => {
        const result = await unwrapOr(0, fromResult(ok(42)));
        expect(result).toBe(42);
    });

    it('returns the default value on failure', async () => {
        const result = await unwrapOr(0, fromResult(err('fail')));
        expect(result).toBe(0);
    });

    it('is curried', async () => {
        const getOrZero = unwrapOr(0);
        const result = await getOrZero(fromResult(ok(99)));
        expect(result).toBe(99);
    });

    it('returns a Promise', () => {
        const promise = unwrapOr(0, fromResult(ok(5)));
        expect(promise).toBeInstanceOf(Promise);
    });
});
