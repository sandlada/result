import { describe, it, expectTypeOf } from 'vitest';
import { okOrElse } from './okOrElse.js';
import { ofSome, ofNone } from './index.js';
import type { AsyncOption } from '../types/AsyncOption.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('okOrElse types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncResult<T, E>', () => {
        const fn = okOrElse<number, string>(() => 'missing');
        const _check: (ao: AsyncOption<number>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E>', () => {
        const r = okOrElse(() => 'missing', ofSome(42));
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('onNone may return Promise<E>', () => {
        const fn = okOrElse<number, string>(async () => 'missing');
        const _check: (ao: AsyncOption<number>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});
