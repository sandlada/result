import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import {
    asyncOptionFrom as from,
    asyncOptionFromPromise as fromPromise,
    asyncOptionFromOption as fromOption,
    asyncOptionMap as map,
    asyncOptionMapAsync as mapAsync,
    asyncOptionAndThen as andThen,
    asyncOptionOrElse as orElse,
    asyncOptionMatch as match,
    asyncOptionTap as tap,
    asyncOptionTapAsync as tapAsync,
    asyncOptionUnwrapOr as unwrapOr
} from '../../src/index.js';

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

        it('mapAsync should transform value', async () => {
            const ao = mapAsync(async (x: number) => x * 2, fromOption(ofSome(21)));
            const result = await ao.run();
            expect(result.isSome).toBe(true);
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('mapAsync should catch errors and return None', async () => {
            const ao = mapAsync(async () => { throw new Error('boom'); }, fromOption(ofSome(21)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('fromOption should lift a sync option', async () => {
            const ao = fromOption(ofSome(42));
            const result = await ao.run();
            expect(result.isSome).toBe(true);
            if (result.isSome) expect(result.value).toBe(42);
        });
    });

    describe('operators', () => {
        it('map should transform value', async () => {
            const ao = map((x: number) => x * 2, fromOption(ofSome(21)));
            const result = await ao.run();
            expect(result.isSome).toBe(true);
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('map should catch errors and return None', async () => {
            const ao = map(() => { throw new Error('boom'); }, fromOption(ofSome(21)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('tapAsync should execute async side-effect on Some', async () => {
            const fn = vi.fn().mockResolvedValue(undefined);
            const ao = tapAsync(fn, fromOption(ofSome(42)));
            await ao.run();
            expect(fn).toHaveBeenCalledWith(42);
        });

        it('tapAsync should turn to None on error', async () => {
            const ao = tapAsync(async () => { throw new Error('boom'); }, fromOption(ofSome(42)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('andThen should chain AsyncOption', async () => {
            const ao = andThen((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
            const result = await ao.run();
            expect(result.isSome).toBe(true);
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('andThen should support Promise<IOption> interop', async () => {
            const ao = andThen((x: number) => Promise.resolve(ofSome(x * 2)), fromOption(ofSome(21)));
            const result = await ao.run();
            expect(result.isSome).toBe(true);
            if (result.isSome) expect(result.value).toBe(42);
        });

        it('andThen should catch errors and return None', async () => {
            const ao = andThen(() => { throw new Error('boom'); }, fromOption(ofSome(21)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('orElse should recover from None', async () => {
            const ao = orElse(() => fromOption(ofSome(0)), fromOption(ofNone()));
            const result = await ao.run();
            expect(result.isSome).toBe(true);
            if (result.isSome) expect(result.value).toBe(0);
        });

        it('tap should execute side-effect on Some', async () => {
            const fn = vi.fn();
            const ao = tap(fn, fromOption(ofSome(42)));
            await ao.run();
            expect(fn).toHaveBeenCalledWith(42);
        });

        it('tap should turn to None on error', async () => {
            const ao = tap(() => { throw new Error('boom'); }, fromOption(ofSome(42)));
            const result = await ao.run();
            expect(result.isNone).toBe(true);
        });

        it('match should call appropriate handler', async () => {
            const handlers = {
                some: (v: number) => `some ${v}`,
                none: () => 'none'
            };
            const r1 = await match(handlers, fromOption(ofSome(42)));
            expect(r1).toBe('some 42');
            const r2 = await match(handlers, fromOption(ofNone()));
            expect(r2).toBe('none');
        });

        it('unwrapOr should return value or default', async () => {
            const v1 = await unwrapOr(0, fromOption(ofSome(42)));
            expect(v1).toBe(42);
            const v2 = await unwrapOr(0, fromOption(ofNone()));
            expect(v2).toBe(0);
        });
    });
});
