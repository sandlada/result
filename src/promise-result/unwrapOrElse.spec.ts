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

    it('passes the error value to onErr', async () => {
        let captured: unknown = undefined;
        const onErr = vi.fn((e: { code: number; msg: string }) => {
            captured = e;
            return 0;
        });
        await unwrapOrElse(onErr, Promise.resolve(err<{ code: number; msg: string }>({ code: 7, msg: 'boom' })));
        expect(captured).toEqual({ code: 7, msg: 'boom' });
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<ReturnType<typeof ok<number>>>(() => { /* never */ });
        const result = unwrapOrElse((_e: string) => 0, pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            unwrapOrElse((_e: string) => 0, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('propagates sync throw from onErr (does not catch)', async () => {
        await expect(
            unwrapOrElse(
                (_e: string) => { throw new Error('onErr-boom'); },
                Promise.resolve(err<string>('boom')),
            ),
        ).rejects.toThrow('onErr-boom');
    });

    it('propagates async rejection from onErr (does not catch)', async () => {
        await expect(
            unwrapOrElse(
                async (_e: string) => { throw new Error('onErr-reject'); },
                Promise.resolve(err<string>('boom')),
            ),
        ).rejects.toThrow('onErr-reject');
    });
});