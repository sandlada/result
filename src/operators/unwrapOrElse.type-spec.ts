import { describe, it, expectTypeOf } from 'vitest';
import { unwrapOrElse } from './unwrapOrElse.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrapOrElse types', () => {
    it('curried form returns the success/fallback type', () => {
        const fn = unwrapOrElse((error: string) => error.length);
        const _check: (r: IResultOfT<number, string>) => number = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the callback output type', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = unwrapOrElse((error: string) => error.length, input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });

    it('preserves the success type', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = unwrapOrElse((error: string) => error.length, input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });

    it('preserves the error type passed to onErr (Group B)', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = unwrapOrElse((error: string) => error.length, input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });
});
