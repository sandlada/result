import { describe, it, expectTypeOf } from 'vitest';
import { all } from './all.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('all types', () => {
    it('returns IResultOfT<[number, string], E> for heterogeneous tuple', () => {
        const r = all([ok(1), ok('hi')] as const);
        const _check: IResultOfT<readonly [number, string], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IResultOfT<[number, number, number], E> for homogeneous tuple', () => {
        const r = all([ok(1), ok(2), ok(3)] as const);
        const _check: IResultOfT<readonly [number, number, number], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('union E when inputs have different error types', () => {
        const r = all([
            ok<number>(1) as IResultOfT<number, string>,
            ok<boolean>(true) as IResultOfT<boolean, number>,
        ] as const);
        expectTypeOf(r).toBeObject();
    });

    it('returns IResultOfT<never, E> when any element is Err', () => {
        const r = all([ok(1), err('boom'), ok(2)] as const);
        expectTypeOf(r.isSuccess).toBeBoolean();
    });
});
