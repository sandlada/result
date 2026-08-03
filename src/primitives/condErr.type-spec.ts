import { describe, it, expectTypeOf } from 'vitest';
import { condErr } from './condErr.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('condErr types', () => {
    it('returns the inverse value-aware IResultOfT<T, E>', () => {
        // CONTRACT GAP (pinned): the Task 14 brief describes `condErr` as the
        // inverse of an undefined-valued `cond`, but the public signature and
        // implementation return `IResultOfT<T, E>` and preserve `okValue` on success.
        // Pinned rather than "fixed" because changing this would break the public API.
        const r = condErr<string, string>((s) => s.includes('@'), 'no-at', 'invalid email');
        expectTypeOf(r).toEqualTypeOf<IResultOfT<string, string>>();
    });

    it('preserves T from okValue', () => {
        const r = condErr((n: number) => n > 0, 42, 'too small');
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers E from errorOnTrue', () => {
        const r = condErr((n: number) => n > 100, 5, new Error('too small'));
        const _check: IResultOfT<number, Error> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('predicate type follows okValue', () => {
        const r = condErr(
            (s: string) => s.length > 0,
            'hi',
            'empty',
        );
        const _check: IResultOfT<string, string> = r;
        expectTypeOf(_check).toBeObject();
        // Negative check — predicate expects string, not number.
        // @ts-expect-error wrong predicate signature
        condErr((n: number) => n > 0, 'not a number', 'err');
    });

    it('narrowing on isSuccess exposes value with original T', () => {
        const r = condErr((n: number) => n > 0, 42, 'too small');
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        } else {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });
});
