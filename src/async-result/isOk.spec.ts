import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { isOk } from '../../src/async-result/isOk.js';

describe('AsyncResult isOk', () => {
    it('returns true on Ok', async () => {
        expect(await isOk(fromResult(ok(42)))).toBe(true);
    });

    it('returns false on Err', async () => {
        expect(await isOk(fromResult(err('x')))).toBe(false);
    });

    it('returns a Promise', () => {
        expect(isOk(fromResult(ok(1)))).toBeInstanceOf(Promise);
    });
});