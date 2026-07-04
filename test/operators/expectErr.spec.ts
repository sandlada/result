import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { expectErr } from '../../src/index.js';

// ─── Void result ───────────────────────────────────────────────────────────

describe('expectErr (void result)', () => {
    it('returns the error on failure', () => {
        const errVal = new Error('boom');
        const r = err(errVal);
        expect(expectErr('should not happen', r)).toBe(errVal);
    });

    it('throws TypeError with custom message on success', () => {
        const r = ok();
        try {
            expectErr('Expected failure', r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect((e as TypeError).message).toBe('Expected failure');
        }
    });
});

// ─── Value result ──────────────────────────────────────────────────────────

describe('expectErr (value result)', () => {
    it('returns the error on failure', () => {
        const errVal = new Error('bad');
        const r = err<number>(errVal);
        expect(expectErr('not needed', r)).toBe(errVal);
    });

    it('throws TypeError with custom message on success', () => {
        const r = ok(7);
        try {
            expectErr('This should have failed', r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect((e as TypeError).message).toBe('This should have failed');
        }
    });
});

// ─── FP operator form ──────────────────────────────────────────────────────

describe('expectErr (FP operator)', () => {
    it('returns error on failure', () => {
        const errVal = new Error('boom');
        const r: IResultOfT<number> = err<number>(errVal);
        expect(expectErr('not needed', r)).toBe(errVal);
    });

    it('throws with custom message on success', () => {
        const r: IResultOfT<number> = ok(3);
        try {
            expectErr('Should be error', r);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect((e as TypeError).message).toBe('Should be error');
        }
    });
});
