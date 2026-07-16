import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../option/index.js';
import {
    mapAsyncOption,
    bindAsyncOption,
    matchAsyncOption,
    orElseAsyncOption,
    tapAsyncOption,
    unwrapOrAsyncOption
} from '../../index.js';

describe('eager AsyncOption operators', () => {
    it('mapAsyncOption should transform value', async () => {
        const r = await mapAsyncOption((x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('mapAsyncOption should return None on callback error', async () => {
        const r = await mapAsyncOption(() => { throw new Error('boom'); }, Promise.resolve(ofSome(21)));
        expect(r.isNone).toBe(true);
    });

    it('bindAsyncOption should chain', async () => {
        const r = await bindAsyncOption((x: number) => Promise.resolve(ofSome(x * 2)), Promise.resolve(ofSome(21)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('bindAsyncOption should return None on callback error', async () => {
        const r = await bindAsyncOption(() => { throw new Error('boom'); }, Promise.resolve(ofSome(21)));
        expect(r.isNone).toBe(true);
    });

    it('matchAsyncOption should match', async () => {
        const r1 = await matchAsyncOption(v => `some ${v}`, () => 'none', Promise.resolve(ofSome(42)));
        expect(r1).toBe('some 42');
        const r2 = await matchAsyncOption(v => `some ${v}`, () => 'none', Promise.resolve(ofNone()));
        expect(r2).toBe('none');
    });

    it('orElseAsyncOption should recover', async () => {
        const r = await orElseAsyncOption(() => Promise.resolve(ofSome(0)), Promise.resolve(ofNone()));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(0);
    });

    it('tapAsyncOption should side-effect', async () => {
        const fn = vi.fn();
        await tapAsyncOption(fn, Promise.resolve(ofSome(42)));
        expect(fn).toHaveBeenCalledWith(42);
    });

    it('unwrapOrAsyncOption should unwrap', async () => {
        const v = await unwrapOrAsyncOption(0, Promise.resolve(ofNone()));
        expect(v).toBe(0);
    });
});
