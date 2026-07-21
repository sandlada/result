import { describe, it, expect } from 'vitest';
import { ok, err, filterOrElseAsync } from '../../src/index.js';

describe('filterOrElseAsync', () => {
    const isEven = async (x: number) => x % 2 === 0;
    const errorFn = async (x: number) => `${x} is odd`;

    it('returns success if predicate matches (curried)', async () => {
        const filterEven = filterOrElseAsync(isEven, errorFn);
        const r = await filterEven(Promise.resolve(ok(42)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('returns success if predicate matches (direct)', async () => {
        const r = await filterOrElseAsync(isEven, errorFn, Promise.resolve(ok(42)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('returns err if predicate does not match', async () => {
        const r = await filterOrElseAsync(isEven, errorFn, Promise.resolve(ok(21)));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('21 is odd');
    });

    it('passes through existing failure', async () => {
        const r = await filterOrElseAsync(isEven, errorFn, Promise.resolve(err<string>('original')));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('original');
    });

    it('works with sync predicate and sync errorFn', async () => {
        const r = await filterOrElseAsync(
            (x: number) => x > 10,
            (x: number) => `too small: ${x}`,
            Promise.resolve(ok(5)),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('too small: 5');
    });

    it('converts sync predicate throw to err(caughtError) (catch+convert policy)', async () => {
        const r = await filterOrElseAsync(
            () => { throw new Error('predicate boom'); },
            (x: number) => `too small: ${x}`,
            Promise.resolve(ok(5)),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('predicate boom');
    });

    it('converts async predicate rejection to err(caughtError) (catch+convert policy)', async () => {
        const r = await filterOrElseAsync(
            async () => { throw new Error('predicate boom'); },
            (x: number) => `too small: ${x}`,
            Promise.resolve(ok(5)),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('predicate boom');
    });

    it('converts errorFn throw to err(caughtError) (catch+convert policy)', async () => {
        const r = await filterOrElseAsync(
            (x: number) => x > 10,
            () => { throw new Error('errorFn boom'); },
            Promise.resolve(ok(5)),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('errorFn boom');
    });
});
