import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { expectErr } from '../../src/async-result/expectErr.js';

describe('AsyncResult expectErr', () => {
    it('returns error on Err', async () => {
        const v = await expectErr('must fail', fromResult(err('boom')));
        expect(v).toBe('boom');
    });

    it('throws Error with the message on Ok', async () => {
        await expect(expectErr('must fail', fromResult(ok(42))))
            .rejects.toThrow('must fail');
    });

    it('returns a Promise', () => {
        const p = expectErr('msg', fromResult(err('boom')));
        expect(p).toBeInstanceOf(Promise);
    });

    it('preserves the typed error value', async () => {
        type VErr = { code: number };
        const v = await expectErr<VErr, number>('msg', fromResult(err<number, VErr>({ code: 7 })));
        expect(v.code).toBe(7);
    });
});