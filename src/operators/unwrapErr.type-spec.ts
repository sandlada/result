import { describe, it, expectTypeOf } from 'vitest';
import { unwrapErr } from './unwrapErr.js';
import { err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unwrapErr types', () => {
    it('returns the error value type', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = unwrapErr(input);
        const _check: string = result;
        expectTypeOf(_check).toBeString();
    });

    it('is independent of the success type', () => {
        const input = err(false) as IResultOfT<{ value: number }, boolean>;
        const result = unwrapErr(input);
        const _check: boolean = result;
        expectTypeOf(_check).toBeBoolean();
    });
});
