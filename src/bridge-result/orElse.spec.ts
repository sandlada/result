import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { orElse } from './orElse.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('promise-result orElse', () => {
    it('returns Ok on Ok without calling f', async () => {
        const r = await orElse(async () => ok(0), ok(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('recovers on Err', async () => {
        const r = await orElse(async (e: string) => ok(0), err('boom'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(0);
    });

    it('is curried', async () => {
        const r = await orElse(async (e: string) => ok(0))(err('x'));
        if (r.isSuccess) expect(r.value).toBe(0);
    });

    it('does not invoke the recovery callback on an Ok source', async () => {
        const f = vi.fn(async (e: string) => ok(0));
        const r = await orElse(f, ok(42));
        expect(f).not.toHaveBeenCalled();
        expect(r.isSuccess).toBe(true);
    });

    it('passes the original error value to the recovery callback', async () => {
        let captured: unknown = undefined;
        type AppErr = { code: number; msg: string };
        const f = vi.fn(async (e: AppErr) => {
            captured = e;
            return ok('recovered');
        });
        await orElse(f, err<AppErr>({ code: 7, msg: 'boom' }));
        expect(captured).toEqual({ code: 7, msg: 'boom' });
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const result = orElse(async (e: string) => ok(0), err('boom'));
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates the recovery callback rejection (does not catch)', async () => {
        // The lift-family orElse does NOT catch async rejection from the
        // recovery callback. The implementation is
        // `Promise.resolve().then(() => f(r.error))`, so a rejection
        // propagates verbatim.
        await expect(
            orElse(async () => { throw 'recovery-reject'; }, err<string>('boom')),
        ).rejects.toBe('recovery-reject');
    });

    it('preserves the input T type on the Ok short-circuit (no widening on success)', async () => {
        // The input T flows through unchanged on the Ok branch. Only on the
        // Err branch does `T | E` widening apply (and even then, the
        // implementation returns the input T verbatim on success).
        type CustomErr = { kind: 'Boom' };
        const r = await orElse(
            async (e: CustomErr) => ok<string>('recovered'),
            ok<string>('original') as IResultOfT<string, CustomErr>,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('original');
    });

    it('passes a thenable error payload through unchanged', async () => {
        // A thenable error must reach the recovery callback as the original
        // payload - not as the value the thenable resolves to.
        const thenable = {
            then(resolve: (value: unknown) => void): void { resolve('ADOPTED'); },
        };
        let captured: unknown;
        const recovery = async (e: unknown): Promise<IResultOfT<unknown, unknown>> => {
            captured = e;
            return ok(0);
        };
        await orElse(recovery, err(thenable) as IResultOfT<unknown, unknown>);
        expect(captured).toBe(thenable);
    });
});