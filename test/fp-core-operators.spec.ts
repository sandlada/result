import { describe, it, expect } from 'vitest';
import type { IResultOfT } from '../src/types/IResultOfT.js';
import {
    ok,
    err,
    map,
    mapErr,
    bind,
    orElse,
    match,
    tap,
    tapErr,
    unwrapOr,
    composeK,
} from '../src/index.js';

// ── Constructors: ok / err ─────────────────────────────────────────────

describe('ok', () => {
    it('ok() with no argument creates a void success', () => {
        const result = ok();

        expect(result.isSuccess).toBe(true);
        expect(result.isFailure).toBe(false);
    });

    it('ok(value) creates a success carrying the value', () => {
        const result = ok(42);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('ok(undefined) creates a success with undefined value', () => {
        const result = ok<number | undefined>(undefined);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeUndefined();
    });

    it('ok(null) creates a success with null value', () => {
        const result = ok<string | null>(null);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeNull();
    });

    it('error type is never for an ok result (type-level: accessible without throw)', () => {
        const result = ok(42);

        // error is accessible (sentinel) at runtime, doesn't throw
        // @ts-expect-error — .error is not on the success variant of the union
        expect(() => result.error).not.toThrow();
        // isFailure correctly reports false
        expect(result.isFailure).toBe(false);
    });
});

describe('err', () => {
    it('err(error) creates a failure carrying the error', () => {
        const result = err('bad input');

        expect(result.isSuccess).toBe(false);
        expect(result.isFailure).toBe(true);
        if (!result.isSuccess) expect(result.error).toBe('bad input');
    });

    it('err works with Error instances', () => {
        const error = new Error('boom');
        const result = err(error);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe(error);
    });

    it('err works with discriminated union errors', () => {
        type AppErr = { kind: 'NotFound'; id: string };
        const result = err<AppErr>({ kind: 'NotFound', id: '42' });

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.kind).toBe('NotFound');
            expect(result.error.id).toBe('42');
        }
    });
});

// ── map ────────────────────────────────────────────────────────────────

describe('fp/map', () => {
    const double = (x: number) => x * 2;

    it('curried: map(fn) returns a function, then applied to success', () => {
        const doubleFn = map(double);

        const result = doubleFn(ok(21));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: map(fn, result) transforms success value', () => {
        const result = map(double, ok(21));

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('failure passes through unchanged (curried)', () => {
        const original = err<string>('bad');
        const mapped = map(double)(original);

        expect(mapped.isSuccess).toBe(false);
        if (!mapped.isSuccess) expect(mapped.error).toBe('bad');
    });

    it('failure passes through unchanged (direct)', () => {
        const original = err<string>('bad');

        const mapped = map(double, original);
        expect(mapped.isSuccess).toBe(false);
        if (!mapped.isSuccess) expect(mapped.error).toBe('bad');
    });

    it('chained curried: double map applies both transforms', () => {
        const addOne = (x: number) => x + 1;

        const result = map(addOne)(map(double)(ok(10)));
        // 10 * 2 = 20, 20 + 1 = 21
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(21);
    });
});

// ── mapErr ─────────────────────────────────────────────────────────────

describe('fp/mapErr', () => {
    const toUpper = (e: string) => e.toUpperCase();

    it('curried: mapErr(fn) transforms failure error', () => {
        const upperErr = mapErr(toUpper);

        const result = upperErr(err('bad'));
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('BAD');
    });

    it('direct: mapErr(fn, failure) transforms error', () => {
        const result = mapErr(toUpper, err('bad'));

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('BAD');
    });

    it('success passes through unchanged (curried)', () => {
        const upperErr = mapErr(toUpper);

        const result = upperErr(ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('success passes through unchanged (direct)', () => {
        const result = mapErr(toUpper, ok(42));

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });
});

// ── bind ───────────────────────────────────────────────────────────────

describe('fp/bind', () => {
    type NumErr = { kind: 'TooSmall' };
    const validatePositive = (x: number): IResultOfT<number, NumErr> =>
        x > 0 ? ok(x) : err<NumErr>({ kind: 'TooSmall' });

    it('curried: bind(fn) chains a success', () => {
        const bound = bind(validatePositive);

        const result = bound(ok(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: bind(fn, ok(value)) chains', () => {
        const result = bind(validatePositive, ok(42));

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('failure short-circuits — fn is not called', () => {
        let called = false;
        const trackingBind = (x: number): IResultOfT<number, NumErr> => {
            called = true;
            return ok(x);
        };

        const result = bind(trackingBind, err<string>('original error'));

        expect(called).toBe(false);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('original error');
    });

    it('chain to failure — fn returns err', () => {
        const result = bind(validatePositive, ok(-1));

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toEqual({ kind: 'TooSmall' });
    });

    it('error type widens: E | F after bind with different error type', () => {
        type ParseErr = { kind: 'ParseError' };
        const validate = (x: number): IResultOfT<number, ParseErr> =>
            x < 100 ? ok(x) : err<ParseErr>({ kind: 'ParseError' });

        // Start: IResultOfT<number, NumErr>; bind → IResultOfT<number, NumErr | ParseErr>
        const result = bind(validate, ok(42));

        expect(result.isSuccess).toBe(true);
    });
});

// ── orElse ─────────────────────────────────────────────────────────────

describe('fp/orElse', () => {
    const fallback = (_e: string) => ok<number | string>(42) as IResultOfT<number | string, string>;

    it('curried: orElse(fn) recovers from failure', () => {
        const recover = orElse(fallback);

        const result = recover(err<string>('original'));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: orElse(fn, failure) recovers', () => {
        const result = orElse(fallback, err<string>('original'));

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('success passes through — fn is not called', () => {
        let called = false;
        const tracking = (_e: string) => {
            called = true;
            return ok(42) as IResultOfT<number | string, string>;
        };

        const result = orElse(tracking, ok<number>(99));

        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(99);
    });

    it('orElse returns failure — recovery also fails', () => {
        const result = orElse(
            (_e: string) => err<string>('recovery failed'),
            err<string>('original'),
        );

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('recovery failed');
    });
});

// ── match ──────────────────────────────────────────────────────────────

describe('fp/match', () => {
    const onOk = (v: number) => `value: ${v}`;
    const onErr = (e: string) => `error: ${e}`;

    it('curried: match(onOk, onErr) applied to success', () => {
        const matcher = match(onOk, onErr);

        expect(matcher(ok(42))).toBe('value: 42');
    });

    it('curried: match(onOk, onErr) applied to failure', () => {
        const matcher = match(onOk, onErr);

        expect(matcher(err('bad'))).toBe('error: bad');
    });

    it('direct: match(onOk, onErr, ok(value))', () => {
        expect(match(onOk, onErr, ok(42))).toBe('value: 42');
    });

    it('direct: match(onOk, onErr, err(error))', () => {
        expect(match(onOk, onErr, err('bad'))).toBe('error: bad');
    });

    it('onOk and onErr can return different types — TS infers union', () => {
        const result = match(
            (_v: number): 123 | 'error' => 123 as const,
            (_e: string): 123 | 'error' => 'error' as const,
            ok(42),
        );
        // result type is 123 | 'error'
        expect(result).toBe(123);
    });
});

// ── tap ────────────────────────────────────────────────────────────────

describe('fp/tap', () => {
    it('curried: side-effect called on success, original returned', () => {
        let side: number | undefined;
        const tapper = tap((v: number) => { side = v; });

        const result = tapper(ok(42));
        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('direct: side-effect called on success', () => {
        let side: number | undefined;

        const result = tap((v: number) => { side = v; }, ok(42));
        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
    });

    it('failure: side-effect NOT called', () => {
        let called = false;

        const result = tap(() => { called = true; }, err<string>('bad'));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(false);
    });
});

// ── tapErr ─────────────────────────────────────────────────────────────

describe('fp/tapErr', () => {
    it('curried: side-effect called on failure, original returned', () => {
        let side: string | undefined;
        const tapper = tapErr((e: string) => { side = e; });

        const result = tapper(err<string>('bad'));
        expect(side).toBe('bad');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('bad');
    });

    it('direct: side-effect called on failure', () => {
        let side: string | undefined;

        const result = tapErr((e: string) => { side = e; }, err<string>('bad'));
        expect(side).toBe('bad');
    });

    it('success: side-effect NOT called', () => {
        let called = false;

        const result = tapErr(() => { called = true; }, ok(42));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
    });
});

// ── unwrapOr ───────────────────────────────────────────────────────────

describe('fp/unwrapOr', () => {
    it('curried: returns value on success', () => {
        const extractor = unwrapOr(0);

        expect(extractor(ok(42))).toBe(42);
    });

    it('direct: returns value on success', () => {
        expect(unwrapOr(0, ok(42))).toBe(42);
    });

    it('curried: returns default on failure', () => {
        const extractor = unwrapOr(0);

        expect(extractor(err<string>('bad'))).toBe(0);
    });

    it('direct: returns default on failure', () => {
        expect(unwrapOr(0, err('bad'))).toBe(0);
    });
});

// ── OOP / FP interop ───────────────────────────────────────────────────

describe('FP operators on OOP results', () => {
    it('map(fn) works on ok()', () => {
        const result = map((x: number) => x * 2, ok(21));

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('map(fn) works on err() — pass through', () => {
        const error = new Error('fail');
        const result = map((x: number) => x * 2, err<number, Error>(error));

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe(error);
    });

    it('composeK accepts OOP-style andThen callbacks', () => {
        const f1 = (a: number) => ok(a * 2) as IResultOfT<number, Error>;
        const f2 = (b: number) => ok(b + 1) as IResultOfT<number, Error>;

        const composed = composeK(f1, f2);

        const result = composed(10);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(21);
    });
});

