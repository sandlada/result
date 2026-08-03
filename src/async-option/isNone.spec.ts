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

    it('is the dual of isSome for the same AsyncOption', async () => {
        // For any AsyncOption<T>, isNone(ao) XOR isSome(ao) === true.
        const some = await isNone(ofSome(1));
        const none = await isNone(ofNone<number>());
        expect(some).toBe(false);
        expect(none).toBe(true);
        expect(some !== none).toBe(true);
    });
});