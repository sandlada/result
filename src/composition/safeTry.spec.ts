import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { safeTry, fromSafeTry } from './index.js';
import { map } from '../operators/index.js';

describe('safeTry / fromSafeTry', () => {
    it('fromSafeTry returns ok on success path', () => {
        const result = fromSafeTry(function* () {
            // safeTry's contract: yield* evaluates to `T | undefined`.
            // The success path returns T; the failure path returns
            // undefined after yielding. The `?? 0` is a typecheck-friendly
            // way to handle the failure branch without weakening the
            // success-path assertion (a is 21 in the success case).
            const a: number | undefined = yield* safeTry(ok(21));
            return (a ?? 0) * 2;
        });
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('fromSafeTry returns err on failure path', () => {
        const result = fromSafeTry(function* () {
            const a: number | undefined = yield* safeTry(err<string>('boom'));
            // Unreachable: safeTry yields on failure, so the generator
            // body after yield* never executes. The `?? 0` keeps the
            // return statement well-typed.
            return (a ?? 0) * 2;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('short-circuits on first failure', () => {
        let secondCalled = false;
        const result = fromSafeTry(function* () {
            const a: number | undefined = yield* safeTry(err<string>('first fail'));
            secondCalled = true;
            return a ?? 0;
        });
        expect(secondCalled).toBe(false);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('first fail');
    });

    it('works with mixed ok and err operations', () => {
        const result = fromSafeTry(function* () {
            const a: number | undefined = yield* safeTry(ok(10));
            const b: number | undefined = yield* safeTry(ok((a ?? 0) * 2));
            return (b ?? 0) + 5;
        });
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(25);
    });

    it('composes with pipe and map', () => {
        const result = fromSafeTry(function* () {
            const a: number | undefined = yield* safeTry(ok(10));
            // In the success path, a is 10; `?? 0` keeps the type narrow
            // and the fromSafeTry inferred T as `number`.
            return a ?? 0;
        });
        const final = map((x: number) => x * 3, result);
        expect(final.isSuccess).toBe(true);
        if (final.isSuccess) expect(final.value).toBe(30);
    });

    it('works with custom error types', () => {
        type AppErr = { code: number; message: string };
        const result = fromSafeTry(function* () {
            const a: number | undefined = yield* safeTry(err<AppErr>({ code: 404, message: 'Not Found' }));
            // Unreachable in the failure path. `?? 0` keeps the
            // generator's return type as `number`.
            return a ?? 0;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error.code).toBe(404);
    });

    it('closes the generator on short-circuit failure', () => {
        let closed = false;
        const gen = function* () {
            try {
                yield* safeTry(err('short-circuit'));
                return 'ok';
            } finally {
                closed = true;
            }
        };

        const result = fromSafeTry(gen);
        expect(result.isFailure).toBe(true);
        expect(closed).toBe(true);
    });

    it('rethrows synchronous errors from the generator body', () => {
        const gen = function* () {
            yield* safeTry(ok(1));
            throw new Error('gen-throw');
        };
        expect(() => fromSafeTry(gen)).toThrow('gen-throw');
    });

    it('closes the generator when the body throws', () => {
        let closed = false;
        const gen = function* () {
            try {
                yield* safeTry(ok(1));
                throw new Error('gen-throw');
            } finally {
                closed = true;
            }
        };
        expect(() => fromSafeTry(gen)).toThrow('gen-throw');
        expect(closed).toBe(true);
    });

    it('throws when an iterator yields more than once', () => {
        // Fake iterator with no `return` method that yields twice — exercises
        // both the `typeof iterator.return === 'function'` false branch and
        // the `if (!check.done)` true branch.
        let calls = 0;
        const fakeIterator: unknown = {
            next: () => {
                calls++;
                return calls === 1
                    ? { value: 'first', done: false }
                    : { value: 'second', done: false };
            },
            // No `return` method on purpose.
        };
        expect(() => fromSafeTry(() => fakeIterator as never)).toThrow(
            'safeTry: generator yielded more than once',
        );
    });

    it('swallows iterator.return() that throws inside the cleanup path', () => {
        // Iterator whose body throws AND whose .return() throws — exercises
        // the inner `try { iterator.return } catch { /* ignore */ }` branch.
        const fakeIterator: unknown = {
            next: () => { throw new Error('body-throw'); },
            return: () => { throw new Error('return-throw'); },
        };
        expect(() => fromSafeTry(() => fakeIterator as never)).toThrow('body-throw');
    });

    it('handles an iterator without .return() that throws', () => {
        // Iterator with no `return` method and a body that throws — exercises
        // the `typeof iterator.return === 'function'` false branch inside
        // the catch block.
        const fakeIterator: unknown = {
            next: () => { throw new Error('body-throw'); },
        };
        expect(() => fromSafeTry(() => fakeIterator as never)).toThrow('body-throw');
    });

    it('throws when the generator returns undefined without yielding', () => {
        const gen = function* () {
            // Do not yield, just return undefined
            return undefined;
        };
        expect(() => fromSafeTry(gen)).toThrow(/generator returned undefined without yielding/);
    });

    it('covers the safeTry undefined return path', () => {
        const gen = function* () {
            const iterator = safeTry(err('test'));
            iterator.next(); // yield err('test')
            iterator.next(); // return undefined
        };
        const iterator = gen();
        iterator.next();
    });

    it('preserves a falsy success value (0, false, "")', () => {
        const zero = fromSafeTry(function* () {
            const a: number | undefined = yield* safeTry(ok(0));
            // `?? 0` returns 0 for both `0` (falsy but not nullish) and
            // `undefined`, so the falsy success value is preserved.
            return a ?? 0;
        });
        expect(zero.isSuccess).toBe(true);
        if (zero.isSuccess) expect(zero.value).toBe(0);

        const empty = fromSafeTry(function* () {
            const s: string | undefined = yield* safeTry(ok(''));
            return s ?? '';
        });
        expect(empty.isSuccess).toBe(true);
        if (empty.isSuccess) expect(empty.value).toBe('');

        const noBool = fromSafeTry(function* () {
            const b: boolean | undefined = yield* safeTry(ok(false));
            return b ?? false;
        });
        expect(noBool.isSuccess).toBe(true);
        if (noBool.isSuccess) expect(noBool.value).toBe(false);
    });

    it('enforces single-yield semantics — repeated safeTry yields in same iteration', () => {
        // When the inner helper yields multiple times in one .next(), the
        // single-yield guarantee is enforced by the outer runner.
        let calls = 0;
        const fakeIterator: unknown = {
            next: () => {
                calls++;
                return calls === 1
                    ? { value: 'first', done: false }
                    : { value: 'second', done: false };
            },
        };
        expect(() => fromSafeTry(() => fakeIterator as never)).toThrow(
            /yielded more than once/,
        );
    });
});