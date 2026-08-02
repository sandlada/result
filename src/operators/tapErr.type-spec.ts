import { describe, it, expectTypeOf } from 'vitest';
import { tapErr } from './tapErr.js';
import { err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tapErr types', () => {
    it('curried form preserves any input success type', () => {
        const fn = tapErr((error: string): void => { void error; });
        const _check: (r: IResultOfT<number, string>) => IResultOfT<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form preserves T and E', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = tapErr((error: string): void => { void error; }, input);
        const _check: IResultOfT<number, string> = result;
        expectTypeOf(_check).toBeObject();
    });
});
