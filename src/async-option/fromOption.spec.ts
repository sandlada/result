import { describe, it, expect } from 'vitest';
import { fromOption } from '../../src/async-option/fromOption.js';
import { ofSome, ofNone } from '../../src/option/index.js';

describe('AsyncOption fromOption', () => {
    it('creates an AsyncOption from a Some option', async () => {
        const option = ofSome(42);
        const ao = fromOption(option);
        const result = await ao.run();

        expect(result).toBe(option);
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });

    it('creates an AsyncOption from a None option', async () => {
        const option = ofNone();
        const ao = fromOption(option);
        const result = await ao.run();

        expect(result).toBe(option);
        expect(result.isNone).toBe(true);
    });

    it('preserves reference identity with the input IOption', async () => {
        // fromOption lifts an IOption into AsyncOption without allocating a
        // new value object — the resolved IOption must be the same reference.
        const option = ofSome({ id: 1, name: 'x' });
        const ao = fromOption(option);
        const r1 = await ao.run();
        const r2 = await ao.run();
        expect(r1).toBe(option);
        expect(r2).toBe(option);
    });

    it('accepts a duck-typed IOption (carrying isSome/isNone + value)', async () => {
        // fromOption types as accepting IOption<T>; a duck-typed literal with
        // the same shape is acceptable at runtime (Promise.resolve passes it through).
        const duck: { isSome: true; isNone: false; value: number } = {
            isSome: true,
            isNone: false,
            value: 99,
        };
        // The static signature requires IOption<T>, so widen through unknown
        // to assert the duck-type is accepted at runtime.
        const ao = fromOption(duck as unknown as ReturnType<typeof ofSome<number>>);
        const r = await ao.run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(99);
    });
});
