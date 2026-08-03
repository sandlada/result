import { describe, it, expectTypeOf } from 'vitest';
import { reduce } from './reduce.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('reduce types', () => {
    it('returns IResultOfT<Acc, E>', () => {
        const r = reduce<number, string, number>(
            (sum, n) => ok(sum + n),
            0,
            [ok(1), ok(2), ok(3)],
        );
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves Acc from initial', () => {
        const r = reduce<string, never, { count: number }>(
            (acc) => ok(acc),
            { count: 0 },
            [],
        );
        const _check: IResultOfT<{ count: number }, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('reducer can return Err to short-circuit', () => {
        const r = reduce<number, string, number>(
            (sum, n) => n === 0 ? err<string>('zero not allowed') : ok(sum + n),
            0,
            [ok(1), ok(0)],
        );
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('reducer receives (Acc, T, index: number) signature (Step 14.2 — callback signature)', () => {
        const r = reduce<number, never, number>(
            (acc: number, n: number, i: number) => ok(acc + n + i),
            0,
            [ok(10), ok(20), ok(30)],
        );
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
        // Negative check — index must be number.
        // @ts-expect-error index should be number, not string
        reduce<number, never, number>((acc: number, n: number, i: string) => ok(acc + n + i.length), 0, [ok(1)]);
    });

    it('preserves Acc type across Err branch (Step 14.2 — Acc + error channel preservation)', () => {
        const r = reduce<number, Error, { count: number }>(
            (acc, n) => (n === 0 ? err<Error>(new Error('zero')) : ok(acc)),
            { count: 0 },
            [ok(1), ok(0)],
        );
        const _check: IResultOfT<{ count: number }, Error> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('narrowing on isSuccess exposes Acc value', () => {
        const r = reduce<number, never, string[]>(
            (acc, n) => ok([...acc, String(n)]),
            [] as string[],
            [ok(1), ok(2)],
        );
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<string[]>();
        } else {
            expectTypeOf(r.error).toEqualTypeOf<never>();
        }
    });

    it('accepts readonly array input — type-shape', () => {
        const input: readonly IResultOfT<number, string>[] = [ok(1), err('boom')];
        const r = reduce<number, string, number>(
            (sum, n) => ok(sum + n),
            0,
            input,
        );
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
