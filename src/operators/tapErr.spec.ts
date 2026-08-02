import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { tapErr } from './index.js';

describe('tapErr', () => {
    it('curried: side-effect called on failure, original returned', () => {
        let side: string | undefined;
        const tapper = tapErr((e: string) => { side = e; });
        const result = tapper(err<string>('bad'));
        expect(side).toBe('bad');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('bad');
    });
    it('direct: side-effect called on failure', () => {
        let side: string | undefined;
        const result = tapErr((e: string) => { side = e; }, err<string>('bad'));
        expect(side).toBe('bad');
    });
    it('success: side-effect NOT called', () => {
        let called = false;
        const result = tapErr(() => { called = true; }, ok(42));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
    });
    it('converts to err when fn throws', () => {
        const result = tapErr(() => { throw new Error('side-effect failed'); }, err<string>('original'));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('side-effect failed');
    });

    it('counts exactly one invocation on failure (Group C)', () => {
        const fn = vi.fn((_e: string) => undefined);
        tapErr(fn, err('boom'));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('counts zero invocations on success (Group C)', () => {
        const fn = vi.fn((_e: string) => undefined);
        tapErr(fn, ok(42));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('curried form — zero invocations on success (Group C)', () => {
        const fn = vi.fn((_e: string) => undefined);
        tapErr(fn)(ok(42));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('converts non-Error throw to err(caught) (Group D)', () => {
        const result = tapErr((_e: string) => { throw 'string-throw'; }, err<string>('original'));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('string-throw');
    });
});

