import { describe, it, expect } from 'vitest';
import { asyncBind } from './index.js';
import { ok, err } from '../factories/index.js';

describe('asyncBind', () => {
    it('chains async success (curried)', async () => {
        const chain = asyncBind(async (x: number) => ok(x * 2));
        const r = await chain(ok(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('chains async success (direct)', async () => {
        const r = await asyncBind(async (x: number) => ok(x * 2), ok(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through failure', async () => {
        const r = await asyncBind(async (x: number) => ok(x * 2), err<string>('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('propagates async callback failure', async () => {
        const r = await asyncBind(async () => err<string>('inner'), ok(21));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('inner');
    });

    it('propagates async callback rejection (does not catch)', async () => {
        await expect(asyncBind(async () => { throw 'cb err'; }, ok(21))).rejects.toBe('cb err');
    });

    it('propagates sync throw from callback', async () => {
        const fn = (() => { throw new Error('sync-boom'); }) as unknown as (x: number) => Promise<never>;
        await expect(asyncBind(fn, ok(1))).rejects.toThrow('sync-boom');
    });
});
