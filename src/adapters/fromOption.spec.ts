import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { ofSome, ofNone } from '../option/index.js';
import { fromOption, toOption } from './index.js';
import { unwrap, unwrapErr } from '../operators/index.js';
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
        const original = err(new Error('original error'));
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

    it('curried form reuses the errorOnNone across invocations (same reference)', () => {
        const sharedError = { code: 404, kind: 'MissingValue' as const };
        const fn = fromOption(sharedError);
        const r1 = fn(ofNone());
        const r2 = fn(ofNone());
        expect(r1.isSuccess).toBe(false);
        expect(r2.isSuccess).toBe(false);
        if (!r1.isSuccess && !r2.isSuccess) {
            expect(r1.error).toBe(sharedError);
            expect(r2.error).toBe(sharedError);
        }
    });

    it('direct form preserves the value identity for object Some', () => {
        const obj = { id: 1, name: 'Alice' };
        const r = fromOption(new Error('missing'), ofSome(obj));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(obj);
    });

    it('curried form preserves the value identity for object Some', () => {
        const obj = { id: 2, name: 'Bob' };
        const fn = fromOption(new Error('missing'));
        const r = fn(ofSome(obj));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(obj);
    });

    it('curried form with discriminated-union error type', () => {
        type AppErr = { kind: 'NotFound'; id: string } | { kind: 'Forbidden' };
        const errorOnNone: AppErr = { kind: 'NotFound', id: 'u-99' };
        const fn = fromOption<AppErr>(errorOnNone);
        const r1 = fn(ofSome('hello'));
        const r2 = fn(ofNone());
        expect(r1.isSuccess).toBe(true);
        expect(r2.isSuccess).toBe(false);
        if (!r2.isSuccess) expect(r2.error).toBe(errorOnNone);
    });

    it('curried and direct forms yield identical results for the same Some(None) pair', () => {
        const sameErr = new Error('boo');
        const a = fromOption(sameErr, ofSome(123));
        const fn = fromOption(sameErr);
        const b = fn(ofSome(123));
        expect(a.isSuccess).toBe(true);
        expect(b.isSuccess).toBe(true);
        if (a.isSuccess && b.isSuccess) {
            expect(a.value).toBe(b.value);
        }
    });

    it('preserves literal undefined Some value', () => {
        const r = fromOption(new Error('missing'), ofSome(undefined));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeUndefined();
    });

    it('preserves null Some value', () => {
        const r = fromOption(new Error('missing'), ofSome(null));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeNull();
    });

    it('preserves falsy Some values (0, false, "")', () => {
        const r0 = fromOption(new Error('missing'), ofSome(0));
        expect(r0.isSuccess).toBe(true);
        if (r0.isSuccess) expect(r0.value).toBe(0);

        const rF = fromOption(new Error('missing'), ofSome(false));
        expect(rF.isSuccess).toBe(true);
        if (rF.isSuccess) expect(rF.value).toBe(false);

        const rE = fromOption(new Error('missing'), ofSome(''));
        expect(rE.isSuccess).toBe(true);
        if (rE.isSuccess) expect(rE.value).toBe('');
    });
});
