import { describe, it, expect, vi } from 'vitest';
import { orElseAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('orElseAsyncOption', () => {
    it('returns the Some value unchanged when Some (curried)', async () => {
        const recover = orElseAsyncOption(() => Promise.resolve(ofSome(0)));
        const r = await recover(Promise.resolve(ofSome(42)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('calls recovery function on None (direct)', async () => {
        const r = await orElseAsyncOption(
            () => Promise.resolve(ofSome(0)),
            Promise.resolve(ofNone()),
        );
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(0);
    });

    it('passes through None if recovery returns None', async () => {
        const r = await orElseAsyncOption(
            () => Promise.resolve(ofNone()),
            Promise.resolve(ofNone()),
        );
        expect(r.isNone).toBe(true);
    });

    it('returns None if recovery throws', async () => {
        const r = await orElseAsyncOption(
            () => { throw new Error('recovery failed'); },
            Promise.resolve(ofNone()),
        );
        expect(r.isNone).toBe(true);
    });

    it('works with sync recovery function', async () => {
        const r = await orElseAsyncOption(
            () => ofSome(0),
            Promise.resolve(ofNone()),
        );
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(0);
    });

    it('returns None when the recovery callback rejects (catch+convert policy)', async () => {
        const r = await orElseAsyncOption(
            async () => { throw new Error('recovery-reject'); },
            Promise.resolve(ofNone()),
        );
        expect(r.isNone).toBe(true);
    });

    it('does not invoke the recovery on Some (callback short-circuit)', async () => {
        const recovery = vi.fn(() => Promise.resolve(ofSome(0)));
        const r = await orElseAsyncOption(recovery, Promise.resolve(ofSome(42)));
        expect(recovery).not.toHaveBeenCalled();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('does not invoke the recovery when the outer Promise rejects', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        const recovery = vi.fn(() => Promise.resolve(ofSome(0)));
        await expect(orElseAsyncOption(recovery, outer)).rejects.toThrow('outer-reject');
        expect(recovery).not.toHaveBeenCalled();
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = orElseAsyncOption(() => Promise.resolve(ofSome(0)), Promise.resolve(ofNone()));
        expect(r).toBeInstanceOf(Promise);
    });

    it('discards the rejected reason (recovery exception → None, not propagated)', async () => {
        const thrown = new Error('hide-me');
        const r1 = await orElseAsyncOption(() => { throw thrown; }, Promise.resolve(ofNone()));
        expect(r1.isNone).toBe(true);

        const r2 = await orElseAsyncOption(
            async () => { throw thrown; },
            Promise.resolve(ofNone()),
        );
        expect(r2.isNone).toBe(true);
    });
});
