import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { tap } from '../../src/async-option/tap.js';

describe('AsyncOption tap', () => {
    it('calls fn on Some and passes result through', async () => {
        const sideEffects: number[] = [];
        const ao = tap((v: number) => {
            sideEffects.push(v);
        }, fromOption(ofSome(42)));

        const result = await ao.run();

        expect(sideEffects).toEqual([42]);
        expect(result.isSome).toBe(true);
        if(result.isSome) expect(result.value).toBe(42);
    });

    it('catches callback error and turns to None', async () => {
        const ao = tap(() => { throw new Error('boom'); }, fromOption(ofSome(42)));
        const result = await ao.run();

        expect(result.isNone).toBe(true);
    });

    it('does not call fn on None', async () => {
        const fn = vi.fn();
        const ao = tap(fn, fromOption(ofNone()));

        await ao.run();

        expect(fn).not.toHaveBeenCalled();
    });

    it('works in curried form', async () => {
        const sideEffects: number[] = [];
        const tapFn = tap((v: number) => {
            sideEffects.push(v);
        });

        const ao = tapFn(fromOption(ofSome(42)));
        const result = await ao.run();

        expect(sideEffects).toEqual([42]);
        expect(result.isSome).toBe(true);
        if(result.isSome) expect(result.value).toBe(42);
    });
});
