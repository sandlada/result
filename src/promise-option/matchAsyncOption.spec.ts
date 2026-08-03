import { describe, it, expect, vi } from 'vitest';
import { matchAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

describe('matchAsyncOption', () => {
    it('calls onSome on Some (curried)', async () => {
        const matcher = matchAsyncOption(
            (v: number) => `got ${v}`,
            () => 'missing',
        );
        const r = await matcher(Promise.resolve(ofSome(42)));
        expect(r).toBe('got 42');
    });

    it('calls onSome on Some (direct)', async () => {
        const r = await matchAsyncOption(
            (v: number) => `got ${v}`,
            () => 'missing',
            Promise.resolve(ofSome(42)),
        );
        expect(r).toBe('got 42');
    });

    it('calls onNone on None', async () => {
        const r = await matchAsyncOption(
            (v: number) => `got ${v}`,
            () => 'missing',
            Promise.resolve(ofNone()),
        );
        expect(r).toBe('missing');
    });

    it('works with async callbacks', async () => {
        const r = await matchAsyncOption(
            async (v: number) => `got ${v}`,
            async () => 'missing',
            Promise.resolve(ofSome(42)),
        );
        expect(r).toBe('got 42');
    });

    it('does not invoke onNone on Some (handler-not-invoked contract)', async () => {
        const onNone = vi.fn(() => 'missing');
        await matchAsyncOption(
            (v: number) => `got ${v}`,
            onNone,
            Promise.resolve(ofSome(42)),
        );
        expect(onNone).not.toHaveBeenCalled();
    });

    it('does not invoke onSome on None (handler-not-invoked contract)', async () => {
        const onSome = vi.fn((v: number) => `got ${v}`);
        await matchAsyncOption(
            onSome,
            () => 'missing',
            Promise.resolve(ofNone()),
        );
        expect(onSome).not.toHaveBeenCalled();
    });

    it('propagates sync throw from onSome verbatim (no catch — the catch+convert does NOT apply here)', async () => {
        // matchAsyncOption uses bare `inner.isSome ? onSome(...) : onNone()`.
        // A sync throw from a handler propagates via the outer `.then`.
        await expect(
            matchAsyncOption(
                (v: number) => { throw new Error('onSome-boom'); },
                () => 'missing',
                Promise.resolve(ofSome(42)),
            ),
        ).rejects.toThrow('onSome-boom');
    });

    it('propagates sync throw from onNone verbatim (no catch)', async () => {
        await expect(
            matchAsyncOption(
                (v: number) => `got ${v}`,
                () => { throw new Error('onNone-boom'); },
                Promise.resolve(ofNone()),
            ),
        ).rejects.toThrow('onNone-boom');
    });

    it('propagates async handler rejection verbatim (no catch)', async () => {
        await expect(
            matchAsyncOption(
                async (v: number) => `got ${v}`,
                async () => { throw new Error('async-onNone-boom'); },
                Promise.resolve(ofNone()),
            ),
        ).rejects.toThrow('async-onNone-boom');
    });

    it('propagates outer Promise rejection verbatim', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        await expect(
            matchAsyncOption(
                (v: number) => `got ${v}`,
                () => 'missing',
                outer,
            ),
        ).rejects.toThrow('outer-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = matchAsyncOption(
            (v: number) => `got ${v}`,
            () => 'missing',
            Promise.resolve(ofSome(5)),
        );
        expect(r).toBeInstanceOf(Promise);
    });
});
