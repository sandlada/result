import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { asyncOrElseOption } from './asyncOrElseOption.js';

describe('promise-result asyncOrElseOption', () => {
    it('recovers on None', async () => {
        const o = await asyncOrElseOption(async () => ofSome(0), ofNone());
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(0);
    });

    it('passes Some through without calling f', async () => {
        const o = await asyncOrElseOption(async () => ofSome(0), ofSome(42));
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('does not invoke the recovery on Some (callback short-circuit)', async () => {
        const recovery = vi.fn(async () => ofSome(0));
        const o = await asyncOrElseOption(recovery, ofSome(42));
        expect(recovery).not.toHaveBeenCalled();
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('returns an Option by reference on Some (no wrapping)', async () => {
        const original = ofSome(42);
        const o = await asyncOrElseOption(async () => ofSome(0), original);
        // asyncOrElseOption short-circuits on Some via `Promise.resolve(o)`
        // — the original Option is returned unchanged.
        expect(o).toBe(original);
    });

    it('propagates async recovery rejection verbatim (no catch in the lift family)', async () => {
        // asyncOrElseOption uses `Promise.resolve().then(() => f())`. A
        // rejection from f propagates via the outer Promise — it is NOT
        // converted to None. (Distinct from the Result-flavored orElseAsync
        // / orElseAsyncOption, which catch.)
        await expect(
            asyncOrElseOption(async () => { throw new Error('recovery-boom'); }, ofNone()),
        ).rejects.toThrow('recovery-boom');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = asyncOrElseOption(async () => ofSome(0), ofNone());
        expect(r).toBeInstanceOf(Promise);
    });
});