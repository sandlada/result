import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { mapAsync } from '../../src/async-option/mapAsync.js';

describe('AsyncOption mapAsync', () => {
    it('maps a Some value correctly', async () => {
        const ao = mapAsync(async (x: number) => x * 2, fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });

    it('catches callback error and turns to None', async () => {
        const ao = mapAsync(async () => { throw new Error('boom'); }, fromOption(ofSome(42)));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });

    it('does not call fn on None', async () => {
        const fn = vi.fn(async (x: number) => x * 2);
        const ao = mapAsync(fn, fromOption(ofNone()));
        const result = await ao.run();

        expect(fn).not.toHaveBeenCalled();
        expect(result.isNone).toBe(true);
    });

    it('supports currying', async () => {
        const mapper = mapAsync(async (x: number) => x * 2);
        const ao = mapper(fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });
});
