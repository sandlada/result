import { describe, it, expectTypeOf } from 'vitest';
import { combine } from './combine.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('combine types', () => {
    it('returns Promise<IResultOfT<A[], E>> for homogeneous array', () => {
        const r = combine([asyncOk(1), asyncOk(2), asyncOk(3)]);
        const _check: Promise<IResultOfT<number[], never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from input array', () => {
        const r = combine<number, string>([]);
        const _check: Promise<IResultOfT<number[], string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns Promise<IResultOfT<A[], E>> on failure', () => {
        const r = combine([asyncOk(1), asyncErr<string>('boom'), asyncOk(3)]);
        const _check: Promise<IResultOfT<number[], string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input', () => {
        const r = combine<number, string>([asyncOk(1), asyncOk(2)]);
        const _check: Promise<IResultOfT<number[], string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});
