/**
 * Type-level tests for AsyncResult<T, E> contract.
 * These verify compile-time behavior only.
 */
import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import type { AsyncResult } from '../../src/types/AsyncResult.js';

describe('AsyncResult — lazy async result', () => {
    it('run() returns a Promise of success', async () => {
        const ar: AsyncResult<number, string> = { run: () => Promise.resolve(ok(42)) };
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('run() returns a Promise of failure', async () => {
        const ar: AsyncResult<number, string> = { run: () => Promise.resolve(err('fail')) };
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('fail');
    });
});
