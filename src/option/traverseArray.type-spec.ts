import { describe, it, expectTypeOf } from 'vitest';
import { traverseArray } from './traverseArray.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('traverseArray types', () => {
    it('curried form returns (items: readonly A[]) => IOption<B[]>', () => {
        const fn = traverseArray((x: number) => ofSome(x * 2));
        type Fn = typeof fn;
        expectTypeOf<Fn>().toEqualTypeOf<(items: readonly number[]) => IOption<number[]>>();
    });

    it('direct form returns IOption<B[]>', () => {
        const r = traverseArray((x: number) => ofSome(x * 2), [1, 2, 3]);
        const _check: IOption<number[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves A from array element type', () => {
        const r = traverseArray((s: string) => ofSome(s.length), ['a', 'bb', 'ccc']);
        const _check: IOption<number[]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IOption<B[]> with None variant when fn returns None', () => {
        const r = traverseArray((x: number) => x > 0 ? ofSome(x) : ofNone(), [-1, 0, 1]);
        expectTypeOf(r.isNone).toBeBoolean();
    });
});
