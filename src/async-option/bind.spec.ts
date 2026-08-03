import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { bind } from '../../src/async-option/bind.js';

describe('AsyncOption bind', () => {
    it('chains to an inner AsyncOption that returns Some', async () => {
        const ao = bind((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });

    it('chains to an inner AsyncOption that returns None', async () => {
        const ao = bind(() => fromOption(ofNone()), fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isNone).toBe(true);
    });

    it('supports interoperability with Promise<IOption>', async () => {
        const ao = bind(async (x: number) => ofSome(x * 2), fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });

    it('catches callback error and turns to None', async () => {
        const ao = bind(() => { throw new Error('boom'); }, fromOption(ofSome(42)));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });

    it('catches rejected promise and turns to None', async () => {
        const ao = bind(async () => { throw new Error('boom'); }, fromOption(ofSome(42)));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });

    it('does not call fn on None', async () => {
        const fn = vi.fn((x: number) => fromOption(ofSome(x * 2)));
        const ao = bind(fn, fromOption(ofNone()));
        const result = await ao.run();

        expect(fn).not.toHaveBeenCalled();
        expect(result.isNone).toBe(true);
    });

    it('supports currying', async () => {
        const binder = bind((x: number) => fromOption(ofSome(x * 2)));
        const ao = binder(fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });

    // ── Carrier handling ─────────────────────────────────────────────────────
    // bind accepts functions that return either an AsyncOption<U> or a
    // Promise<IOption<U>>. The implementation normalises both shapes via
    // `isAsyncCarrier`. Pin that contract here.
    it('accepts fn returning Promise<IOption<U>> (carrier contract)', async () => {
        const ao = bind(async (x: number) => ofSome(x + 1), fromOption(ofSome(10)));
        const result = await ao.run();
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(11);
    });

    it('accepts fn returning AsyncOption<U> (carrier contract)', async () => {
        const ao = bind((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
        const result = await ao.run();
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(42);
    });

    // ── Throw policy (canonical catch+convert) ───────────────────────────────
    it('catches a non-Error throw reason and turns to None', async () => {
        const ao = bind(() => { throw 'string-err'; }, fromOption(ofSome(1)));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });

    it('catches a non-Error rejection reason and turns to None', async () => {
        const ao = bind(async () => { throw 42; }, fromOption(ofSome(1)));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });
});
