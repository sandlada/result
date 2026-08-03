import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { expectErr } from './index.js';

describe('expectErr (void result)', () => {
    it('returns the error on failure', () => {
        const errVal = new Error('boom');
        const r = err(errVal);
        expect(expectErr('should not happen', r)).toBe(errVal);
    });

    it('throws TypeError with custom message on success', () => {
        const r = ok();
        try {
            expectErr('Expected failure', r as unknown as IResultOfT<unknown, never>);
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect((e as TypeError).message).toBe('Expected failure');
        }
    });
});

describe('expectErr (value result)', () => {
    it('returns the error on failure', () => {
        const errVal = new Error('bad');
        const r = err<Error>(errVal);
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

describe('expectErr (FP operator / curried)', () => {
    it('returns error on failure', () => {
        const errVal = new Error('boom');
        const r: IResultOfT<number> = err<Error>(errVal);
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

    it('curried: returns a function that takes the result later', () => {
        const fn = expectErr<number, Error>('must fail');
        const errVal = new Error('boom');
        expect(fn(err(errVal))).toBe(errVal);
        expect(() => fn(ok(5))).toThrow(TypeError);
    });

    it('curried form: throws TypeError on success (Group D)', () => {
        const fn = expectErr<number, Error>('curried-success-fail');
        try {
            fn(ok(5));
        } catch (e: unknown) {
            expect(e).toBeInstanceOf(TypeError);
            expect((e as TypeError).message).toBe('curried-success-fail');
        }
    });

    it('exact error type returned on failure (Group B)', () => {
        class CustomError extends Error { public readonly code: number = 0; }
        const r = err(new CustomError());
        const result = expectErr('msg', r);
        expect(result).toBeInstanceOf(CustomError);
    });
});
