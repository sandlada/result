import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { contains } from '../../src/async-option/contains.js';

describe('AsyncOption contains', () => {
    it('returns true if Some contains the exact value', async () => {
        const result = await contains(42, fromOption(ofSome(42)));
        expect(result).toBe(true);
    });

    it('returns false if Some contains a different value', async () => {
        const result = await contains(100, fromOption(ofSome(42)));
        expect(result).toBe(false);
    });

    it('returns false on None', async () => {
        const result = await contains(42, fromOption(ofNone()));
        expect(result).toBe(false);
    });

    it('is curried', async () => {
        const contains42 = contains(42);
        const result1 = await contains42(fromOption(ofSome(42)));
        const result2 = await contains42(fromOption(ofSome(100)));
        const result3 = await contains42(fromOption(ofNone()));

        expect(result1).toBe(true);
        expect(result2).toBe(false);
        expect(result3).toBe(false);
    });

    it('checks strict primitive equality', async () => {
        const obj = { id: 1 };
        const result1 = await contains(obj, fromOption(ofSome(obj)));
        const result2 = await contains({ id: 1 }, fromOption(ofSome(obj))); // Different reference

        expect(result1).toBe(true);
        expect(result2).toBe(false);
    });
});
