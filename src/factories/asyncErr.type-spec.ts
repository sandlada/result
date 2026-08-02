import { describe, it, expectTypeOf } from 'vitest';
import { asyncErr } from './asyncErr.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncErr types', () => {
    it('returns Promise<IResultOfT<never, E>>', () => {
        const p = asyncErr('boom');
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, string>>>();
    });

    it('infers E from argument', () => {
        const p = asyncErr(new Error('fail'));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, Error>>>();
    });

    it('preserves complex error types', () => {
        type AppError = { kind: 'AppError'; message: string };
        const p = asyncErr<AppError>({ kind: 'AppError', message: 'x' });
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<never, AppError>>>();
    });
});
