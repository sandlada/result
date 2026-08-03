import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { unwrapOrElse } from '../../src/async-result/unwrapOrElse.js';

describe('AsyncResult unwrapOrElse', () => {
    it('returns value on Ok without calling onErr', async () => {
        const onErr = vi.fn(() => 0);
        const v = await unwrapOrElse(onErr, fromResult(ok(42)));
        expect(v).toBe(42);
        expect(onErr).not.toHaveBeenCalled();
    });

    it('calls onErr on Err', async () => {
        const v = await unwrapOrElse((e: string) => -1, fromResult(err('boom')));
        expect(v).toBe(-1);
    });

    it('supports async onErr', async () => {
        const v = await unwrapOrElse(async (e: string) => `handled ${e}`, fromResult(err('boom')));
        expect(v).toBe('handled boom');
    });

    it('is curried', async () => {
        const v = await unwrapOrElse(() => -1)(fromResult(err('x')));
        expect(v).toBe(-1);
    });

    it('passes the original error to onErr', async () => {
        let received: unknown;
        await unwrapOrElse((e: string) => { received = e; return 0; }, fromResult(err('orig')));
        expect(received).toBe('orig');
    });
});