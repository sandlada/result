import { describe, it, expect, vi } from 'vitest';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { ok, err } from '../factories/index.js';
import { bind } from './index.js';

describe('bind', () => {
    type NumErr = { kind: 'TooSmall' };
    const validatePositive = (x: number): IResultOfT<number, NumErr> =>
        x > 0 ? ok(x) : err<NumErr>({ kind: 'TooSmall' });

    it('curried: bind(fn) chains a success', () => {
        const bound = bind(validatePositive);
        const result = bound(ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: bind(fn, ok(value)) chains', () => {
        const result = bind(validatePositive, ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('failure short-circuits — fn is not called', () => {
        let called = false;
        const trackingBind = (x: number): IResultOfT<number, NumErr> => {
            called = true;
            return ok(x);
        };
        const result = bind(trackingBind, err<string>('original error'));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('original error');
    });

    it('chain to failure — fn returns err', () => {
        const result = bind(validatePositive, ok(-1));
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toEqual({ kind: 'TooSmall' });
    });

    it('error type widens: E | F after bind with different error type', () => {
        type ParseErr = { kind: 'ParseError' };
        const validate = (x: number): IResultOfT<number, ParseErr> =>
            x < 100 ? ok(x) : err<ParseErr>({ kind: 'ParseError' });
        const result = bind(validate, ok(42));
        expect(result.isSuccess).toBe(true);
    });

    it('propagates sync throw from bound function', () => {
        const throwing = (_x: number) => { throw new Error('crash'); };
        expect(() => bind(throwing, ok(42))).toThrow('crash');
    });

    it('counts exactly one invocation on success (Group C)', () => {
        const fn = vi.fn((_x: number) => ok('chained'));
        bind(fn, ok(1));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('does NOT invoke fn on failure — downstream stays silent (Group C)', () => {
        const fn = vi.fn((_x: number) => ok('x'));
        bind(fn, err<string>('down'));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('curried form — zero invocations on failure (Group C)', () => {
        const fn = vi.fn((_x: number) => ok('x'));
        bind(fn)(err<string>('down'));
        expect(fn).toHaveBeenCalledTimes(0);
    });
});