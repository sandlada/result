import { describe, it, expect } from 'vitest';
import { switchFnAsync } from '../../src/index.js';

describe('switchFnAsync', () => {
    it('lifts an async function to async switch', async () => {
        const fetchLen = switchFnAsync(async (s: string) => s.length);
        const r = await fetchLen('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('wraps an async function returning a value', async () => {
        const fetchNum = switchFnAsync(async (s: string) => Number.parseInt(s, 10));
        const r = await fetchNum('42');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches sync exceptions and returns err', async () => {
        const badFn = switchFnAsync((_s: string) => {
            throw new Error('unexpected');
        });
        const r = await badFn('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error.message).toBe('unexpected');
    });

    it('catches rejected Promise and returns err', async () => {
        const rejectFn = switchFnAsync(async (_s: string) => {
            throw new Error('async boom');
        });
        const r = await rejectFn('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error.message).toBe('async boom');
    });

    it('preserves falsy return values', async () => {
        const returnFalse = switchFnAsync(async (_x: unknown) => false);
        const r = await returnFalse(undefined);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(false);
    });

    it('preserves null return values', async () => {
        const returnNull = switchFnAsync(async (_x: unknown) => null);
        const r = await returnNull(undefined);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeNull();
    });

    it('uses the supplied errorFn to map caught exceptions', async () => {
        const mappedFn = switchFnAsync(
            async (_s: string) => { throw new Error('raw async'); },
            (e: unknown) => new Error(`mapped: ${(e as Error).message}`),
        );
        const r = await mappedFn('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error.message).toBe('mapped: raw async');
        }
    });

    it('catches direct Promise rejections', async () => {
        const directReject = switchFnAsync((_s: string) => Promise.reject(new Error('direct reject')));
        const r = await directReject('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect((r.error as Error).message).toBe('direct reject');
    });

    it('handles primitive exceptions without errorFn fallback', async () => {
        const primitiveReject = switchFnAsync((_s: string) => {
            throw 'string error';
        });
        const r = await primitiveReject('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('string error');
    });
});
