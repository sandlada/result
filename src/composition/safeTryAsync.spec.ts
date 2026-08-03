import { describe, it, expect } from 'vitest';
import { safeTryAsync, fromSafeTryAsync } from './safeTryAsync.js';
import { asyncOk, asyncErr, ok, err } from '../factories/index.js';
import { mapAsync } from '../async-result/index.js';

describe('safeTryAsync / fromSafeTryAsync', () => {
    it('returns ok on success path', async () => {
        const result = fromSafeTryAsync(async function* () {
            // safeTryAsync's contract: yield* evaluates to `T | undefined`.
            // The success path returns T; the failure path returns
            // undefined after yielding. The `?? 0` is a typecheck-friendly
            // way to handle the failure branch without weakening the
            // success-path assertion (a is 21 in the success case).
            const a: number | undefined = yield* safeTryAsync(asyncOk(21));
            return (a ?? 0) * 2;
        });
        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('returns err on failure path and short-circuits', async () => {
        let called = false;
        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(asyncErr<string>('boom'));
            called = true;
            // Unreachable: safeTryAsync yields on failure.
            return (a ?? 0) * 2;
        });
        const r = await result.run();
        expect(called).toBe(false);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('boom');
    });

    it('works with mixed ok and err operations', async () => {
        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(asyncOk(10));
            const b: number | undefined = yield* safeTryAsync(asyncOk((a ?? 0) * 2));
            return (b ?? 0) + 5;
        });
        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(25);
    });

    it('composes with pipe and mapAsync', async () => {
        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(asyncOk(10));
            // In the success path, a is 10; `?? 0` keeps the type narrow
            // and fromSafeTryAsync's inferred T as `number`.
            return a ?? 0;
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
            const a: number | undefined = yield* safeTryAsync(Promise.resolve(ok(21)));
            return (a ?? 0) * 2;
        });
        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('yields a promise failure correctly', async () => {
        let called = false;
        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(Promise.resolve(err<string>('boom')));
            called = true;
            return (a ?? 0) * 2;
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

    it('generator yield safeTryAsync directly without value', async () => {
        const gen = safeTryAsync(asyncErr('direct-yield'));
        expect((await gen.next()).value).toEqual(err('direct-yield'));
        expect((await gen.next()).value).toBe(undefined);
    });

    it('identifies non-AsyncResult objects gracefully (e.g. promise that happens to have a run property not as function)', async () => {
        const fakePromise = Promise.resolve(ok(99)) as any;
        fakePromise.run = 'not a function'; // branch coverage: res.run is not a function

        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(fakePromise);
            return a ?? 0;
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(99);
    });

    it('identifies non-AsyncResult completely normal objects correctly', async () => {
        const fakePromise = Promise.resolve(ok(88)) as any;

        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(fakePromise);
            return a ?? 0;
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(88);
    });

    it('identifies non-AsyncResult completely normal objects correctly but failed at runtime with non-result shape', async () => {
        const fakePromise = Promise.resolve({}) as any;

        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(fakePromise);
            return a ?? 0;
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(undefined);
    });

    it('identifies bare objects with run property not matching function completely normal objects correctly but failed at runtime with non-result shape', async () => {
        const fakePromise = Promise.resolve({}) as any;
        fakePromise.run = 123;

        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(fakePromise);
            return a ?? 0;
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(undefined);
    });

    it('identifies bare objects with run property strictly returning a bare promise without isSuccess', async () => {
        const fakePromise = Promise.resolve({ value: 'hello' }) as any;
        const result = fromSafeTryAsync(async function* () {
            const a: string | undefined = yield* safeTryAsync(fakePromise);
            return a ?? '';
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(undefined);
    });

    it('identifies bare promise missing isSuccess', async () => {
        const fakePromise = Promise.resolve({}) as any;
        const result = fromSafeTryAsync(async function* () {
            const a: string | undefined = yield* safeTryAsync(fakePromise);
            return a ?? '';
        });
        const r = await result.run();
        expect(r.isSuccess).toBe(undefined);
    });

    it('handles falsy result inputs gracefully', async () => {
        const fakePromise = null as any;
        const result = fromSafeTryAsync(async function* () {
            const a: string | undefined = yield* safeTryAsync(fakePromise);
            return a ?? '';
        });
        await expect(result.run()).rejects.toThrow();
    });

    it('falls back to bare result handling branch', async () => {
        // Line 34 uncovered branch
        const fakePromise = { isSuccess: true, value: 42 } as any;
        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(fakePromise);
            return a ?? 0;
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('identifies bare objects strictly with run not function branch', async () => {
        // Line 34 uncovered branch coverage
        const fakePromise = {
            then: (resolve: any) => resolve(ok(123)),
            run: 'not-a-function'
        } as any;
        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(fakePromise);
            return a ?? 0;
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(123);
    });

    it('handles falsy result inputs missing run safely without evaluating as AsyncResult', async () => {
        // Line 34 uncovered branch coverage (ternary false on result lacking run)
        const fakePromise = Promise.resolve(ok(22)) as any;
        delete fakePromise.run;
        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(fakePromise);
            return a ?? 0;
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(22);
    });

    it('identifies result successfully with falsy type mapping gracefully (checking condition on isAsyncResult)', async () => {
        // Line 34 uncovered branch
        const fakePromise = { run: 123 } as any;
        const result = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(fakePromise);
            return a ?? 0;
        });

        const r = await result.run();
        expect(r.isSuccess).toBe(undefined);
    });

    it('preserves falsy success values (0, false, "")', async () => {
        const zero = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(asyncOk(0));
            // `?? 0` returns 0 for both `0` (falsy but not nullish) and
            // `undefined`, so the falsy success value is preserved.
            return a ?? 0;
        });
        const r0 = await zero.run();
        expect(r0.isSuccess).toBe(true);
        if (r0.isSuccess) expect(r0.value).toBe(0);

        const empty = fromSafeTryAsync(async function* () {
            const s: string | undefined = yield* safeTryAsync(asyncOk(''));
            return s ?? '';
        });
        const re = await empty.run();
        expect(re.isSuccess).toBe(true);
        if (re.isSuccess) expect(re.value).toBe('');

        const noBool = fromSafeTryAsync(async function* () {
            const b: boolean | undefined = yield* safeTryAsync(asyncOk(false));
            return b ?? false;
        });
        const rb = await noBool.run();
        expect(rb.isSuccess).toBe(true);
        if (rb.isSuccess) expect(rb.value).toBe(false);
    });

    it('discriminates AsyncResult from Promise<IResultOfT> by duck-typing `.run`', async () => {
        // The discriminator checks for a `.run` method. A Promise with no
        // `.run` should be awaited directly; an AsyncResult should have its
        // `.run()` invoked.
        const asAsyncResult = {
            run: async () => ok(7),
        };
        const r = fromSafeTryAsync(async function* () {
            const a: number | undefined = yield* safeTryAsync(asAsyncResult);
            return a ?? 0;
        });
        const res = await r.run();
        expect(res.isSuccess).toBe(true);
        if (res.isSuccess) expect(res.value).toBe(7);
    });
});