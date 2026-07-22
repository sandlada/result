import { describe, it, expect } from 'vitest';
import { ok, err, safeTry, fromSafeTry, map } from '../../src/index.js';

describe('safeTry / fromSafeTry', () => {
    it('fromSafeTry returns ok on success path', () => {
        const result = fromSafeTry(function* () {
            const a: number = yield* safeTry(ok(21));
            return a * 2;
        });
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('fromSafeTry returns err on failure path', () => {
        const result = fromSafeTry(function* () {
            const a: number = yield* safeTry(err<string>('boom'));
            return a * 2;
        });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('short-circuits on first failure', () => {
        let secondCalled = false;
        const result = fromSafeTry(function* () {
            const a: number = yield* safeTry(err<string>('first fail'));
            secondCalled = true;
            return a;
        });
        expect(secondCalled).toBe(false);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('first fail');
    });

    it('works with mixed ok and err operations', () => {
        const result = fromSafeTry(function* () {
            const a: number = yield* safeTry(ok(10));
            const b: number = yield* safeTry(ok(a * 2));
            return b + 5;
        });
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(25);
    });

    it('composes with pipe and map', () => {
        const result = fromSafeTry(function* () {
            const a: number = yield* safeTry(ok(10));
            return a;
        });
        const final = map((x: number) => x * 3, result);
        expect(final.isSuccess).toBe(true);
        if (final.isSuccess) expect(final.value).toBe(30);
    });

    it('works with custom error types', () => {
        type AppErr = { code: number; message: string };
        const result = fromSafeTry(function* () {
            const a: number = yield* safeTry(err<AppErr>({ code: 404, message: 'Not Found' }));
            return a;
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
});
