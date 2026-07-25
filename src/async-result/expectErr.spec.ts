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
});