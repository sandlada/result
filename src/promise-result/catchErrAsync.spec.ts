import { describe, it, expect, vi } from 'vitest';
import { catchErrAsync } from './catchErrAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import { ok } from '../factories/index.js';

describe('catchErrAsync', () => {
    it('returns original Ok if the result is successful (direct)', async () => {
        const result = await catchErrAsync(async (e: string) => 0, asyncOk(42));
        expect(result).toEqual(ok(42));
    });

    it('returns original Ok if the result is successful (curried)', async () => {
        const recover = catchErrAsync(async (e: string) => 0);
        const result = await recover(asyncOk(42));
        expect(result).toEqual(ok(42));
    });

    it('converts Err to Ok with the recovered value (direct)', async () => {
        const result = await catchErrAsync(async (e: string) => 0, asyncErr('boom'));
        expect(result).toEqual(ok(0));
    });

    it('converts Err to Ok with the recovered value (curried)', async () => {
        const recover = catchErrAsync(async (e: string) => e.length);
        const result = await recover(asyncErr('boom'));
        expect(result).toEqual(ok(4));
    });

    it('works with synchronous recovery function', async () => {
        const result = await catchErrAsync((e: string) => e.length, asyncErr('boom'));
        expect(result).toEqual(ok(4));
    });

    it('does not invoke the recovery callback on an Ok source', async () => {
        const fn = vi.fn(async (_e: string) => 0);
        const r = await catchErrAsync(fn, asyncOk(42));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes the error value to the recovery callback', async () => {
        let captured: unknown = undefined;
        const fn = vi.fn(async (e: { code: number; msg: string }) => {
            captured = e;
            return 0;
        });
        await catchErrAsync(fn, asyncErr<{ code: number; msg: string }>({ code: 7, msg: 'boom' }));
        expect(captured).toEqual({ code: 7, msg: 'boom' });
    });

    it('propagates async rejection from the recovery callback', async () => {
        // The implementation does not catch async rejection from onErr.
        await expect(
            catchErrAsync(async () => { throw 'recovery-reject'; }, asyncErr<string>('boom')),
        ).rejects.toBe('recovery-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<Awaited<ReturnType<typeof asyncOk<number>>>>(() => { /* never */ });
        const result = catchErrAsync(async (_e: string) => 0, pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            catchErrAsync(async (_e: string) => 0, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('collapses the error type to never on the output (catchErrAsync contract)', async () => {
        // The return type is `Promise<IResultOfT<A, never>>` — after
        // catchErrAsync, there is no longer any error channel. Even if the
        // source error had a specific shape, it does not propagate.
        type CustomErr = { kind: 'Custom'; code: number };
        const r = await catchErrAsync(
            async (_e: CustomErr) => 0,
            asyncErr<CustomErr>({ kind: 'Custom', code: 7 }),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(0);
    });
});
