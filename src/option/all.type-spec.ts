import { describe, it, expectTypeOf } from 'vitest';
import { all } from './all.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('all types', () => {
    it('returns IOption<[number, string]> from mixed tuple', () => {
        const r = all([ofSome(1), ofSome('hi')] as const);
        const _check: IOption<readonly [number, string]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IOption of homogeneous tuple', () => {
        const r = all([ofSome(1), ofSome(2), ofSome(3)] as const);
        const _check: IOption<readonly [number, number, number]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IOption<never> when any element is None', () => {
        const r = all([ofSome(1), ofNone(), ofSome(2)] as const);
        expectTypeOf(r.isNone).toBeBoolean();
    });

    it('handles single-element tuple', () => {
        const r = all([ofSome(42)] as const);
        const _check: IOption<readonly [number]> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('array overload yields IOption<T[]> for runtime-sized arrays', () => {
        const opts: IOption<number>[] = [ofSome(1), ofSome(2), ofSome(3)];
        const r = all(opts);
        const _check: IOption<number[]> = r;
        expectTypeOf(_check).toBeObject();
    });
});
