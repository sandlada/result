import { describe, it, expect } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { isNone } from './isNone.js';

describe('AsyncOption isNone', () => {
    it('returns false for Some', async () => {
        expect(await isNone(ofSome(1))).toBe(false);
    });

    it('returns true for None', async () => {
        expect(await isNone(ofNone<number>())).toBe(true);
    });
});