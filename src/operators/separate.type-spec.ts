import { describe, it, expectTypeOf } from 'vitest';
import { separate } from './separate.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('separate types', () => {
    it('partitions success and error values into typed arrays', () => {
        const results: readonly IResultOfT<number, string>[] = [
            ok(1) as IResultOfT<number, string>,
            err('boom') as IResultOfT<number, string>,
        ];
        const separated = separate(results);
        const _check: { ok: number[]; err: string[] } = separated;
        expectTypeOf(_check).toBeObject();
    });

    it('exposes primitive element types on both arrays', () => {
        const results: readonly IResultOfT<number, string>[] = [];
        const separated = separate(results);
        const okValue: number = separated.ok[0]!;
        const errValue: string = separated.err[0]!;
        expectTypeOf(okValue).toBeNumber();
        expectTypeOf(errValue).toBeString();
    });

    it('preserves discriminated-union element types (Group B)', () => {
        type E = { kind: 'A' } | { kind: 'B'; payload: number };
        const results: readonly IResultOfT<string, E>[] = [];
        const separated = separate(results);
        const errValue: E = separated.err[0]!;
        expectTypeOf(errValue).toEqualTypeOf<E>();
    });
});
