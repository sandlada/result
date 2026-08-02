import { describe, it, expect, vi, expectTypeOf } from 'vitest';
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

    it('does NOT call fn on Some — short-circuit (Group C)', () => {
        const fn = vi.fn(() => ofSome(99));
        orElse(fn)(ofSome(1));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls fn exactly once on None — single invocation (Group C)', () => {
        const fn = vi.fn(() => ofSome(42));
        orElse(fn)(ofNone());
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('returns the original Some reference unchanged on success (tee policy)', () => {
        const sentinel = { id: 'a' };
        const opt = ofSome(sentinel);
        const result = orElse(() => ofSome({ id: 'b' }))(opt);
        if (result.isSome) expect(result.value).toBe(sentinel);
    });

    it('T is unified across branches via generic inference (Group B)', () => {
        // The fallback's T must match the input T
        const r = orElse<string>(() => ofSome('recovered'))(ofNone());
        if (r.isSome) expectTypeOf(r.value).toEqualTypeOf<string>();
    });
});
