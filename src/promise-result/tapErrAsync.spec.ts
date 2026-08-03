import { describe, it, expect, vi } from 'vitest';
import { tapErrAsync } from './index.js';
import { asyncErr, asyncOk } from '../factories/index.js';

describe('tapErrAsync', () => {
    it('calls side-effect on failure', async () => {
        let side = '';
        const r = await tapErrAsync((e: string) => { side = e; }, asyncErr<string>('oops'));
        expect(side).toBe('oops');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('oops');
    });

    it('does not call side-effect on success and forwards the result', async () => {
        let called = false;
        const r = await tapErrAsync(() => { called = true; }, asyncOk<number, string>(42));
        expect(called).toBe(false);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches callback throw and converts to Err(callback error)', async () => {
        const r = await tapErrAsync(
            () => { throw new Error('side-effect failed'); },
            asyncErr<string>('original'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('side-effect failed');
    });

    it('curried: returns a function that can be applied later', async () => {
        let side: string | undefined;
        const tapper = tapErrAsync((e: string) => { side = e; });
        const r = await tapper(asyncErr<string>('curried'));
        expect(side).toBe('curried');
        expect(r.isFailure).toBe(true);
    });

    it('does not invoke the callback on an Ok source', async () => {
        const fn = vi.fn((e: string) => { void e; });
        const r = await tapErrAsync(fn, asyncOk<number, string>(5));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isSuccess).toBe(true);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = tapErrAsync((e: string) => { void e; }, asyncErr<string>('oops'));
        expect(r).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim (does not catch)', async () => {
        await expect(
            tapErrAsync((e: string) => { void e; }, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('passes the original error value to the callback', async () => {
        let captured: unknown = undefined;
        const fn = vi.fn((e: { code: number; msg: string }) => {
            captured = e;
        });
        await tapErrAsync(fn, asyncErr<{ code: number; msg: string }>({ code: 7, msg: 'boom' }));
        expect(captured).toEqual({ code: 7, msg: 'boom' });
    });
});
