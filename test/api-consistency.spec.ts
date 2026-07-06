import { describe, it, expect } from 'vitest';
import {
    ok,
    err,
    ofSome,
    ofNone,
    bimapAsync,
    swapAsync,
    flattenAsync,
    containsAsync,
    existsAsync,
    filterOrElseAsync,
    asyncResultBimap,
    asyncResultSwap,
    asyncResultFlatten,
    asyncResultContains,
    asyncResultExists,
    asyncResultFilterOrElse,
    asyncOptionFilter,
    asyncOptionFlatten,
    asyncOptionContains,
    asyncOptionExists,
    fromResult,
    asyncOptionFromOption
} from '../src/index.js';

describe('API Consistency - New Operators', () => {
    describe('eager async result', () => {
        it('bimapAsync', async () => {
            const r = await bimapAsync(x => x * 2, e => e + '!', Promise.resolve(ok(21)));
            if (r.isSuccess) expect(r.value).toBe(42);

            const r2 = await bimapAsync(x => x * 2, e => e + '!', Promise.resolve(err('fail')));
            if (r2.isFailure) expect(r2.error).toBe('fail!');
        });

        it('swapAsync', async () => {
            const r = await swapAsync(Promise.resolve(ok(42)));
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect(r.error).toBe(42);
        });

        it('flattenAsync', async () => {
            const r = await flattenAsync(Promise.resolve(ok(ok(42))));
            if (r.isSuccess) expect(r.value).toBe(42);
        });

        it('containsAsync', async () => {
            expect(await containsAsync(42, Promise.resolve(ok(42)))).toBe(true);
            expect(await containsAsync(42, Promise.resolve(ok(43)))).toBe(false);
        });

        it('existsAsync', async () => {
            expect(await existsAsync(x => x > 0, Promise.resolve(ok(42)))).toBe(true);
        });

        it('filterOrElseAsync', async () => {
            const r = await filterOrElseAsync(x => x > 100, () => 'too small', Promise.resolve(ok(42)));
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect(r.error).toBe('too small');
        });
    });

    describe('lazy async result', () => {
        it('asyncResultBimap', async () => {
            const ar = asyncResultBimap(x => x * 2, e => e + '!', fromResult(ok(21)));
            const r = await ar.run();
            if (r.isSuccess) expect(r.value).toBe(42);
        });

        it('asyncResultSwap', async () => {
            const ar = asyncResultSwap(fromResult(ok(42)));
            const r = await ar.run();
            expect(r.isFailure).toBe(true);
        });

        it('asyncResultFlatten', async () => {
            const ar = asyncResultFlatten(fromResult(ok(fromResult(ok(42)))));
            const r = await ar.run();
            if (r.isSuccess) expect(r.value).toBe(42);
        });
    });

    describe('lazy async option', () => {
        it('asyncOptionFilter', async () => {
            const ao = asyncOptionFilter(x => x > 100, asyncOptionFromOption(ofSome(42)));
            const r = await ao.run();
            expect(r.isNone).toBe(true);
        });

        it('asyncOptionFlatten', async () => {
            const ao = asyncOptionFlatten(asyncOptionFromOption(ofSome(asyncOptionFromOption(ofSome(42)))));
            const r = await ao.run();
            if (r.isSome) expect(r.value).toBe(42);
        });
    });
});
