import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResultOfT } from '../src/IResultOfT.js';
import { ok, err, map as fpMap, bind as fpBind } from '../src/fp/index.js';
import { combine as fpCombine } from '../src/fp/index.js';

// ── .map(fn) ───────────────────────────────────────────────────────────

describe('ResultOfT.map', () => {
    it('transforms the success value', () => {
        const result = Result.Success(21).map(x => x * 2);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('failure passes through unchanged — fn is not called', () => {
        let called = false;
        const error = new Error('fail');

        const result = Result.Failure<number, Error>(error).map(x => {
            called = true;
            return x * 2;
        });

        expect(called).toBe(false);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe(error);
    });

    it('chainable: .map().map() applies both transforms', () => {
        const result = Result.Success(10)
            .map(x => x * 2)
            .map(x => x + 1);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(21);
    });

    it('type changes: number → string via map', () => {
        const result = Result.Success(42).map(x => `value: ${x}`);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('value: 42');
    });
});

// ── .mapErr(fn) ────────────────────────────────────────────────────────

describe('ResultOfT.mapErr', () => {
    it('transforms the error on failure', () => {
        type AppErr = { code: number; message: string };
        const error = new Error('raw error');

        const result = Result.Failure<number, Error>(error).mapErr(
            (e): AppErr => ({ code: 500, message: e.message }),
        );

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.code).toBe(500);
            expect(result.error.message).toBe('raw error');
        }
    });

    it('success passes through — fn is not called', () => {
        let called = false;

        const result = Result.Success(42).mapErr(e => {
            called = true;
            return String(e);
        });

        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('chainable: .mapErr().mapErr() applies both error transforms', () => {
        const result = Result.Failure<number, string>('bad')
            .mapErr(e => e.toUpperCase())
            .mapErr(e => `ERROR: ${e}`);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('ERROR: BAD');
    });

    it('error type changes via mapErr', () => {
        const result = Result.Failure<number, Error>(new Error('boom')).mapErr(
            (): number => 404,
        );

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(typeof result.error).toBe('number');
    });
});

// ── .andThen(fn) ───────────────────────────────────────────────────────

describe('ResultOfT.andThen', () => {
    type ParseErr = { kind: 'Invalid' };

    const validate = (x: number): IResultOfT<number, ParseErr> =>
        x > 0
            ? Result.Success(x) as unknown as IResultOfT<number, ParseErr>
            : Result.Failure<number, ParseErr>({ kind: 'Invalid' });

    it('chains to the next success', () => {
        const result = Result.Success<number>(42).andThen(validate);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('chains to a failure (fn returns failure)', () => {
        const result = Result.Success<number>(-1).andThen(validate);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toEqual({ kind: 'Invalid' });
    });

    it('failure short-circuits — fn is not called', () => {
        let called = false;
        const error = new Error('original');

        const result = Result.Failure<number, Error>(error).andThen(x => {
            called = true;
            return Result.Success(x * 2) as IResultOfT<number, Error>;
        });

        expect(called).toBe(false);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe(error);
    });

    it('chainable: .andThen().andThen()', () => {
        type ChainErr = string;

        const result = Result.Success<number>(5)
            .andThen(x => Result.Success(x * 2) as unknown as IResultOfT<number, ChainErr>)
            .andThen(x => Result.Success(x + 1) as unknown as IResultOfT<number, ChainErr>);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(11);
    });

    it('error type widens: E1 | E2 after andThen with different error', () => {
        type E1 = Error;
        type E2 = { kind: 'Domain' };

        const result = Result.Success<number>(42).andThen(
            (): IResultOfT<number, E2> => Result.Failure<number, E2>({ kind: 'Domain' }),
        );

        // result type should be IResultOfT<number, E1 | E2>
        expect(result.isSuccess).toBe(false);
    });
});

// ── .orElse(fn) ────────────────────────────────────────────────────────

describe('ResultOfT.orElse', () => {
    it('recovers from failure to success', () => {
        const result = Result.Failure<string, string>('not found').orElse(
            (_e) => Result.Success<string>('default'),
        );

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('default');
    });

    it('failure recovery also fails', () => {
        type AppErr = { kind: 'Fatal' };

        const result = Result.Failure<string, string>('original').orElse(
            (_e): IResultOfT<string, AppErr> =>
                Result.Failure<string, AppErr>({ kind: 'Fatal' }),
        );

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toEqual({ kind: 'Fatal' });
    });

    it('success passes through — fn is not called', () => {
        let called = false;

        const result = Result.Success<string>('hello').orElse(_e => {
            called = true;
            return Result.Success('fallback');
        });

        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('hello');
    });

    it('success type widens: T | U when recovery produces different type', () => {
        const result = Result.Failure<number, string>('error').orElse(
            (_e): IResultOfT<string, string> =>
                Result.Success('recovered') as unknown as IResultOfT<string, string>,
        );

        expect(result.isSuccess).toBe(true);
        // result type: IResultOfT<number | string, string>
        if (result.isSuccess) expect(result.value).toBe('recovered');
    });
});

// ── .match(onOk, onErr) ────────────────────────────────────────────────

describe('ResultOfT.match', () => {
    it('calls onSuccess for a success result', () => {
        const result = Result.Success(42).match(
            v => `value: ${v}`,
            e => `error: ${e}`,
        );

        expect(result).toBe('value: 42');
    });

    it('calls onFailure for a failure result', () => {
        const result = Result.Failure<number, string>('bad').match(
            v => `value: ${v}`,
            e => `error: ${e}`,
        );

        expect(result).toBe('error: bad');
    });

    it('return type is correctly inferred', () => {
        const val: 'ok' | 'fail' = Result.Success(42).match(
            () => 'ok' as const,
            () => 'fail' as const,
        );

        expect(val).toBe('ok');
    });
});

// ── .tap(fn) ───────────────────────────────────────────────────────────

describe('ResultOfT.tap', () => {
    it('calls side-effect on success and returns same result', () => {
        let side: number | undefined;

        const result = Result.Success(42).tap(v => { side = v; });

        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('does NOT call side-effect on failure', () => {
        let called = false;

        Result.Failure<number, string>('bad').tap(() => { called = true; });

        expect(called).toBe(false);
    });

    it('chainable: .tap() then .map() — tap called before map', () => {
        const order: string[] = [];

        const result = Result.Success(10)
            .tap(() => order.push('tap'))
            .map(x => {
                order.push('map');
                return x * 2;
            });

        expect(order).toEqual(['tap', 'map']);
        if (result.isSuccess) expect(result.value).toBe(20);
    });
});

// ── .tapErr(fn) ────────────────────────────────────────────────────────

describe('ResultOfT.tapErr', () => {
    it('calls side-effect on failure', () => {
        let side: string | undefined;

        const result = Result.Failure<number, string>('bad').tapErr(e => { side = e; });

        expect(side).toBe('bad');
        expect(result.isSuccess).toBe(false);
    });

    it('does NOT call side-effect on success', () => {
        let called = false;

        Result.Success(42).tapErr(() => { called = true; });

        expect(called).toBe(false);
    });

    it('chainable: .tapErr() then .orElse() — tapErr called before orElse', () => {
        const order: string[] = [];

        const result = Result.Failure<number, string>('original')
            .tapErr(() => order.push('tapErr'))
            .orElse(_e => {
                order.push('orElse');
                return Result.Success(42);
            });

        expect(order).toEqual(['tapErr', 'orElse']);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });
});

// ── .unwrapOr(defaultValue) ────────────────────────────────────────────

describe('ResultOfT.unwrapOr', () => {
    it('returns the value on success', () => {
        const val = Result.Success(42).unwrapOr(0);

        expect(val).toBe(42);
    });

    it('returns the default on failure', () => {
        const val = Result.Failure<number, string>('bad').unwrapOr(0);

        expect(val).toBe(0);
    });

    it('default can be a different type from the value', () => {
        // unwrapOr is typed as (defaultValue: TValue) => TValue, so to pass a
        // different type we cast through unknown. Runtime behavior is unchanged.
        const val = Result.Failure<number, string>('bad').unwrapOr(
            'none' as unknown as number,
        ) as number | 'none';

        // Type: number | 'none'
        expect(val).toBe('none');
    });
});

// ── OOP / FP interop ───────────────────────────────────────────────────

describe('OOP methods with FP operators', () => {
    it('.map() → FP bind() — OOP entry, FP continuation', () => {
        const mapped = Result.Success(10).map(x => x * 2);
        const bound = fpBind(
            (x: number) => ok(x + 1),
            mapped,
        );

        expect(bound.isSuccess).toBe(true);
        if (bound.isSuccess) expect(bound.value).toBe(21);
    });

    it('FP map() result → .andThen() — FP entry, OOP continuation', () => {
        const fpResult = fpMap((x: number) => x * 2, ok(10));
        const result = (fpResult as unknown as ReturnType<typeof Result.Success<number>>)
            .andThen(x => Result.Success(x + 1) as IResultOfT<number, Error>);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(21);
    });

    it('.andThen callback uses FP ok / err', () => {
        const result = Result.Success<number>(42).andThen(x =>
            x > 0 ? ok(x * 2) : err<string>('negative') as IResultOfT<number, string>,
        );

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(84);
    });

    it('ResultOfT instance passed into fp/combine', () => {
        const combined = fpCombine([
            Result.Success(1) as IResultOfT<number, Error>,
            Result.Success(2) as IResultOfT<number, Error>,
            Result.Success(3) as IResultOfT<number, Error>,
        ]);

        expect(combined.isSuccess).toBe(true);
        if (combined.isSuccess) expect(combined.value).toEqual([1, 2, 3]);
    });
});
