import { describe, it, expect } from 'vitest';
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
});
