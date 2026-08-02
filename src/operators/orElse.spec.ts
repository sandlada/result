import { describe, it, expect, vi } from 'vitest';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { ok, err } from '../factories/index.js';
import { orElse } from './index.js';

describe('orElse', () => {
    const fallback = (_e: string) => ok<number | string>(42) as IResultOfT<number | string, string>;

    it('curried: orElse(fn) recovers from failure', () => {
        const recover = orElse(fallback);
        const result = recover(err<string>('original'));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: orElse(fn, failure) recovers', () => {
        const result = orElse(fallback, err<string>('original'));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('success passes through — fn is not called', () => {
        let called = false;
        const tracking = (_e: string) => {
            called = true;
            return ok(42) as IResultOfT<number | string, string>;
        };
        const result = orElse(tracking, ok<number>(99));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(99);
    });

    it('orElse returns failure — recovery also fails', () => {
        const result = orElse(
            (_e: string) => err<string>('recovery failed'),
            err<string>('original'),
        );
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('recovery failed');
    });

    it('catches sync throw from fn and converts to Err', () => {
        const result = orElse<number, string, Error>(
            (() => { throw new Error('fn-boom'); }) as (e: string) => IResultOfT<number, string>,
            err<string>('original'),
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('fn-boom');
    });

    it('does NOT call fn on success — short-circuit (Group C)', () => {
        const fn = vi.fn((_e: string) => ok(42) as IResultOfT<number, string>);
        orElse(fn, ok(99));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('calls fn exactly once on failure (Group C)', () => {
        const fn = vi.fn((_e: string) => ok(42) as IResultOfT<number, string>);
        orElse(fn, err<string>('e'));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('curried form — zero invocations on success (Group C)', () => {
        const fn = vi.fn((_e: string) => ok(42) as IResultOfT<number, string>);
        orElse(fn)(ok(99));
        expect(fn).toHaveBeenCalledTimes(0);
    });
});
