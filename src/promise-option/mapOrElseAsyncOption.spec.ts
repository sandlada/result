import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { mapOrElseAsyncOption } from './mapOrElseAsyncOption.js';

describe('promise-result mapOrElseAsyncOption', () => {
    it('maps Some', async () => {
        const v = await mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expect(v).toBe(42);
    });

    it('uses onNone on None', async () => {
        const v = await mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofNone<number>()));
        expect(v).toBe(-1);
    });

    it('does not call onNone on Some', async () => {
        const onNone = vi.fn(() => -1);
        await mapOrElseAsyncOption(onNone, (x: number) => x * 2, Promise.resolve(ofSome(1)));
        expect(onNone).not.toHaveBeenCalled();
    });

    it('does not call the mapper on None (callback short-circuit)', async () => {
        const mapper = vi.fn((x: number) => x * 2);
        const v = await mapOrElseAsyncOption(() => -1, mapper, Promise.resolve(ofNone<number>()));
        expect(mapper).not.toHaveBeenCalled();
        expect(v).toBe(-1);
    });

    it('propagates sync throw from mapper verbatim (no catch — the catch+convert does NOT apply here)', async () => {
        // mapOrElseAsyncOption does NOT wrap the mapper or onNone in a
        // try/catch. A sync throw inside either handler propagates via the
        // outer `.then` rejection.
        await expect(
            mapOrElseAsyncOption(() => -1, () => { throw new Error('mapper-boom'); }, Promise.resolve(ofSome(1))),
        ).rejects.toThrow('mapper-boom');
    });

    it('propagates sync throw from onNone verbatim (no catch)', async () => {
        await expect(
            mapOrElseAsyncOption(() => { throw new Error('onNone-boom'); }, (x: number) => x * 2, Promise.resolve(ofNone<number>())),
        ).rejects.toThrow('onNone-boom');
    });

    it('propagates async mapper rejection verbatim (no catch)', async () => {
        await expect(
            mapOrElseAsyncOption(() => -1, async () => { throw new Error('mapper-reject'); }, Promise.resolve(ofSome(1))),
        ).rejects.toThrow('mapper-reject');
    });

    it('propagates async onNone rejection verbatim (no catch)', async () => {
        await expect(
            mapOrElseAsyncOption(async () => { throw new Error('onNone-reject'); }, (x: number) => x * 2, Promise.resolve(ofNone<number>())),
        ).rejects.toThrow('onNone-reject');
    });

    it('propagates outer Promise rejection verbatim', async () => {
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        await expect(
            mapOrElseAsyncOption(() => -1, (x: number) => x * 2, outer),
        ).rejects.toThrow('outer-reject');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = mapOrElseAsyncOption(() => -1, (x: number) => x * 2, Promise.resolve(ofSome(5)));
        expect(r).toBeInstanceOf(Promise);
    });

    it('supports async onNone returning Promise<B>', async () => {
        const v = await mapOrElseAsyncOption(async () => -1, (x: number) => x * 2, Promise.resolve(ofNone<number>()));
        expect(v).toBe(-1);
    });
});