import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { orElse } from '../../src/async-option/orElse.js';

describe('AsyncOption orElse', () => {
    it('returns original Some without calling the fallback function', async () => {
        const fallback = vi.fn(() => fromOption(ofSome(100)));
        const ao = orElse(fallback, fromOption(ofSome(42)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
        expect(fallback).not.toHaveBeenCalled();
    });

    it('calls the fallback function when original is None and processes returned AsyncOption (Some)', async () => {
        const fallback = vi.fn(() => fromOption(ofSome(100)));
        const ao = orElse(fallback, fromOption(ofNone()));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(100);
        }
        expect(fallback).toHaveBeenCalledOnce();
    });

    it('calls the fallback function when original is None and processes returned AsyncOption (None)', async () => {
        const fallback = vi.fn(() => fromOption(ofNone()));
        const ao = orElse(fallback, fromOption(ofNone()));
        const result = await ao.run();

        expect(result.isNone).toBe(true);
        expect(fallback).toHaveBeenCalledOnce();
    });

    it('calls the fallback function when original is None and processes returned Promise<IOption> (Some)', async () => {
        const fallback = vi.fn(() => Promise.resolve(ofSome('alternative')));
        const ao = orElse(fallback, fromOption(ofNone<string>()));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe('alternative');
        }
        expect(fallback).toHaveBeenCalledOnce();
    });

    it('calls the fallback function when original is None and processes returned Promise<IOption> (None)', async () => {
        const fallback = vi.fn(() => Promise.resolve(ofNone<string>()));
        const ao = orElse(fallback, fromOption(ofNone<string>()));
        const result = await ao.run();

        expect(result.isNone).toBe(true);
        expect(fallback).toHaveBeenCalledOnce();
    });

    it('catches errors thrown by the fallback function and returns None to stay on the railway', async () => {
        const fallback = vi.fn(() => { throw new Error('fallback failed'); });
        const ao = orElse(fallback, fromOption(ofNone()));
        const result = await ao.run();

        expect(result.isNone).toBe(true);
        expect(fallback).toHaveBeenCalledOnce();
    });

    it('catches errors from a rejected promise in the fallback function', async () => {
        const fallback = vi.fn(() => Promise.reject(new Error('promise rejected')));
        const ao = orElse(fallback, fromOption(ofNone()));
        const result = await ao.run();

        expect(result.isNone).toBe(true);
        expect(fallback).toHaveBeenCalledOnce();
    });

    it('supports data-last currying properly', async () => {
        const fallback = vi.fn(() => fromOption(ofSome(99)));
        const withFallback = orElse(fallback);

        const ao1 = withFallback(fromOption(ofSome(1)));
        const result1 = await ao1.run();
        expect(result1.isSome).toBe(true);
        if (result1.isSome) {
            expect(result1.value).toBe(1);
        }
        expect(fallback).not.toHaveBeenCalled();

        const ao2 = withFallback(fromOption(ofNone()));
        const result2 = await ao2.run();
        expect(result2.isSome).toBe(true);
        if (result2.isSome) {
            expect(result2.value).toBe(99);
        }
        expect(fallback).toHaveBeenCalledOnce();
    });
});
