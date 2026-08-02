import { describe, it, expectTypeOf } from 'vitest';
import { withPath } from './withPath.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('withPath types', () => {
    it('withPath(segment) returns void', () => {
        const r: void = withPath('fetchUser');
        expectTypeOf(r).toEqualTypeOf<void>();
    });

    it('withPath(segment, r) returns IResultOfT<T, E>', () => {
        const r = withPath('fetchUser', ok(42));
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input', () => {
        const errVal: IResultOfT<string, Error> = err(new Error('x'));
        const r = withPath('id:1', errVal);
        const _check: IResultOfT<string, Error> = r;
        expectTypeOf(_check).toBeObject();
    });
});
