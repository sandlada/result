import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';
import { unwrap, expect as expectOp, unwrapErr, expectErr } from '../src/index.js';

// ─── Void result escape hatches ────────────────────────────────────────────

describe('void result escape hatches', () => {
    describe('unwrap(r)', () => {
        it('succeeds on a success result (no return)', () => {
            const r = ok();
            expect(() => unwrap(r)).not.toThrow();
        });

        it('throws TypeError on a failure result', () => {
            const r = err(new Error('boom'));
            expect(() => unwrap(r)).toThrow(TypeError);
        });

        it('includes the error in the thrown message', () => {
            const r = err(new Error('something went wrong'));
            try {
                unwrap(r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('something went wrong');
            }
        });

        it('works with custom (non-Error) TError', () => {
            const r = err({ kind: 'ValidationError' as const, reason: 'bad' });
            try {
                unwrap(r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect((e as TypeError).message).toContain('Called unwrap() on a failure result.');
            }
        });
    });

    describe('expect(msg, r)', () => {
        it('succeeds on a success result (no return)', () => {
            const r = ok();
            expect(() => expectOp('should not happen', r)).not.toThrow();
        });

        it('throws TypeError with the custom message on failure', () => {
            const r = err(new Error('boom'));
            try {
                expectOp('User must exist', r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('User must exist');
                expect(String(e)).toContain('boom');
            }
        });
    });

    describe('unwrapErr(r)', () => {
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

    describe('expectErr(msg, r)', () => {
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
});

// ─── Value result escape hatches ────────────────────────────────────────────

describe('value result escape hatches', () => {
    describe('unwrap(r)', () => {
        it('returns the value on success', () => {
            const r = ok(42);
            expect(unwrap(r)).toBe(42);
        });

        it('throws TypeError on failure', () => {
            const r = err<number>(new Error('no number here'));
            expect(() => unwrap(r)).toThrow(TypeError);
        });

        it('includes the error in the thrown message', () => {
            const r = err<string>(new Error('parse error'));
            try {
                unwrap(r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('parse error');
            }
        });
    });

    describe('expect(msg, r)', () => {
        it('returns the value on success', () => {
            const r = ok('hello');
            expect(expectOp('should not happen', r)).toBe('hello');
        });

        it('throws TypeError with custom message on failure', () => {
            const r = err<string>(new Error('db down'));
            try {
                expectOp('Failed to fetch user', r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('Failed to fetch user');
                expect(String(e)).toContain('db down');
            }
        });

        it('works with discriminated union TError', () => {
            type AppErr = { kind: 'NotFound'; id: number };
            const r = err<string, AppErr>({ kind: 'NotFound', id: 42 });
            try {
                expectOp('User lookup', r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect((e as TypeError).message).toContain('User lookup');
            }
        });
    });

    describe('unwrapErr(r)', () => {
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

    describe('expectErr(msg, r)', () => {
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
});

// ─── FP operators ───────────────────────────────────────────────────────────

describe('FP escape hatch operators', () => {
    describe('unwrap(r)', () => {
        it('returns value on success', () => {
            const r: IResultOfT<number> = ok(42);
            expect(unwrap(r)).toBe(42);
        });

        it('throws TypeError on failure', () => {
            const r: IResultOfT<number> = err<number>(new Error('fail'));
            expect(() => unwrap(r)).toThrow(TypeError);
        });
    });

    describe('expect(msg, r)', () => {
        it('returns value on success', () => {
            const r: IResultOfT<string> = ok('hi');
            expect(expectOp('nope', r)).toBe('hi');
        });

        it('throws with custom message on failure', () => {
            const r: IResultOfT<number> = err<number>(new Error('oops'));
            try {
                expectOp('Config missing', r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('Config missing');
            }
        });

        it('curried form works', () => {
            const r: IResultOfT<number> = err<number>(new Error('bad'));
            const configOrDie = expectOp('Config required');
            expect(() => configOrDie(r)).toThrow(TypeError);
        });
    });

    describe('unwrapErr(r)', () => {
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

    describe('expectErr(msg, r)', () => {
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

        it('curried form works', () => {
            const r: IResultOfT<number> = ok(5);
            const mustFail = expectErr('Expected error path');
            expect(() => mustFail(r)).toThrow('Expected error path');
        });
    });
});

// ─── Type-narrowing after unwrap ────────────────────────────────────────────

describe('Type narrowing after escape hatches', () => {
    it('unwrap() preserves TValue type', () => {
        const r: IResultOfT<{ name: string }> = ok({ name: 'Alice' });
        const user = unwrap(r);
        // Type-level check: user.name should be accessible
        expect(user.name).toBe('Alice');
    });

    it('expectErr() preserves TError type', () => {
        type AppErr = { code: number; msg: string };
        const appErr: AppErr = { code: 500, msg: 'server error' };
        const r: IResultOfT<string, AppErr> = err<string, AppErr>(appErr);
        const unwrapped = expectErr('not needed', r);
        // Type-level check: unwrapped.code exists
        expect(unwrapped.code).toBe(500);
    });
});

