import { describe, it, expectTypeOf } from 'vitest';
import { catchErr } from './catchErr.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('catchErr types', () => {
    it('curried form removes the error track', () => {
        const fn = catchErr((error: string) => error.length);
        const _check: (r: IResultOfT<number, string>) => IResultOfT<number, never> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns an infallible result', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = catchErr((error: string) => error.length, input);
        const _check: IResultOfT<number, never> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('keeps an existing success value type', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = catchErr((error: string) => error.length, input);
        const _check: IResultOfT<number, never> = result;
        expectTypeOf(_check).toBeObject();
    });
});
