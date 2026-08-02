import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { mapOrElse } from './index.js';

describe('mapOrElse', () => {
    it('direct form', () => {
        const r = err<number>(new Error('x'));
        const result = mapOrElse(
            (e: Error) => e.message.length,
            (v: number) => v * 2,
            r,
        );
        expect(result).toBe(1);
    });
    it('curried form', () => {
        const handle = mapOrElse(
            (e: Error) => `fail: ${e.message}`,
            (v: number) => `ok: ${v}`,
        );
        expect(handle(ok(42))).toBe('ok: 42');
        expect(handle(err<number>(new Error('boom')))).toBe('fail: boom');
    });

    it('does NOT call onErr on success (Group C)', () => {
        const onErr = vi.fn((_e: Error) => 0);
        const fn = vi.fn((_v: number) => 0);
        mapOrElse(onErr, fn, ok(1));
        expect(onErr).toHaveBeenCalledTimes(0);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('does NOT call fn on failure (Group C)', () => {
        const onErr = vi.fn((_e: Error) => 0);
        const fn = vi.fn((_v: number) => 0);
        mapOrElse(onErr, fn, err<number>('e'));
        expect(onErr).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledTimes(0);
    });
});

