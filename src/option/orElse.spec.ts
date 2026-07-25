import { describe, it, expect } from 'vitest';
import { orElse, ofSome, ofNone } from './index.js';

describe('orElse', () => {
    it('passes through Some unchanged', () => {
        const result = orElse(() => ofSome(10))(ofSome(5));
        if (result.isSome) expect(result.value).toBe(5);
    });

    it('falls back to the alternative on None', () => {
        const result = orElse(() => ofSome(42))(ofNone());
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(42);
    });

    it('returns None if the fallback also returns None', () => {
        const result = orElse(() => ofNone())(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('does not call fallback on Some (lazy evaluation)', () => {
        let called = false;
        const result = orElse(() => {
            called = true;
            return ofSome(10);
        })(ofSome(5));
        expect(called).toBe(false);
        if (result.isSome) expect(result.value).toBe(5);
    });

    it('returns None if the fallback throws an error', () => {
        const result = orElse(() => {
            throw new Error('Fallback failed');
        })(ofNone());
        expect(result.isSome).toBe(false);
    });
});
