import { describe, expect, it, vi } from 'vitest';
import * as asyncOption from '../../async-option/index.js';
import * as asyncResult from '../../async-result/index.js';
import * as composition from '../../composition/index.js';
import { err, ok } from '../../factories/index.js';
import * as observability from '../../observability/index.js';
import * as operators from '../../operators/index.js';
import * as option from '../../option/index.js';
import * as primitives from '../../primitives/index.js';
import * as promiseOption from '../../promise-option/index.js';
import * as promiseResult from '../../promise-result/index.js';
import * as reliability from '../../reliability/index.js';

/**
 * Conformance suite for the contracts this library settled on after a defect
 * audit. Every assertion here pins a *behavior*, not an implementation detail:
 * the suite fails when a contract regresses, whichever way the code is
 * written.
 *
 * The contracts are grouped by the module that owns them. Each group states
 * the invariant in the test title, so a failure names the broken contract
 * without needing to consult an external catalogue.
 */

describe('async-result / ap', () => {
    it('captures a throwing applied function as Err instead of rejecting', async () => {
        const r = await asyncResult.ap(
            asyncResult.fromResult(ok(() => { throw new Error('boom'); })),
            asyncResult.fromResult(ok(21)),
        ).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom');
    });

    it('starts both carriers before either one finishes', async () => {
        const order: string[] = [];
        const slow = {
            run: async (): Promise<ReturnType<typeof ok<number>>> => {
                await new Promise((resolve) => { setTimeout(resolve, 50); });
                order.push('slow-end');
                return ok(1);
            },
        };
        const fast = {
            run: async (): Promise<ReturnType<typeof ok<number>>> => {
                order.push('fast-start');
                return ok(2);
            },
        };
        await asyncResult.ap(slow, fast).run();
        // A sequential implementation would settle the slow carrier first.
        expect(order).toEqual(['fast-start', 'slow-end']);
    });
});

describe('promise-result / ap', () => {
    it('captures a throwing applied function as Err instead of rejecting', async () => {
        const r = await promiseResult.ap(
            Promise.resolve(ok(() => { throw new Error('boom'); })),
            Promise.resolve(ok(21)),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom');
    });
});

describe('promise-result / async payload carriers', () => {
    const thenable = { then(resolve: (value: string) => void): void { resolve('ADOPTED'); } };

    it('hands a thenable payload to asyncOrElse unchanged', async () => {
        let seen: unknown;
        await promiseResult.asyncOrElse(async (e) => { seen = e; return ok(1); }, err(thenable));
        expect(seen).toBe(thenable);
    });

    it('hands a thenable payload to asyncBind unchanged', async () => {
        let seen: unknown;
        await promiseResult.asyncBind(async (v) => { seen = v; return ok(1); }, ok(thenable));
        expect(seen).toBe(thenable);
    });

    it('hands a thenable payload to asyncMatch unchanged', async () => {
        let seen: unknown;
        await promiseResult.asyncMatch({ ok: (v) => { seen = v; return 1; }, err: () => 0 }, ok(thenable));
        expect(seen).toBe(thenable);
    });
});

describe('promise-option / asyncMatchOption', () => {
    it('hands a thenable payload to the some handler unchanged', async () => {
        const thenable = { then(resolve: (value: string) => void): void { resolve('ADOPTED'); } };
        let seen: unknown;
        await promiseOption.asyncMatchOption({
            some: (v) => { seen = v; return 'some'; },
            none: () => 'none',
        }, option.ofSome(thenable as never));
        expect(seen).toBe(thenable);
    });
});

describe('async-result / from', () => {
    it('returns a Promise from run() even when the thunk returns a plain Result', async () => {
        const carrier = asyncResult.from(() => ok(1));
        const promise = carrier.run();
        expect(promise).toBeInstanceOf(Promise);
        await expect(asyncResult.isOk(carrier)).resolves.toBe(true);
    });

    it('turns a synchronous throw of the thunk into a rejected promise', async () => {
        const carrier = asyncResult.from(() => { throw new Error('sync-throw'); });
        await expect(asyncResult.isOk(carrier)).rejects.toThrow('sync-throw');
    });
});

describe('async-option / from', () => {
    it('returns a Promise from run() even when the thunk returns a plain Result', async () => {
        const carrier = asyncOption.from(() => option.ofSome(1));
        expect(carrier.run()).toBeInstanceOf(Promise);
        await expect(carrier.run()).resolves.toBeDefined();
    });

    it('turns a synchronous throw of the thunk into a rejected promise', async () => {
        const carrier = asyncOption.from(() => { throw new Error('sync-throw'); });
        await expect(carrier.run()).rejects.toThrow('sync-throw');
    });
});

describe('primitives / sequenceAsyncResult', () => {
    it('keeps the carrier receiver when the carrier uses a method shorthand', async () => {
        const carrier = {
            value: 42,
            run() { return Promise.resolve(ok(this.value)); },
        };
        const r = await primitives.sequenceAsyncResult([carrier]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([42]);
    });
});

describe('observability / format', () => {
    it('keeps the closing parenthesis after a newline inside the error message', () => {
        expect(observability.format(err(new Error('line1\nline2')))).toBe('Err(Error: line1\nline2)');
    });
});

describe('observability / installObserver', () => {
    it('removes only the active observer when null is passed', () => {
        const first = vi.fn();
        const second = vi.fn();
        const cancelFirst = observability.installObserver(first);
        const cancelSecond = observability.installObserver(second);
        observability.installObserver(null);
        cancelSecond();
        expect(observability.getActiveObserver()).toBe(first);
        cancelFirst();
        expect(observability.getActiveObserver()).toBeNull();
    });
});

describe('reliability / malformed carriers', () => {
    it('race settles with an Err instead of hanging when a carrier resolves with a non-Result', async () => {
        const settled = await Promise.race([
            reliability.race([{ run: async () => undefined } as never]).run().then(() => 'settled'),
            new Promise<string>((resolve) => { setTimeout(() => { resolve('hung'); }, 100); }),
        ]);
        expect(settled).toBe('settled');
    });

    it('race accepts a carrier whose run() returns a plain Result', async () => {
        const r = await reliability.race([{ run: () => ok(1) } as never]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(1);
    });

    it('any never rejects on a carrier that resolves with a non-Result', async () => {
        const r = await reliability.any([{ run: async () => undefined } as never]).run();
        expect(r.isFailure).toBe(true);
    });

    it('allSettled never rejects on a carrier that resolves with a non-Result', async () => {
        const r = await reliability.allSettled([{ run: async () => undefined } as never]).run();
        expect(r.isSuccess).toBe(true);
    });

    it('retry never rejects when the function resolves with a non-Result', async () => {
        const r = await reliability.retry(async () => undefined as never, { times: 1 });
        expect(r.isFailure).toBe(true);
    });

    it('timeout resolves with an Err when the inner run resolves with a non-Result', async () => {
        const r = await reliability.timeout(50, { run: async () => undefined } as never).run();
        expect(r.isFailure).toBe(true);
    });

    it('never hands a non-finite delay to the timer', async () => {
        vi.useFakeTimers();
        const spy = vi.spyOn(globalThis, 'setTimeout');
        const pending = reliability.retry(async () => err('x'), { times: 1, delayMs: () => Number.POSITIVE_INFINITY });
        await vi.advanceTimersByTimeAsync(0);
        const delays = spy.mock.calls
            .map((call) => call[1])
            .filter((delay): delay is number => typeof delay === 'number');
        spy.mockRestore();
        vi.useRealTimers();
        void pending.catch(() => undefined);
        for (const delay of delays) {
            expect(Number.isFinite(delay)).toBe(true);
            expect(delay).toBeLessThanOrEqual(2_147_483_647);
        }
    });
});

describe('option / direct form', () => {
    it('map applies the function when the option is passed directly', () => {
        const r = option.map((x: number) => x * 2, option.ofSome(21));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('bind applies the function when the option is passed directly', () => {
        const r = option.bind((x: number) => option.ofSome(x * 2), option.ofSome(21));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('filter applies the predicate when the option is passed directly', () => {
        expect(option.filter((x: number) => x > 0, option.ofSome(42)).isSome).toBe(true);
        expect(option.filter((x: number) => x > 100, option.ofSome(42)).isNone).toBe(true);
    });

    it('tap applies the side effect when the option is passed directly', () => {
        const seen: number[] = [];
        option.tap((v: number) => { seen.push(v); }, option.ofSome(7));
        expect(seen).toEqual([7]);
    });

    it('okOr converts when the option is passed directly', () => {
        const r = option.okOr('default', option.ofSome(42));
        expect(r.isSuccess).toBe(true);
    });

    it('okOrElse converts when the option is passed directly', () => {
        const r = option.okOrElse(() => 'default', option.ofSome(42));
        expect(r.isSuccess).toBe(true);
    });

    it('contains answers the question when the option is passed directly', () => {
        expect(option.contains(42, option.ofSome(42))).toBe(true);
        expect(option.contains(99, option.ofSome(42))).toBe(false);
    });
});

describe('option / okOrElse', () => {
    it('wraps a non-Error throw in an Error so the declared error type holds', () => {
        const r = option.okOrElse<string>(() => { throw 'plain-string'; })(option.ofNone() as never);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).cause).toBe('plain-string');
        }
    });
});

describe('option / all', () => {
    it('returns Some([]) for an empty array', () => {
        const r = option.all([]);
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toEqual([]);
    });
});

describe('exists across the layers', () => {
    it('propagates a throwing predicate in the Result layer', () => {
        expect(() => operators.exists(() => { throw new Error('boom'); }, ok(1))).toThrow('boom');
    });

    it('collapses a throwing predicate to false in the eager Option layer', async () => {
        const r = await promiseOption.existsAsyncOption(
            (() => { throw new Error('boom'); }) as (x: number) => boolean,
            Promise.resolve(option.ofSome(1)),
        );
        expect(r).toBe(false);
    });
});

describe('async-option / exists', () => {
    it('returns false when the predicate throws synchronously', async () => {
        const r = await asyncOption.exists(
            (() => { throw new Error('pred-throw'); }) as (x: number) => boolean,
            asyncOption.fromOption(option.ofSome(1)),
        );
        expect(r).toBe(false);
    });

    it('returns false when the predicate rejects', async () => {
        const r = await asyncOption.exists(
            async () => { throw new Error('pred-reject'); },
            asyncOption.fromOption(option.ofSome(1)),
        );
        expect(r).toBe(false);
    });
});

describe('async-option / zipWith', () => {
    it('converts a synchronous throw from the callback to None', async () => {
        const r = await asyncOption.zipWith(
            (() => { throw new Error('boom'); }) as (a: number, b: number) => number,
            asyncOption.fromOption(option.ofSome(1)),
            asyncOption.fromOption(option.ofSome(2)),
        ).run();
        expect(r.isNone).toBe(true);
    });
});

describe('async-option / okOrElse', () => {
    it('wraps a non-Error throw from onNone in an Error', async () => {
        const r = await asyncOption.okOrElse<string>(
            () => { throw 'plain-string'; },
            asyncOption.fromOption(option.ofNone<number>()),
        ).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).cause).toBe('plain-string');
        }
    });
});

describe('promise-option / lift family', () => {
    it('asyncMapOption converts a synchronous mapper into None instead of throwing', async () => {
        const r = await promiseOption.asyncMapOption(((x: number) => x * 2) as never, option.ofSome(21));
        expect(r.isNone).toBe(true);
    });

    it('asyncTapOption converts a synchronous callback into None instead of throwing', async () => {
        const r = await promiseOption.asyncTapOption((() => undefined) as never, option.ofSome(21));
        expect(r.isNone).toBe(true);
    });

    it('asyncBindOption returns a Promise even when the callback returns a plain Option', async () => {
        const pending = promiseOption.asyncBindOption(((x: number) => option.ofSome(x * 2)) as never, option.ofSome(21));
        expect(pending).toBeInstanceOf(Promise);
        const r = await pending;
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('asyncOrElseOption returns a Promise even when the callback returns a plain Option', async () => {
        const pending = promiseOption.asyncOrElseOption((() => option.ofSome(0)) as never, option.ofNone());
        expect(pending).toBeInstanceOf(Promise);
        const r = await pending;
        expect(r.isSome).toBe(true);
    });
});

describe('promise-option / tapErrAsyncOption', () => {
    it('observes the Some track with fn and the None track with fnNone', async () => {
        const calls: unknown[] = [];
        await promiseOption.tapErrAsyncOption(
            (v) => { calls.push(['fn', v]); },
            Promise.resolve(option.ofSome(42)),
            () => { calls.push(['fnNone']); },
        );
        await promiseOption.tapErrAsyncOption(
            (v) => { calls.push(['fn', v]); },
            Promise.resolve(option.ofNone()),
            () => { calls.push(['fnNone']); },
        );
        expect(calls).toEqual([['fn', 42], ['fnNone']]);
    });
});

describe('operators / errorFn', () => {
    const boom = () => { throw new Error('mapper-bug'); };

    it('map collapses a throwing errorFn into the error channel', () => {
        const r = operators.map(() => { throw new Error('x'); }, ok(1), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });

    it('tap collapses a throwing errorFn into the error channel', () => {
        const r = operators.tap(() => { throw new Error('x'); }, ok(1), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });

    it('tapErr collapses a throwing errorFn into the error channel', () => {
        const r = operators.tapErr(() => { throw new Error('x'); }, err('orig'), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });

    it('andTee collapses a throwing errorFn into the error channel', () => {
        const r = operators.andTee(() => { throw new Error('x'); }, ok(1), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });

    it('orTee collapses a throwing errorFn into the error channel', () => {
        const r = operators.orTee(() => { throw new Error('x'); }, err('orig'), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });

    it('andThrough collapses a throwing errorFn into the error channel', () => {
        const r = operators.andThrough(() => { throw new Error('x'); }, ok(1), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });

    it('bimap collapses a throwing errorFn into the error channel', () => {
        const r = operators.bimap(() => { throw new Error('x'); }, (e: string) => e, ok(1), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });

    it('orElse collapses a throwing errorFn into the error channel', () => {
        const r = operators.orElse(() => { throw new Error('x'); }, err('orig'), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });

    it('filterOrElse collapses a throwing errorFn into the error channel', () => {
        const r = operators.filterOrElse(() => { throw new Error('x'); }, () => 'orig', ok(1), boom);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('mapper-bug');
    });
});

describe('composition / fromSafeTry', () => {
    it('throws when a real generator yields twice', () => {
        function* twice(): Generator<ReturnType<typeof err<string>>, void, unknown> {
            yield err('first');
            yield err('second');
        }
        expect(() => composition.fromSafeTry(twice)).toThrow('safeTry: generator yielded more than once');
    });

    it('uses a Result returned by the generator as-is', () => {
        const nested = composition.fromSafeTry(function* () { return ok(undefined); });
        expect(nested.isSuccess).toBe(true);
        if (nested.isSuccess) expect(nested.value).toBeUndefined();
    });

    it('does not resume the generator body after a failed delegation', () => {
        let sideEffect = 'NOT-RUN';
        const r = composition.fromSafeTry(function* () {
            yield* composition.safeTry(err('failed'));
            sideEffect = 'RAN';
            return 1;
        });
        expect(r.isFailure).toBe(true);
        expect(sideEffect).toBe('NOT-RUN');
    });
});

describe('composition / fromSafeTryAsync', () => {
    it('throws when a real generator yields twice', async () => {
        async function* twice(): AsyncGenerator<ReturnType<typeof err<string>>, void, unknown> {
            yield err('first');
            yield err('second');
        }
        await expect(composition.fromSafeTryAsync(twice).run()).rejects.toThrow(
            'safeTryAsync: generator yielded more than once',
        );
    });

    it('uses a Result returned by the generator as-is', async () => {
        const nested = await composition.fromSafeTryAsync(async function* () { return ok(undefined); }).run();
        expect(nested.isSuccess).toBe(true);
        if (nested.isSuccess) expect(nested.value).toBeUndefined();
    });

    it('does not resume the generator body after a failed delegation while another run is in flight', async () => {
        let sideEffect = 'NOT-RUN';
        const runA = composition.fromSafeTryAsync(async function* () {
            await new Promise((resolve) => { setTimeout(resolve, 20); });
            yield* composition.safeTryAsync(err('A-failure'));
            sideEffect = 'RAN';
            return 1;
        }).run();
        const runB = composition.fromSafeTryAsync(async function* () {
            await new Promise((resolve) => { setTimeout(resolve, 200); });
            return 2;
        }).run();
        const a = await runA;
        expect(a.isFailure).toBe(true);
        expect(sideEffect).toBe('NOT-RUN');
        await runB;
    });
});
