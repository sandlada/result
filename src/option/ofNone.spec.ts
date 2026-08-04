import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofNone, ofSome } from './index.js';
import type { IOptionNone, IOption } from '../../src/types/Option.js';

describe('ofNone()', () => {
    it('returns a None variant', () => {
        const opt = ofNone();
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('conforms to IOptionNone', () => {
        // `ofNone<T>(): IOption<T>` returns the *union* IOptionSome<T> | IOptionNone,
        // so the static type isn't exactly IOptionNone — it's IOption<never> by
        // default. We narrow first, then assert the variant. The runtime payload
        // is structurally IOptionNone (no `value` field).
        const opt = ofNone();
        if (opt.isNone) {
            const _check: IOptionNone = opt;
            expect(_check.isSome).toBe(false);
        }
    });

    it('conforms to IOption<never> by default', () => {
        const opt: IOption<never> = ofNone();
        expect(opt.isSome).toBe(false);
    });

    it('accepts an explicit type parameter', () => {
        // The generic <T> widens the result type at the call site. The runtime
        // payload is still the same singleton; only the type system slot
        // changes.
        const optNum: IOption<number> = ofNone<number>();
        const optStr: IOption<string> = ofNone<string>();
        expect(optNum.isSome).toBe(false);
        expect(optStr.isSome).toBe(false);
    });

    it('isNone and isSome are true/false literals (literal discrimination)', () => {
        // CONTRACT GAP (pinned): `ofNone<T>(): IOption<T>` returns the *union*
        // `IOptionSome<T> | IOptionNone`, not the `IOptionNone` variant. So
        // at the call site `isNone`/`isSome` are `boolean`, not the literals
        // `true`/`false` — callers must narrow first. Pinned rather than
        // "fixed" because tightening the return type would change the public API.
        const opt = ofNone();
        expectTypeOf(opt.isNone).toEqualTypeOf<boolean>();
        expectTypeOf(opt.isSome).toEqualTypeOf<boolean>();
        // After narrowing, the literal discriminants are visible.
        if (opt.isNone) {
            expectTypeOf(opt.isNone).toEqualTypeOf<true>();
            expectTypeOf(opt.isSome).toEqualTypeOf<false>();
        }
    });

    it('forms a discriminated union with ofSome at the same call-site', () => {
        const some: IOption<number> = ofSome(1);
        const none: IOption<number> = ofNone<number>();
        // discriminated union narrowing
        if (some.isSome) {
            expectTypeOf(some.value).toEqualTypeOf<number>();
        }
        if (none.isNone) {
            // value is not accessible on None variant
            expectTypeOf(none.isSome).toEqualTypeOf<false>();
        }
    });

    it('ofNone() returns an object with no value field (structural discrimination)', () => {
        const opt = ofNone();
        expect('value' in opt).toBe(false);
        expect(Object.keys(opt)).toEqual(['isSome', 'isNone']);
    });

    // --- Singleton guarantees ---

    it('returns the same reference on every call (singleton)', () => {
        // All ofNone<T>() calls — regardless of T — share the same frozen
        // runtime object. Reference equality is intentional: None is a
        // unit value with no payload, so it must be a singleton.
        const a = ofNone();
        const b = ofNone();
        const c = ofNone<number>();
        const d = ofNone<string>();
        expect(a).toBe(b);
        expect(a).toBe(c);
        expect(a).toBe(d);
        expect(Object.is(a, b)).toBe(true);
    });

    it('the singleton is deep-frozen at module load', () => {
        // Type layer: IOptionNone has readonly fields, blocking writes through
        // the type system. Runtime layer: Object.freeze blocks writes through
        // the JS runtime (silently in non-strict, throws in strict mode).
        const opt = ofNone();
        expect(Object.isFrozen(opt)).toBe(true);
        // Object.isFrozen implies: no add, no remove, no reconfigure, no write.
        expect(Object.isExtensible(opt)).toBe(false);
        expect(Object.isSealed(opt)).toBe(true);
    });

    it('singleton survives across generic instantiations', () => {
        // Even though the static type is parameterized, the runtime singleton
        // is shared. This is the whole point of the singleton: free, allocation-
        // free None production regardless of T.
        for (let i = 0; i < 100; i++) ofNone<number>();
        // If ofNone created a new object per call, the last reference would
        // differ. It doesn't — proving singleton behavior.
        const ref = ofNone();
        for (let i = 0; i < 100; i++) ofNone<string>();
        expect(ofNone()).toBe(ref);
    });
});
