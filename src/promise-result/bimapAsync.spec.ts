import { describe, it, expect, vi } from 'vitest';
import { bimapAsync } from './index.js';
import { asyncOk, asyncErr } from '../factories/index.js';

describe('bimapAsync', () => {
    it('maps success value (curried)', async () => {
        const double = bimapAsync(
            (x: number) => x * 2,
            (e: string) => e.toUpperCase()
        );
        const r = await double(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps success value (direct)', async () => {
        const r = await bimapAsync(
            (x: number) => x * 2,
            (e: string) => e.toUpperCase(),
            asyncOk(21)
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps failure value (curried)', async () => {
        const double = bimapAsync(
            (x: number) => x * 2,
            (e: string) => e.toUpperCase()
        );
        const r = await double(asyncErr('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('FAIL');
    });

    it('maps failure value (direct)', async () => {
        const r = await bimapAsync(
            (x: number) => x * 2,
            (e: string) => e.toUpperCase(),
            asyncErr('fail')
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('FAIL');
    });

    it('maps with async callbacks (curried)', async () => {
        const doubleAsync = bimapAsync(
            async (x: number) => x * 2,
            async (e: string) => e.toUpperCase()
        );
        const r1 = await doubleAsync(asyncOk(21));
        expect(r1.isSuccess).toBe(true);
        if (r1.isSuccess) expect(r1.value).toBe(42);

        const r2 = await doubleAsync(asyncErr('fail'));
        expect(r2.isFailure).toBe(true);
        if (r2.isFailure) expect(r2.error).toBe('FAIL');
    });

    it('catches exceptions in onOk callback', async () => {
        const r = await bimapAsync(
            () => { throw 'ok error'; },
            (e: string) => e,
            asyncOk(1)
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('ok error');
    });

    it('catches exceptions in onErr callback', async () => {
        const r = await bimapAsync(
            (x: number) => x,
            () => { throw 'err error'; },
            asyncErr('fail')
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('err error');
    });

    it('catches async exceptions in onOk callback', async () => {
        const r = await bimapAsync(
            async () => { throw 'async ok error'; },
            async (e: string) => e,
            asyncOk(1)
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('async ok error');
    });

    it('catches async exceptions in onErr callback', async () => {
        const r = await bimapAsync(
            async (x: number) => x,
            async () => { throw 'async err error'; },
            asyncErr('fail')
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('async err error');
    });

    it('does not invoke onErr on an Ok source', async () => {
        const onOk = vi.fn((x: number) => x * 2);
        const onErr = vi.fn((e: string) => e);
        await bimapAsync(onOk, onErr, asyncOk(5));
        expect(onOk).toHaveBeenCalledOnce();
        expect(onErr).not.toHaveBeenCalled();
    });

    it('does not invoke onOk on an Err source', async () => {
        const onOk = vi.fn((x: number) => x * 2);
        const onErr = vi.fn((e: string) => e);
        await bimapAsync(onOk, onErr, asyncErr<string>('boom'));
        expect(onErr).toHaveBeenCalledOnce();
        expect(onOk).not.toHaveBeenCalled();
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = bimapAsync(
            (x: number) => x * 2,
            (e: string) => e,
            asyncOk(5),
        );
        expect(r).toBeInstanceOf(Promise);
    });

    it('propagates an outer Promise rejection verbatim', async () => {
        await expect(
            bimapAsync(
                (x: number) => x,
                (e: string) => e,
                Promise.reject(new Error('outer-reject')),
            ),
        ).rejects.toThrow('outer-reject');
    });
});
