import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { match } from './index.js';

describe('match', () => {
    const onOk = (v: number) => `value: ${v}`;
    const onErr = (e: string) => `error: ${e}`;

    it('curried: match(onOk, onErr) applied to success', () => {
        const matcher = match(onOk, onErr);
        expect(matcher(ok(42))).toBe('value: 42');
    });

    it('curried: match(onOk, onErr) applied to failure', () => {
        const matcher = match(onOk, onErr);
        expect(matcher(err('bad'))).toBe('error: bad');
    });

    it('direct: match(onOk, onErr, ok(value))', () => {
        expect(match(onOk, onErr, ok(42))).toBe('value: 42');
    });

    it('direct: match(onOk, onErr, err(error))', () => {
        expect(match(onOk, onErr, err('bad'))).toBe('error: bad');
    });

    it('onOk and onErr can return different types — TS infers union', () => {
        const result = match(
            (_v: number): 123 | 'error' => 123 as const,
            (_e: string): 123 | 'error' => 'error' as const,
            ok(42),
        );
        expect(result).toBe(123);
    });

    it('object form: match(handlers, ok(value))', () => {
        expect(match({ ok: onOk, err: onErr }, ok(42))).toBe('value: 42');
    });

    it('object form: match(handlers, err(error))', () => {
        expect(match({ ok: onOk, err: onErr }, err('bad'))).toBe('error: bad');
    });

    it('object form: curried', () => {
        const matcher = match({ ok: onOk, err: onErr });
        expect(matcher(ok(11))).toBe('value: 11');
        expect(matcher(err('nope'))).toBe('error: nope');
    });

    it('positional direct — five-overload coverage: direct (Group A)', () => {
        expect(match(onOk, onErr, ok(1))).toBe('value: 1');
        expect(match(onOk, onErr, err('e'))).toBe('error: e');
    });

    it('positional curried — five-overload coverage: curried positional (Group A)', () => {
        const m = match(onOk, onErr);
        expect(m(ok(2))).toBe('value: 2');
        expect(m(err('e'))).toBe('error: e');
    });

    it('object direct — five-overload coverage: object direct (Group A)', () => {
        expect(match({ ok: onOk, err: onErr }, ok(3))).toBe('value: 3');
        expect(match({ ok: onOk, err: onErr }, err('e'))).toBe('error: e');
    });

    it('object curried — five-overload coverage: object curried (Group A)', () => {
        const m = match({ ok: onOk, err: onErr });
        expect(m(ok(4))).toBe('value: 4');
        expect(m(err('e'))).toBe('error: e');
    });

    it('handlers-only positional variant covers (Group A)', () => {
        const m = match(onOk, onErr);
        // direct invocation should also work without the third arg
        const curried = m(ok(5));
        expect(curried).toBe('value: 5');
    });

    it('does NOT call err handler on success (Group C)', () => {
        const onOk = vi.fn(() => `ok`);
        const onErr = vi.fn(() => `err`);
        match(onOk, onErr, ok(1));
        expect(onOk).toHaveBeenCalledTimes(1);
        expect(onErr).toHaveBeenCalledTimes(0);
    });

    it('does NOT call ok handler on failure (Group C)', () => {
        const onOk = vi.fn(() => `ok`);
        const onErr = vi.fn(() => `err`);
        match(onOk, onErr, err('e'));
        expect(onOk).toHaveBeenCalledTimes(0);
        expect(onErr).toHaveBeenCalledTimes(1);
    });
});