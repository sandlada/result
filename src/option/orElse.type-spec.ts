import { describe, it, expectTypeOf } from 'vitest';
import { orElse } from './orElse.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

interface User {
    name: string;
}
interface DefaultUser {
    name: string;
    isGuest: true;
}

describe('orElse types', () => {
    it('curried form produces a function whose return widens T | U with deferred T', () => {
        const fn = orElse<number>(() => ofSome(0));
        // Shape: `<T>(opt: IOption<T>) => IOption<T | number>`
        const _shape: <T>(opt: IOption<T>) => IOption<T | number> = fn;
        expectTypeOf(_shape).toBeFunction();

        const r = fn(ofSome('hi') as IOption<string>);
        expectTypeOf(r).toEqualTypeOf<IOption<string | number>>();
    });

    it('preserves U from the fallback when applied to None', () => {
        const fn = orElse<string>(() => ofSome('default'));
        const r = fn(ofNone());
        expectTypeOf(r).toEqualTypeOf<IOption<string>>();
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<string>();
        }
    });

    it('cross-type recovery widens to User | string (curried)', () => {
        const fn = orElse<string>(() => ofSome('default'));
        const r = fn(ofNone() as IOption<User>);
        expectTypeOf(r).toEqualTypeOf<IOption<User | string>>();
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<User | string>();
        }
    });

    it('cross-type recovery widens to User | DefaultUser (curried)', () => {
        const fallback: DefaultUser = { name: 'Guest', isGuest: true };
        const fn = orElse<DefaultUser>(() => ofSome(fallback));
        const r = fn(ofNone() as IOption<User>);
        expectTypeOf(r).toEqualTypeOf<IOption<User | DefaultUser>>();
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<User | DefaultUser>();
        }
    });

    it('pass-through on Some keeps the original value type at the call site', () => {
        const fn = orElse<string>(() => ofSome('default'));
        const opt = ofSome({ name: 'Alice' } as User);
        const r = fn(opt);
        expectTypeOf(r).toEqualTypeOf<IOption<User | string>>();
        if (r.isSome) {
            // On Some, the value is `User`; the union widens for the *type* of the
            // carrier, but the runtime branch determines which leg is selected.
            expectTypeOf(r.value).toEqualTypeOf<User | string>();
        }
    });

    it('direct form cross-type returns IOption<User | string>', () => {
        const r = orElse(() => ofSome('fallback'), ofNone() as IOption<User>);
        expectTypeOf(r).toEqualTypeOf<IOption<User | string>>();
        if (r.isSome) expectTypeOf(r.value).toEqualTypeOf<User | string>();
    });

    it('direct form with explicit T | U generics', () => {
        // The overload signature `<T, U>(fn, opt): IOption<T | U>` lets the developer
        // pin both generics when needed.
        const r = orElse<number, string>(() => ofSome('default'), ofNone());
        expectTypeOf(r).toEqualTypeOf<IOption<number | string>>();
    });

    it('Two applications of the same curried function type independently', () => {
        const fn = orElse<string>(() => ofSome('default'));
        const r1 = fn(ofNone());
        const r2 = fn(ofNone() as IOption<User>);
        expectTypeOf(r1).toEqualTypeOf<IOption<string>>();
        expectTypeOf(r2).toEqualTypeOf<IOption<User | string>>();
    });
});
