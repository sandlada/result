import { describe, it, expectTypeOf } from 'vitest';
import { ok } from './ok.js';
import type { IResult } from '../types/IResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('ok types', () => {
    it('ok() returns IResult<never>', () => {
        const r = ok();
        expectTypeOf(r).toMatchTypeOf<IResult>();
    });

    it('ok(value) returns IResultOfT<T, never>', () => {
        const r = ok(42);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, never>>();
    });

    it('infers T from argument', () => {
        const r = ok('hello');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, never>>();
    });

    it('preserves complex object types', () => {
        const r = ok({ id: 1, name: 'Alice' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<{ id: number; name: string }, never>>();
    });

    it('isSuccess narrows to success variant with value', () => {
        const r = ok(42);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('handles nullable T values', () => {
        const r = ok<number | null>(null);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number | null>();
        }
    });

    it('handles undefined T values', () => {
        const r = ok<number | undefined>(undefined);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number | undefined>();
        }
    });
});
