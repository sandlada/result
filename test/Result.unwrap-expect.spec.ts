import { describe, it, expect } from 'vitest';
import { Result, ResultOfT } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';

// FP operators
import { unwrap, expect as expectOp, unwrapErr, expectErr } from '../src/fp/operators.js';

// ─── Result (void) — OOP ───────────────────────────────────────────────────

describe('Result (void) — OOP escape hatches', () => {
    describe('unwrap()', () => {
        it('succeeds on a success result (no return)', () => {
            const r = Result.Success();
            // Should not throw
            expect(() => r.unwrap()).not.toThrow();
        });

        it('throws TypeError on a failure result', () => {
            const r = Result.Failure(new Error('boom'));
            expect(() => r.unwrap()).toThrow(TypeError);
        });

        it('includes the error in the thrown message', () => {
            const r = Result.Failure(new Error('something went wrong'));
            try {
                r.unwrap();
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('something went wrong');
            }
        });

        it('works with custom (non-Error) TError', () => {
            const r = Result.Failure({ kind: 'ValidationError' as const, reason: 'bad' });
            try {
                r.unwrap();
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                // Plain objects serialize as [object Object] via String().
                // Use expect() with a meaningful message for complex TError.
                expect((e as TypeError).message).toContain('Called unwrap() on a failure result.');
            }
        });
    });

    describe('expect(msg)', () => {
        it('succeeds on a success result (no return)', () => {
            const r = Result.Success();
            expect(() => r.expect('should not happen')).not.toThrow();
        });

        it('throws TypeError with the custom message on failure', () => {
            const r = Result.Failure(new Error('boom'));
            try {
                r.expect('User must exist');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('User must exist');
                expect(String(e)).toContain('boom');
            }
        });
    });

    describe('unwrapErr()', () => {
        it('returns the error on failure', () => {
            const err = new Error('boom');
            const r = Result.Failure(err);
            expect(r.unwrapErr()).toBe(err);
        });

        it('throws TypeError on success', () => {
            const r = Result.Success();
            expect(() => r.unwrapErr()).toThrow(TypeError);
            expect(() => r.unwrapErr()).toThrow('success');
        });
    });

    describe('expectErr(msg)', () => {
        it('returns the error on failure', () => {
            const err = new Error('boom');
            const r = Result.Failure(err);
            expect(r.expectErr('should not happen')).toBe(err);
        });

        it('throws TypeError with custom message on success', () => {
            const r = Result.Success();
            try {
                r.expectErr('Expected failure');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect((e as TypeError).message).toBe('Expected failure');
            }
        });
    });
});

// ─── ResultOfT<T> — OOP ─────────────────────────────────────────────────────

describe('ResultOfT<T> — OOP escape hatches', () => {
    describe('unwrap()', () => {
        it('returns the value on success', () => {
            const r = Result.Success(42);
            expect(r.unwrap()).toBe(42);
        });

        it('throws TypeError on failure', () => {
            const r = Result.Failure<number>(new Error('no number here'));
            expect(() => r.unwrap()).toThrow(TypeError);
        });

        it('includes the error in the thrown message', () => {
            const r = Result.Failure<string>(new Error('parse error'));
            try {
                r.unwrap();
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('parse error');
            }
        });
    });

    describe('expect(msg)', () => {
        it('returns the value on success', () => {
            const r = Result.Success('hello');
            expect(r.expect('should not happen')).toBe('hello');
        });

        it('throws TypeError with custom message on failure', () => {
            const r = Result.Failure<string>(new Error('db down'));
            try {
                r.expect('Failed to fetch user');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('Failed to fetch user');
                expect(String(e)).toContain('db down');
            }
        });

        it('works with discriminated union TError', () => {
            type AppErr = { kind: 'NotFound'; id: number };
            const r = Result.Failure<string, AppErr>({ kind: 'NotFound', id: 42 });
            try {
                r.expect('User lookup');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect((e as TypeError).message).toContain('User lookup');
            }
        });
    });

    describe('unwrapErr()', () => {
        it('returns the error on failure', () => {
            const err = new Error('nope');
            const r = Result.Failure<number>(err);
            expect(r.unwrapErr()).toBe(err);
        });

        it('throws TypeError on success', () => {
            const r = Result.Success(99);
            expect(() => r.unwrapErr()).toThrow(TypeError);
            expect(() => r.unwrapErr()).toThrow('success');
        });
    });

    describe('expectErr(msg)', () => {
        it('returns the error on failure', () => {
            const err = new Error('bad');
            const r = Result.Failure<number>(err);
            expect(r.expectErr('not needed')).toBe(err);
        });

        it('throws TypeError with custom message on success', () => {
            const r = Result.Success(7);
            try {
                r.expectErr('This should have failed');
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
            const r: IResultOfT<number> = Result.Success(42);
            expect(unwrap(r)).toBe(42);
        });

        it('throws TypeError on failure', () => {
            const r: IResultOfT<number> = Result.Failure<number>(new Error('fail'));
            expect(() => unwrap(r)).toThrow(TypeError);
        });
    });

    describe('expect(msg, r)', () => {
        it('returns value on success', () => {
            const r: IResultOfT<string> = Result.Success('hi');
            expect(expectOp('nope', r)).toBe('hi');
        });

        it('throws with custom message on failure', () => {
            const r: IResultOfT<number> = Result.Failure<number>(new Error('oops'));
            try {
                expectOp('Config missing', r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect(String(e)).toContain('Config missing');
            }
        });

        it('curried form works', () => {
            const r: IResultOfT<number> = Result.Failure<number>(new Error('bad'));
            const configOrDie = expectOp('Config required');
            expect(() => configOrDie(r)).toThrow(TypeError);
        });
    });

    describe('unwrapErr(r)', () => {
        it('returns error on failure', () => {
            const err = new Error('oops');
            const r: IResultOfT<number> = Result.Failure<number>(err);
            expect(unwrapErr(r)).toBe(err);
        });

        it('throws on success', () => {
            const r: IResultOfT<number> = Result.Success(1);
            expect(() => unwrapErr(r)).toThrow(TypeError);
        });
    });

    describe('expectErr(msg, r)', () => {
        it('returns error on failure', () => {
            const err = new Error('boom');
            const r: IResultOfT<number> = Result.Failure<number>(err);
            expect(expectErr('not needed', r)).toBe(err);
        });

        it('throws with custom message on success', () => {
            const r: IResultOfT<number> = Result.Success(3);
            try {
                expectErr('Should be error', r);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(TypeError);
                expect((e as TypeError).message).toBe('Should be error');
            }
        });

        it('curried form works', () => {
            const r: IResultOfT<number> = Result.Success(5);
            const mustFail = expectErr('Expected error path');
            expect(() => mustFail(r)).toThrow('Expected error path');
        });
    });
});

// ─── Type-narrowing after unwrap ────────────────────────────────────────────

describe('Type narrowing after escape hatches', () => {
    it('unwrap() preserves TValue type', () => {
        const r: IResultOfT<{ name: string }> = Result.Success({ name: 'Alice' });
        const user = r.unwrap();
        // Type-level check: user.name should be accessible
        expect(user.name).toBe('Alice');
    });

    it('expectErr() preserves TError type', () => {
        type AppErr = { code: number; msg: string };
        const err: AppErr = { code: 500, msg: 'server error' };
        const r: IResultOfT<string, AppErr> = Result.Failure<string, AppErr>(err);
        const unwrapped = r.expectErr('not needed');
        // Type-level check: unwrapped.code exists
        expect(unwrapped.code).toBe(500);
    });
});
