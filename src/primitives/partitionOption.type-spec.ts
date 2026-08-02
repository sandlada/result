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
});
