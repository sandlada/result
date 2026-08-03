import { describe, it, expectTypeOf } from 'vitest';
import { toOption } from './toOption.js';
import { ok, err } from '../factories/index.js';
import type { IOption } from '../types/Option.js';
import type { IOptionNone } from '../types/Option.js';

describe('toOption types', () => {
    it('returns IOption<A> for a success result', () => {
        const opt = toOption(ok(42));
        expectTypeOf(opt).toMatchTypeOf<IOption<number>>();
    });

    it('returns IOption<A> for a failure result (error info is discarded)', () => {
        const opt = toOption(err('boom'));
        expectTypeOf(opt).toMatchTypeOf<IOption<never>>();
    });

    it('preserves the value type from IResultOfT<T, E>', () => {
        const opt = toOption(ok('hello'));
        expectTypeOf(opt).toMatchTypeOf<IOption<string>>();
    });

    it('preserves value type from complex object', () => {
        const opt = toOption(ok({ id: 1, name: 'Alice' }));
        expectTypeOf(opt).toMatchTypeOf<IOption<{ id: number; name: string }>>();
    });

    it('discards wide error shapes (e.g. discriminated union)', () => {
        type AppErr = { kind: 'NotFound'; id: string } | { kind: 'Forbidden' };
        const opt = toOption(err<AppErr>({ kind: 'NotFound', id: 'x' }));
        expectTypeOf(opt).toMatchTypeOf<IOption<never>>();
    });

    it('narrows to IOptionSome on `isSome` and IOptionNone on `isNone`', () => {
        const opt = toOption(ok(42));
        if (opt.isSome) {
            // `ok(42)` infers `T = number` (no `as const`), so the Some payload is
            // `number`, not the literal `42`. Literal preservation is covered below.
            expectTypeOf(opt.value).toEqualTypeOf<number>();
        } else {
            // @ts-expect-error value is not accessible on None variant
            opt.value;
            expectTypeOf(opt).toEqualTypeOf<IOptionNone>();
        }
    });

    it('preserves literal types from the input Success', () => {
        const opt = toOption(ok('k' as const));
        expectTypeOf(opt).toMatchTypeOf<IOption<'k'>>();
    });
});
