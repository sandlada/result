import { describe, it, expectTypeOf } from 'vitest';
import { ok } from './ok.js';
import type { IResult } from '../types/IResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('ok types', () => {
    it('ok() returns IResult<never>', () => {
        const r = ok();
        expectTypeOf(r).toMatchTypeOf<IResult>();
    });

    it('ok(value) returns IResultOfT<T, never>', () => {
        const r = ok(42);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, never>>();
    });

    it('infers T from argument', () => {
        const r = ok('hello');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, never>>();
    });

    it('preserves complex object types', () => {
        const r = ok({ id: 1, name: 'Alice' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<{ id: number; name: string }, never>>();
    });

    it('isSuccess narrows to success variant with value', () => {
        const r = ok(42);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('handles nullable T values', () => {
        const r = ok<number | null>(null);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number | null>();
        }
    });

    it('handles undefined T values', () => {
        const r = ok<number | undefined>(undefined);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number | undefined>();
        }
    });

    // ─── Discrimination between ok() and ok(undefined) ─────────────────────

    it('ok() with no arguments yields the void success carrier (no value key on the success branch)', () => {
        // The overload `ok()` returns `IResult<never>`. The success branch of
        // `IResult` is `IResultSuccess`, which has only `isSuccess`/`isFailure`
        // — no `value` key. This is what lets callers distinguish `ok()` from
        // `ok(undefined)`.
        const r = ok();
        expectTypeOf(r).toEqualTypeOf<IResult<never>>();
        if (r.isSuccess) {
            // @ts-expect-error the void success variant has no `value` property
            r.value;
        }
    });

    it('ok(undefined) yields the value-bearing success carrier (value: undefined)', () => {
        // The overload `ok<T>(value: T)` returns `IResultOfT<T, never>`. With
        // `T = undefined`, the success branch is `IResultOfTSuccess<undefined>`
        // which still requires a `value` key (whose value is `undefined`).
        const r = ok<undefined>(undefined);
        expectTypeOf(r).toEqualTypeOf<IResultOfT<undefined, never>>();
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<undefined>();
        }
    });

    it('the two overloads are distinguishable by their success-variant shape', () => {
        // The ok() overload widens away `value`; the ok(value) overload keeps it.
        // This documents the discriminator overload set as the source of truth
        // for which shape you get, regardless of which branch TypeScript picks.
        type VoidSuccess = ReturnType<typeof ok> extends infer R
            ? R extends { isSuccess: true } ? R : never
            : never;
        expectTypeOf<VoidSuccess>().toMatchTypeOf<IResultSuccess>();
        // The value-bearing overload always carries a `value` key on the success
        // branch, even when the type is `undefined`.
        type ValueSuccess = ReturnType<typeof ok<undefined>> extends infer R
            ? R extends { isSuccess: true } ? R : never
            : never;
        expectTypeOf<ValueSuccess>().toMatchTypeOf<{ isSuccess: true; isFailure: false; value: undefined }>();
    });

    it('preserves the literal-type narrowing of string arguments', () => {
        // `as const` would narrow a literal — the factory must propagate the
        // exact literal type so consumers can use literal-type-driven dispatch.
        const r = ok('exact' as const);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<'exact', never>>();
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<'exact'>();
        }
    });

    it('the failure branch of the ok() overload carries a `never` error', () => {
        // `ok()` returns `IResult<never>`. The failure arm exists structurally
        // (so `isFailure` narrowing compiles), but its `error` payload is
        // `never` — nothing can inhabit it.
        const r = ok();
        if (r.isFailure) {
            expectTypeOf(r.error).toEqualTypeOf<never>();
        }
    });
});

// Local helper used only for type discrimination — mirrors IResultSuccess.
interface IResultSuccess {
    readonly isSuccess: true;
    readonly isFailure: false;
}