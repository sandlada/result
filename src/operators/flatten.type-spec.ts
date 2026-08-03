import { describe, it, expectTypeOf } from 'vitest';
import { flatten } from './flatten.js';
import { err, ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('flatten types', () => {
    it('removes exactly one Result layer', () => {
        const inner = ok(42) as IResultOfT<number, string>;
        const nested = ok(inner) as IResultOfT<IResultOfT<number, string>, string>;
        const result = flatten(nested);
        const _check: IResultOfT<number, string> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('leaves deeper Result layers intact', () => {
        const inner = ok(42) as IResultOfT<number, string>;
        const middle = ok(inner) as IResultOfT<IResultOfT<number, string>, string>;
        const outer = ok(middle) as IResultOfT<IResultOfT<IResultOfT<number, string>, string>, string>;
        const result = flatten(outer);
        const _check: IResultOfT<IResultOfT<number, string>, string> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the error type on outer failure (Group B)', () => {
        const outer = err('boom') as IResultOfT<IResultOfT<number, string>, string>;
        const result = flatten(outer);
        if (result.isFailure) expectTypeOf(result.error).toBeString();
    });
});
