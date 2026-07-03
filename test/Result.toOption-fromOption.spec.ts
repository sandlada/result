import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import { ofSome, ofNone } from '../src/index.js';
import type { IOption } from '../src/types/Option.js';
import { toOption, fromOption, unwrap, unwrapErr } from '../src/index.js';

// ─── toOption ───────────────────────────────────────────────────────────────

describe('toOption', () => {
    it('Success(value) → Some(value)', () => {
        const opt = toOption(ok(42));
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
        if (opt.isSome) expect(opt.value).toBe(42);
    });

    it('Failure(error) → None', () => {
        const opt = toOption(err<number>(new Error('boom')));
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('preserves object references on success', () => {
        const obj = { name: 'Alice' };
        const opt = toOption(ok(obj));
        expect(opt.isSome).toBe(true);
        if (opt.isSome) expect(opt.value).toBe(obj);
    });

    it('works with discriminated union TError', () => {
        type AppErr = { kind: 'NotFound' };
        const opt = toOption(err<string, AppErr>({ kind: 'NotFound' }));
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });
});

// ─── fromOption ─────────────────────────────────────────────────────────────

describe('fromOption', () => {
    it('Some(value) → Success(value) — direct form', () => {
        const opt = ofSome('hello');
        const r = fromOption(new Error('missing'), opt);
        expect(r.isSuccess).toBe(true);
        expect(unwrap(r)).toBe('hello');
    });

    it('None → Failure(errorOnNone) — direct form', () => {
        const errVal = new Error('value was missing');
        const opt = ofNone();
        const r = fromOption(errVal, opt);
        expect(r.isSuccess).toBe(false);
        expect(unwrapErr(r)).toBe(errVal);
    });

    it('works with custom TError types', () => {
        type AppErr = { kind: 'MissingValue'; field: string };
        const missingErr: AppErr = { kind: 'MissingValue', field: 'username' };
        const opt: IOption<string> = ofNone();
        const r = fromOption(missingErr, opt);
        expect(r.isSuccess).toBe(false);
        expect(unwrapErr(r)).toEqual(missingErr);
    });

    it('round-trips: Success → toOption → fromOption', () => {
        const original = ok(99);
        const back = fromOption(new Error('gone'), toOption(original));
        expect(unwrap(back)).toBe(99);
    });

    it('round-trips: Failure → toOption → fromOption loses error', () => {
        const lostErr = new Error('was none');
        const original = err<number>(new Error('original error'));
        const back = fromOption(lostErr, toOption(original));
        expect(unwrapErr(back)).toBe(lostErr);
    });

    it('curried form works', () => {
        const missingOrDie = fromOption(new Error('Value required'));
        const r = missingOrDie(ofSome(123));
        expect(unwrap(r)).toBe(123);

        const r2 = missingOrDie(ofNone());
        expect(r2.isSuccess).toBe(false);
        expect(unwrapErr(r2)).toBeInstanceOf(Error);
    });
});

