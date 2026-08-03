import { describe, it, expect } from 'vitest';
import { ofSome } from '../../src/async-option/ofSome.js';
import { ofNone } from '../../src/async-option/ofNone.js';
import { mapOr } from '../../src/async-option/mapOr.js';

describe('AsyncOption mapOr', () => {
    it('maps Some', async () => {
        const v = await mapOr(-1, (x: number) => x * 2, ofSome(21));
        expect(v).toBe(42);
    });

    it('returns default on None', async () => {
        const v = await mapOr(-1, (x: number) => x * 2, ofNone<number>());
        expect(v).toBe(-1);
    });

    it('catches sync throws and returns default', async () => {
        const v = await mapOr(-1, () => { throw new Error('boom'); }, ofSome(21));
        expect(v).toBe(-1);
    });

    it('catches rejected promises and returns default', async () => {
        const v = await mapOr(-1, async () => { throw new Error('boom'); }, ofSome(21));
        expect(v).toBe(-1);
    });

    it('supports currying', async () => {
        const mapper = mapOr(-1, (x: number) => x * 2);
        expect(await mapper(ofSome(10))).toBe(20);
        expect(await mapper(ofNone<number>())).toBe(-1);
    });

    it('catches non-Error throw reason and returns default', async () => {
        const v = await mapOr(-1, () => { throw 'string-err'; }, ofSome(21));
        expect(v).toBe(-1);
    });

    it('catches non-Error rejection reason and returns default', async () => {
        const v = await mapOr(-1, async () => { throw 'string-err'; }, ofSome(21));
        expect(v).toBe(-1);
    });
});