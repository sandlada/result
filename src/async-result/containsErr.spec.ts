import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { containsErr } from '../../src/async-result/containsErr.js';

describe('AsyncResult containsErr', () => {
    it('true when Err matches', async () => {
        expect(await containsErr('boom', fromResult(err('boom')))).toBe(true);
    });

    it('false when Err differs', async () => {
        expect(await containsErr('nope', fromResult(err('boom')))).toBe(false);
    });

    it('false on Ok', async () => {
        expect(await containsErr('boom', fromResult(ok(42)))).toBe(false);
    });

    it('is curried', async () => {
        expect(await containsErr('boom')(fromResult(err('boom')))).toBe(true);
    });
});