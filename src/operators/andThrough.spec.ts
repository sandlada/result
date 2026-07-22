import { describe, it, expect } from 'vitest';
import { ok, err, andThrough } from '../../src/index.js';

describe('andThrough', () => {
    it('curried: calls fn and preserves original result on success', () => {
        let side = 0;
        const through = andThrough((v: number) => { side = v; return ok('ignored'); });
        const result = through(ok(42));
        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: calls fn and preserves original result on success', () => {
        let side = 0;
        const result = andThrough((v: number) => { side = v; return ok('ignored'); }, ok(42));
        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('propagates fn error when callback fails', () => {
        const result = andThrough((_v: number) => err<string>('inner-boom'), ok(42));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('inner-boom');
    });

    it('does NOT call fn on failure, passes through', () => {
        let called = false;
        const result = andThrough(() => { called = true; return ok('ignored'); }, err<string>('boom'));
        expect(called).toBe(false);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('error type widens to E | F', () => {
        type E1 = 'e1';
        type E2 = 'e2';
        const r1 = err<E1>('e1');
        const r2 = andThrough((_v: number) => err<E2>('e2'), r1);
        expect(r2.isFailure).toBe(true);
        if (r2.isFailure) expect(r2.error).toBe('e1');
    });

    it('catches sync throw from fn and converts to Err', () => {
        const result = andThrough<number, string, Error>(
            (() => { throw new Error('fn-boom'); }) as (v: number) => { isSuccess: true; isFailure: false; value: string },
            ok(7),
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('fn-boom');
    });
});
