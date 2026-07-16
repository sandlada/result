import { describe, it, expect } from 'vitest';
import { fromOption } from '../../src/async-option/fromOption.js';
import { ofSome, ofNone } from '../../src/option/index.js';

describe('AsyncOption fromOption', () => {
    it('creates an AsyncOption from a Some option', async () => {
        const option = ofSome(42);
        const ao = fromOption(option);
        const result = await ao.run();

        expect(result).toBe(option);
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });

    it('creates an AsyncOption from a None option', async () => {
        const option = ofNone();
        const ao = fromOption(option);
        const result = await ao.run();

        expect(result).toBe(option);
        expect(result.isNone).toBe(true);
    });
});
