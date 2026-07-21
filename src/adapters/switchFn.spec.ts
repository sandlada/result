import { describe, it, expect } from 'vitest';
import { switchFn } from '../../src/index.js';

describe('switchFn', () => {
    it('wraps a normal function to return a success result', () => {
        const safeParseInt = switchFn((s: string) => Number.parseInt(s, 10));
        const result = safeParseInt('42');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('catches exceptions and returns err', () => {
        const badFn = switchFn((_s: string) => {
            throw new Error('unexpected');
        });
        const result = badFn('anything');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error.message).toBe('unexpected');
    });

    it('preserves falsy return values', () => {
        const returnFalse = switchFn((_x: unknown) => false);
        const result = returnFalse(undefined);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(false);
    });

    it('preserves null return values', () => {
        const returnNull = switchFn((_x: unknown) => null);
        const result = returnNull(undefined);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeNull();
    });

    it('uses the supplied errorFn to map caught exceptions', () => {
        const mappedFn = switchFn(
            (_s: string) => { throw new Error('raw'); },
            (e: unknown) => new Error(`mapped: ${(e as Error).message}`),
        );
        const result = mappedFn('anything');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.message).toBe('mapped: raw');
        }
    });
});

