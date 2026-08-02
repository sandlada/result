import { describe, it, expect, expectTypeOf } from 'vitest';
import { unzip } from './unzip.js';
import { ok, err } from '../factories/index.js';

describe('unzip', () => {
    it('unzips an Ok tuple into a tuple of Oks', () => {
        const [a, b] = unzip(ok([1, 'a']));
        expect(a).toEqual(ok(1));
        expect(b).toEqual(ok('a'));
    });

    it('unzips an Err into a tuple of Errs', () => {
        const [a, b] = unzip(err('boom'));
        expect(a).toEqual(err('boom'));
        expect(b).toEqual(err('boom'));
    });

    it('failure short-circuits both slots with the same error (Group B)', () => {
        const e = err('e1');
        const [a, b] = unzip(e);
        expect(a).toBe(e);
        expect(b).toBe(e);
    });

    it('success slot types are derived from the tuple (Group B)', () => {
        const [a, b] = unzip(ok([1, 'x'] as const));
        if (a.isSuccess) expectTypeOf(a.value).toBeNumber();
        if (b.isSuccess) expectTypeOf(b.value).toBeString();
    });
});
