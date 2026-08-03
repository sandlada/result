import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { reduce } from './index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

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

    it('passes zero-based index to the reducer (Step 14.2 — index contract)', () => {
        const seen: number[] = [];
        const r = reduce(
            (_acc: number, _n: number, i: number) => {
                seen.push(i);
                return ok(0);
            },
            0,
            [ok(10), ok(20), ok(30), ok(40)],
        );
        expect(r.isSuccess).toBe(true);
        expect(seen).toEqual([0, 1, 2, 3]);
    });

    it('does not invoke the reducer when a source failure is at index 0 (Step 14.2 — short-circuit before reducer)', () => {
        let reducerCalls = 0;
        const r = reduce(
            (_a: number, _n: number) => {
                reducerCalls++;
                return ok(0);
            },
            0,
            [err('boom'), ok(1)],
        );
        expect(r.isFailure).toBe(true);
        expect(reducerCalls).toBe(0);
    });

    it('does not invoke the reducer after the reducer itself returns Err (Step 14.2 — short-circuit on reducer Err)', () => {
        let calls = 0;
        const r = reduce(
            (_acc: number, n: number) => {
                calls++;
                if (n === 0) return err('zero not allowed');
                return ok(n);
            },
            0,
            [ok(1), ok(0), ok(2), ok(3)],
        );
        expect(r.isFailure).toBe(true);
        // The reducer is called for index 0 (value 1) and index 1 (value 0). It
        // returns Err for index 1, so we do not expect any subsequent calls.
        expect(calls).toBe(2);
        if (r.isFailure) expect(r.error).toBe('zero not allowed');
    });

    it('accumulates correctly with non-numeric Acc (Step 14.2 — Acc type flexibility)', () => {
        const r = reduce<string, never, number>(
            (acc, s) => ok(acc + s.length),
            0,
            [ok('hi'), ok('hello'), ok('ok')],
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(2 + 5 + 2);
    });

    it('accepts a readonly array input (Step 14.2 — readonly contract)', () => {
        const input: readonly IResultOfT<number, never>[] = [ok(1), ok(2), ok(3)];
        const r = reduce((acc: number, n: number) => ok(acc + n), 0, input);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(6);
    });

    it('source failure short-circuit preserves source error identity (Step 14.2 — error channel)', () => {
        const sentinel = { code: 'E_BAD' };
        const r = reduce(
            (acc: number, _n: number) => ok(acc + 1),
            0,
            [ok(1), err<{ code: string }>(sentinel)],
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(sentinel);
    });

    it('returns Ok(initial) on empty input — initial value is returned verbatim (Step 14.2 — empty boundary)', () => {
        const sentinel = { count: 0, name: 'init' };
        const r = reduce(
            (acc: typeof sentinel, _n: number) => ok(acc),
            sentinel,
            [],
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(sentinel);
    });
});
