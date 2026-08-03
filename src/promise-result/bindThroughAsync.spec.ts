import { describe, it, expect, vi } from 'vitest';
import { bindThroughAsync } from './index.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('bindThroughAsync', () => {
    it('passes through success when inner callback returns success (curried)', async () => {
        const chain = bindThroughAsync(async (x: number) => ok(x * 2));
        const r = await chain(Promise.resolve(ok(21)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(21);
    });

    it('passes through success when inner callback returns success (direct)', async () => {
        const r = await bindThroughAsync(
            async (x: number) => ok(x * 2),
            Promise.resolve(ok(21)),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(21);
    });

    it('returns inner error when callback returns failure', async () => {
        const r = await bindThroughAsync(
            async () => err<string>('inner'),
            Promise.resolve(ok<number>(21) as IResultOfT<number, string>),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('inner');
    });

    it('passes through outer failure', async () => {
        const r = await bindThroughAsync(
            async (x: number) => ok(x * 2),
            Promise.resolve(err<string>('outer')),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('outer');
    });

    it('propagates callback exceptions (does not catch)', async () => {
        await expect(bindThroughAsync(
            async () => { throw 'cb err'; },
            Promise.resolve(ok<number>(21) as IResultOfT<number, string>),
        )).rejects.toBe('cb err');
    });

    it('does not invoke the callback on an Err source', async () => {
        const fn = vi.fn(async (x: number) => ok(x * 2));
        const r = await bindThroughAsync(fn, Promise.resolve(err<string>('pre-fail')));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
    });

    it('widens the error type to E | F (canonical bind carrier)', async () => {
        type CustomErr = { kind: 'Input' };
        type BindErr = { kind: 'Bind'; reason: string };
        const r = await bindThroughAsync<number, void, CustomErr, BindErr>(
            async (_x: number) => err<BindErr>({ kind: 'Bind', reason: 'nope' }),
            Promise.resolve(ok<number>(5) as IResultOfT<number, CustomErr>),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as CustomErr | BindErr;
            expect(e.kind).toBe('Bind');
        }
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = bindThroughAsync(
            async (x: number) => ok(x * 2),
            Promise.resolve(ok(5)),
        );
        expect(r).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim (does not catch)', async () => {
        await expect(
            bindThroughAsync(
                async (x: number) => ok(x * 2),
                Promise.reject(new Error('outer-reject')),
            ),
        ).rejects.toThrow('outer-reject');
    });
});
