import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { fromOption, toOption } from './index.js';

describe('toOption', () => {
    it('Success(value) → Some(value)', () => {
        const opt = toOption(ok(42));
        expect(opt.isSome).toBe(true);
        expect(opt.isNone).toBe(false);
        if (opt.isSome) expect(opt.value).toBe(42);
    });

    it('Failure(error) → None', () => {
        const opt = toOption(err(new Error('boom')));
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
        const opt = toOption(err<AppErr>({ kind: 'NotFound' }));
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
    });

    it('preserves literal undefined value (Some of undefined)', () => {
        const opt = toOption(ok(undefined));
        expect(opt.isSome).toBe(true);
        if (opt.isSome) expect(opt.value).toBeUndefined();
    });

    it('preserves null value (Some of null)', () => {
        const opt = toOption(ok(null));
        expect(opt.isSome).toBe(true);
        if (opt.isSome) expect(opt.value).toBeNull();
    });

    it('preserves falsy values (0, false, "")', () => {
        const o0 = toOption(ok(0));
        expect(o0.isSome).toBe(true);
        if (o0.isSome) expect(o0.value).toBe(0);

        const oF = toOption(ok(false));
        expect(oF.isSome).toBe(true);
        if (oF.isSome) expect(oF.value).toBe(false);

        const oE = toOption(ok(''));
        expect(oE.isSome).toBe(true);
        if (oE.isSome) expect(oE.value).toBe('');
    });

    it('error information is fully discarded — error fields are not exposed', () => {
        // The whole point of toOption is that error info is lost. Verify that
        // a failure with rich fields turns into a bare None with no `value`.
        type Rich = { kind: 'NotFound'; resource: string; id: string };
        const opt = toOption(err<Rich>({ kind: 'NotFound', resource: 'User', id: 'u-7' }));
        expect(opt.isSome).toBe(false);
        expect(opt.isNone).toBe(true);
        // None carries `isSome` + `isNone` only; no `value` field.
        expect('value' in opt).toBe(false);
    });

    it('round-trips: Success → toOption → fromOption keeps the value', () => {
        const original = ok(99);
        const back = fromOption(new Error('gone'), toOption(original));
        expect(back.isSuccess).toBe(true);
        if (back.isSuccess) expect(back.value).toBe(99);
    });

    it('round-trips: Failure → toOption → fromOption loses the original error', () => {
        const replacement = new Error('replacement');
        const original = err(new Error('original'));
        const back = fromOption(replacement, toOption(original));
        expect(back.isSuccess).toBe(false);
        if (!back.isSuccess) expect(back.error).toBe(replacement);
    });

    it('value identity preserved — no cloning', () => {
        const obj = { id: 1, items: [10, 20] as readonly number[] };
        const opt = toOption(ok(obj));
        expect(opt.isSome).toBe(true);
        if (opt.isSome) {
            expect(opt.value).toBe(obj);
            // inner array identity too (transitively)
            expect((opt.value.items)).toBe(obj.items);
        }
    });
});
