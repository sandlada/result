import { describe, it, expect } from 'vitest';
import { fromPredicate } from '../../src/index.js';

describe('fromPredicate', () => {
    it('creates success when predicate is true (direct)', () => {
        const r = fromPredicate(
            (x: number) => x > 0,
            'must be positive',
            5,
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('creates failure when predicate is false (curried)', () => {
        const isPositive = fromPredicate(
            (x: number) => x > 0,
            '-1 is not positive',
        );
        const r = isPositive(-1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('-1 is not positive');
    });

    it('creates failure when predicate is false (direct)', () => {
        const r = fromPredicate(
            (x: number) => x > 0,
            'must be positive',
            -1,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('must be positive');
    });

    it('works with discriminated union error types (direct)', () => {
        type AppErr = { kind: 'InvalidInput'; value: number };
        const errVal: AppErr = { kind: 'InvalidInput', value: 200 };
        const r = fromPredicate(
            (x: number) => x >= 0 && x <= 100,
            errVal,
            200,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.kind).toBe('InvalidInput');
            expect(r.error.value).toBe(200);
        }
    });

    it('works with discriminated union error types (curried)', () => {
        type AppErr = { kind: 'InvalidInput'; value: number };
        const errVal: AppErr = { kind: 'InvalidInput', value: 200 };
        const validate = fromPredicate<number, AppErr>(
            (x: number) => x >= 0 && x <= 100,
            errVal,
        );
        const r = validate(200);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.kind).toBe('InvalidInput');
        }
    });
});
