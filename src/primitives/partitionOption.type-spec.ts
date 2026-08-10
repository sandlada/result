import { describe, it, expectTypeOf } from 'vitest';
import { partitionOption, type Partitioned } from './partitionOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('partitionOption types', () => {
    it('returns Partitioned<T>', () => {
        // `ofNone()` widens to `IOption<unknown>`; pin the array's element
        // type via explicit annotation so `T` is not absorbed into `unknown`.
        const opts: IOption<number>[] = [ofSome(1), ofNone(), ofSome(3)];
        const r = partitionOption(opts);
        const _check: Partitioned<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T from Some values', () => {
        const opts: IOption<string>[] = [ofSome('a'), ofNone(), ofSome('b')];
        const r = partitionOption(opts);
        const _check: Partitioned<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('Partitioned has some and noneIndices', () => {
        type P = Partitioned<number>;
        const p: P = { some: [1, 2], noneIndices: [3, 4] };
        // The interface declares both fields `readonly`; tests assert the
        // underlying element type rather than the mutability of the array.
        expectTypeOf(p.some).toEqualTypeOf<readonly number[]>();
        expectTypeOf(p.noneIndices).toEqualTypeOf<readonly number[]>();
    });

    it('preserves structural T across mixed payloads (value channel)', () => {
        interface Item { id: number; label: string }
        const opts: IOption<Item>[] = [ofSome({ id: 1, label: 'a' } satisfies Item), ofNone()];
        const r = partitionOption(opts);
        const _check: Partitioned<Item> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('noneIndices is always readonly number[] regardless of T (index type)', () => {
        const opts: IOption<string>[] = [ofSome('x')];
        const r = partitionOption(opts);
        if (true) {
            expectTypeOf(r.noneIndices).toEqualTypeOf<readonly number[]>();
        }
    });

    it('some on Partitioned<T> carries exactly T[] (value array type)', () => {
        const opts: IOption<number>[] = [ofSome(7 as number)];
        const r = partitionOption(opts);
        if (true) {
            expectTypeOf(r.some).toEqualTypeOf<readonly number[]>();
        }
    });

    it('accepts readonly input — returns readonly arrays', () => {
        const input: readonly ReturnType<typeof ofSome<string>>[] = [ofSome('a')];
        const r = partitionOption(input);
        const _check: Partitioned<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves inferred T even when None elements outnumber Some (T cardinality)', () => {
        const opts: IOption<number>[] = [ofNone(), ofNone(), ofSome(1)];
        const r = partitionOption(opts);
        const _check: Partitioned<number> = r;
        expectTypeOf(_check.some).toEqualTypeOf<readonly number[]>();
        expectTypeOf(_check.noneIndices).toEqualTypeOf<readonly number[]>();
    });
});
