import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, unwrapOrOption } from '../../src/index.js';

describe('unwrapOrOption', () => {
    it('extracts the value on Some', () => {
        const val = unwrapOrOption(0)(ofSome(42));
        expect(val).toBe(42);
    });

    it('returns the default on None', () => {
        const val = unwrapOrOption(42)(ofNone());
        expect(val).toBe(42);
    });

    it('works with object defaults', () => {
        const defaultUser = { name: 'Guest' };
        const val = unwrapOrOption(defaultUser)(ofNone());
        expect(val).toBe(defaultUser);
    });

    it('direct form: extracts the value on Some', () => {
        expect(unwrapOrOption(0, ofSome(42))).toBe(42);
    });

    it('direct form: returns the default on None', () => {
        expect(unwrapOrOption(0, ofNone())).toBe(0);
    });
});
