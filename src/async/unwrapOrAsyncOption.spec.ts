import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, unwrapOrAsyncOption } from '../../src/index.js';

describe('unwrapOrAsyncOption', () => {
    it('returns value on Some (curried)', async () => {
        const unwrap = unwrapOrAsyncOption(0);
        const r = await unwrap(Promise.resolve(ofSome(42)));
        expect(r).toBe(42);
    });

    it('returns value on Some (direct)', async () => {
        const r = await unwrapOrAsyncOption(0, Promise.resolve(ofSome(42)));
        expect(r).toBe(42);
    });

    it('returns default on None', async () => {
        const r = await unwrapOrAsyncOption(0, Promise.resolve(ofNone()));
        expect(r).toBe(0);
    });

    it('works with async default value', async () => {
        const r = await unwrapOrAsyncOption(Promise.resolve(99), Promise.resolve(ofNone()));
        expect(r).toBe(99);
    });

    it('awaits an asynchronously-resolving default value (not just auto-flattened)', async () => {
        // A default that resolves on a later microtask. If the implementation
        // returned the Promise without awaiting, `r` would be a Promise object
        // and the strict equality below would fail.
        const lazyDefault = new Promise<number>(resolve => {
            setTimeout(() => resolve(77), 10);
        });
        const r = await unwrapOrAsyncOption(lazyDefault, Promise.resolve(ofNone()));
        expect(r).toBe(77);
        expect(typeof r).toBe('number');
    });

    it('returns the resolved value (not a Promise) when default is a Promise', async () => {
        const r = await unwrapOrAsyncOption(Promise.resolve(42), Promise.resolve(ofNone()));
        // Guard against regressions where the default Promise is returned as-is.
        expect(r).not.toBeInstanceOf(Promise);
        expect(r).toBe(42);
    });
});
