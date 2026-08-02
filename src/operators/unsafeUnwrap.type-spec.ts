import { describe, it, expectTypeOf } from 'vitest';
import { unsafeUnwrap } from './unsafeUnwrap.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unsafeUnwrap types', () => {
    it('returns the success type with an arbitrary error type', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = unsafeUnwrap(input);
        const _check: number = result;
        expectTypeOf(_check).toBeNumber();
    });

    it('does not require the error type to extend Error', () => {
        const input = err('boom') as IResultOfT<boolean, string>;
        const result = unsafeUnwrap(input);
        const _check: boolean = result;
        expectTypeOf(_check).toBeBoolean();
    });

    it('supports primitive error types like number (Group B)', () => {
        const input = err(404) as IResultOfT<boolean, number>;
        const result = unsafeUnwrap(input);
        const _check: boolean = result;
        expectTypeOf(_check).toBeBoolean();
    });
});
