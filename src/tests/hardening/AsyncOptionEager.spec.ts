import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../option/index.js';
import { mapAsync, bindAsync, matchAsync, orElseAsync, tapAsync, unwrapOrAsync } from '../../promise-option/index.js';

describe('eager AsyncOption operators', () => {
    it('mapAsync should transform value', async () => {
        const r = await mapAsync((x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('mapAsync should return None on callback error', async () => {
        const r = await mapAsync(() => { throw new Error('boom'); }, Promise.resolve(ofSome(21)));
        expect(r.isNone).toBe(true);
    });

    it('bindAsync should chain', async () => {
        const r = await bindAsync((x: number) => Promise.resolve(ofSome(x * 2)), Promise.resolve(ofSome(21)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('bindAsync should return None on callback error', async () => {
        const r = await bindAsync(() => { throw new Error('boom'); }, Promise.resolve(ofSome(21)));
        expect(r.isNone).toBe(true);
    });

    it('matchAsync should match', async () => {
        const r1 = await matchAsync(v => `some ${v}`, () => 'none', Promise.resolve(ofSome(42)));
        expect(r1).toBe('some 42');
        const r2 = await matchAsync(v => `some ${v}`, () => 'none', Promise.resolve(ofNone()));
        expect(r2).toBe('none');
    });

    it('orElseAsync should recover', async () => {
        const r = await orElseAsync(() => Promise.resolve(ofSome(0)), Promise.resolve(ofNone()));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(0);
    });

    it('tapAsync should side-effect', async () => {
        const fn = vi.fn();
        await tapAsync(fn, Promise.resolve(ofSome(42)));
        expect(fn).toHaveBeenCalledWith(42);
    });

    it('unwrapOrAsync should unwrap', async () => {
        const v = await unwrapOrAsync(0, Promise.resolve(ofNone()));
        expect(v).toBe(0);
    });
});
