import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
import type { IOption } from '../../src/types/Option.js';
import { okOrElse } from '../../src/option/index.js';

describe('Option — okOrElse', () => {
    it('Some returns Ok(value)', () => {
        const result = okOrElse(() => 'default')(ofSome(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('None calls errorFn and returns Err(error)', () => {
        const result = okOrElse(() => 'default')(ofNone() as IOption<number>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('default');
    });

    it('errorFn is lazily evaluated — not called on Some', () => {
        let called = false;
        const result = okOrElse(() => { called = true; return 'err'; })(ofSome(42));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
    });

    it('errorFn is called on None', () => {
        let called = false;
        const result = okOrElse(() => { called = true; return 'err'; })(ofNone() as IOption<number>);
        expect(called).toBe(true);
        expect(result.isFailure).toBe(true);
    });

    it('catches errorFn throw and converts to Err', () => {
        const result = okOrElse<number, Error>(
            () => { throw new Error('errFn-boom'); },
        )(ofNone() as IOption<number>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('errFn-boom');
    });
});
