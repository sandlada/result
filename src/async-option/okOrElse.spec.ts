import { describe, it, expect, vi } from 'vitest';
import { ofSome } from '../../src/async-option/ofSome.js';
import { ofNone } from '../../src/async-option/ofNone.js';
import { okOrElse } from '../../src/async-option/okOrElse.js';

describe('AsyncOption okOrElse', () => {
    it('Some converts to Ok', async () => {
        const ar = okOrElse(() => 'missing', ofSome(42));
        const r = await ar.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('None lazily computes Err', async () => {
        const onNone = vi.fn(() => 'missing');
        const ar = okOrElse(onNone, ofNone<number>());
        const r = await ar.run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('missing');
        expect(onNone).toHaveBeenCalledTimes(1);
    });

    it('does not call onNone on Some', async () => {
        const onNone = vi.fn(() => 'missing');
        await okOrElse(onNone, ofSome(1)).run();
        expect(onNone).not.toHaveBeenCalled();
    });

    it('supports async onNone', async () => {
        const r = await okOrElse(async () => 'lazy', ofNone<number>()).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('lazy');
    });

    it('converts sync throw from onNone to Err (canonical catch+convert)', async () => {
        // The source explicitly catches sync throws from onNone and converts
        // them to Err with the thrown value as the error.
        const r = await okOrElse(() => { throw new Error('onNone err'); }, ofNone<number>()).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBeInstanceOf(Error);
    });

    it('converts async rejection from onNone to Err (canonical catch+convert)', async () => {
        const r = await okOrElse(async () => { throw new Error('rej'); }, ofNone<number>()).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect((r.error as Error).message).toBe('rej');
    });

    it('is curried', async () => {
        const r = await okOrElse(() => 'lazy')(ofNone<number>()).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('lazy');
    });
});