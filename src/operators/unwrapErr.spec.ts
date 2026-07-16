import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { unwrapErr } from '../../src/index.js';

// ─── Void result ───────────────────────────────────────────────────────────

describe('unwrapErr (void result)', () => {
    it('returns the error on failure', () => {
        const errVal = new Error('boom');
        const r = err(errVal);
        expect(unwrapErr(r)).toBe(errVal);
    });

    it('throws TypeError on success', () => {
        const r = ok();
        expect(() => unwrapErr(r)).toThrow(TypeError);
        expect(() => unwrapErr(r)).toThrow('success');
    });
});

// ─── Value result ──────────────────────────────────────────────────────────

describe('unwrapErr (value result)', () => {
    it('returns the error on failure', () => {
        const errVal = new Error('nope');
        const r = err<number>(errVal);
        expect(unwrapErr(r)).toBe(errVal);
    });

    it('throws TypeError on success', () => {
        const r = ok(99);
        expect(() => unwrapErr(r)).toThrow(TypeError);
        expect(() => unwrapErr(r)).toThrow('success');
    });
});

// ─── FP operator form ──────────────────────────────────────────────────────

describe('unwrapErr (FP operator)', () => {
    it('returns error on failure', () => {
        const errVal = new Error('oops');
        const r: IResultOfT<number> = err<number>(errVal);
        expect(unwrapErr(r)).toBe(errVal);
    });

    it('throws on success', () => {
        const r: IResultOfT<number> = ok(1);
        expect(() => unwrapErr(r)).toThrow(TypeError);
    });
});
