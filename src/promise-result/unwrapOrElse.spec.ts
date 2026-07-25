import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { unwrapOrElse } from './unwrapOrElse.js';

describe('promise-result unwrapOrElse (sync)', () => {
    it('returns value on Ok without calling onErr', async () => {
        const onErr = vi.fn(() => 0);
        const v = await unwrapOrElse(onErr, Promise.resolve(ok(42)));
        expect(v).toBe(42);
        expect(onErr).not.toHaveBeenCalled();
    });

    it('calls onErr on Err', async () => {
        const v = await unwrapOrElse((e: string) => -1, Promise.resolve(err('boom')));
        expect(v).toBe(-1);
    });

    it('supports async onErr', async () => {
        const v = await unwrapOrElse(async (e: string) => `handled ${e}`, Promise.resolve(err('boom')));
        expect(v).toBe('handled boom');
    });
});