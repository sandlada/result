import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { filter } from '../../src/async-option/filter.js';

describe('AsyncOption filter', () => {
    it('keeps a Some value when the predicate evaluates to true', async () => {
        const ao = filter((x: number) => x > 10, fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(21);
        }
    });

    it('turns Some into None when the predicate evaluates to false', async () => {
        const ao = filter((x: number) => x > 10, fromOption(ofSome(5)));
        const result = await ao.run();

        expect(result.isNone).toBe(true);
    });

    it('works correctly with asynchronous predicates (returning true)', async () => {
        const ao = filter(async (x: number) => Promise.resolve(x > 10), fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(21);
        }
    });

    it('works correctly with asynchronous predicates (returning false)', async () => {
        const ao = filter(async (x: number) => Promise.resolve(x > 10), fromOption(ofSome(5)));
        const result = await ao.run();

        expect(result.isNone).toBe(true);
    });

    it('does not call the predicate on a None value', async () => {
        const predicate = vi.fn((x: number) => x > 10);
        const ao = filter(predicate, fromOption(ofNone()));
        const result = await ao.run();

        expect(predicate).not.toHaveBeenCalled();
        expect(result.isNone).toBe(true);
    });

    it('supports currying', async () => {
        const filterer = filter((x: number) => x > 10);
        const ao = filterer(fromOption(ofSome(21)));
        const result = await ao.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(21);
        }
    });

    it('converts sync predicate throw to None (catch+convert policy)', async () => {
        const ao = filter(() => { throw new Error('boom'); }, fromOption(ofSome(21)));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });

    it('converts async predicate rejection to None (catch+convert policy)', async () => {
        const ao = filter(async () => { throw new Error('boom'); }, fromOption(ofSome(21)));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });
});
