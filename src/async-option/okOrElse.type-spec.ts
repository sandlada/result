import { describe, it, expectTypeOf } from 'vitest';
import { okOrElse } from './okOrElse.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('okOrElse types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncResult<T, E | Error>', () => {
        // The return type is widened to `E | Error` to reflect the catch
        // block's honest runtime payload when `onNone` throws - see the
        // implementation JSDoc for the contract rationale.
        const fn = okOrElse<number, string>(() => 'missing');
        const _check: (ao: AsyncOption<number>) => AsyncResult<number, string | Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E | Error>', () => {
        const r = okOrElse(() => 'missing', ofSome(42));
        const _check: AsyncResult<number, string | Error> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('onNone may return Promise<E>', () => {
        const fn = okOrElse<number, string>(async () => 'missing');
        const _check: (ao: AsyncOption<number>) => AsyncResult<number, string | Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('the error channel of the failure branch is E | Error', () => {
        const r = okOrElse(() => 'default', ofNone<number>());
        const _check: AsyncResult<number, string | Error> = r;
        expectTypeOf(_check).toBeObject();
    });
});
