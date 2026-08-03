import { describe, it, expect } from 'vitest';
import { ofSome } from '../../src/async-option/ofSome.js';
import { ofNone } from '../../src/async-option/ofNone.js';
import { unwrap } from '../../src/async-option/unwrap.js';

describe('AsyncOption unwrap', () => {
    it('extracts the value on Some', async () => {
        const v = await unwrap(ofSome(42));
        expect(v).toBe(42);
    });

    it('throws on None', async () => {
        await expect(unwrap(ofNone<number>())).rejects.toThrow(/None/);
    });

    it('returns the original value reference on Some (no copy)', async () => {
        // unwrap extracts the inner value; it must not clone or transform.
        const obj = { id: 1, nested: { x: 'y' } };
        const v = await unwrap(ofSome(obj));
        expect(v).toBe(obj);
    });

    it('throws an Error instance (not a string)', async () => {
        await expect(unwrap(ofNone<number>())).rejects.toBeInstanceOf(Error);
    });
});