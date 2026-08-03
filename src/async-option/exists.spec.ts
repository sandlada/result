import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { exists } from '../../src/async-option/exists.js';

describe('AsyncOption exists', () => {
    it('returns true if predicate holds on Some', async () => {
        const result = await exists((x: number) => x > 0, fromOption(ofSome(42)));
        expect(result).toBe(true);
    });

    it('returns false if predicate fails on Some', async () => {
        const result = await exists((x: number) => x < 0, fromOption(ofSome(42)));
        expect(result).toBe(false);
    });

    it('returns false on None', async () => {
        const result = await exists((x: number) => x > 0, fromOption(ofNone()));
        expect(result).toBe(false);
    });

    it('supports async predicate', async () => {
        const result = await exists(async (x: number) => x > 0, fromOption(ofSome(42)));
        expect(result).toBe(true);
    });

    it('is curried', async () => {
        const positive = exists((x: number) => x > 0);
        const result = await positive(fromOption(ofSome(42)));
        expect(result).toBe(true);
    });

    it('propagates sync throw from async predicate (does not catch)', async () => {
        // exists returns a Promise<boolean>; sync throws from the predicate
        // bubble up as a rejected Promise. Pin the propagation contract.
        const result = exists((() => { throw new Error('boom'); }) as (x: number) => boolean, fromOption(ofSome(1)));
        await expect(result).rejects.toThrow('boom');
    });

    it('propagates rejection from async predicate (does not catch)', async () => {
        const result = exists(async () => { throw new Error('rej'); }, fromOption(ofSome(1)));
        await expect(result).rejects.toThrow('rej');
    });
});
