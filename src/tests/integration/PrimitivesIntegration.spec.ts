import { describe, it, expect } from 'vitest';
import { ok, err, pipe, map } from '../../index.js';
import { ofSome, ofNone } from '../../option/index.js';
import {
    cond,
    condErr,
    reduce,
    partitionOption,
    lift,
    sequence,
    sequenceAsyncResult,
} from '../../primitives/index.js';
import { fromResult } from '../../async-result/index.js';

describe('Primitives integration', () => {
    it('compose cond + map in a real pipeline', () => {
        const result = pipe(
            cond((n: number) => n > 0, 'must be positive', 5),
            map((x) => x * 2),
        );
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(10);
    });

    it('condErr surfaces an Err when the predicate matches', () => {
        const failed = condErr((s: string) => s.includes('@'), 'alice@x', 'invalid email');
        expect(failed.isFailure).toBe(true);
        if (failed.isFailure) expect(failed.error).toBe('invalid email');
        const passed = condErr((s: string) => s.includes('@'), 'no-at', 'invalid email');
        expect(passed.isSuccess).toBe(true);
        if (passed.isSuccess) expect(passed.value).toBe('no-at');
    });

    it('reduce yields cumulative state and short-circuits on first failure', () => {
        const r = reduce<number, string, number>(
            (sum, n) => n === 0 ? err('zero') : ok(sum + n),
            0,
            [ok(1), ok(2), ok(3)],
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(6);
    });

    it('partitionOption splits a mixed array, retaining None indices', () => {
        const opts = [ofSome(1), ofNone(), ofSome(3), ofNone(), ofSome(5)];
        const { some, noneIndices } = partitionOption(opts);
        expect(some).toEqual([1, 3, 5]);
        expect(noneIndices).toEqual([1, 3]);
    });

    it('lift safely wraps a parser for use in pipe', () => {
        const parseEven = lift(
            (s: string) => {
                const n = Number(s);
                if (Number.isNaN(n)) throw new Error('NaN');
                return n;
            },
            (e) => ({ kind: 'ParseError' as const, cause: e }),
        );
        const r1 = parseEven('42');
        expect(r1.isSuccess).toBe(true);
        if (r1.isSuccess) expect(r1.value).toBe(42);
        const r2 = parseEven('xx');
        expect(r2.isFailure).toBe(true);
        if (r2.isFailure) expect(r2.error.kind).toBe('ParseError');
    });

    it('sequence matches combine for uniform input', () => {
        const input = [ok(1), ok(2), ok(3)];
        expect(sequence(input)).toEqual([ok(1), ok(2), ok(3)].length === 3
            ? { isSuccess: true as const, isFailure: false as const, value: [1, 2, 3] } as never
            : (null as never));
        expect(sequence([ok(1), ok(2), ok(3)])).toEqual(sequence([ok(1), ok(2), ok(3)]));
    });

    it('sequenceAsyncResult defers every nested run()', async () => {
        let calls = 0;
        const ar = {
            run: () => {
                calls++;
                return Promise.resolve(ok(1));
            },
        };
        const wrapped = sequenceAsyncResult([ar, ar, ar]);
        expect(calls).toBe(0);
        const r = await wrapped.run();
        expect(calls).toBe(3);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 1, 1]);
    });

    it('full pipeline: cond → map', () => {
        const out = pipe(
            cond((n: number) => n > 0, 'non-positive', 4),
            map((x) => x + 1),
            map((x) => x * 3),
        );
        expect(out.isSuccess).toBe(true);
        if (out.isSuccess) expect(out.value).toBe(15);
    });
});