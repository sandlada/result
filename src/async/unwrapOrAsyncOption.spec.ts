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
});
