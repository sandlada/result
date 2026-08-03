import { describe, it, expect, vi } from 'vitest';
import { ofSome } from '../../src/async-option/ofSome.js';
import { ofNone } from '../../src/async-option/ofNone.js';
import { mapOrElse } from '../../src/async-option/mapOrElse.js';

describe('AsyncOption mapOrElse', () => {
    it('maps Some', async () => {
        const v = await mapOrElse(() => -1, (x: number) => x * 2, ofSome(21));
        expect(v).toBe(42);
    });

    it('uses onNone on None', async () => {
        const onNone = vi.fn(() => -1);
        const v = await mapOrElse(onNone, (x: number) => x * 2, ofNone<number>());
        expect(v).toBe(-1);
        expect(onNone).toHaveBeenCalled();
    });

    it('does not call onNone on Some', async () => {
        const onNone = vi.fn(() => -1);
        await mapOrElse(onNone, (x: number) => x * 2, ofSome(1));
        expect(onNone).not.toHaveBeenCalled();
    });

    it('supports async onNone', async () => {
        const v = await mapOrElse(async () => 99, (x: number) => x * 2, ofNone<number>());
        expect(v).toBe(99);
    });

    it('propagates sync throw from mapper (does not catch)', async () => {
        // mapOrElse has no try/catch around the mapper — sync throws propagate.
        await expect(mapOrElse(() => -1, () => { throw new Error('boom'); }, ofSome(1)))
            .rejects.toThrow('boom');
    });

    it('propagates rejection from async mapper (does not catch)', async () => {
        await expect(mapOrElse(() => -1, async () => { throw new Error('rej'); }, ofSome(1)))
            .rejects.toThrow('rej');
    });

    it('is curried: data-last form', async () => {
        const c = mapOrElse(() => -1, (x: number) => x * 2);
        expect(await c(ofSome(3))).toBe(6);
        expect(await c(ofNone<number>())).toBe(-1);
    });
});