import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { liftMap } from './index.js';

describe('liftMap', () => {
    const double = (x: number) => x * 2;

    it('curried: liftMap(fn) returns a function that maps success', () => {
        const lifted = liftMap(double);
        const result = lifted(ok(21));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: liftMap(fn, ok(value)) transforms', () => {
        const result = liftMap(double, ok(21));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('failure passes through', () => {
        const result = liftMap(double, err<string>('bad'));
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('bad');
    });

    it('curried form preserves the error type across multiple invocations', () => {
        const lifted = liftMap(double);
        const a = lifted(ok(1));
        const b = lifted(ok(2));
        expect(a.isSuccess).toBe(true);
        expect(b.isSuccess).toBe(true);
        if (a.isSuccess && b.isSuccess) {
            expect(a.value).toBe(2);
            expect(b.value).toBe(4);
        }
    });

    it('curried form and direct form yield the same value for the same input', () => {
        const lifted = liftMap(double);
        const a = lifted(ok(10));
        const b = liftMap(double, ok(10));
        expect(a).toEqual(b);
    });

    it('preserves the failure reference (does not re-wrap)', () => {
        const original = err<{ kind: 'Boo'; detail: string }>({ kind: 'Boo', detail: 'whoops' });
        const result = liftMap(double, original);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess && !original.isSuccess) expect(result.error).toBe(original.error);
    });

    it('preserves object reference returned by f (no re-allocation)', () => {
        const obj = { kind: 'Computed' as const, n: 99 };
        const boxed = liftMap(() => obj);
        const result = boxed(ok(0));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(obj);
    });

    it('callback runs exactly once per call (no double-mapping)', () => {
        let calls = 0;
        const lifted = liftMap((x: number) => {
            calls += 1;
            return x + 1;
        });
        const result = lifted(ok(7));
        expect(calls).toBe(1);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(8);
    });

    it('curried form is reusable with different error shapes', () => {
        const lifted = liftMap((x: number) => x.toString());
        const a = lifted(ok(5));
        const b = lifted(err<number>(404));
        expect(a.isSuccess).toBe(true);
        if (a.isSuccess) expect(a.value).toBe('5');
        expect(b.isSuccess).toBe(false);
        if (!b.isSuccess) expect(b.error).toBe(404);
    });

    it('callback is not invoked when the input is a failure', () => {
        let calls = 0;
        const lifted = liftMap((x: number) => {
            calls += 1;
            return x;
        });
        const result = lifted(err<string>('nope'));
        expect(calls).toBe(0);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('nope');
    });

    it('preserves falsy and null success values', () => {
        const lifted = liftMap(() => 0);
        const r0 = lifted(ok(1));
        expect(r0.isSuccess).toBe(true);
        if (r0.isSuccess) expect(r0.value).toBe(0);

        const liftedNull = liftMap(() => null);
        const rN = liftedNull(ok(1));
        expect(rN.isSuccess).toBe(true);
        if (rN.isSuccess) expect(rN.value).toBeNull();
    });
});
