import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, asyncBindOption } from '../../src/index.js';

describe('asyncBindOption', () => {
    it('chains async success (curried)', async () => {
        const chain = asyncBindOption(async (x: number) => ofSome(x * 2));
        const r = await chain(ofSome(21));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('chains async success (direct)', async () => {
        const r = await asyncBindOption(async (x: number) => ofSome(x * 2), ofSome(21));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('passes through ofNone', async () => {
        const r = await asyncBindOption(async (x: number) => ofSome(x * 2), ofNone());
        expect(r.isNone).toBe(true);
    });

    it('propagates async callback returning ofNone', async () => {
        const r = await asyncBindOption(async () => ofNone(), ofSome(21));
        expect(r.isNone).toBe(true);
    });

    it('propagates callback exceptions natively', async () => {
        const chain = asyncBindOption(async () => { throw new Error('callback exception'); });
        await expect(chain(ofSome(21))).rejects.toThrow('callback exception');
    });
});
