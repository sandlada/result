import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, orElseAsyncOption } from '../../src/index.js';

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
});
