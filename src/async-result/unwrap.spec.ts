import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { unwrap } from '../../src/async-result/unwrap.js';

describe('AsyncResult unwrap', () => {
    it('extracts value on Ok', async () => {
        const v = await unwrap(fromResult(ok(42)));
        expect(v).toBe(42);
    });

    it('throws on Err', async () => {
        await expect(unwrap(fromResult(err<string>('boom')))).rejects.toThrow(/Err/);
    });

    it('returns a Promise', () => {
        expect(unwrap(fromResult(ok(1)))).toBeInstanceOf(Promise);
    });
});