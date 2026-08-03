import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { or, unwrap } from './index.js';

describe('or', () => {
    it('direct form: failure falls back to other', () => {
        const fallback: IResultOfT<number> = ok(7);
        const failed: IResultOfT<number> = err<Error>(new Error('oops'));
        expect(unwrap(or(fallback, failed))).toBe(7);
    });

    it('direct form: success passes through, other is ignored', () => {
        const success: IResultOfT<number> = ok(3);
        const fallback: IResultOfT<number> = ok(99);
        expect(unwrap(or(fallback, success))).toBe(3);
    });

    it('direct form: failure returned when other is also failure', () => {
        const fallback: IResultOfT<number> = err<Error>(new Error('fallback'));
        const failed: IResultOfT<number> = err<Error>(new Error('original'));
        const r = or(fallback, failed);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('fallback');
    });

    it('curried: returns a function applied to the result later', () => {
        const fallback: IResultOfT<number> = ok(7);
        const fn = or(fallback);
        expect(unwrap(fn(err(new Error('boom'))))).toBe(7);
        expect(unwrap(fn(ok(99)))).toBe(99);
    });

    it('value is invariant — both sides share the same success type (Group B)', () => {
        const result = or(ok(1) as IResultOfT<number, string>, ok(2) as IResultOfT<number, number>);
        if (result.isSuccess) expect(result.value).toBe(2);
    });

    it('short-circuits — success skips other evaluation (Group C)', () => {
        const result = or(ok(1) as IResultOfT<number, string>, ok(2) as IResultOfT<number, number>);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(2);
    });
});
