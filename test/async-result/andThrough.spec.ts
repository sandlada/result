import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { andThrough } from '../../src/async-result/andThrough.js';

describe('AsyncResult andThrough', () => {
    it('preserves original value on callback success', async () => {
        const ar = andThrough((v: number) => fromResult(ok(v * 2)), fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('propagates callback error on success', async () => {
        const ar = andThrough((_v: number) => fromResult(err<string>('validation-failed')), fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('validation-failed');
    });

    it('does not call fn on failure', async () => {
        let called = false;
        const ar = andThrough((_v: number) => { called = true; return fromResult(ok(0)); }, fromResult(err<string>('original')));
        const result = await ar.run();
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('original');
    });

    it('supports Promise<IResultOfT> interop', async () => {
        const ar = andThrough((v: number) => Promise.resolve(ok(v * 2)), fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('is curried', async () => {
        const validate = andThrough((v: number) => v > 0 ? fromResult(ok(v)) : fromResult(err('neg')));
        const ar = validate(fromResult(ok(10)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(10);
    });

    it('catches callback sync throw', async () => {
        const ar = andThrough(() => { throw new Error('boom'); }, fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if(result.isFailure) expect((result.error as Error).message).toBe('boom');
    });
});
