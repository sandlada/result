import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../../src/types/Option.js';
import { okOrElse } from '../../src/option/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';

describe('Option — okOrElse', () => {
    it('Some returns Ok(value)', () => {
        const result = okOrElse(() => 'default')(ofSome(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('None calls errorFn and returns Err(error)', () => {
        const result = okOrElse(() => 'default')(ofNone() as IOption<number>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('default');
    });

    it('errorFn is lazily evaluated — not called on Some', () => {
        let called = false;
        const result = okOrElse(() => { called = true; return 'err'; })(ofSome(42));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
    });

    it('errorFn is called on None', () => {
        let called = false;
        const result = okOrElse(() => { called = true; return 'err'; })(ofNone() as IOption<number>);
        expect(called).toBe(true);
        expect(result.isFailure).toBe(true);
    });

    it('catches errorFn throw and converts to Err', () => {
        const result = okOrElse<Error>(
            () => { throw new Error('errFn-boom'); },
        )(ofNone() as IOption<number>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error.message).toBe('errFn-boom');
    });

    it('does NOT call errorFn on Some — short-circuit (Group C)', () => {
        const fn = vi.fn(() => 'err');
        okOrElse(fn)(ofSome(42));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls errorFn exactly once on None — single invocation (Group C)', () => {
        const fn = vi.fn(() => 'err');
        okOrElse(fn)(ofNone() as IOption<number>);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('catches non-Error throws and converts to Err (Group D)', () => {
        const result = okOrElse<unknown>(
            () => { throw 'string-throw'; },
        )(ofNone() as IOption<number>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBeInstanceOf(Error);
    });

    it('wraps a non-Error throw in an Error so the declared error type holds', () => {
        // The error channel is typed `E | Error`, so every value the caller
        // can receive has to be an `Error` instance - `instanceof Error` must
        // not be false for a value the type claims to be an Error. The
        // original thrown value stays available through `cause`.
        const result = okOrElse<string>(
            () => { throw 'string-throw'; },
        )(ofNone() as IOption<number>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(Error);
            expect((result.error as Error).cause).toBe('string-throw');
        }
    });

    it('produces IResultOfT<T, E> - T from input, E from errorFn return (Group B)', () => {
        const fn = okOrElse<string>(() => 'default');
        const success = fn(ofSome(42));
        const failure = fn(ofNone<number>());
        if (success.isSuccess) expectTypeOf(success.value).toEqualTypeOf<number>();
        if (failure.isFailure) expectTypeOf(failure.error).toEqualTypeOf<string | Error>();
    });

    it('accepts the direct form okOrElse(errorFn, option)', () => {
        const ok = okOrElse(() => 'default', ofSome(42));
        expect(ok.isSuccess).toBe(true);
        if (ok.isSuccess) expect(ok.value).toBe(42);
        const failure = okOrElse(() => 'default', ofNone() as IOption<number>);
        expect(failure.isFailure).toBe(true);
        if (failure.isFailure) expect(failure.error).toBe('default');
    });
});
