/**
 * Type-level tests for AsyncOption<T> contract.
 * These verify compile-time behavior only.
 */
import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
import type { AsyncOption } from '../../src/types/AsyncOption.js';

describe('AsyncOption — lazy async option', () => {
    it('run() returns a Promise of Some', async () => {
        const ao: AsyncOption<number> = { run: () => Promise.resolve(ofSome(42)) };
        const result = await ao.run();
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(42);
    });

    it('run() returns a Promise of None', async () => {
        const ao: AsyncOption<number> = { run: () => Promise.resolve(ofNone()) };
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });
});
