import { describe, it, expect } from 'vitest';
import { safeTryAsync, fromSafeTryAsync } from './safeTryAsync.js';
import { asyncOk, asyncErr, ok, err } from '../factories/index.js';
import { mapAsync } from '../async-result/index.js';

describe('safeTryAsync / fromSafeTryAsync', () => {
    it('returns ok on success path', async () => {
        const result = fromSafeTryAsync(async function* () {
            const a: number = yield* safeTryAsync(asyncOk(21));
            return a * 2;
        });
        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('returns err on failure path and short-circuits', async () => {
        let called = false;
        const result = fromSafeTryAsync(async function* () {
            const a: number = yield* safeTryAsync(asyncErr<string>('boom'));
            called = true;
            return a * 2;
        });
        const r = await result.run();
        expect(called).toBe(false);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('boom');
    });

    it('works with mixed ok and err operations', async () => {
        const result = fromSafeTryAsync(async function* () {
            const a: number = yield* safeTryAsync(asyncOk(10));
            const b: number = yield* safeTryAsync(asyncOk(a * 2));
            return b + 5;
        });
        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(25);
    });

    it('composes with pipe and mapAsync', async () => {
        const result = fromSafeTryAsync(async function* () {
            const a: number = yield* safeTryAsync(asyncOk(10));
            return a;
        });
        const final = mapAsync((x: number) => x * 3, result);
        const r = await final.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(30);
    });

    it('closes the generator on short-circuit failure', async () => {
        let closed = false;
        const gen = async function* () {
            try {
                yield* safeTryAsync(asyncErr('short-circuit'));
                return 'ok';
            } finally {
                closed = true;
            }
        };

        const result = await fromSafeTryAsync(gen).run();
        expect(result.isFailure).toBe(true);
        expect(closed).toBe(true);
    });

    it('rethrows synchronous errors from the generator body', async () => {
        const gen = async function* () {
            yield* safeTryAsync(asyncOk(1));
            throw new Error('gen-throw');
        };
        await expect(fromSafeTryAsync(gen).run()).rejects.toThrow('gen-throw');
    });

    it('closes the generator when the body throws', async () => {
        let closed = false;
        const gen = async function* () {
            try {
                yield* safeTryAsync(asyncOk(1));
                throw new Error('gen-throw');
            } finally {
                closed = true;
            }
        };
        await expect(fromSafeTryAsync(gen).run()).rejects.toThrow('gen-throw');
        expect(closed).toBe(true);
    });

    it('throws when fromSafeTryAsync generator returns undefined directly on first tick without yielding', async () => {
        await expect(fromSafeTryAsync(async function* () {
            yield* safeTryAsync(asyncOk(1));
            return undefined;
        } as never).run()).rejects.toThrow('safeTryAsync: generator returned undefined without yielding — did you forget to yield a failure?');
    });

    it('throws when an iterator yields more than once', async () => {
        let calls = 0;
        const fakeIterator: unknown = {
            next: async () => {
                calls++;
                return calls === 1
                    ? { value: 'first', done: false }
                    : { value: 'second', done: false };
            },
        };
        await expect(fromSafeTryAsync(() => fakeIterator as never).run()).rejects.toThrow(
            'safeTryAsync: generator yielded more than once',
        );
    });

    it('swallows iterator.return() that throws inside the cleanup path', async () => {
        const fakeIterator: unknown = {
            next: async () => { throw new Error('body-throw'); },
            return: async () => { throw new Error('return-throw'); },
        };
        await expect(fromSafeTryAsync(() => fakeIterator as never).run()).rejects.toThrow('body-throw');
    });

    it('handles an iterator without .return() that throws', async () => {
        const fakeIterator: unknown = {
            next: async () => { throw new Error('body-throw'); },
        };
        await expect(fromSafeTryAsync(() => fakeIterator as never).run()).rejects.toThrow('body-throw');
    });

    it('generator returns a raw promise instead of async result', async () => {
        const result = fromSafeTryAsync(async function* () {
            const a: number = yield* safeTryAsync(Promise.resolve(ok(21)));
            return a * 2;
        });
        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('yields a promise failure correctly', async () => {
        let called = false;
        const result = fromSafeTryAsync(async function* () {
            const a: number = yield* safeTryAsync(Promise.resolve(err<string>('boom')));
            called = true;
            return a * 2;
        });
        const r = await result.run();
        expect(called).toBe(false);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('boom');
    });

    it('handles raw generator yielding twice directly', async () => {
        let calls = 0;
        const fakeIterator: unknown = {
            next: async () => {
                calls++;
                return calls === 1
                    ? { value: err('first'), done: false }
                    : { value: err('second'), done: false };
            }
        };
        await expect(fromSafeTryAsync(() => fakeIterator as never).run()).rejects.toThrow(
            'safeTryAsync: generator yielded more than once',
        );
    });
});
