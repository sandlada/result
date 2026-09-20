import { describe, it, expect, vi } from 'vitest';
import { asyncBindOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('asyncBindOption', () => {
    it('chains async success (curried)', async () => {
        const chain = asyncBindOption(async (x: number) => ofSome(x * 2));
        const r = await chain(ofSome(21));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('chains async success (direct)', async () => {
        const r = await asyncBindOption(async (x: number) => ofSome(x * 2), ofSome(21));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('passes through ofNone', async () => {
        const r = await asyncBindOption(async (x: number) => ofSome(x * 2), ofNone());
        expect(r.isNone).toBe(true);
    });

    it('propagates async callback returning ofNone', async () => {
        const r = await asyncBindOption(async () => ofNone(), ofSome(21));
        expect(r.isNone).toBe(true);
    });

    it('propagates async callback rejection (promotion-family rule)', async () => {
        const chain = asyncBindOption(async () => { throw new Error('callback exception'); });
        await expect(chain(ofSome(21))).rejects.toThrow('callback exception');
    });

    it('converts sync throw of callback to None (catch+convert policy)', async () => {
        const chain = asyncBindOption(() => { throw new Error('sync throw'); });
        const r = await chain(ofSome(21));
        expect(r.isNone).toBe(true);
    });

    it('propagates a rejected Promise from the callback (promotion-family rule)', async () => {
        const chain = asyncBindOption(async () => Promise.reject(new Error('rejected')));
        await expect(chain(ofSome(21))).rejects.toThrow('rejected');
    });

    it('does not invoke the callback on ofNone input (input short-circuit)', async () => {
        // The lift family has *no* async carrier to surface outer errors.
        // None in => None out, without invoking the async mapper.
        const callback = vi.fn(async (x: number) => ofSome(x * 2));
        const r = await asyncBindOption(callback, ofNone());
        expect(callback).not.toHaveBeenCalled();
        expect(r.isNone).toBe(true);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = asyncBindOption(async (x: number) => ofSome(x * 2), ofSome(5));
        expect(r).toBeInstanceOf(Promise);
    });

    it('captures a sync throw as None but propagates an async rejection', async () => {
        const thrown = new Error('hide-me');
        const r1 = await asyncBindOption(
            () => { throw thrown; },
            ofSome(1),
        );
        expect(r1.isNone).toBe(true);

        await expect(asyncBindOption(
            async () => { throw thrown; },
            ofSome(1),
        )).rejects.toBe(thrown);
    });

    it('preserves U when callback return differs from T (canonical lift narrowing)', async () => {
        // The lift family has E | F widening on bind family, but value-side
        // (U in asyncBindOption) is *not* widened — U goes in as U from the
        // callback, regardless of T's identity.
        const r = await asyncBindOption(
            async (s: string) => ofSome(s.length),
            ofSome('hi'),
        );
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(2);
    });
});
