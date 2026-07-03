import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import { Option } from '../src/Option.js';
import type { IResultOfT } from '../src/IResultOfT.js';
import type { IOption } from '../src/Option.js';

// FP adapters
import { toOption as fpToOption, fromOption as fpFromOption } from '../src/fp/adapters.js';

// ─── ResultOfT.toOption() — OOP ─────────────────────────────────────────────

describe('ResultOfT.toOption() — OOP', () => {
    it('Success(value) → Some(value)', () => {
        const r = Result.Success(42);
        const opt = r.toOption();
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
        expect(opt.value).toBe(42);
    });

    it('Failure(error) → None', () => {
        const r = Result.Failure<number>(new Error('boom'));
        const opt = r.toOption();
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('preserves object references on success', () => {
        const obj = { name: 'Alice' };
        const r = Result.Success(obj);
        const opt = r.toOption();
        expect(opt.isSome).toBe(true);
        expect(opt.value).toBe(obj); // same reference
    });

    it('works with discriminated union TError', () => {
        type AppErr = { kind: 'NotFound' };
        const r = Result.Failure<string, AppErr>({ kind: 'NotFound' });
        const opt = r.toOption();
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });
});

// ─── Result.fromOption() — OOP static ───────────────────────────────────────

describe('Result.fromOption() — OOP static', () => {
    it('Some(value) → Success(value)', () => {
        const opt = Option.Some('hello');
        const r = Result.fromOption(opt, new Error('missing'));
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
        expect(r.unwrap()).toBe('hello');
    });

    it('None → Failure(errorOnNone)', () => {
        const err = new Error('value was missing');
        const opt = Option.None();
        const r = Result.fromOption(opt, err);
        expect(r.isSuccess).toBe(false);
        expect(r.isFailure).toBe(true);
        expect(r.unwrapErr()).toBe(err);
    });

    it('works with custom TError types', () => {
        type AppErr = { kind: 'MissingValue'; field: string };
        const missingErr: AppErr = { kind: 'MissingValue', field: 'username' };
        const opt: IOption<string> = Option.None();
        const r = Result.fromOption(opt, missingErr);
        expect(r.isSuccess).toBe(false);
        expect(r.unwrapErr()).toEqual(missingErr);
    });

    it('round-trips: Success → toOption → fromOption', () => {
        const original = Result.Success(99);
        const back = Result.fromOption(original.toOption(), new Error('gone'));
        expect(back.unwrap()).toBe(99);
    });

    it('round-trips: Failure → toOption → fromOption loses error', () => {
        const originalErr = new Error('original error');
        const lostErr = new Error('was none');
        const original = Result.Failure<number>(originalErr);
        const back = Result.fromOption(original.toOption(), lostErr);
        // The original error is discarded; we get the errorOnNone instead
        expect(back.unwrapErr()).toBe(lostErr);
    });
});

// ─── FP toOption ────────────────────────────────────────────────────────────

describe('FP toOption', () => {
    it('Ok(value) → Some(value)', () => {
        const r: IResultOfT<number> = Result.Success(7);
        const opt = fpToOption(r);
        expect(opt.isSome).toBe(true);
        expect(opt.value).toBe(7);
    });

    it('Err(_) → None', () => {
        const r: IResultOfT<number> = Result.Failure<number>(new Error('fail'));
        const opt = fpToOption(r);
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });
});

// ─── FP fromOption ──────────────────────────────────────────────────────────

describe('FP fromOption', () => {
    it('Some(value) → Ok(value) — direct form', () => {
        const opt: IOption<string> = Option.Some('hi');
        const r = fpFromOption(new Error('nope'), opt);
        expect(r.isSuccess).toBe(true);
        expect(r.unwrap()).toBe('hi');
    });

    it('None → Err(errorOnNone) — direct form', () => {
        const err = new Error('missing');
        const opt: IOption<number> = Option.None();
        const r = fpFromOption(err, opt);
        expect(r.isSuccess).toBe(false);
        expect(r.unwrapErr()).toBe(err);
    });

    it('curried form works', () => {
        const missingOrDie = fpFromOption(new Error('Value required'));
        const r = missingOrDie(Option.Some(123));
        expect(r.unwrap()).toBe(123);

        const r2 = missingOrDie(Option.None());
        expect(r2.isSuccess).toBe(false);
        expect(r2.unwrapErr()).toBeInstanceOf(Error);
    });
});
