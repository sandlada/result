import { describe, it, expectTypeOf } from 'vitest';
import { combine } from './combine.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('combine types', () => {
    it('returns IResultOfT<A[], E> for homogeneous array', () => {
        const r = combine([ok(1), ok(2), ok(3)]);
        const _check: IResultOfT<number[], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from input array', () => {
        const r = combine<number, string>([]);
        const _check: IResultOfT<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IResultOfT<A[], E> on failure', () => {
        const r = combine([ok(1), err<string>('boom'), ok(3)]);
        const _check: IResultOfT<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
