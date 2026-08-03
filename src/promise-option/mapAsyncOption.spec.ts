import { describe, it, expect, vi } from 'vitest';
import { mapAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('mapAsyncOption', () => {
    it('transforms value (curried)', async () => {
        const double = mapAsyncOption((x: number) => x * 2);
        const r = await double(Promise.resolve(ofSome(21)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('transforms value (direct)', async () => {
        const r = await mapAsyncOption((x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('passes through None', async () => {
        const r = await mapAsyncOption((x: number) => x * 2, Promise.resolve(ofNone()));
        expect(r.isNone).toBe(true);
    });

    it('returns None when callback throws', async () => {
        const r = await mapAsyncOption(
            () => { throw new Error('boom'); },
            Promise.resolve(ofSome(21)),
        );
        expect(r.isNone).toBe(true);
    });

    it('works with async callback', async () => {
        const r = await mapAsyncOption(async (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('converts async callback rejection to None (catch+convert policy)', async () => {
        // mapAsyncOption catches both sync throws and async rejections from
        // the mapper and converts them to None — the rejection is *not*
        // propagated.
        const r = await mapAsyncOption(
            async () => { throw new Error('boom'); },
            Promise.resolve(ofSome(1)),
        );
        expect(r.isNone).toBe(true);
    });

    it('does not invoke the mapper when the outer Promise rejects', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        const mapper = vi.fn((x: number) => x * 2);
        await expect(mapAsyncOption(mapper, outer)).rejects.toThrow('outer-reject');
        expect(mapper).not.toHaveBeenCalled();
    });

    it('does not invoke the mapper on None input', async () => {
        const mapper = vi.fn((x: number) => x * 2);
        const r = await mapAsyncOption(mapper, Promise.resolve(ofNone()));
        expect(mapper).not.toHaveBeenCalled();
        expect(r.isNone).toBe(true);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = mapAsyncOption((x: number) => x * 2, Promise.resolve(ofSome(5)));
        expect(r).toBeInstanceOf(Promise);
    });

    it('discards the rejected reason (mapper exception → None, not propagated)', async () => {
        const thrown = new Error('hide-me');
        const r1 = await mapAsyncOption(() => { throw thrown; }, Promise.resolve(ofSome(1)));
        expect(r1.isNone).toBe(true);

        const r2 = await mapAsyncOption(
            async () => { throw thrown; },
            Promise.resolve(ofSome(1)),
        );
        expect(r2.isNone).toBe(true);
    });
});
