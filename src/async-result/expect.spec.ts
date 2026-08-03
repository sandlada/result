import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { expect as expectOk } from '../../src/async-result/expect.js';

describe('AsyncResult expect', () => {
    it('returns value on Ok', async () => {
        const v = await expectOk('must succeed', fromResult(ok(42)));
        expect(v).toBe(42);
    });

    it('throws Error with the message and the error on Err', async () => {
        await expect(expectOk('config must be valid', fromResult(err('boom'))))
            .rejects.toThrow(/config must be valid.*boom/);
    });

    it('returns a Promise (no sync throw)', () => {
        const p = expectOk('msg', fromResult(ok(42)));
        expect(p).toBeInstanceOf(Promise);
    });

    it('stringifies non-string errors', async () => {
        const e = expectOk('boom', fromResult(err<number>(7)));
        await expect(e).rejects.toThrow(/boom: 7/);
    });
});