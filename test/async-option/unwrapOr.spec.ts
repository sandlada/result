import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { unwrapOr } from '../../src/async-option/unwrapOr.js';

describe('AsyncOption unwrapOr', () => {
    it('returns the value when AsyncOption resolves to Some', async () => {
        const ao = fromOption(ofSome(42));
        const result = await unwrapOr(0, ao);
        expect(result).toBe(42);
    });

    it('returns the default value when AsyncOption resolves to None', async () => {
        const ao = fromOption(ofNone<number>());
        const result = await unwrapOr(0, ao);
        expect(result).toBe(0);
    });

    it('supports currying for Some', async () => {
        const ao = fromOption(ofSome(42));
        const unwrapper = unwrapOr(0);
        const result = await unwrapper(ao);
        expect(result).toBe(42);
    });

    it('supports currying for None', async () => {
        const ao = fromOption(ofNone<number>());
        const unwrapper = unwrapOr(0);
        const result = await unwrapper(ao);
        expect(result).toBe(0);
    });

    it('supports a Promise as the default value when resolving to Some', async () => {
        const ao = fromOption(ofSome(42));
        const result = await unwrapOr(Promise.resolve(0), ao);
        expect(result).toBe(42);
    });

    it('supports a Promise as the default value when resolving to None', async () => {
        const ao = fromOption(ofNone<number>());
        const result = await unwrapOr(Promise.resolve(0), ao);
        expect(result).toBe(0);
    });

    it('supports currying with a Promise as the default value when resolving to Some', async () => {
        const ao = fromOption(ofSome(42));
        const unwrapper = unwrapOr(Promise.resolve(0));
        const result = await unwrapper(ao);
        expect(result).toBe(42);
    });

    it('supports currying with a Promise as the default value when resolving to None', async () => {
        const ao = fromOption(ofNone<number>());
        const unwrapper = unwrapOr(Promise.resolve(0));
        const result = await unwrapper(ao);
        expect(result).toBe(0);
    });
});
