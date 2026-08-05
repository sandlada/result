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

    it('returns IResultOfT<A[], E> for empty input', () => {
        const r = combine<number, string>([]);
        const _check: IResultOfT<readonly number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns IResultOfT<A[], E> on homogeneous mixed success/failure', () => {
        const r = combine<number, string>([ok(1), err('a'), ok(2)]);
        const _check: IResultOfT<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('accepts readonly array input', () => {
        const input: readonly IResultOfT<number, never>[] = [ok(1), ok(2)];
        const r = combine(input);
        const _check: IResultOfT<readonly number[], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves heterogeneous tuple types', () => {
        const r = combine([ok(1), ok('a')]);
        const _check: IResultOfT<[number, string], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves heterogeneous tuple error union', () => {
        const r = combine([ok(1), err<string>('a'), ok(true)]);
        const _check: IResultOfT<[number, string, boolean], string> = r;
        expectTypeOf(_check).toBeObject();
    });
});
