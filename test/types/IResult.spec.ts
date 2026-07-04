/**
 * Type-level tests for IResult<TError> contract.
 * These verify compile-time behavior only.
 */
import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import type { IResult, IResultSuccess, IResultFailure } from '../../src/types/IResult.js';

describe('IResult — discriminated union (void result)', () => {
    it('ok() returns IResultSuccess', () => {
        const r = ok();
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
    });

    it('err(error) returns IResultFailure', () => {
        const r = err(new Error('oops'));
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
        expect(r.error).toBeInstanceOf(Error);
    });

    it('narrows correctly via isSuccess', () => {
        const r: IResult<string> = Math.random() > 0.5 ? ok() : err('fail');
        if (r.isSuccess) {
            // r: IResultSuccess — no error property
            expect(r).toBeDefined();
        } else {
            // r: IResultFailure<string>
            expect(r.error).toBe('fail');
        }
    });

    it('narrows correctly via isFailure', () => {
        const r: IResult<number> = ok();
        if (r.isFailure) {
            // r: IResultFailure<number>
            expect(typeof r.error).toBe('number');
        } else {
            // r: IResultSuccess
            expect(r.isSuccess).toBe(true);
        }
    });
});
