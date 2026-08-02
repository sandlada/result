import { describe, it, expectTypeOf } from 'vitest';
import { mapOr } from './mapOr.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapOr types', () => {
    it('curried form returns the mapped/default type', () => {
        const fn = mapOr<number, string, Error>('fallback', (value: number) => value.toString());
        const _check: (r: IResultOfT<number, Error>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the mapped type', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = mapOr('fallback', (value: number) => value.toString(), input);
        const _check: string = result;
        expectTypeOf(_check).toBeString();
    });
});
