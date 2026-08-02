import { describe, it, expectTypeOf } from 'vitest';
import { combine } from './combine.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('combine types', () => {
    it('returns AsyncResult<T[], E> from Array<AsyncResult<T, E>>', () => {
        const list: AsyncResult<number, string>[] = [
            fromResult(ok(1) as IResultOfT<number, string>),
            fromResult(ok(2) as IResultOfT<number, string>),
            fromResult(ok(3) as IResultOfT<number, string>),
        ];
        const ar = combine(list);
        const _check: AsyncResult<number[], string> = ar;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E', () => {
        const list: AsyncResult<string, number>[] = [
            fromResult(ok('a') as IResultOfT<string, number>),
            fromResult(ok('b') as IResultOfT<string, number>),
        ];
        const ar = combine(list);
        const _check: AsyncResult<string[], number> = ar;
        expectTypeOf(_check).toBeObject();
    });
});
