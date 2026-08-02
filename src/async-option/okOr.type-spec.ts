import { describe, it, expectTypeOf } from 'vitest';
import { okOr } from './okOr.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('okOr types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncResult<T, E>', () => {
        const fn = okOr<number, string>('missing');
        const _check: (ao: AsyncOption<number>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E>', () => {
        const r = okOr('missing', ofSome(42));
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from error argument', () => {
        type AppError = { kind: 'AppError'; message: string };
        const fn = okOr<number, AppError>({ kind: 'AppError', message: 'x' });
        const _check: (ao: AsyncOption<number>) => AsyncResult<number, AppError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('applies to None yielding AsyncResult<T, E>', () => {
        const r = okOr('missing', ofNone<number>());
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
