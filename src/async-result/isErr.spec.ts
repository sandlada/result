import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { isErr } from '../../src/async-result/isErr.js';

describe('AsyncResult isErr', () => {
    it('returns false on Ok', async () => {
        expect(await isErr(fromResult(ok(42)))).toBe(false);
    });

    it('returns true on Err', async () => {
        expect(await isErr(fromResult(err('x')))).toBe(true);
    });
});