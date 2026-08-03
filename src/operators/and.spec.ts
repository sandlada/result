import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { and, unwrap } from './index.js';

describe('and', () => {
    it('direct form', () => {
        const a: IResultOfT<number> = ok(1);
        const b: IResultOfT<string> = ok('ok');
        expect(unwrap(and(b, a))).toBe('ok');
    });

    it('curried form', () => {
        const andWith = and(ok('result'));
        expect(unwrap(andWith(ok(5)))).toBe('result');
        expect(andWith(err<Error>(new Error('no'))).isSuccess).toBe(false);
    });

    it('short-circuits to the other side on success (Group C)', () => {
        const other = ok('fallback') as IResultOfT<string, string>;
        const result = and(other, ok(7));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('fallback');
    });

    it('passes failure through unchanged, ignoring other (Group C)', () => {
        const other = ok('never seen') as IResultOfT<string, string>;
        const result = and(other, err<string>('original'));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('original');
    });

    it('error widens to E | F when both are distinct error types (Group B)', () => {
        type E1 = 'one';
        type E2 = 'two';
        const r = and(
            err<E2>('two-error') as unknown as IResultOfT<string, E2>,
            err<E1>('one-error') as unknown as IResultOfT<string, E1>,
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('one-error');
    });
});
