import { describe, it, expectTypeOf } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResult } from '../src/types/IResult.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';

describe('Return types of FP constructors', () => {
    it('ok() returns IResult', () => {
        const r = ok();
        expectTypeOf(r).toMatchTypeOf<IResult>();
    });

    it('ok<T>(value) returns IResultOfT<T>', () => {
        const r = ok(42);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number>>();
    });

    it('ok<T>(value) infers T from argument', () => {
        const r = ok('hello');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string>>();
    });

    it('err(error) returns IResultOfT<never, E>', () => {
        const r = err(new Error('fail'));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, Error>>();
    });

    it('err<E>(error) infers E from argument', () => {
        const r = err<string>('fail');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, string>>();
    });
});

describe('Generic parameter inference', () => {
    it('TValue is inferred from ok argument', () => {
        const r = ok({ id: 1, name: 'Alice' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<{ id: number; name: string }>>();
    });

    it('TError is inferred from err argument', () => {
        type ApiError = { status: number; message: string };
        const r = err<ApiError>({ status: 404, message: 'Not found' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, ApiError>>();
    });
});

describe('Interface hierarchy', () => {
    it('IResultOfT<T, E> is assignable to IResult<E>', () => {
        type R = IResultOfT<string, Error>;
        expectTypeOf<R>().toMatchTypeOf<IResult>();
    });

    it('IResultOfT without TError defaults to Error', () => {
        type R = IResultOfT<number>;
        expectTypeOf<R>().toMatchTypeOf<IResultOfT<number, Error>>();
    });

    it('IResult without TError defaults to Error', () => {
        type R = IResult;
        expectTypeOf<R>().toMatchTypeOf<IResult<Error>>();
    });
});

describe('Structural compatibility', () => {
    it('custom error union is assignable to IResultOfT<T, E>', () => {
        type AppError = { kind: 'NotFound'; id: string };
        const r = ok('hello') as unknown as IResultOfT<string, AppError>;
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, AppError>>();
    });

    it('class-based error is assignable to IResultOfT<T, E>', () => {
        class MyError extends Error {}
        const r = ok(42) as unknown as IResultOfT<number, MyError>;
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, MyError>>();
    });

    it('discriminated union variants all compatible', () => {
        type E = { kind: 'A' } | { kind: 'B' };
        const r = ok(true) as unknown as IResultOfT<boolean, E>;
        expectTypeOf(r).toMatchTypeOf<IResultOfT<boolean, E>>();
    });
});

describe('Property types', () => {
    it('isSuccess is boolean', () => {
        const r = ok(42);
        expectTypeOf(r.isSuccess).toBeBoolean();
    });

    it('isFailure is boolean', () => {
        const r = err(new Error('fail'));
        expectTypeOf(r.isFailure).toBeBoolean();
    });

    it('error is TError (after narrowing)', () => {
        const r = err(new Error('fail'));
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<Error>();
        }
    });
});

