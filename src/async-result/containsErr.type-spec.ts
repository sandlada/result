import { describe, it, expectTypeOf } from 'vitest';
import { containsErr } from './containsErr.js';
import { fromResult } from './fromResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('containsErr types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => Promise<boolean>', () => {
        const fn: <T>(ar: AsyncResult<T, string>) => Promise<boolean> = containsErr<unknown, string>('boom');
        expectTypeOf(fn).toBeFunction();
    });

    it('direct form returns Promise<boolean>', () => {
        const errResult: IResultOfT<number, string> = { isSuccess: false as const, isFailure: true as const, error: 'boom' };
        const ar: AsyncResult<number, string> = fromResult(errResult);
        const r = containsErr<number, string>('boom', ar);
        const _check: Promise<boolean> = r;
        expectTypeOf(_check).toBeObject();
    });
});
