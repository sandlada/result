import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOr } from './unwrapOr.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

interface User {
    name: string;
}
interface DefaultUser {
    name: string;
    isGuest: true;
}

// `expectTypeOf(X).toEqualTypeOf<U>()` requires `X` to be the value form (chained)
// for vitest 4.x's MismatchArgs overload-selection rule. We prefer direct assignment
// against declared placeholders for the inner-curried tests, since the curried
// form returns a polymorphic generic whose `T` is never pinned until applied.

describe('unwrapOr types', () => {
    it('direct form returns T | D, both inferred from arguments', () => {
        const r = unwrapOr(0, ofSome(42));
        // T = number (from ofSome(42)), D = number (from default 0)
        expectTypeOf(r).toEqualTypeOf<number>();
    });

    it('returns T from Some path (direct form)', () => {
        const r = unwrapOr(0, ofSome(42));
        expectTypeOf(r).toEqualTypeOf<number>();
    });

    it('returns D from None path (direct form)', () => {
        const r = unwrapOr(0, ofNone());
        expectTypeOf(r).toEqualTypeOf<number>();
    });

    // ── Curried form: type flows through deferred <T> ─────────────────────

    it('curried form: default 0 produces a function whose return narrows T by call site', () => {
        const fn = unwrapOr(0);
        // The curried return is polymorphic — `<T>(opt: IOption<T>) => T | number`.
        // It's a *fresh* `<T>`, so it stays deferrable across calls.
        // Direct shape check via assignment.
        const _shape: <T>(opt: IOption<T>) => T | number = fn;
        expectTypeOf(_shape).toBeFunction();

        // Apply with a concrete option:
        const rNumber = fn(ofSome(42));
        expectTypeOf(rNumber).toEqualTypeOf<number>();

        const rString = fn(ofSome('hi') as IOption<string>);
        expectTypeOf(rString).toEqualTypeOf<string | number>();

        const rNone = fn(ofNone());
        expectTypeOf(rNone).toEqualTypeOf<number>();
    });

    it('preserves literal D via const-asserted default', () => {
        const fallback = 'default' as const;
        const fn = unwrapOr(fallback);
        const _shape: <T>(opt: IOption<T>) => T | 'default' = fn;
        expectTypeOf(_shape).toBeFunction();

        const opt = ofNone() as IOption<'default'>;
        const r = fn(opt);
        expectTypeOf(r).toEqualTypeOf<'default'>();
    });

    // ── Cross-shape default type contract (regression for the bug). ─────────

    it('null default permitted for a non-null option type (curried)', () => {
        const userOpt: IOption<User> = ofSome({ name: 'Alice' });
        const fn = unwrapOr(null);
        // Without `D` flowing anywhere, the curried shape is `<T>(o: IOption<T>) => T | null`.
        // Cross-shape acceptance comes from `IOption<User>` being assignable to `IOption<T>`.
        const r = fn(userOpt);
        expectTypeOf(r).toEqualTypeOf<User | null>();
    });

    it('object default with a different shape narrows to User | DefaultUser', () => {
        const userOpt: IOption<User> = ofNone();
        const fallback: DefaultUser = { name: 'Guest', isGuest: true };
        const fn = unwrapOr(fallback);
        const r = fn(userOpt);
        expectTypeOf(r).toEqualTypeOf<User | DefaultUser>();
    });

    it('object default returns the value when Some, regardless of shape', () => {
        const userOpt: IOption<User> = ofSome({ name: 'Alice' });
        const fallback: DefaultUser = { name: 'Guest', isGuest: true };
        const fn = unwrapOr(fallback);
        const r = fn(userOpt);
        expectTypeOf(r).toEqualTypeOf<User | DefaultUser>();
    });

    it('string default narrows to User | string (curried)', () => {
        const userOpt: IOption<User> = ofNone();
        const fn = unwrapOr('fallback');
        const r = fn(userOpt);
        expectTypeOf(r).toEqualTypeOf<User | string>();
    });

    it('string default narrows to User | string (direct form)', () => {
        const userOpt: IOption<User> = ofNone();
        const r = unwrapOr('fallback', userOpt);
        expectTypeOf(r).toEqualTypeOf<User | string>();
    });

    it('direct form cross-type default', () => {
        const userOpt: IOption<User> = ofSome({ name: 'Alice' });
        const r = unwrapOr({} as DefaultUser, userOpt);
        expectTypeOf(r).toEqualTypeOf<User | DefaultUser>();
    });

    it('curried with explicit T annotation pins both generics', () => {
        const fallback: DefaultUser = { name: 'Guest', isGuest: true };
        // The curried form is `<D>(defaultValue: D): <T>(opt: IOption<T>) => T | D`.
        // To pin the inner T, annotate the curried return with the desired shape.
        type Expected = <T>(opt: IOption<T>) => T | DefaultUser;
        const fn: Expected = unwrapOr(fallback);
        expectTypeOf(fn).toBeFunction();

        const userOpt: IOption<User> = ofSome({ name: 'Alice' });
        const r = fn(userOpt);
        expectTypeOf(r).toEqualTypeOf<User | DefaultUser>();
    });
});
