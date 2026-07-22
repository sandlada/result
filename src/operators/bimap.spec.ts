import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { bimap, unwrap } from '../../src/index.js';

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
});
