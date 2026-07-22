import { describe, it, expect } from 'vitest';
import { ok, err } from '../index.js';
import { reduce } from './index.js';

describe('reduce', () => {
    it('folds a list of successes', () => {
        const r = reduce<number, never, string>(
            (sum, n) => ok(sum + String(n)),
            '',
            [ok(1), ok(2), ok(3)],
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('123');
    });

    it('short-circuits on a source failure', () => {
        const r = reduce(
            (sum, n) => ok(sum + n),
            0,
            [ok(1), err('bad'), ok(3)],
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('bad');
    });

    it('short-circuits when reducer returns Err', () => {
        const r = reduce(
            (sum: number, n) => n === 0 ? err('zero not allowed') : ok(sum + n),
            0,
            [ok(1), ok(0), ok(5)],
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('zero not allowed');
    });

    it('returns initial on empty input', () => {
        const r = reduce((acc: number, n: number) => ok(acc + n), 10, []);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(10);
    });
});