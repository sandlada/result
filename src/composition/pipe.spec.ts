import { describe, it, expect } from 'vitest';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { ok, err } from '../factories/index.js';
import { map, bind, orElse, match } from '../operators/index.js';
import { pipe } from './index.js';

describe('pipe', () => {
    it('single argument returns the argument itself', () => {
        const result = pipe(42);
        expect(result).toBe(42);
    });

    it('three functions — sequential transform on an ok result', () => {
        const result = pipe(
            ok(10),
            map((x: number) => x * 2),
            bind((x: number) => ok(x + 1)),
            match(
                (v: number) => `OK: ${v}`,
                (_e: unknown) => 'FAIL',
            ),
        );
        expect(result).toBe('OK: 21');
    });

    it('early failure in the pipeline short-circuits', () => {
        let afterFailure = false;
        const trackingBind = (x: number): IResultOfT<number, string> => {
            afterFailure = true;
            return ok(x * 2);
        };
        pipe(
            err<string>('original error'),
            bind(trackingBind),
            match(
                (v: number) => String(v),
                (e: string) => e,
            ),
        );
    });

    it('pipe ending with match returns a terminal value', () => {
        const result = pipe(
            ok(42),
            match(
                (v: number) => `success: ${v}`,
                (e: unknown) => `error: ${String(e)}`,
            ),
        );
        expect(result).toBe('success: 42');
    });

    it('pipe with mixed map / bind / orElse', () => {
        const result = pipe(
            err<string>('original'),
            orElse((_e: string) => ok<number>(42)),
            map((x: number) => x * 2),
            bind((x: number) => ok(x + 1)),
            match(
                (v: number) => v,
                (_e: string) => -1,
            ),
        );
        expect(result).toBe(85);
    });

    it('chains exactly 10 functions (top of the documented ladder)', () => {
        // Verifies the runtime implementation accepts the full 10-input overload.
        const result = pipe(
            1,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x * 5,
            (x: number) => x * 6,
            (x: number) => x * 7,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        // 1 → 2 → 4 → 12 → 48 → 240 → 1440 → 10080 → "10080" → 5
        expect(result).toBe(5);
    });

    it('identity pipe — returns the same reference for object values', () => {
        const obj = { a: 1 };
        const r = pipe(obj);
        expect(r).toBe(obj);
    });
});