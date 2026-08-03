import { describe, it, expect, vi } from 'vitest';
import { tapAsync } from './index.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tapAsync', () => {
    it('calls side-effect on success', async () => {
        let side = 0;
        const r = await tapAsync((v: number) => { side = v; }, asyncOk(5));
        expect(side).toBe(5);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('does not call on failure', async () => {
        let side = 0;
        await tapAsync((v: number) => { side = v; }, asyncErr<string>('err'));
        expect(side).toBe(0);
    });

    it('catches callback throw and converts to Err', async () => {
        const r = await tapAsync(
            () => { throw new Error('boom'); },
            asyncOk<number>(5) as Promise<IResultOfT<number, string>>,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom');
    });

    it('catches async callback rejection and converts to Err', async () => {
        const r = await tapAsync(
            async () => { throw new Error('async-boom'); },
            asyncOk<number>(5) as Promise<IResultOfT<number, string>>,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('async-boom');
    });

    it('curried: returns a function to apply later', async () => {
        let called = false;
        const fn = tapAsync<number>(() => { called = true; });
        const r = await fn(asyncOk(7));
        expect(called).toBe(true);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(7);
    });

    it('does not invoke the callback on an Err source', async () => {
        const fn = vi.fn((v: number) => { void v; });
        const r = await tapAsync(fn, asyncErr<string>('pre-fail'));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = tapAsync((v: number) => { void v; }, asyncOk(5));
        expect(r).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim (does not catch)', async () => {
        await expect(
            tapAsync((v: number) => { void v; }, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('preserves the input E type on Err short-circuit (no widening)', async () => {
        type CustomErr = { kind: 'TapBoom' };
        const r = await tapAsync((_v: number) => { /* noop */ }, asyncErr<CustomErr>({ kind: 'TapBoom' }));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as CustomErr;
            expect(e.kind).toBe('TapBoom');
        }
    });
});
