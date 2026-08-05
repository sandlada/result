import { describe, it, expectTypeOf } from 'vitest';
import { all } from './all.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('all types', () => {
    it('returns AsyncOption<T[]> for AsyncOption<T>[]', () => {
        const r = all([ofSome(1), ofSome(2), ofSome(3)]);
        const _check: AsyncOption<[number, number, number]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves per-position heterogeneous types from a tuple', () => {
        const r = all([ofSome(1), ofSome('a')]);
        const _check: AsyncOption<[number, string]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles readonly array input', () => {
        const aos: readonly AsyncOption<number>[] = [ofSome(1)];
        const r = all(aos);
        const _check: AsyncOption<number[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns AsyncOption<[]> for an empty tuple literal', () => {
        // Empty array literal — the tuple overload constrains to non-empty.
        // Falling through to the array overload yields AsyncOption<unknown[]>.
        const r = all([]);
        expectTypeOf(r).toEqualTypeOf<AsyncOption<unknown[]>>();
    });
});