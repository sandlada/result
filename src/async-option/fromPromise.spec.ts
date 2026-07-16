import { describe, it, expect } from 'vitest';
import { fromPromise } from '../../src/async-option/fromPromise.js';

describe('AsyncOption fromPromise', () => {
    it('creates an AsyncOption from a resolving Promise (returns Some)', async () => {
        const ao = fromPromise(() => Promise.resolve(42));
        const result = await ao.run();
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });

    it('creates an AsyncOption from a rejecting Promise (returns None)', async () => {
        const ao = fromPromise(() => Promise.reject(new Error('test error')));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });

    it('is lazy — thunk is not called until run()', () => {
        let called = false;
        fromPromise(() => {
            called = true;
            return Promise.resolve(42);
        });
        expect(called).toBe(false);
    });

    it('is lazy — thunk is called on run()', async () => {
        let called = false;
        const ao = fromPromise(() => {
            called = true;
            return Promise.resolve(42);
        });
        await ao.run();
        expect(called).toBe(true);
    });
});
