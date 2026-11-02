import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { match } from './match.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('promise-result match', () => {
    it('calls ok on Ok', async () => {
        const v = await match({
            ok: (x: number) => `ok ${x}`,
            err: (e: string) => `err ${e}`,
        }, ok(42));
        expect(v).toBe('ok 42');
    });

    it('calls err on Err', async () => {
        const v = await match({
            ok: (x: number) => `ok ${x}`,
            err: (e: string) => `err ${e}`,
        }, err('boom'));
        expect(v).toBe('err boom');
    });

    it('supports async handlers', async () => {
        const v = await match({
            ok: async (x: number) => `ok ${x}`,
            err: async (e: string) => `err ${e}`,
        }, ok(42));
        expect(v).toBe('ok 42');
    });

    it('is curried', async () => {
        const matcher = match({ ok: (x: number) => x, err: (e: string) => -1 });
        const v = await matcher(err('x'));
        expect(v).toBe(-1);
    });

    it('does not invoke the err handler on an Ok source', async () => {
        const onOk = vi.fn((x: number) => `ok ${x}`);
        const onErr = vi.fn((e: string) => `err ${e}`);
        await match({ ok: onOk, err: onErr }, ok(7));
        expect(onOk).toHaveBeenCalledOnce();
        expect(onErr).not.toHaveBeenCalled();
    });

    it('does not invoke the ok handler on an Err source', async () => {
        const onOk = vi.fn((x: number) => `ok ${x}`);
        const onErr = vi.fn((e: string) => `err ${e}`);
        await match({ ok: onOk, err: onErr }, err<string>('boom'));
        expect(onErr).toHaveBeenCalledOnce();
        expect(onOk).not.toHaveBeenCalled();
    });

    it('propagates a sync throw from a handler (lift family policy)', async () => {
        // The implementation is `Promise.resolve().then(...)` which rethrows
        // sync throws into the chained Promise — handlers' sync throws
        // propagate as Promise rejections, NOT as caught errors.
        const boom = new Error('handler-boom');
        await expect(match({
            ok: (_x: number) => { throw boom; },
            err: (e: string) => e,
        }, ok(1))).rejects.toBe(boom);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = match({
            ok: (x: number) => x,
            err: (e: string) => -1,
        }, ok(5));
        expect(r).toBeInstanceOf(Promise);
    });

    it('passes a thenable value payload to the ok handler unchanged', async () => {
        // A thenable value must reach the handler as the original payload -
        // not as the value the thenable resolves to.
        const thenable = {
            then(resolve: (value: unknown) => void): void { resolve('ADOPTED'); },
        };
        let captured: unknown;
        await match({
            ok: (v: unknown) => { captured = v; return 'ok'; },
            err: () => 'err',
        }, ok(thenable) as IResultOfT<unknown, unknown>);
        expect(captured).toBe(thenable);
    });
});