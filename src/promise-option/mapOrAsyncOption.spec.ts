import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { mapOrAsyncOption } from './mapOrAsyncOption.js';

describe('promise-result mapOrAsyncOption', () => {
    it('maps Some', async () => {
        const v = await mapOrAsyncOption(-1, (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(v).toBe(42);
    });

    it('returns default on None', async () => {
        const v = await mapOrAsyncOption(-1, (x: number) => x * 2, Promise.resolve(ofNone<number>()));
        expect(v).toBe(-1);
    });

    it('catches sync throws and returns default', async () => {
        const v = await mapOrAsyncOption(-1, () => { throw new Error('boom'); }, Promise.resolve(ofSome(1)));
        expect(v).toBe(-1);
    });

    it('supports async fn', async () => {
        const v = await mapOrAsyncOption(-1, async (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(v).toBe(42);
    });

    it('catches async mapper rejection and returns default (catch+convert policy)', async () => {
        const v = await mapOrAsyncOption(
            -1,
            async () => { throw new Error('async-boom'); },
            Promise.resolve(ofSome(1)),
        );
        expect(v).toBe(-1);
    });

    it('propagates outer Promise rejection verbatim (the default is unreachable)', async () => {
        // The catch inside the .then handler only wraps the *mapper* call.
        // A rejected outer Promise skips the .then handler entirely and
        // propagates the rejection.
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        await expect(
            mapOrAsyncOption(-1, (x: number) => x * 2, outer),
        ).rejects.toThrow('outer-reject');
    });

    it('does not invoke the mapper on None input', async () => {
        const mapper = vi.fn((x: number) => x * 2);
        const v = await mapOrAsyncOption(-1, mapper, Promise.resolve(ofNone<number>()));
        expect(mapper).not.toHaveBeenCalled();
        expect(v).toBe(-1);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = mapOrAsyncOption(-1, (x: number) => x * 2, Promise.resolve(ofSome(5)));
        expect(r).toBeInstanceOf(Promise);
    });
});