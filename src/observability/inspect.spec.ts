import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { inspect } from './index.js';

describe('inspect', () => {
    it('returns {kind: ok, value} for success', () => {
        const r = inspect(ok(42));
        expect(r).toEqual({ kind: 'ok', value: 42 });
    });

    it('returns {kind: err, error} for failure', () => {
        const r = inspect(err('boom'));
        expect(r).toEqual({ kind: 'err', error: 'boom' });
    });

    it('preserves complex values', () => {
        const v = { a: 1 };
        const r = inspect(ok(v));
        expect(r).toEqual({ kind: 'ok', value: { a: 1 } });
    });

    it('typeguards the union discriminator', () => {
        const r = inspect(ok(1));
        expect(r.kind === 'ok').toBe(true);
        if (r.kind === 'err') {
            // @ts-expect-error — narrowing works
            r.error;
        }
    });

    it('preserves value reference identity for objects', () => {
        const v = { a: 1 };
        const r = inspect(ok(v));
        expect(r.kind).toBe('ok');
        if (r.kind === 'ok') {
            expect(r.value).toBe(v);
        }
    });

    it('preserves error reference identity for objects', () => {
        const e = new Error('boom');
        const r = inspect(err(e));
        expect(r.kind).toBe('err');
        if (r.kind === 'err') {
            expect(r.error).toBe(e);
        }
    });

    it('preserves null and undefined values', () => {
        expect(inspect(ok(null))).toEqual({ kind: 'ok', value: null });
        expect(inspect(ok(undefined))).toEqual({ kind: 'ok', value: undefined });
        expect(inspect(err(null))).toEqual({ kind: 'err', error: null });
        expect(inspect(err(undefined))).toEqual({ kind: 'err', error: undefined });
    });

    it('returns readonly-friendly object shape', () => {
        const r = inspect(ok(1));
        // The returned shape is structurally readonly — frozen-check via
        // assignment-style mutations should be safe (i.e., the type system
        // declares both keys readonly). Runtime: we don't enforce freezing
        // here, but the type contract is `readonly kind` / `readonly value`.
        expect(r.kind).toBe('ok');
        expect(r).toEqual({ kind: 'ok', value: 1 });
    });

    it('distinguishes ok and err via the kind discriminator', () => {
        const okR = inspect(ok(1));
        const errR = inspect(err('boom'));
        expect(okR.kind).not.toBe(errR.kind);
    });
});