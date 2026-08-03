import { describe, it, expectTypeOf } from 'vitest';
import { cond } from './cond.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('cond types', () => {
    it('returns the value-aware IResultOfT<T, E>', () => {
        // CONTRACT GAP (pinned): the Task 14 brief describes `cond` as returning
        // `IResultOfT<undefined, E>`, but the public signature and implementation
        // return `IResultOfT<T, E>` and carry the original value through on success.
        // Pinned rather than "fixed" because changing this would break the public API.
        const r = cond<number, string>((n) => n > 0, 'must be positive', 5);
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, string>>();
    });

    it('preserves T from value argument', () => {
        const r = cond((s: string) => s.length > 0, 'empty', 'hi');
        const _check: IResultOfT<string, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers E from errorOnFalse', () => {
        const r = cond((n: number) => n > 0, new Error('fail'), 5);
        const _check: IResultOfT<number, Error> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves structural object T on success', () => {
        const r = cond(
            (v: { id: number }) => v.id > 0,
            { code: 'BAD' },
            { id: 7, label: 'ok' },
        );
        const _check: IResultOfT<{ id: number; label: string }, { code: string }> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('narrowing on isSuccess exposes value with original T', () => {
        const r = cond((n: number) => n > 0, 'bad', 5);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        } else {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });

    it('predicate parameter type matches T inferred from value', () => {
        const r = cond(
            (s: string) => s.length > 0,
            'empty',
            'hi',
        );
        const _check: IResultOfT<string, string> = r;
        expectTypeOf(_check).toBeObject();
        // Negative check — predicate expects string, not number.
        // @ts-expect-error wrong predicate signature
        cond((n: number) => n > 0, 'bad', 'not a number');
    });
});
