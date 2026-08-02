import { describe, it, expectTypeOf } from 'vitest';
import { unzip } from './unzip.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('unzip types', () => {
    it('splits a tuple success into a tuple of Results', () => {
        const input = ok([42, 'value'] as const) as IResultOfT<readonly [number, string], Error>;
        const result = unzip(input);
        const _check: [IResultOfT<number, Error>, IResultOfT<string, Error>] = result;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the shared error type on both Results', () => {
        const input = err(new Error('boom')) as IResultOfT<readonly [number, string], Error>;
        const [left, right] = unzip(input);
        const _leftCheck: IResultOfT<number, Error> = left;
        const _rightCheck: IResultOfT<string, Error> = right;
        expectTypeOf(_leftCheck).toBeObject();
        expectTypeOf(_rightCheck).toBeObject();
    });

    it('supports narrowing each unzipped Result', () => {
        const input = ok([42, 'value'] as const) as IResultOfT<readonly [number, string], Error>;
        const [left, right] = unzip(input);
        if (left.isSuccess) expectTypeOf(left.value).toBeNumber();
        if (right.isSuccess) expectTypeOf(right.value).toBeString();
    });
});
