import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';

describe('AsyncResult fromResult', () => {
    it('wraps a success result', async () => {
        const ar = fromResult(ok(42));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('wraps a failure result', async () => {
        const ar = fromResult(err('fail'));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('resolves immediately to the same result', async () => {
        const input = ok('hello');
        const ar = fromResult(input);
        const result = await ar.run();
        expect(result).toBe(input);
    });

    it('is lazy — does not block', () => {
        const ar = fromResult(ok(99));
        // Simply creating it should not throw or require await
        expect(ar).toBeDefined();
    });

    it('preserves the input IResultOfT identity (no clone)', async () => {
        const input = { isSuccess: true as const, isFailure: false as const, value: 'identity' } as IResultOfT<string, never>;
        const ar = fromResult(input);
        const result = await ar.run();
        expect(result).toBe(input);
    });

    it('preserves structured error types', async () => {
        type VErr = { field: string; message: string };
        const input = { isSuccess: false as const, isFailure: true as const, error: { field: 'email', message: 'bad' } } as IResultOfT<never, VErr>;
        const ar = fromResult(input);
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if(result.isFailure) {
            expect(result.error.field).toBe('email');
            expect(result.error.message).toBe('bad');
        }
    });
});
