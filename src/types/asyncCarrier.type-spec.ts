import { describe, it, expectTypeOf } from 'vitest';
import type { BrandedAsyncCarrier } from './asyncCarrier.js';
import { ASYNC_CARRIER_BRAND, isAsyncCarrier, markAsyncCarrier, unwrapAsyncCarrier } from './asyncCarrier.js';
import type { AsyncResult } from './AsyncResult.js';
import type { IResultOfT } from './IResultOfT.js';
import { ok } from '../factories/index.js';

describe('asyncCarrier types', () => {
    it('ASYNC_CARRIER_BRAND is a symbol', () => {
        const brand: symbol = ASYNC_CARRIER_BRAND;
        expectTypeOf(brand).toEqualTypeOf<symbol>();
    });

    it('BrandedAsyncCarrier has a true literal at the brand key', () => {
        type B = BrandedAsyncCarrier[typeof ASYNC_CARRIER_BRAND];
        expectTypeOf<B>().toEqualTypeOf<true>();
    });

    it('markAsyncCarrier preserves the input type', () => {
        const base = { run: () => Promise.resolve(42) };
        const branded = markAsyncCarrier(base);
        expectTypeOf(branded.run).toEqualTypeOf<() => Promise<number>>();
    });

    it('markAsyncCarrier returns branded input', () => {
        const base = { run: () => 42 };
        const branded = markAsyncCarrier(base);
        // Branded value is structurally the same as base plus brand symbol.
        expectTypeOf(branded).toMatchObjectType<{ run: () => number }>();
    });

    it('isAsyncCarrier returns boolean', () => {
        const branded = markAsyncCarrier({ run: () => Promise.resolve(42) });
        expectTypeOf(isAsyncCarrier(branded)).toEqualTypeOf<boolean>();
        expectTypeOf(isAsyncCarrier(null)).toEqualTypeOf<boolean>();
        expectTypeOf(isAsyncCarrier(42)).toEqualTypeOf<boolean>();
    });

    it('isAsyncCarrier narrows its argument via a type predicate', () => {
        // isAsyncCarrier returns a TS type predicate, so the guard exposes
        // `.run` on its argument without an explicit cast.
        const value: unknown = { run: () => Promise.resolve(1) };
        if (isAsyncCarrier(value)) {
            expectTypeOf(value.run).toBeFunction();
        }
    });

    it('unwrapAsyncCarrier preserves the input type', () => {
        // The declared signature is `<T>(value: T): T` — an identity on its
        // type parameter. The implementation, however, invokes `.run()` for
        // branded carrier inputs and returns the resolved promise, so the
        // declared identity is false for branded values at runtime. The
        // helper has no production callers and is currently dead code; the
        // narrowing is left as a known gap and deletion is out of scope.
        const branded = markAsyncCarrier({ run: () => 42 });
        expectTypeOf(unwrapAsyncCarrier(branded)).toEqualTypeOf<typeof branded>();
    });

    describe('The brand key', () => {
        it('ASYNC_CARRIER_BRAND is a unique symbol, not the widened symbol type', () => {
            expectTypeOf<typeof ASYNC_CARRIER_BRAND>().not.toEqualTypeOf<symbol>();
            expectTypeOf<typeof ASYNC_CARRIER_BRAND>().toExtend<symbol>();
            // A unique symbol is usable as a type-level key; a plain `symbol` is not.
            expectTypeOf<keyof BrandedAsyncCarrier>().toEqualTypeOf<typeof ASYNC_CARRIER_BRAND>();
        });

        it('the brand key is readonly on the branded type', () => {
            const branded = markAsyncCarrier({ run: () => 42 });
            // @ts-expect-error the brand is readonly
            branded[ASYNC_CARRIER_BRAND] = true;
        });

        it('an unbranded object is not assignable to BrandedAsyncCarrier', () => {
            expectTypeOf<{ run: () => number }>().not.toExtend<BrandedAsyncCarrier>();
            // @ts-expect-error the brand cannot be forged with a plain object literal type
            const _forged: BrandedAsyncCarrier = { run: () => 42 };
        });
    });

    describe('markAsyncCarrier', () => {
        it('returns exactly the input type intersected with the brand', () => {
            const base = { run: () => 42 };
            const branded = markAsyncCarrier(base);
            expectTypeOf(branded).toEqualTypeOf<{ run: () => number } & BrandedAsyncCarrier>();
            expectTypeOf(branded[ASYNC_CARRIER_BRAND]).toEqualTypeOf<true>();
        });

        it('brands an arbitrary thunk, not only carrier-shaped objects', () => {
            const thunk = () => 42;
            const branded = markAsyncCarrier(thunk);
            expectTypeOf(branded).toEqualTypeOf<(() => number) & BrandedAsyncCarrier>();
            expectTypeOf(branded()).toEqualTypeOf<number>();
            expectTypeOf(branded[ASYNC_CARRIER_BRAND]).toEqualTypeOf<true>();
        });

        it('keeps a real AsyncResult usable as an AsyncResult', () => {
            const carrier: AsyncResult<number, string> = {
                run: async () => ok(42) as IResultOfT<number, string>,
            };
            const branded = markAsyncCarrier(carrier);
            expectTypeOf(branded).toExtend<AsyncResult<number, string>>();
            expectTypeOf(branded).toExtend<BrandedAsyncCarrier>();
            expectTypeOf(branded.run()).toEqualTypeOf<Promise<IResultOfT<number, string>>>();
        });

        it('rejects non-object inputs', () => {
            // @ts-expect-error a number is not an object
            markAsyncCarrier(42);
            // @ts-expect-error a string is not an object
            markAsyncCarrier('carrier');
            // @ts-expect-error null is not an object for the purpose of branding
            markAsyncCarrier(null);
            // @ts-expect-error undefined is not an object
            markAsyncCarrier(undefined);
        });
    });

    describe('isAsyncCarrier', () => {
        it('accepts any value, including unknown', () => {
            const value: unknown = { run: () => Promise.resolve(1) };
            expectTypeOf(isAsyncCarrier).toEqualTypeOf<(value: unknown) => boolean>();
            expectTypeOf(isAsyncCarrier(value)).toEqualTypeOf<boolean>();
            expectTypeOf(isAsyncCarrier(undefined)).toEqualTypeOf<boolean>();
        });
    });

    describe('unwrapAsyncCarrier', () => {
        it('is declared as an identity on its type parameter', () => {
            // The declared signature is `<T>(value: T): T` — an identity on its
            // type parameter. The implementation, however, invokes `.run()` for
            // branded carrier inputs and returns the resolved promise, so the
            // declared identity is false for branded values at runtime. The
            // helper has no production callers and is currently dead code; the
            // narrowing is left as a known gap and deletion is out of scope.
            expectTypeOf(unwrapAsyncCarrier<number>).toEqualTypeOf<(value: number) => number>();
            expectTypeOf(unwrapAsyncCarrier(ok(42))).toEqualTypeOf<IResultOfT<number, never>>();
        });

        it('accepts unbranded values unchanged', () => {
            const plain = { run: () => 42 };
            expectTypeOf(unwrapAsyncCarrier(plain)).toEqualTypeOf<{ run: () => number }>();
            expectTypeOf(unwrapAsyncCarrier('not a carrier')).toEqualTypeOf<string>();
        });
    });
});
