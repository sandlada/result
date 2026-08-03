import { describe, it, expect } from 'vitest';
import { unwrapOrAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

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

    it('propagates outer Promise rejection verbatim (no value to fall back to)', async () => {
        // unwrapOrAsyncOption does not catch the outer Promise rejection —
        // a rejected outer Promise short-circuits before the default is
        // considered.
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        await expect(unwrapOrAsyncOption(0, outer)).rejects.toThrow('outer-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = unwrapOrAsyncOption(0, Promise.resolve(ofSome(42)));
        expect(r).toBeInstanceOf(Promise);
    });

    it('does not resolve defaultValue Promise when Some carries a value (short-circuit)', async () => {
        // When the input is Some, the defaultValue Promise is never awaited.
        // Pin by handing a *thenable* (object with a `then` method) and
        // observing whether `.then` was invoked.
        let thenableAwaited = false;
        const observedDefault = {
            then(onFulfilled: (v: number) => void) {
                thenableAwaited = true;
                onFulfilled(0);
            },
        };
        const r = await unwrapOrAsyncOption(
            observedDefault as unknown as Promise<number>,
            Promise.resolve(ofSome(7)),
        );
        expect(r).toBe(7);
        expect(thenableAwaited).toBe(false);
    });

    it('supports curried form with Promise<T> default', async () => {
        const fn = unwrapOrAsyncOption(Promise.resolve(99));
        const r = await fn(Promise.resolve(ofNone()));
        expect(r).toBe(99);
    });
});
