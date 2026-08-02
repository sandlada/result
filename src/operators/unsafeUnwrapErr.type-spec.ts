import { describe, it, expectTypeOf } from 'vitest';
import { unsafeUnwrapErr } from './unsafeUnwrapErr.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unsafeUnwrapErr types', () => {
    it('returns the error type', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = unsafeUnwrapErr(input);
        const _check: string = result;
        expectTypeOf(_check).toBeString();
    });

    it('preserves a non-Error error type independently of success', () => {
        const input = ok(42) as IResultOfT<number, boolean>;
        const result = unsafeUnwrapErr(input);
        const _check: boolean = result;
        expectTypeOf(_check).toBeBoolean();
    });
});
