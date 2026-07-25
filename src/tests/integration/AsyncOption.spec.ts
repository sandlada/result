import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../option/index.js';
import {
    from,
    fromPromise,
    fromOption,
    bind,
    map,
    mapAsync,
    match,
    orElse,
    tap,
    tapAsync,
    unwrapOr,
} from '../../async-option/index.js';

describe('AsyncOption', () => {
    describe('factories', () => {
        it('from should create an AsyncOption from a thunk', async () => {
            const ao = from(() => Promise.resolve(ofSome(42)));
            const result = await ao.run();
            expect(result.isSome).toBe(true);
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('fromPromise should create Some on resolve', async () => {
            const ao = fromPromise(() => Promise.resolve(42));
            const result = await ao.run();
            expect(result.isSome).toBe(true);
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('fromPromise should create None on reject', async () => {
            const ao = fromPromise(() => Promise.reject('error'));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('fromOption should lift a sync option', async () => {
            const ao = fromOption(ofSome(7));
            const result = await ao.run();
            if (result.isSome) expect(result.value).toBe(7);
        });
    });

    describe('operators', () => {
        it('map should transform value', async () => {
            const ao = map((x: number) => x * 2, fromOption(ofSome(21)));
            const result = await ao.run();
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('map should catch errors and return None', async () => {
            const ao = map(() => { throw new Error('boom'); }, fromOption(ofSome(1)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('mapAsync should transform value', async () => {
            const ao = mapAsync(async (x: number) => x * 2, fromOption(ofSome(21)));
            const result = await ao.run();
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('mapAsync should catch errors and return None', async () => {
            const ao = mapAsync(async () => { throw new Error('boom'); }, fromOption(ofSome(1)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('bind should chain AsyncOption', async () => {
            const ao = bind((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
            const result = await ao.run();
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('bind should support Promise<IOption> interop', async () => {
            const ao = bind(async (x: number) => ofSome(x * 2), fromOption(ofSome(21)));
            const result = await ao.run();
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('bind should catch errors and return None', async () => {
            const ao = bind(() => { throw new Error('boom'); }, fromOption(ofSome(1)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('tap should execute side-effect on Some', async () => {
            const fn = vi.fn();
            const ao = tap(fn, fromOption(ofSome(42)));
            await ao.run();
            expect(fn).toHaveBeenCalled();
        });

        it('tap should turn to None on error', async () => {
            const fn = vi.fn(() => { throw new Error('boom'); });
            const ao = tap(fn, fromOption(ofSome(1)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('tapAsync should execute async side-effect on Some', async () => {
            const fn = vi.fn();
            const ao = tapAsync(fn, fromOption(ofSome(42)));
            await ao.run();
            expect(fn).toHaveBeenCalled();
        });

        it('tapAsync should turn to None on error', async () => {
            const fn = vi.fn(async () => { throw new Error('boom'); });
            const ao = tapAsync(fn, fromOption(ofSome(1)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('orElse should recover from None', async () => {
            const ao = orElse(() => fromOption(ofSome(99)), fromOption(ofNone<number>()));
            const result = await ao.run();
            if (result.isSome) expect(result.value).toBe(99);
        });

        it('match should call appropriate handler', async () => {
            const someVal = await match({
                some: (v: number) => `got ${v}`,
                none: () => 'none',
            }, fromOption(ofSome(42)));
            const noneVal = await match({
                some: (v: number) => `got ${v}`,
                none: () => 'none',
            }, fromOption(ofNone<number>()));
            expect(someVal).toBe('got 42');
            expect(noneVal).toBe('none');
        });

        it('unwrapOr should return value or default', async () => {
            const v1 = await unwrapOr(0, fromOption(ofSome(42)));
            const v2 = await unwrapOr(0, fromOption(ofNone<number>()));
            expect(v1).toBe(42);
            expect(v2).toBe(0);
        });
    });
});