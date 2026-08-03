import { describe, it, expectTypeOf } from 'vitest';
import { partitionOption, type Partitioned } from './partitionOption.js';
import { ofSome, ofNone } from '../option/index.js';

describe('partitionOption types', () => {
    it('returns Partitioned<T>', () => {
        const r = partitionOption([ofSome(1), ofNone(), ofSome(3)]);
        const _check: Partitioned<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T from Some values', () => {
        const r = partitionOption([ofSome('a'), ofNone(), ofSome('b')]);
        const _check: Partitioned<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('Partitioned has some and noneIndices', () => {
        type P = Partitioned<number>;
        const p: P = { some: [1, 2], noneIndices: [3, 4] };
        expectTypeOf(p.some).toEqualTypeOf<number[]>();
        expectTypeOf(p.noneIndices).toEqualTypeOf<number[]>();
    });

    it('preserves structural T across mixed payloads (Step 14.2 — value channel)', () => {
        interface Item { id: number; label: string }
        const r = partitionOption([ofSome({ id: 1, label: 'a' } satisfies Item), ofNone()]);
        const _check: Partitioned<Item> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('noneIndices is always number[] regardless of T (Step 14.2 — index type)', () => {
        const r = partitionOption([ofSome('x')]);
        if (true) {
            expectTypeOf(r.noneIndices).toEqualTypeOf<number[]>();
        }
    });

    it('some on Partitioned<T> carries exactly T[] (Step 14.2 — value array type)', () => {
        const r = partitionOption([ofSome(7 as number)]);
        if (true) {
            expectTypeOf(r.some).toEqualTypeOf<number[]>();
        }
    });

    it('accepts readonly input — returns mutable arrays', () => {
        const input: readonly ReturnType<typeof ofSome<string>>[] = [ofSome('a')];
        const r = partitionOption(input);
        const _check: Partitioned<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves inferred T even when None elements outnumber Some (Step 14.2 — T cardinality)', () => {
        const r = partitionOption([ofNone(), ofNone(), ofSome(1)]);
        const _check: Partitioned<number> = r;
        expectTypeOf(_check.some).toEqualTypeOf<number[]>();
        expectTypeOf(_check.noneIndices).toEqualTypeOf<number[]>();
    });
});
