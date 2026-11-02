import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { match } from './match.js';

describe('promise-result match', () => {
    it('calls some on Some', async () => {
        const v = await match({
            some: (x: number) => `some ${x}`,
            none: () => 'none',
        }, ofSome(42));
        expect(v).toBe('some 42');
    });

    it('calls none on None', async () => {
        const v = await match({
            some: (x: number) => `some ${x}`,
            none: () => 'none',
        }, ofNone());
        expect(v).toBe('none');
    });

    it('supports async handlers', async () => {
        const v = await match({
            some: async (x: number) => `some ${x}`,
            none: async () => 'none',
        }, ofSome(42));
        expect(v).toBe('some 42');
    });

    it('does not invoke the some handler on None (handler-not-invoked contract)', async () => {
        const some = vi.fn((x: number) => `some ${x}`);
        const v = await match({
            some,
            none: () => 'none',
        }, ofNone());
        expect(some).not.toHaveBeenCalled();
        expect(v).toBe('none');
    });

    it('does not invoke the none handler on Some (handler-not-invoked contract)', async () => {
        const none = vi.fn(() => 'none');
        const v = await match({
            some: (x: number) => `some ${x}`,
            none,
        }, ofSome(42));
        expect(none).not.toHaveBeenCalled();
        expect(v).toBe('some 42');
    });

    it('propagates sync throw from some handler verbatim (no catch in the lift family)', async () => {
        // match uses `Promise.resolve().then(() => ...)` — there
        // is no try/catch around the handlers. Sync throws propagate.
        await expect(
            match({
                some: (x: number) => { throw new Error('some-boom'); },
                none: () => 'none',
            }, ofSome(1)),
        ).rejects.toThrow('some-boom');
    });

    it('propagates sync throw from none handler verbatim (no catch)', async () => {
        await expect(
            match({
                some: (x: number) => `some ${x}`,
                none: () => { throw new Error('none-boom'); },
            }, ofNone()),
        ).rejects.toThrow('none-boom');
    });

    it('propagates async handler rejection verbatim (no catch)', async () => {
        await expect(
            match({
                some: async () => { throw new Error('async-some-boom'); },
                none: async () => 'none',
            }, ofSome(1)),
        ).rejects.toThrow('async-some-boom');
    });

    it('resolves async some handler with a single await (no Promise<Promise<U>> nesting)', async () => {
        const r = await match({
            some: async (x: number) => `async-some:${x}`,
            none: async () => 'async-none',
        }, ofSome(7));
        expect(r).toBe('async-some:7');
    });

    it('resolves async none handler with a single await (no Promise<Promise<U>> nesting)', async () => {
        const r = await match({
            some: async (x: number) => `async-some:${x}`,
            none: async () => 'async-none',
        }, ofNone<number>());
        expect(r).toBe('async-none');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = match({
            some: (x: number) => `some ${x}`,
            none: () => 'none',
        }, ofSome(5));
        expect(r).toBeInstanceOf(Promise);
    });

    it('hands the some handler the original payload when the payload is a thenable', async () => {
        // The payload must reach the handler unchanged. Lifting it with
        // `Promise.resolve(value)` would adopt the thenable and hand the
        // handler the thenable's resolved value instead.
        const thenable = { then: (resolve: (v: number) => void) => { resolve(99); } };
        const seen: unknown[] = [];
        await match({
            some: (x: unknown) => { seen.push(x); return 'some'; },
            none: () => 'none',
        }, ofSome(thenable as never));
        expect(seen[0]).toBe(thenable);
    });
});