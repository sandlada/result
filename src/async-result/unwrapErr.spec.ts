import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { unwrapErr } from '../../src/async-result/unwrapErr.js';

describe('AsyncResult unwrapErr', () => {
    it('extracts error on Err', async () => {
        const v = await unwrapErr(fromResult(err('boom')));
        expect(v).toBe('boom');
    });

    it('throws on Ok', async () => {
        await expect(unwrapErr(fromResult(ok(42)))).rejects.toThrow(/Ok/);
    });

    it('returns a Promise', () => {
        expect(unwrapErr(fromResult(err('x')))).toBeInstanceOf(Promise);
    });
});