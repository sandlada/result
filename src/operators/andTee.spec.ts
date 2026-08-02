import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { andTee } from './index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';

describe('andTee', () => {
    it('curried: calls fn and passes original result through on success', () => {
        let side = 0;
        const tee = andTee((v: number) => { side = v; return ok('ignored'); });
        const result = tee(ok(42));
        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: calls fn and passes original result through on success', () => {
        let side = 0;
        const result = andTee((v: number) => { side = v; return ok('ignored'); }, ok(42));
        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('ignores fn error on success and preserves original', () => {
        const result = andTee((v: number) => err('inner-error'), ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('does NOT call fn on failure', () => {
        let called = false;
        const result = andTee(() => { called = true; return ok('ignored'); }, err<string>('boom'));
        expect(called).toBe(false);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('fn can return IResultOfT with different types', () => {
        const result = andTee((v: string) => ok(v.length), ok('hello'));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('hello');
    });
    it('converts to err when fn throws', () => {
        const result = andTee(() => { throw new Error('side-effect failed'); }, ok(42));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('side-effect failed');
    });

    it('counts a single invocation per success (Group C)', () => {
        const fn = vi.fn((_v: number) => ok('x'));
        andTee(fn, ok(1));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('counts zero invocations on failure (Group C)', () => {
        const fn = vi.fn((_v: number) => ok('x'));
        andTee(fn, err<string>('down'));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('curried form — zero invocations on failure (Group C)', () => {
        const fn = vi.fn((_v: number) => ok('x'));
        const tee = andTee(fn);
        tee(err<string>('down'));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('throws non-Error value — still converts to err(caught) (Group D)', () => {
        const result = andTee(() => { throw 'string-throw'; }, ok(1));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('string-throw');
    });
});
