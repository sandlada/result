import { describe, it, expect, vi } from 'vitest';
import { asyncOk, asyncErr } from '../factories/index.js';
import { matchAsync } from './index.js';

describe('matchAsync', () => {
    it('matches on success (curried)', async () => {
        const m = matchAsync(
            (v: number) => `ok: ${v}`,
            (e: string) => `err: ${e}`,
        );
        const result = await m(asyncOk(42));
        expect(result).toBe('ok: 42');
    });

    it('matches on failure', async () => {
        const result = await matchAsync(
            (v: number) => `ok: ${v}`,
            (e: string) => `err: ${e}`,
            asyncErr<string>('bad'),
        );
        expect(result).toBe('err: bad');
    });

    it('does not invoke onErr on an Ok source', async () => {
        const onOk = vi.fn((v: number) => `ok: ${v}`);
        const onErr = vi.fn((e: string) => `err: ${e}`);
        const r = await matchAsync(onOk, onErr, asyncOk(7));
        expect(onOk).toHaveBeenCalledOnce();
        expect(onErr).not.toHaveBeenCalled();
        expect(r).toBe('ok: 7');
    });

    it('does not invoke onOk on an Err source', async () => {
        const onOk = vi.fn((v: number) => `ok: ${v}`);
        const onErr = vi.fn((e: string) => `err: ${e}`);
        const r = await matchAsync(onOk, onErr, asyncErr<string>('boom'));
        expect(onErr).toHaveBeenCalledOnce();
        expect(onOk).not.toHaveBeenCalled();
        expect(r).toBe('err: boom');
    });

    it('propagates sync throw from a handler (does not catch)', async () => {
        const boom = new Error('handler-boom');
        await expect(matchAsync(
            (_v: number) => { throw boom; },
            (e: string) => e,
            asyncOk(1),
        )).rejects.toBe(boom);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = matchAsync(
            (v: number) => v,
            (e: string) => -1,
            asyncOk(5),
        );
        expect(r).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            matchAsync(
                (v: number) => v,
                (e: string) => -1,
                Promise.reject(new Error('outer-reject')),
            ),
        ).rejects.toThrow('outer-reject');
    });
});
