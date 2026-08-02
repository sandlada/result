import { describe, it, expectTypeOf } from 'vitest';
import { expectErr } from './expectErr.js';
import { err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('expectErr types', () => {
    it('curried form returns the error type', () => {
        const fn = expectErr<number, string>('error required');
        const _check: (r: IResultOfT<number, string>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the error type', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = expectErr('error required', input);
        const _check: string = result;
        expectTypeOf(_check).toBeString();
    });
});
