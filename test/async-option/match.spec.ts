import { describe, it, expect } from 'vitest';
import { match } from '../../src/async-option/match.js';
import { from } from '../../src/async-option/from.js';
import { ofSome, ofNone } from '../../src/option/index.js';

describe('AsyncOption match', () => {
    it('matches Some and calls the some handler', async () => {
        const ao = from(() => Promise.resolve(ofSome(42)));
        const result = await match({
            some: (v) => `some ${v}`,
            none: () => 'none'
        }, ao);
        expect(result).toBe('some 42');
    });

    it('matches None and calls the none handler', async () => {
        const ao = from(() => Promise.resolve(ofNone()));
        const result = await match({
            some: (v) => `some ${v}`,
            none: () => 'none'
        }, ao);
        expect(result).toBe('none');
    });

    it('supports curried execution', async () => {
        const ao = from(() => Promise.resolve(ofSome(42)));
        const matcher = match({
            some: (v: number) => `some ${v}`,
            none: () => 'none'
        });
        const result = await matcher(ao);
        expect(result).toBe('some 42');
    });

    it('supports async handlers (some)', async () => {
        const ao = from(() => Promise.resolve(ofSome(42)));
        const result = await match({
            some: async (v) => `some async ${v}`,
            none: async () => 'none async'
        }, ao);
        expect(result).toBe('some async 42');
    });

    it('supports async handlers (none)', async () => {
        const ao = from(() => Promise.resolve(ofNone()));
        const result = await match({
            some: async (v) => `some async ${v}`,
            none: async () => 'none async'
        }, ao);
        expect(result).toBe('none async');
    });

    it('propagates errors thrown in the some handler', async () => {
        const ao = from(() => Promise.resolve(ofSome(42)));
        await expect(match({
            some: () => { throw new Error('some error'); },
            none: () => 'none'
        }, ao)).rejects.toThrow('some error');
    });

    it('propagates errors thrown in the none handler', async () => {
        const ao = from(() => Promise.resolve(ofNone()));
        await expect(match({
            some: (v) => `some ${v}`,
            none: () => { throw new Error('none error'); }
        }, ao)).rejects.toThrow('none error');
    });

    it('propagates rejected promises from async handlers', async () => {
        const ao = from(() => Promise.resolve(ofSome(42)));
        await expect(match({
            some: () => Promise.reject(new Error('async some error')),
            none: () => 'none'
        }, ao)).rejects.toThrow('async some error');
    });
});
