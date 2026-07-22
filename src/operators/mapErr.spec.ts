import { describe, it, expect } from 'vitest';
import { ok, err, mapErr } from '../../src/index.js';

describe('mapErr', () => {
    const toUpper = (e: string) => e.toUpperCase();

    it('curried: mapErr(fn) transforms failure error', () => {
        const upperErr = mapErr(toUpper);
        const result = upperErr(err('bad'));
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('BAD');
    });

    it('direct: mapErr(fn, failure) transforms error', () => {
        const result = mapErr(toUpper, err('bad'));
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('BAD');
    });

    it('success passes through unchanged (curried)', () => {
        const upperErr = mapErr(toUpper);
        const result = upperErr(ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('success passes through unchanged (direct)', () => {
        const result = mapErr(toUpper, ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('catches fn throw and converts to Err', () => {
        const result = mapErr<string, string, Error>(
            () => { throw new Error('fn-boom'); },
            err('original'),
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('fn-boom');
    });
});
