import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOr } from './unwrapOr.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrapOr types', () => {
    it('curried form accepts any error type and returns the value type', () => {
        const fn = unwrapOr(0);
        const _check: (r: IResultOfT<number, Error>) => number = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the success/default type', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = unwrapOr(0, input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });

    it('preserves a successful primitive type', () => {
        const input = ok('value') as IResultOfT<string, Error>;
        const result = unwrapOr('fallback', input);
        const _check: string = result;
        expectTypeOf(_check).toBeString();
    });

    it('default and success share the same value type (Group B)', () => {
        const input = ok(7) as IResultOfT<number, string>;
        const result = unwrapOr(0, input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });
});
