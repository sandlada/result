import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { filterOrElse } from '../../src/async-result/filterOrElse.js';

describe('AsyncResult filterOrElse', () => {
    it('passes through success if predicate holds', async () => {
        const ar = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `negative: ${x}`,
            fromResult(ok(42)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('returns error if predicate fails on success', async () => {
        const ar = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `negative: ${x}`,
            fromResult(ok(-1)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('negative: -1');
    });

    it('passes through failure', async () => {
        const ar = filterOrElse(
            (_x: number) => true,
            (_x: number) => 'should not happen',
            fromResult(err<string>('original')),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('original');
    });

    it('supports async predicate', async () => {
        const ar = filterOrElse(
            async (x: number) => x > 0,
            (x: number) => `negative: ${x}`,
            fromResult(ok(42)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
    });

    it('supports async errorFn', async () => {
        const ar = filterOrElse(
            (x: number) => x > 0,
            async (x: number) => `async-negative: ${x}`,
            fromResult(ok(-5)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('async-negative: -5');
    });

    it('is curried', async () => {
        const positiveOnly = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `neg: ${x}`,
        );
        const ar = positiveOnly(fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });
});
