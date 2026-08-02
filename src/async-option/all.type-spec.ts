import { describe, it, expectTypeOf } from 'vitest';
import { all } from './all.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('all types', () => {
    it('returns AsyncOption<T[]> for AsyncOption<T>[]', () => {
        const r = all([ofSome(1), ofSome(2), ofSome(3)]);
        const _check: AsyncOption<number[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves element T', () => {
        const r = all([ofSome('a'), ofSome('b')]);
        const _check: AsyncOption<string[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('handles readonly array input', () => {
        const aos: readonly AsyncOption<number>[] = [ofSome(1)];
        const r = all(aos);
        const _check: AsyncOption<number[]> = r;
        expectTypeOf(_check).toBeObject();
    });
});
