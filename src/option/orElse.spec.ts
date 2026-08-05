import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { orElse, ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

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

    // ── Cross-type recovery: T and U are independent (regression for the bug). ───

    it('fallback can produce a different value type (curried)', () => {
        interface User { name: string }
        const userOpt: IOption<User> = ofSome({ name: 'Alice' });

        // T = User, U = string. The result widens to `User | string`.
        const r = orElse(() => ofSome('anonymous' as string))(userOpt);
        expectTypeOf(r).toEqualTypeOf<IOption<User | string>>();
        if (r.isSome) {
            // TypeScript narrows on `Some`: T = User
            expectTypeOf(r.value).toEqualTypeOf<User>();
        }
    });

    it('fallback runs on None with a different value type (curried)', () => {
        interface User { name: string }
        const userOpt: IOption<User> = ofNone();

        const r = orElse(() => ofSome('anonymous' as string))(userOpt);
        expectTypeOf(r).toEqualTypeOf<IOption<User | string>>();
        // Runtime: the branch fell through to the fallback.
        expect(r.isSome).toBe(true);
        if (r.isSome) {
            // On the recovered branch: U = string.
            expectTypeOf(r.value).toEqualTypeOf<User | string>();
            expect(r.value).toBe('anonymous');
        }
    });

    it('fallback can produce a different object shape (curried)', () => {
        interface User { name: string }
        interface DefaultUser { name: string; isGuest: true }
        const userOpt: IOption<User> = ofNone();

        const fallback: DefaultUser = { name: 'Guest', isGuest: true };
        const r = orElse(() => ofSome(fallback))(userOpt);
        expectTypeOf(r).toEqualTypeOf<IOption<User | DefaultUser>>();
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<User | DefaultUser>();
            expect(r.value).toBe(fallback);
        }
    });

    it('fallback cross-type works in the direct form', () => {
        interface User { name: string }
        const userOpt: IOption<User> = ofNone();
        const r = orElse(() => ofSome('fallback' as string), userOpt);
        expectTypeOf(r).toEqualTypeOf<IOption<User | string>>();
        if (r.isSome) expect(r.value).toBe('fallback');
    });

    it('Some pass-through preserves the original type even when fallback is different', () => {
        interface User { name: string }
        const userOpt: IOption<User> = ofSome({ name: 'Alice' });
        const r = orElse(() => ofSome('never-used' as string))(userOpt);
        expectTypeOf(r).toEqualTypeOf<IOption<User | string>>();
        // The fallback must NOT be called.
        if (r.isSome) {
            expect(r.value).toEqual({ name: 'Alice' });
        }
    });

    it('fallback that throws on None returns IOption<T | U> as None, never crashes', () => {
        interface User { name: string }
        const userOpt: IOption<User> = ofNone();
        const r = orElse<User, string>(() => {
            throw new Error('Fallback broke');
        })(userOpt);
        expectTypeOf(r).toEqualTypeOf<IOption<User | string>>();
        expect(r.isSome).toBe(false);
    });

    it('T and U can be re-bound at each application site', () => {
        const fnString = () => ofSome('default' as string);
        const opt1: IOption<number> = ofNone();
        const opt2: IOption<User> = ofNone();
        interface User { name: string }
        const r1 = orElse(fnString)(opt1);
        const r2 = orElse(fnString)(opt2);
        // r1 and r2 are independently typed
        expectTypeOf(r1).toEqualTypeOf<IOption<number | string>>();
        expectTypeOf(r2).toEqualTypeOf<IOption<User | string>>();
        if (r1.isSome) expect(r1.value).toBe('default');
        if (r2.isSome) expect(r2.value).toBe('default');
    });
});
