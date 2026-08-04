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

    it('rejects heterogeneous element types unless T is given explicitly', () => {
        // CONTRACT GAP (pinned): `all<T>(aos: readonly AsyncOption<T>[])` binds a
        // *single* `T`. A mixed array literal does NOT widen `T` to a union —
        // inference picks one candidate and the rest fail to assign.
        // @ts-expect-error AsyncOption<number> is not assignable to AsyncOption<string>
        all([ofSome(1), ofSome('a')]);
        // Supplying the union explicitly is the supported way to mix elements.
        const r = all<string | number>([ofSome(1), ofSome('a')]);
        expectTypeOf(r).toEqualTypeOf<AsyncOption<(string | number)[]>>();
    });

    it('returns AsyncOption<unknown[]> for an empty array literal', () => {
        // CONTRACT GAP (pinned): an empty array literal gives TypeScript no
        // inference candidate for `T`, so it falls back to `unknown` — not
        // `never`. `all<never>([])` is the way to get `AsyncOption<never[]>`.
        const r = all([]);
        expectTypeOf(r).toEqualTypeOf<AsyncOption<unknown[]>>();
        const explicit = all<never>([]);
        const _check: AsyncOption<never[]> = explicit;
        expectTypeOf(_check).toBeObject();
    });
});
