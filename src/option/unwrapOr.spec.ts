import { describe, it, expect } from 'vitest';
import { unwrapOr, ofSome, ofNone } from './index.js';

describe('unwrapOr', () => {
    it('extracts the value on Some', () => {
        const val = unwrapOr(0)(ofSome(42));
        expect(val).toBe(42);
    });

    it('returns the default on None', () => {
        const val = unwrapOr(42)(ofNone());
        expect(val).toBe(42);
    });

    it('works with object defaults', () => {
        const defaultUser = { name: 'Guest' };
        const val = unwrapOr(defaultUser)(ofNone());
        expect(val).toBe(defaultUser);
    });

    it('direct form: extracts the value on Some', () => {
        expect(unwrapOr(0, ofSome(42))).toBe(42);
    });

    it('direct form: returns the default on None', () => {
        expect(unwrapOr(0, ofNone())).toBe(0);
    });
});
