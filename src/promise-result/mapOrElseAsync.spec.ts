import { describe, it, expect, vi } from 'vitest';
import { asyncOk, asyncErr } from '../factories/index.js';
import { mapOrElseAsync } from './index.js';

describe('mapOrElseAsync', () => {
    it('maps success value (curried)', async () => {
        const handle = mapOrElseAsync(
            (e: string) => -1,
            (x: number) => x * 2,
        );
        const v = await handle(asyncOk(5));
        expect(v).toBe(10);
    });

    it('computes value from error on failure (curried)', async () => {
        const handle = mapOrElseAsync(
            (e: string) => e.length,
            (x: number) => x * 2,
        );
        const v = await handle(asyncErr<string>('fail'));
        expect(v).toBe(4);
    });

    it('direct form with success', async () => {
        const v = await mapOrElseAsync(
            (e: string) => -1,
            (x: number) => x * 2,
            asyncOk(5),
        );
        expect(v).toBe(10);
    });

    it('direct form with failure', async () => {
        const v = await mapOrElseAsync(
            (e: string) => -1,
            (x: number) => x * 2,
            asyncErr<string>('boom'),
        );
        expect(v).toBe(-1);
    });

    it('works with async callbacks', async () => {
        const v = await mapOrElseAsync(
            async (e: string) => `err: ${e}`,
            async (x: number) => `ok: ${x}`,
            asyncOk(42),
        );
        expect(v).toBe('ok: 42');
    });

    it('does not invoke onErr on an Ok source', async () => {
        const onErr = vi.fn((e: string) => -1);
        const fn = vi.fn((x: number) => x * 2);
        const v = await mapOrElseAsync(onErr, fn, asyncOk(5));
        expect(fn).toHaveBeenCalledOnce();
        expect(onErr).not.toHaveBeenCalled();
        expect(v).toBe(10);
    });

    it('does not invoke fn on an Err source', async () => {
        const onErr = vi.fn((e: string) => -1);
        const fn = vi.fn((x: number) => x * 2);
        const v = await mapOrElseAsync(onErr, fn, asyncErr<string>('boom'));
        expect(onErr).toHaveBeenCalledOnce();
        expect(fn).not.toHaveBeenCalled();
        expect(v).toBe(-1);
    });

    it('propagates onErr throw verbatim (does not catch)', async () => {
        // The implementation has no try/catch; sync throws or async
        // rejections from onErr/fn propagate to the outer Promise.
        await expect(
            mapOrElseAsync(
                (_e: string) => { throw new Error('onErr-boom'); },
                (x: number) => x * 2,
                asyncErr<string>('boom'),
            ),
        ).rejects.toThrow('onErr-boom');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<Awaited<ReturnType<typeof asyncOk<number>>>>(() => { /* never */ });
        const result = mapOrElseAsync(
            (e: string) => -1,
            (x: number) => x * 2,
            pending,
        );
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            mapOrElseAsync(
                (e: string) => -1,
                (x: number) => x * 2,
                Promise.reject(new Error('outer-reject')),
            ),
        ).rejects.toThrow('outer-reject');
    });
});
