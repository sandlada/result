import { describe, it, expect, expectTypeOf } from 'vitest';
import { unwrapOr, ofSome, ofNone } from './index.js';
import type { IOption } from '../../src/types/Option.js';

interface User {
    name: string;
}
interface DefaultUser {
    name: string;
    isGuest: true;
}

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

    it('curried form — default object is returned by identity (Group B)', () => {
        const sentinel = { name: 'Guest' };
        const result = unwrapOr(sentinel)(ofNone() as IOption<{ name: string }>);
        expect(result).toBe(sentinel);
    });

    it('direct form — default object is returned by identity (Group B)', () => {
        const sentinel = { name: 'Guest' };
        const result = unwrapOr(sentinel, ofNone() as IOption<{ name: string }>);
        expect(result).toBe(sentinel);
    });

    it('default literal type is preserved (Group B)', () => {
        const fallback = 'default' as const;
        const result = unwrapOr(fallback)(ofNone() as IOption<'default'>);
        expectTypeOf(result).toEqualTypeOf<'default'>();
    });

    it('curried and direct form return same value for same input (Group A)', () => {
        const opt = ofSome(42);
        expect(unwrapOr(0)(opt)).toBe(unwrapOr(0, opt));
        expect(unwrapOr(99)(ofNone())).toBe(unwrapOr(99, ofNone()));
    });

    // ── Cross-type default: T and D are independent (regression for the bug). ───

    it('allow the default to differ in type from the option value (curried)', () => {
        const userOpt: IOption<User> = ofSome({ name: 'Alice' });
        const fallback: DefaultUser = { name: 'Guest', isGuest: true };
        const result = unwrapOr(fallback)(userOpt);
        expectTypeOf(result).toEqualTypeOf<User | DefaultUser>();
        expect(result).toEqual({ name: 'Alice' });
    });

    it('allow `null` as default for a non-null option (curried)', () => {
        const userOpt: IOption<User> = ofSome({ name: 'Alice' });
        const result = unwrapOr(null)(userOpt);
        expectTypeOf(result).toEqualTypeOf<User | null>();
        expect(result).toEqual({ name: 'Alice' });
    });

    it('cross-type default returns the default on None (curried)', () => {
        const userOpt: IOption<User> = ofNone();
        const fallback: DefaultUser = { name: 'Guest', isGuest: true };
        const result = unwrapOr(fallback)(userOpt);
        expectTypeOf(result).toEqualTypeOf<User | DefaultUser>();
        expect(result).toBe(fallback);
    });

    it('allow the default to differ in type from the option value (direct)', () => {
        const userOpt: IOption<User> = ofSome({ name: 'Alice' });
        const fallback: DefaultUser = { name: 'Guest', isGuest: true };
        const result = unwrapOr(fallback, userOpt);
        expectTypeOf(result).toEqualTypeOf<User | DefaultUser>();
        expect(result).toEqual({ name: 'Alice' });
    });

    it('cross-type default returns the default on None (direct)', () => {
        const userOpt: IOption<User> = ofNone();
        const result = unwrapOr('fallback', userOpt);
        expectTypeOf(result).toEqualTypeOf<User | string>();
        expect(result).toBe('fallback');
    });
});
