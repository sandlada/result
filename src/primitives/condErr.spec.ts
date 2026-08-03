import { describe, it, expect } from 'vitest';
import { condErr } from './index.js';

describe('condErr', () => {
    it('Err(errorOnTrue) when predicate is true', () => {
        const r = condErr((s: string) => s.includes('@'), 'alice@x', 'invalid email');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('invalid email');
    });

    it('Ok(okValue) when predicate is false', () => {
        const r = condErr((s: string) => s.includes('@'), 'no-at', 'invalid email');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('no-at');
    });

    it('predicate receives the okValue exactly once (Step 14.2 — call-by-value)', () => {
        let calls = 0;
        const r = condErr(
            (s: string) => {
                calls++;
                // Predicate is `false` for 'value' so condErr returns Ok.
                return s === 'mismatch';
            },
            'value',
            'err',
        );
        expect(calls).toBe(1);
        expect(r.isSuccess).toBe(true);
    });

    it('preserves reference identity on success branch (Step 14.2 — value channel)', () => {
        const original = { id: 1, name: 'a' };
        const r = condErr(
            (v: typeof original) => v.id === 0,
            original,
            'bad',
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(original);
    });

    it('object error is preserved verbatim on the failure branch (Step 14.2 — error channel)', () => {
        const errObj = { code: 'E_INVALID' };
        const r = condErr(
            (s: string) => s === 'bad',
            'bad',
            errObj,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(errObj);
    });

    it('accepts undefined as okValue when T includes undefined (Step 14.2 — value channel)', () => {
        const r = condErr(
            (v: undefined) => v !== undefined,
            undefined,
            'fail',
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeUndefined();
    });

    it('does not invoke predicate on failure path that goes the other way (Step 14.2 — predicate evaluation)', () => {
        // This verifies call count is exactly 1 regardless of branch.
        let calls = 0;
        const r = condErr(
            (s: string) => {
                calls++;
                return s === 'fail'; // true → error branch
            },
            'fail',
            'err',
        );
        expect(calls).toBe(1);
        expect(r.isFailure).toBe(true);
    });
});
