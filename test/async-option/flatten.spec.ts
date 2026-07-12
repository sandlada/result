import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/option/index.js';
import { fromOption } from '../../src/async-option/fromOption.js';
import { flatten } from '../../src/async-option/flatten.js';

describe('AsyncOption flatten', () => {
    it('flattens Some(Some(value)) into Some(value)', async () => {
        const inner = fromOption(ofSome(42));
        const outer = fromOption(ofSome(inner));

        const flattened = flatten(outer);
        const result = await flattened.run();

        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toBe(42);
        }
    });

    it('flattens Some(None) into None', async () => {
        const inner = fromOption(ofNone<number>());
        const outer = fromOption(ofSome(inner));

        const flattened = flatten(outer);
        const result = await flattened.run();

        expect(result.isSome).toBe(false);
    });

    it('flattens None into None', async () => {
        // Here we simulate an AsyncOption<AsyncOption<number>> that resolves to None
        const outer = fromOption(ofNone<any>());

        const flattened = flatten(outer);
        const result = await flattened.run();

        expect(result.isSome).toBe(false);
    });
});
