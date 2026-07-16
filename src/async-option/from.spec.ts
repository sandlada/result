import { describe, it, expect } from 'vitest';
import { from } from '../../src/async-option/from.js';
import { ofSome, ofNone } from '../../src/option/index.js';

describe('AsyncOption from', () => {
    it('creates an AsyncOption from a thunk that returns Some', async () => {
        const ao = from(() => Promise.resolve(ofSome(42)));
        const result = await ao.run();
        expect(result.isSome).toBe(true);
        if(result.isSome) expect(result.value).toBe(42);
    });

    it('creates an AsyncOption from a thunk that returns None', async () => {
        const ao = from(() => Promise.resolve(ofNone()));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });

    it('is lazy — thunk is not called until run()', () => {
        let called = false;
        const ao = from(() => {
            called = true;
            return Promise.resolve(ofSome('done'));
        });
        expect(called).toBe(false);
    });

    it('is lazy — thunk is called on run()', async () => {
        let called = false;
        const ao = from(() => {
            called = true;
            return Promise.resolve(ofSome('done'));
        });
        await ao.run();
        expect(called).toBe(true);
    });
});
