import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../../src/types/Option.js';
import { okOr } from '../../src/option/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';

describe('Option — okOr', () => {
    it('Some returns Ok(value)', () => {
        const result = okOr('default')(ofSome(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('None returns Err(error)', () => {
        const result = okOr('default')(ofNone() as IOption<number>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('default');
    });

    it('works with different error types', () => {
        const result = okOr(404)(ofNone() as IOption<string>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe(404);
    });

    it('works with Some string values', () => {
        const result = okOr('missing')(ofSome('hello'));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('hello');
    });

    it('produces IResultOfT<T, E> — T comes from input, E from error arg (Group B)', () => {
        const fn = okOr('default');
        const r = fn(ofSome(42));
        // Both T and E inferred from arguments
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, string>>();
    });

    it('error literal type is preserved (Group B)', () => {
        const literal = 'missing' as const;
        const fn = okOr(literal);
        const r = fn(ofNone() as IOption<number>);
        if (r.isFailure) expectTypeOf(r.error).toEqualTypeOf<'missing'>();
    });

    it('E is fixed at okOr() time, not at None time (Group B)', () => {
        type AppErr = { code: 404; msg: string };
        const err: AppErr = { code: 404, msg: 'not found' };
        const fn = okOr(err);
        const r1 = fn(ofSome(1));
        const r2 = fn(ofNone() as IOption<number>);
        if (r1.isSuccess) expectTypeOf(r1.value).toEqualTypeOf<number>();
        if (r2.isFailure) expectTypeOf(r2.error).toEqualTypeOf<AppErr>();
    });
});
