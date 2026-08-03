import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { asyncMatchOption } from './asyncMatchOption.js';

describe('promise-result asyncMatchOption', () => {
    it('calls some on Some', async () => {
        const v = await asyncMatchOption({
            some: (x: number) => `some ${x}`,
            none: () => 'none',
        }, ofSome(42));
        expect(v).toBe('some 42');
    });

    it('calls none on None', async () => {
        const v = await asyncMatchOption({
            some: (x: number) => `some ${x}`,
            none: () => 'none',
        }, ofNone<number>());
        expect(v).toBe('none');
    });

    it('supports async handlers', async () => {
        const v = await asyncMatchOption({
            some: async (x: number) => `some ${x}`,
            none: async () => 'none',
        }, ofSome(42));
        expect(v).toBe('some 42');
    });

    it('does not invoke the some handler on None (handler-not-invoked contract)', async () => {
        const some = vi.fn((x: number) => `some ${x}`);
        const v = await asyncMatchOption({
            some,
            none: () => 'none',
        }, ofNone<number>());
        expect(some).not.toHaveBeenCalled();
        expect(v).toBe('none');
    });

    it('does not invoke the none handler on Some (handler-not-invoked contract)', async () => {
        const none = vi.fn(() => 'none');
        const v = await asyncMatchOption({
            some: (x: number) => `some ${x}`,
            none,
        }, ofSome(42));
        expect(none).not.toHaveBeenCalled();
        expect(v).toBe('some 42');
    });

    it('propagates sync throw from some handler verbatim (no catch in the lift family)', async () => {
        // asyncMatchOption uses `Promise.resolve().then(() => ...)` — there
        // is no try/catch around the handlers. Sync throws propagate.
        await expect(
            asyncMatchOption({
                some: (x: number) => { throw new Error('some-boom'); },
                none: () => 'none',
            }, ofSome(1)),
        ).rejects.toThrow('some-boom');
    });

    it('propagates sync throw from none handler verbatim (no catch)', async () => {
        await expect(
            asyncMatchOption({
                some: (x: number) => `some ${x}`,
                none: () => { throw new Error('none-boom'); },
            }, ofNone<number>()),
        ).rejects.toThrow('none-boom');
    });

    it('propagates async handler rejection verbatim (no catch)', async () => {
        await expect(
            asyncMatchOption({
                some: async () => { throw new Error('async-some-boom'); },
                none: async () => 'none',
            }, ofSome(1)),
        ).rejects.toThrow('async-some-boom');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = asyncMatchOption({
            some: (x: number) => `some ${x}`,
            none: () => 'none',
        }, ofSome(5));
        expect(r).toBeInstanceOf(Promise);
    });
});