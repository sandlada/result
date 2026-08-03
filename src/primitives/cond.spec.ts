import { describe, it, expect } from 'vitest';
import { cond } from './index.js';

describe('cond', () => {
    it('Ok(value) when predicate is true', () => {
        const r = cond((n: number) => n > 0, 'must be positive', 5);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('Err(errorOnFalse) when predicate is false', () => {
        const r = cond((n: number) => n > 0, 'must be positive', -1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('must be positive');
    });

    it('still passes the original value through on success', () => {
        const original = { id: 7, label: 'ok' };
        const r = cond((v: typeof original) => v.id > 0, 'bad id', original);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(original);
    });

    it('predicate is invoked exactly once with the value (Step 14.2 — call-by-value contract)', () => {
        let calls = 0;
        const r = cond(
            (n: number) => {
                calls++;
                return n > 0;
            },
            'bad',
            42,
        );
        expect(calls).toBe(1);
        expect(r.isSuccess).toBe(true);
    });

    it('preserves reference identity for object values on success (Step 14.2 — value pass-through)', () => {
        const original = { id: 7 };
        const r = cond((v: typeof original) => v.id === 7, 'bad', original);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(original);
    });

    it('accepts undefined as a value argument when T includes undefined (Step 14.2 — value channel)', () => {
        const r = cond((v: undefined) => v === undefined, 'fail', undefined);
        expect(r.isSuccess).toBe(true);
    });

    it('does not evaluate predicate when the function is not called (Step 14.2 — laziness)', () => {
        // Side-effecting predicate is observable only when cond runs.
        let side = 0;
        const r = cond(
            (_n: number) => {
                side++;
                return true;
            },
            'bad',
            1,
        );
        expect(side).toBe(1);
        expect(r.isSuccess).toBe(true);
    });

    it('object-shaped error is preserved verbatim on the failure branch (Step 14.2 — error channel)', () => {
        const errObj = { code: 'E_BAD', meta: { id: 7 } };
        const r = cond((n: number) => n > 0, errObj, -1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBe(errObj);
            expect(r.error.code).toBe('E_BAD');
        }
    });

    it('does not mutate the value argument (Step 14.2 — purity)', () => {
        const sentinel = { count: 0 };
        cond((v: typeof sentinel) => v.count < 0, 'bad', sentinel);
        expect(sentinel).toEqual({ count: 0 });
    });
});
