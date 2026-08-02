import { describe, it, expectTypeOf } from 'vitest';
import { err } from './err.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('err types', () => {
    it('err(error) returns IResultOfT<never, E>', () => {
        const r = err('boom');
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, string>>();
    });

    it('infers E from argument', () => {
        const r = err(new Error('fail'));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, Error>>();
    });

    it('preserves complex error types', () => {
        type AppError = { kind: 'NotFound'; id: string };
        const r = err<AppError>({ kind: 'NotFound', id: 'x' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, AppError>>();
    });

    it('narrowing yields error on failure variant', () => {
        const r = err('boom');
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });

    it('discriminated union error types are preserved', () => {
        type E = { kind: 'A' } | { kind: 'B' };
        const r = err<E>({ kind: 'A' });
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, E>>();
    });

    it('class-based error types are preserved', () => {
        class CustomError extends Error {}
        const r = err(new CustomError('custom'));
        expectTypeOf(r).toMatchTypeOf<IResultOfT<never, CustomError>>();
    });
});
