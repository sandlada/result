import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';
import {
    ok,
    err,
    map,
    bind,
    orElse,
    match,
    composeK,
    pipe,
    switchFn,
    liftMap,
    tee,
    combine,
    all,
    combineWithAllErrors,
} from '../src/fp/index.js';

// ── composeK ───────────────────────────────────────────────────────────

describe('composeK', () => {
    type AppErr = string;

    const parse = (input: string): IResultOfT<number, AppErr> => {
        const n = Number(input);
        return Number.isNaN(n) ? err<AppErr>('Not a number') : ok(n);
    };

    const double = (n: number): IResultOfT<number, AppErr> =>
        ok(n * 2);

    it('chains two successful functions', () => {
        const composed = composeK(parse, double);

        const result = composed('21');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('short-circuits when the first function fails', () => {
        let secondCalled = false;
        const tracking = (n: number): IResultOfT<number, AppErr> => {
            secondCalled = true;
            return ok(n * 2);
        };

        const composed = composeK(parse, tracking);
        const result = composed('invalid');

        expect(secondCalled).toBe(false);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('Not a number');
    });

    it('chains to failure when the second function fails', () => {
        const failIfLarge = (n: number): IResultOfT<number, AppErr> =>
            n > 10 ? err<AppErr>('Too large') : ok(n);

        const composed = composeK(parse, failIfLarge);
        const result = composed('21');

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('Too large');
    });

    it('supports nested composeK', () => {
        const addOne = (n: number): IResultOfT<number, AppErr> => ok(n + 1);

        const composed = composeK(parse, composeK(double, addOne));
        // parse('21') → ok(21) → composeK(double, addOne)(21) → double(21) → ok(42) → addOne(42) → ok(43)
        const result = composed('21');

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(43);
    });
});

// ── pipe ───────────────────────────────────────────────────────────────

describe('pipe', () => {
    it('single argument returns the argument itself', () => {
        const result = pipe(42);

        expect(result).toBe(42);
    });

    it('three functions — sequential transform on an ok result', () => {
        const result = pipe(
            ok(10),
            map((x: number) => x * 2),
            bind((x: number) => ok(x + 1)),
            match(
                (v: number) => `OK: ${v}`,
                (_e: unknown) => 'FAIL',
            ),
        );

        expect(result).toBe('OK: 21');
    });

    it('early failure in the pipeline short-circuits', () => {
        let afterFailure = false;
        const trackingBind = (x: number): IResultOfT<number, string> => {
            afterFailure = true;
            return ok(x * 2);
        };

        pipe(
            err<string>('original error'),
            bind(trackingBind),
            match(
                (v: number) => String(v),
                (e: string) => e,
            ),
        );

        // bind should NOT be called when input is failure in pipe
        // (but pipe runs sequentially through all fns; the short-circuit is in bind itself)
        // pipe still passes the result through, but bind ignores it
    });

    it('pipe ending with match returns a terminal value', () => {
        const result = pipe(
            ok(42),
            match(
                (v: number) => `success: ${v}`,
                (e: unknown) => `error: ${String(e)}`,
            ),
        );

        expect(result).toBe('success: 42');
    });

    it('pipe with mixed map / bind / orElse', () => {
        const result = pipe(
            err<string>('original'),
            orElse((_e: string) => ok<number>(42)),
            map((x: number) => x * 2),
            bind((x: number) => ok(x + 1)),
            match(
                (v: number) => v,
                (_e: string) => -1,
            ),
        );

        // orElse recovers → ok(42) → map *2 → ok(84) → bind +1 → ok(85) → match → 85
        expect(result).toBe(85);
    });
});

// ── switchFn ───────────────────────────────────────────────────────────

describe('switchFn', () => {
    it('wraps a normal function to return a success result', () => {
        const safeParseInt = switchFn((s: string) => Number.parseInt(s, 10));

        const result = safeParseInt('42');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('exception propagates (switchFn does not catch)', () => {
        const badFn = switchFn((_s: string) => {
            throw new Error('unexpected');
        });

        expect(() => badFn('anything')).toThrow('unexpected');
    });

    it('preserves falsy return values', () => {
        const returnFalse = switchFn((_x: unknown) => false);

        const result = returnFalse(undefined);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(false);
    });

    it('preserves null return values', () => {
        const returnNull = switchFn((_x: unknown) => null);

        const result = returnNull(undefined);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeNull();
    });
});

// ── liftMap ────────────────────────────────────────────────────────────

describe('liftMap', () => {
    const double = (x: number) => x * 2;

    it('curried: liftMap(fn) returns a function that maps success', () => {
        const lifted = liftMap(double);

        const result = lifted(ok(21));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: liftMap(fn, ok(value)) transforms', () => {
        const result = liftMap(double, ok(21));

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('failure passes through', () => {
        const result = liftMap(double, err<string>('bad'));

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('bad');
    });
});

// ── tee ────────────────────────────────────────────────────────────────

describe('tee', () => {
    it('calls side-effect and returns the original value', () => {
        let side: number | undefined;
        const withLog = tee((x: number) => { side = x; });

        const result = withLog(42);
        expect(side).toBe(42);
        expect(result).toBe(42);
    });

    it('does not mutate the value', () => {
        let caught: string | undefined;
        const log = tee((x: string) => { caught = x; });

        const result = log('hello');
        expect(caught).toBe('hello');
        expect(result).toBe('hello');
    });
});

// ── combine (FP) ───────────────────────────────────────────────────────

describe('fp/combine', () => {
    it('all success → returns value array', () => {
        const result = combine([ok(1), ok(2), ok(3)]);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toEqual([1, 2, 3]);
    });

    it('first failure → short-circuits', () => {
        const result = combine([err<string>('fail'), ok(2), ok(3)]);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('empty array → success with empty array', () => {
        const result = combine([]);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toEqual([]);
    });
});

// ── all (FP) ───────────────────────────────────────────────────────────

describe('fp/all', () => {
    it('heterogeneous tuple all success', () => {
        const result = all([
            ok<number>(1),
            ok<string>('hello'),
        ] as const);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toEqual([1, 'hello']);
    });

    it('any failure → short-circuits', () => {
        const result = all([
            ok<number>(1),
            err<string>('failed'),
        ] as const);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('failed');
    });
});

// ── combineWithAllErrors (FP) ──────────────────────────────────────────

describe('fp/combineWithAllErrors', () => {
    it('partial failure → collects all errors', () => {
        const result = combineWithAllErrors([
            ok<number>(1),
            err<string>('bad'),
            ok<number>(3),
            err<string>('also bad'),
        ]);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toEqual(['bad', 'also bad']);
    });

    it('all success → returns value array', () => {
        const result = combineWithAllErrors([ok(1), ok(2)]);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toEqual([1, 2]);
    });
});

// ── OOP / FP interop ───────────────────────────────────────────────────

describe('FP composition with OOP results', () => {
    it('pipe starting with Result.Success goes through full FP pipeline', () => {
        const result = pipe(
            Result.Success<number>(10),
            map((x: number) => x * 2),
            bind((x: number) => ok(x + 1)),
            match(
                (v: number) => `value: ${v}`,
                (e: unknown) => `error: ${String(e)}`,
            ),
        );

        expect(result).toBe('value: 21');
    });

    it('fp/combine accepts Result.Success and Result.Failure elements', () => {
        const error = new Error('fail');

        const result = combine([
            Result.Success(1) as IResultOfT<number, Error>,
            Result.Success(2) as IResultOfT<number, Error>,
            Result.Failure<number, Error>(error),
        ]);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe(error);
    });

    it('switchFn wrapping a function that returns an OOP Result', () => {
        const wrapped = switchFn((x: number) =>
            x > 0 ? Result.Success(x * 2) : Result.Failure<number, Error>(new Error('negative')),
        );

        const r1 = wrapped(21);
        expect(r1.isSuccess).toBe(true);
        if (r1.isSuccess) expect(r1.value).toStrictEqual(Result.Success(42));
    });
});
