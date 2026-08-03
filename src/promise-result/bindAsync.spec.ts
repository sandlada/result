import { describe, it, expect, vi } from 'vitest';
import { ok } from '../factories/index.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import { bindAsync } from './index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('bindAsync', () => {
    it('chains to AsyncResult (curried)', async () => {
        const chain = bindAsync((x: number) => asyncOk(x * 2));
        const r = await chain(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('chains to sync IResultOfT', async () => {
        const r = await bindAsync(
            (s: string) => ok(s.length),
            asyncOk('hello'),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('short-circuits on failure', async () => {
        const r = await bindAsync(
            (x: number) => asyncOk(x * 2),
            asyncErr<string>('fail'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('does not invoke the callback on an Err source', async () => {
        const fn = vi.fn((x: number) => asyncOk(x * 2));
        const r = await bindAsync(fn, asyncErr<string>('pre-fail'));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
    });

    it('propagates async callback rejection (does not catch)', async () => {
        // Per the documented throw policy, sync throws and async rejections
        // from the callback propagate via the outer Promise — they are NOT
        // converted to Err.
        await expect(
            bindAsync(async () => { throw 'cb-reject'; }, asyncOk(1)),
        ).rejects.toBe('cb-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = bindAsync(
            (x: number) => asyncOk(x * 2),
            asyncOk(5),
        );
        expect(r).toBeInstanceOf(Promise);
    });

    it('widens the error type to E | F (canonical AsyncResult bind carrier)', async () => {
        type CustomErr = { kind: 'Input'; id: string };
        type BindErr = { kind: 'Bind'; reason: string };
        const r = await bindAsync<number, string, CustomErr, BindErr>(
            async (_x: number) => asyncErr<BindErr>({ kind: 'Bind', reason: 'nope' }),
            asyncOk<number>(5) as Promise<IResultOfT<number, CustomErr>>,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as CustomErr | BindErr;
            expect(e.kind).toBe('Bind');
        }
    });
});
