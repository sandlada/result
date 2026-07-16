import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { andTee } from '../../src/async-result/andTee.js';

describe('AsyncResult andTee', () => {
    it('calls fn on success and passes original result through', async () => {
        const sideEffects: number[] = [];
        const ar = andTee((v: number) => { sideEffects.push(v); }, fromResult(ok(42)));
        const result = await ar.run();
        expect(sideEffects).toEqual([42]);
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('ignores fn return value on success', async () => {
        const ar = andTee((_v: number) => ok('ignored'), fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('ignores fn error on success', async () => {
        const ar = andTee((_v: number) => err('ignored-error'), fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('does not call fn on failure', async () => {
        let called = false;
        const ar = andTee((_v: number) => { called = true; }, fromResult(err<string>('fail')));
        await ar.run();
        expect(called).toBe(false);
    });

    it('is curried', async () => {
        const sideEffects: string[] = [];
        const tee = andTee((v: string) => { sideEffects.push(v); });
        const ar = tee(fromResult(ok('hello')));
        await ar.run();
        expect(sideEffects).toEqual(['hello']);
    });

    it('supports async side-effect', async () => {
        const sideEffects: number[] = [];
        const ar = andTee(async (v: number) => { sideEffects.push(v); }, fromResult(ok(99)));
        await ar.run();
        expect(sideEffects).toEqual([99]);
    });
});
