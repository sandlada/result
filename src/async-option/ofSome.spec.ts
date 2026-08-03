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

    it('returns the same reference when called with the same value (no copy)', async () => {
        const obj = { id: 7 };
        const r1 = await ofSome(obj).run();
        const r2 = await ofSome(obj).run();
        expect(r1.isSome).toBe(true);
        expect(r2.isSome).toBe(true);
        if (r1.isSome && r2.isSome) {
            expect(r1.value).toBe(obj);
            expect(r2.value).toBe(obj);
        }
    });
});