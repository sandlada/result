import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, mapAsyncOption } from '../../src/index.js';

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
});
