import { describe, it, expectTypeOf } from 'vitest';
import type { BrandedAsyncCarrier } from './asyncCarrier.js';
import { ASYNC_CARRIER_BRAND, isAsyncCarrier, markAsyncCarrier, unwrapAsyncCarrier } from './asyncCarrier.js';

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

    it('unwrapAsyncCarrier preserves the input type', () => {
        const branded = markAsyncCarrier({ run: () => 42 });
        expectTypeOf(unwrapAsyncCarrier(branded)).toEqualTypeOf<typeof branded>();
    });
});
