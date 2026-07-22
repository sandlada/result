import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, orElseOption } from '../../src/index.js';

describe('orElseOption', () => {
    it('passes through Some unchanged', () => {
        const result = orElseOption(() => ofSome(10))(ofSome(5));
        if (result.isSome) expect(result.value).toBe(5);
    });

    it('falls back to the alternative on None', () => {
        const result = orElseOption(() => ofSome(42))(ofNone());
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(42);
    });

    it('returns None if the fallback also returns None', () => {
        const result = orElseOption(() => ofNone())(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('does not call fallback on Some (lazy evaluation)', () => {
        let called = false;
        const result = orElseOption(() => {
            called = true;
            return ofSome(10);
        })(ofSome(5));
        expect(called).toBe(false);
        if (result.isSome) expect(result.value).toBe(5);
    });

    it('returns None if the fallback throws an error', () => {
        const result = orElseOption(() => {
            throw new Error('Fallback failed');
        })(ofNone());
        expect(result.isSome).toBe(false);
    });
});
