import { describe, it, expect, vi } from 'vitest';
import { tap, ofSome, ofNone } from './index.js';

describe('tap', () => {
    it('calls fn with the value on Some', () => {
        let sideEffect = '';
        const result = tap((v: string) => {
            sideEffect = v;
        })(ofSome('hello'));
        expect(sideEffect).toBe('hello');
        if (result.isSome) expect(result.value).toBe('hello');
    });

    it('returns the same None', () => {
        const mockFn = vi.fn();
        const result = tap(mockFn)(ofNone());
        expect(mockFn).not.toHaveBeenCalled();
        expect(result.isSome).toBe(false);
    });

    it('converts to None when fn throws', () => {
        const mockFn = vi.fn().mockImplementation(() => {
            throw new Error('boom');
        });
        const result = tap(mockFn)(ofSome('hello'));
        expect(mockFn).toHaveBeenCalledWith('hello');
        expect(result.isNone).toBe(true);
        expect(result).toEqual(ofNone());
    });

    it('does NOT call fn on None — short-circuit (Group C)', () => {
        const fn = vi.fn((_v: number) => undefined);
        tap(fn)(ofNone());
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls fn exactly once on Some — single invocation (Group C)', () => {
        const fn = vi.fn((_v: number) => undefined);
        tap(fn)(ofSome(42));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('returns the original Some value reference unchanged on success (tee policy)', () => {
        const sentinel = { count: 1 };
        const opt = ofSome(sentinel);
        const result = tap(() => undefined)(opt);
        // same value identity — tap is a tee
        if (result.isSome) expect(result.value).toBe(sentinel);
    });

    it('catches a non-Error throw and still converts to None (Group D)', () => {
        const result = tap((_v: number) => { throw 'string-throw'; })(ofSome(1));
        expect(result.isNone).toBe(true);
    });
});
