import { describe, it, expectTypeOf } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResult } from '../src/IResult.js';
import type { IResultOfT } from '../src/IResultOfT.js';

describe('Return types of static factories', () => {
    it('Result.Success() returns IResult', () => {
        const r = Result.Success();
        expectTypeOf(r).toMatchTypeOf<IResult>();
    });

    it('Result.Success<T>(value) returns IResult<T>', () => {
        const r = Result.Success(42);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number>>();
    });

    it('Result.Success<T>(value) infers T from argument', () => {
        const r = Result.Success('hello');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string>>();
    });

    it('Result.Failure(error) returns IResult', () => {
        const r = Result.Failure(new Error('fail'));
        expectTypeOf(r).toMatchTypeOf<IResult>();
    });

    it('Result.Failure<T, E>(error) returns IResult<T, E>', () => {
        const r = Result.Failure<string, Error>(new Error('fail'));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, Error>>();
    });
});

describe('Generic parameter inference', () => {
    it('TValue is inferred from Success argument', () => {
        const r = Result.Success({ id: 1, name: 'Alice' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<{ id: number; name: string }>>();
    });

    it('TError is inferred from Failure argument', () => {
        type ApiError = { status: number; message: string };
        const r = Result.Failure<string, ApiError>({ status: 404, message: 'Not found' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, ApiError>>();
    });
});

describe('Interface hierarchy', () => {
    it('IResultOfT<T, E> extends IResult<E>', () => {
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
    it('custom error union is assignable to IResult<T, E>', () => {
        type AppError = { kind: 'NotFound'; id: string };
        type R = IResultOfT<string, AppError>;
        const r: R = Result.Success('hello');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<string, AppError>>();
    });

    it('class-based error is assignable to IResult<T, E>', () => {
        class MyError extends Error {}
        type R = IResultOfT<number, MyError>;
        const r: R = Result.Success(42);
        expectTypeOf(r).toMatchTypeOf<IResultOfT<number, MyError>>();
    });

    it('discriminated union variants all compatible', () => {
        type E = { kind: 'A' } | { kind: 'B' };
        type R = IResultOfT<boolean, E>;

        const ok: R = Result.Success(true);
        expectTypeOf(ok).toMatchTypeOf<IResultOfT<boolean, E>>();
    });
});

describe('Property types', () => {
    it('isSuccess is boolean', () => {
        const r = Result.Success(42);
        expectTypeOf(r.isSuccess).toBeBoolean();
    });

    it('isFailure is boolean', () => {
        const r = Result.Failure(new Error('fail'));
        expectTypeOf(r.isFailure).toBeBoolean();
    });

    it('error is TError (after narrowing)', () => {
        const r = Result.Failure(new Error('fail'));
        expectTypeOf(r.error).toEqualTypeOf<Error>();
    });
});
