import { describe, it, expect } from 'vitest';
import { bindAsyncOption } from './index.js';
import { ofSome, ofNone } from '../option/index.js';

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

    it('does not invoke the callback when the outer Promise is rejected', async () => {
        // The callback receives the inner value only if the outer Promise
        // resolves with a Some — a rejected outer Promise short-circuits
        // before the callback is ever called.
        const outer = new Promise<ReturnType<typeof ofSome<number>>>((_, reject) => {
            setTimeout(() => reject(new Error('outer-reject')), 5);
        });
        let invoked = false;
        const chain = bindAsyncOption(() => {
            invoked = true;
            return Promise.resolve(ofSome(1));
        });
        await expect(chain(outer)).rejects.toThrow('outer-reject');
        expect(invoked).toBe(false);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = bindAsyncOption(
            (x: number) => Promise.resolve(ofSome(x * 2)),
            Promise.resolve(ofSome(5)),
        );
        expect(r).toBeInstanceOf(Promise);
    });

    it('discards the rejection reason — only the None shape matters (canonical catch+convert)', async () => {
        // Per the documented throw policy, the thrown/rejected value is
        // intentionally discarded and converted to None. The contract does
        // not surface the reason to the caller.
        const thrown = new Error('hide-me');
        const r1 = await bindAsyncOption(
            () => { throw thrown; },
            Promise.resolve(ofSome(1)),
        );
        expect(r1.isNone).toBe(true);

        const r2 = await bindAsyncOption(
            () => Promise.reject(thrown),
            Promise.resolve(ofSome(1)),
        );
        expect(r2.isNone).toBe(true);
    });
});
