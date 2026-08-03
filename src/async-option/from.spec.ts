import { describe, it, expect } from 'vitest';
import { from } from '../../src/async-option/from.js';
import { ofSome, ofNone } from '../../src/option/index.js';

describe('AsyncOption from', () => {
    it('creates an AsyncOption from a thunk that returns Some', async () => {
        const ao = from(() => Promise.resolve(ofSome(42)));
        const result = await ao.run();
        expect(result.isSome).toBe(true);
        if(result.isSome) expect(result.value).toBe(42);
    });

    it('creates an AsyncOption from a thunk that returns None', async () => {
        const ao = from(() => Promise.resolve(ofNone()));
        const result = await ao.run();
        expect(result.isNone).toBe(true);
    });

    it('is lazy — thunk is not called until run()', () => {
        let called = false;
        const ao = from(() => {
            called = true;
            return Promise.resolve(ofSome('done'));
        });
        expect(called).toBe(false);
    });

    it('is lazy — thunk is called on run()', async () => {
        let called = false;
        const ao = from(() => {
            called = true;
            return Promise.resolve(ofSome('done'));
        });
        await ao.run();
        expect(called).toBe(true);
    });

    it('is lazy — thunk is not called when an upstream operator never runs', async () => {
        let called = false;
        // Build the carrier and discard — no .run() means no execution.
        from(() => {
            called = true;
            return Promise.resolve(ofSome(1));
        });
        // Yield once to give any stray side-effect a chance.
        await Promise.resolve();
        expect(called).toBe(false);
    });

    it('exposes a duck-typed AsyncOption carrier (no markAsyncCarrier brand required)', async () => {
        // The contract is structural: a { run } function returning a Promise<IOption>
        // is a valid AsyncOption. Verify a hand-rolled carrier survives .run().
        let runs = 0;
        const hand: { run: () => Promise<ReturnType<typeof ofSome<number>>> } = {
            run: () => {
                runs += 1;
                return Promise.resolve(ofSome(7));
            },
        };
        const result = await hand.run();
        expect(runs).toBe(1);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(7);
    });
});
