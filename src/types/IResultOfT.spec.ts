/**
 * Type-level tests for IResultOfT<TValue, TError> contract.
 * These verify compile-time behavior only.
 */
import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import type { IResultOfTSuccess, IResultOfTFailure, IResultOfT } from '../../src/types/IResultOfT.js';

describe('IResultOfT — discriminated union (value-bearing)', () => {
    it('ok(value) returns IResultOfTSuccess', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('err(error) returns IResultOfTFailure', () => {
        const r = err('fail');
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('narrows correctly via isSuccess', () => {
        const r: IResultOfT<number, string> = Math.random() > 0.5 ? ok(99) : err('nope');
        if (r.isSuccess) {
            expect(r.value).toBe(99);
        } else {
            expect(r.error).toBe('nope');
        }
    });

    it('narrows correctly via isFailure', () => {
        const r: IResultOfT<string, Error> = Math.random() > 0.5 ? ok('data') : err(new Error('fail'));
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
        } else {
            expect(r.value).toBe('data');
        }
    });
});
