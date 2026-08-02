import { describe, it, expectTypeOf } from 'vitest';
import { choose } from './choose.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('choose types', () => {
    it('curried form returns an array mapper', () => {
        const fn = choose((value: number) => ok(value.toString()) as IResultOfT<string, Error>);
        const _check: (items: readonly number[]) => string[] = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form collects only the success value type', () => {
        const result = choose(
            (value: number) => ok(value.toString()) as IResultOfT<string, Error>,
            [1, 2, 3] as const,
        );
        const _check: string[] = result;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves readonly array input (Group B)', () => {
        const fn = choose((value: number) => ok(value) as IResultOfT<number, Error>);
        const items: readonly number[] = [1, 2, 3];
        const result = fn(items);
        expectTypeOf(result).toEqualTypeOf<number[]>();
    });
});
