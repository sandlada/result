import { describe, it, expect } from 'vitest';
import { ok, asyncOk, asyncErr, composeKAsync } from '../../src/index.js';

describe('composeKAsync', () => {
    it('composes two async switch functions', async () => {
        const f1 = (x: number) => asyncOk(x + 1);
        const f2 = (x: number) => asyncOk(x * 2);
        const composed = composeKAsync(f1, f2);
        const r = await composed(10);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(22);
    });

    it('short-circuits on first failure', async () => {
        const f1 = (_x: number) => asyncErr<string>('fail');
        const f2 = (x: number) => asyncOk(x * 2);
        const composed = composeKAsync(f1, f2);
        const r = await composed(10);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('composes a single function', async () => {
        const f = (x: number) => asyncOk(x + 1);
        const composed = composeKAsync(f);
        const r = await composed(41);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches sync throw from first function', async () => {
        const throwing = (_x: number): any => { throw new Error('boom'); };
        const f2 = (x: number) => asyncOk(x * 2);
        const composed = composeKAsync(throwing, f2);
        const r = await composed(10);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
    });

    it('rejects when no functions provided', async () => {
        const composed = composeKAsync();
        await expect(composed(42)).rejects.toThrow('composeKAsync requires at least one function');
    });

    it('chains mixed sync and async functions', async () => {
        const f1 = (x: number) => ok(x + 1); // sync
        const f2 = (x: number) => asyncOk(x * 2); // async
        const f3 = (x: number) => ok(String(x)); // sync
        const composed = composeKAsync(f1, f2, f3);
        const r = await composed(20);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('42');
    });
});
