import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { bimap, unwrap } from './index.js';

describe('bimap', () => {
    it('direct form: maps success value', () => {
        const r: IResultOfT<number, Error> = ok(3);
        const result = bimap(
            (v: number) => String(v),
            (e: Error) => e.message,
            r,
        );
        expect(unwrap(result)).toBe('3');
    });

    it('curried form', () => {
        const transform = bimap(
            (v: number) => v + 1,
            (e: Error) => e.message,
        );
        expect(unwrap(transform(ok(1)))).toBe(2);
        expect(transform(err<number>(new Error('fail'))).isSuccess).toBe(false);
    });

    it('maps failure error', () => {
        const r: IResultOfT<number, string> = err<number>('bad');
        const result = bimap(
            (v: number) => v * 2,
            (e: string) => `mapped: ${e}`,
            r,
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('mapped: bad');
    });

    it('catches onOk throw and converts to Err', () => {
        const r: IResultOfT<number, never> = ok(5);
        const result = bimap(
            () => { throw new Error('onOk-boom'); },
            (e: never) => e,
            r,
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('onOk-boom');
    });

    it('catches onErr throw and converts to Err', () => {
        const r: IResultOfT<number, string> = err<number>('original');
        const result = bimap(
            (v: number) => v,
            () => { throw new Error('onErr-boom'); },
            r,
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('onErr-boom');
    });

    it('does NOT call onErr on success (Group C)', () => {
        const onOk = vi.fn((v: number) => v * 2);
        const onErr = vi.fn((_e: string) => 'never');
        bimap(onOk, onErr, ok(5));
        expect(onOk).toHaveBeenCalledTimes(1);
        expect(onErr).toHaveBeenCalledTimes(0);
    });

    it('does NOT call onOk on failure (Group C)', () => {
        const onOk = vi.fn((_v: number) => 99);
        const onErr = vi.fn((_e: string) => 'called');
        bimap(onOk, onErr, err<number>('bad'));
        expect(onOk).toHaveBeenCalledTimes(0);
        expect(onErr).toHaveBeenCalledTimes(1);
    });

    it('widens both tracks independently (Group B)', () => {
        type A = number;
        type E = string;
        type C = boolean;
        type F = symbol;
        const r: IResultOfT<A, E> = ok(1);
        const result = bimap(
            (_v: A): C => true,
            (_e: E): F => Symbol('s'),
            r,
        );
        // The success track is on the success path; the error track only applies on failure.
        if (result.isSuccess) {
            const _v: C = result.value;
            expectTypeOf(_v).toBeBoolean();
        }
    });
});
