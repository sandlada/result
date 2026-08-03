import { describe, it, expect, vi } from 'vitest';
import { asyncOk, asyncErr } from '../factories/index.js';
import { orElseAsync } from './index.js';

describe('orElseAsync', () => {
    it('recovers from failure (curried)', async () => {
        const recover = orElseAsync(() => asyncOk(42));
        const r = await recover(asyncErr<string>('down'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through success', async () => {
        const r = await orElseAsync(() => asyncOk(99), asyncOk(10));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(10);
    });

    it('does not invoke the recovery callback on an Ok source', async () => {
        const fn = vi.fn(() => asyncOk(99));
        const r = await orElseAsync(fn, asyncOk(10));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isSuccess).toBe(true);
    });

    it('widens the success type to A | B (canonical orElseAsync carrier)', async () => {
        // The direct form is `<A, E, B, F>` and the result is
        // `Promise<IResultOfT<A | B, F>>`. The original A flows through on
        // Ok; the recovery callback's B is unioned in when the source is
        // Err and recovery succeeds.
        type InputErr = { kind: 'Input'; code: number };
        const r = await orElseAsync<string, InputErr, number, never>(
            async (_e: InputErr) => asyncOk<number>(0),
            asyncErr<InputErr>({ kind: 'Input', code: 7 }),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(0);
    });

    it('passes the original error value to the recovery callback', async () => {
        let captured: unknown = undefined;
        const fn = vi.fn(async (e: { code: number; msg: string }) => {
            captured = e;
            return asyncOk('recovered');
        });
        await orElseAsync(fn, asyncErr<{ code: number; msg: string }>({ code: 7, msg: 'down' }));
        expect(captured).toEqual({ code: 7, msg: 'down' });
    });

    it('propagates async recovery rejection (does not catch)', async () => {
        await expect(
            orElseAsync(async () => { throw 'recovery-reject'; }, asyncErr<string>('boom')),
        ).rejects.toBe('recovery-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = orElseAsync(() => asyncOk(0), asyncOk(5));
        expect(r).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            orElseAsync(() => asyncOk(0), Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });
});
