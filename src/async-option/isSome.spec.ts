import { describe, it, expect } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { isSome } from './isSome.js';

describe('AsyncOption isSome', () => {
    it('returns true for Some', async () => {
        expect(await isSome(ofSome(1))).toBe(true);
    });

    it('returns false for None', async () => {
        expect(await isSome(ofNone<number>())).toBe(false);
    });
});