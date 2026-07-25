import { describe, it, expect } from 'vitest';
import { ofSome } from '../../src/async-option/ofSome.js';

describe('AsyncOption ofSome', () => {
    it('wraps a value as Some', async () => {
        const ao = ofSome(42);
        const opt = await ao.run();
        expect(opt.isSome).toBe(true);
        if (opt.isSome) expect(opt.value).toBe(42);
    });

    it('works with object values', async () => {
        const ao = ofSome({ a: 1 });
        const opt = await ao.run();
        if (opt.isSome) expect(opt.value.a).toBe(1);
    });
});