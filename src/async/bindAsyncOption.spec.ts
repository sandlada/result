import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, bindAsyncOption } from '../../src/index.js';

describe('bindAsyncOption', () => {
    it('chains to Promise<IOption> (curried)', async () => {
        const chain = bindAsyncOption((x: number) => Promise.resolve(ofSome(x * 2)));
        const r = await chain(Promise.resolve(ofSome(21)));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('chains to Promise<IOption> (direct)', async () => {
        const r = await bindAsyncOption(
            (x: number) => Promise.resolve(ofSome(x * 2)),
            Promise.resolve(ofSome(21))
        );
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('chains to sync IOption', async () => {
        const r = await bindAsyncOption(
            (s: string) => ofSome(s.length),
            Promise.resolve(ofSome('hello'))
        );
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(5);
    });

    it('passes through ofNone', async () => {
        const r = await bindAsyncOption(
            (x: number) => Promise.resolve(ofSome(x * 2)),
            Promise.resolve(ofNone())
        );
        expect(r.isNone).toBe(true);
    });

    it('short-circuits when callback returns Promise ofNone', async () => {
        const r = await bindAsyncOption(
            () => Promise.resolve(ofNone()),
            Promise.resolve(ofSome(21))
        );
        expect(r.isNone).toBe(true);
    });

    it('short-circuits when callback returns sync ofNone', async () => {
        const r = await bindAsyncOption(
            () => ofNone(),
            Promise.resolve(ofSome(21))
        );
        expect(r.isNone).toBe(true);
    });

    it('returns ofNone when callback throws exception', async () => {
        const r = await bindAsyncOption(
            () => { throw new Error('callback exception'); },
            Promise.resolve(ofSome(21))
        );
        expect(r.isNone).toBe(true);
    });

    it('returns ofNone when callback rejects', async () => {
        const r = await bindAsyncOption(
            () => Promise.reject(new Error('callback exception')),
            Promise.resolve(ofSome(21))
        );
        expect(r.isNone).toBe(true);
    });
});
