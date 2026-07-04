import { describe, it, expect } from 'vitest';
import { ok, err, ofSome, ofNone, fromOption, toOption, unwrap, unwrapErr } from '../../src/index.js';
import type { IOption } from '../../src/types/Option.js';

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
