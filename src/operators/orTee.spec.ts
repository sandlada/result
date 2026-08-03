import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { orTee } from './index.js';

describe('orTee', () => {
    it('curried: calls fn and passes original result through on failure', () => {
        let side = '';
        const tee = orTee((e: string) => { side = e; return ok('ignored'); });
        const result = tee(err('boom'));
        expect(side).toBe('boom');
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('direct: calls fn and passes original result through on failure', () => {
        let side = '';
        const result = orTee((e: string) => { side = e; return ok('ignored'); }, err('boom'));
        expect(side).toBe('boom');
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('ignores fn success and preserves original failure', () => {
        const result = orTee((_e: string) => ok(42), err<string>('boom'));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('does NOT call fn on success', () => {
        let called = false;
        const result = orTee(() => { called = true; return ok('ignored'); }, ok(42));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('handles fn returning failure gracefully', () => {
        let side = '';
        const result = orTee((e: string) => { side = e; return err('inner'); }, err('boom'));
        expect(side).toBe('boom');
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });
    it('converts to err when fn throws', () => {
        const result = orTee(() => { throw new Error('side-effect failed'); }, err<string>('original'));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as unknown as Error).message).toBe('side-effect failed');
    });

    it('counts exactly one invocation on failure (Group C)', () => {
        const fn = vi.fn((_e: string) => ok('x'));
        orTee(fn, err('boom'));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('counts zero invocations on success (Group C)', () => {
        const fn = vi.fn((_e: string) => ok('x'));
        orTee(fn, ok(42));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('curried form — zero invocations on success (Group C)', () => {
        const fn = vi.fn((_e: string) => ok('x'));
        orTee(fn)(ok(42));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('non-Error throw — still converts to err(caught) (Group D)', () => {
        const result = orTee((_e: string) => { throw 'string-throw'; }, err<string>('original'));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('string-throw');
    });
});
