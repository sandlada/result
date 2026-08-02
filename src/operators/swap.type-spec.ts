import { describe, it, expectTypeOf } from 'vitest';
import { swap } from './swap.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('swap types', () => {
    it('swaps the success and error types', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = swap(input);
        const _check: IResultOfT<string, number> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('supports narrowing with the swapped types', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = swap(input);
        if (result.isSuccess) expectTypeOf(result.value).toBeString();
        else expectTypeOf(result.error).toBeNumber();
    });

    it('transposes value and error types (Group B)', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = swap(input);
        if (result.isFailure) expectTypeOf(result.error).toBeNumber();
    });
});
