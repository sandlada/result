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
        // the `if (!check.done)` true branch. The yielded values are Results:
        // a yield that is not a Result is rejected before the probe.
        let calls = 0;
        const fakeIterator: unknown = {
            next: () => {
                calls++;
                return calls === 1
                    ? { value: err('first'), done: false }
                    : { value: err('second'), done: false };
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

    it('covers the safeTry short-circuit path', () => {
        const gen = function* () {
            const iterator = safeTry(err('test'));
            iterator.next(); // yield err('test')
            // Resuming past the failure ends the delegation: the runner
            // consumes the failure instead of running the body after it.
            try {
                iterator.next();
            } catch {
                // The short-circuit signal ends the delegation.
            }
        };
        const iterator = gen();
        iterator.next();
    });

    it('a delegation that is resumed past its failure throws the short-circuit signal', () => {
        const iterator = safeTry(err('test'));
        expect(iterator.next().done).toBe(false);
        expect(() => iterator.next()).toThrow(/resumed past/);
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
                    ? { value: err('first'), done: false }
                    : { value: err('second'), done: false };
            },
        };
        expect(() => fromSafeTry(() => fakeIterator as never)).toThrow(
            /yielded more than once/,
        );
    });

    describe('Cleanup error isolation', () => {
        it('preserves original failure when user finally throws during cleanup', () => {
            // User-defined `finally` block throwing during cleanup must NOT shadow
            // the primary failure yielded via safeTry.
            const gen = function* () {
                try {
                    yield* safeTry(err<string>('primary-failure'));
                    return 'unreachable';
                } finally {
                    throw new Error('cleanup-error-should-be-swallowed');
                }
            };
            const r = fromSafeTry(gen);
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect(r.error).toBe('primary-failure');
        });

        it('propagates cleanup errors that fire AFTER the body returns', () => {
            // Variant: success path body returns, finally throws — the cleanup
            // error propagates because there is no primary failure to preserve.
            const gen = function* () {
                try {
                    return 42;
                } finally {
                    throw new Error('cleanup-throws-after-return');
                }
            };
            expect(() => fromSafeTry(gen)).toThrow('cleanup-throws-after-return');
        });
    });

    describe('Undefined success sentinel', () => {
        it('error message guides users toward ok(undefined) for legitimate undefined success', () => {
            const gen = function* () {
                return undefined;
            };
            expect(() => fromSafeTry(gen)).toThrow(
                /If you intended undefined as a legitimate success value/,
            );
            expect(() => fromSafeTry(gen)).toThrow(/wrap it explicitly/);
        });

        it('returns Ok(undefined) when the generator returns ok(undefined)', () => {
            // The documented workaround must not produce a doubly wrapped
            // Result - `value` is `undefined`, not another Result.
            const nested = fromSafeTry(function* () { return ok(undefined); });
            expect(nested.isSuccess).toBe(true);
            if (nested.isSuccess) expect(nested.value).toBe(undefined);
        });
    });

    describe('Double yield', () => {
        it('throws when a real generator yields twice', () => {
            function* twice() {
                yield err('first');
                yield err('second');
            }
            expect(() => fromSafeTry(twice)).toThrow('safeTry: generator yielded more than once');
        });

        it('reports the yielded failure for a single raw yield', () => {
            const result = fromSafeTry(function* () {
                yield err('raw');
            });
            expect(result.isFailure).toBe(true);
            if (result.isFailure) expect(result.error).toBe('raw');
        });

        it('attributes a delegation to the right run when a generator nests another fromSafeTry', () => {
            let sideEffect = 'NOT-RUN';
            const result = fromSafeTry(function* () {
                // The nested run delegates first and must not steal the outer
                // run's delegation bookkeeping.
                const inner = fromSafeTry(function* () {
                    yield* safeTry(err('inner'));
                });
                expect(inner.isFailure).toBe(true);
                yield* safeTry(err('outer'));
                sideEffect = 'RAN';
                return 1;
            });
            expect(result.isFailure).toBe(true);
            if (result.isFailure) expect(result.error).toBe('outer');
            expect(sideEffect).toBe('NOT-RUN');
        });

        it('still reports a double yield after a delegation was driven manually', () => {
            // A delegation that is driven by hand and then abandoned must not
            // leave a trace that a later run could mistake for its own: the
            // double-yield detection has to stay intact.
            const shared = err('shared');
            const abandoned = safeTry(shared);
            abandoned.next();

            expect(() => fromSafeTry(function* () {
                yield shared;
                yield shared;
            })).toThrow('safeTry: generator yielded more than once');
        });

        it('does not run the body after a delegation even when the same Result was delegated before', () => {
            const shared = err('shared');
            const abandoned = safeTry(shared);
            abandoned.next();

            let sideEffect = 'NOT-RUN';
            const result = fromSafeTry(function* () {
                yield* safeTry(shared);
                sideEffect = 'RAN';
                return 1;
            });
            expect(result.isFailure).toBe(true);
            expect(sideEffect).toBe('NOT-RUN');
        });

        it('rejects a yield that is not a Result before the generator body resumes', () => {
            // The runner hands the yielded value back as the failure, so a
            // non-Result would be returned as a value that is not a Result at
            // all. The check runs before the probe, so the body never resumes.
            let resumed = 'NOT-RUN';
            expect(() => fromSafeTry(function* () {
                yield 42 as never;
                resumed = 'RAN';
            })).toThrow('safeTry: the generator yielded a value that is not a valid IResultOfT');
            expect(resumed).toBe('NOT-RUN');
        });

        it('runs the body between two raw yields before reporting the double yield', () => {
            // The double-yield probe resumes the generator, so the statements
            // between the two yields execute before the error is raised. A
            // delegation does not have this property - its failure ends the
            // generator instead of running the body after it.
            let ran = 'NOT-RUN';
            expect(() => fromSafeTry(function* () {
                yield err('first');
                ran = 'RAN';
                yield err('second');
            })).toThrow('safeTry: generator yielded more than once');
            expect(ran).toBe('RAN');
        });
    });
});