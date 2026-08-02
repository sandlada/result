import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofSome, ofNone } from './index.js';
import { ok, err } from '../factories/index.js';
import type { IOption } from '../../src/types/Option.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { transpose } from '../../src/option/index.js';

describe('Option — transpose', () => {
    it('Some(Ok(v)) transposes to Ok(Some(v))', () => {
        const input: IOption<IResultOfT<number, string>> = ofSome(ok(42));
        const result = transpose(input);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.isSome).toBe(true);
            if (result.value.isSome) expect(result.value.value).toBe(42);
        }
    });

    it('Some(Err(e)) transposes to Err(e)', () => {
        const input: IOption<IResultOfT<number, string>> = ofSome(err('boom'));
        const result = transpose(input);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('None transposes to Ok(None)', () => {
        const input: IOption<IResultOfT<number, string>> = ofNone() as IOption<IResultOfT<number, string>>;
        const result = transpose(input);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.isNone).toBe(true);
        }
    });

    it('Some(Err(e)) error identity is preserved (Group B)', () => {
        const sentinel = { code: 500, msg: 'internal' };
        const input: IOption<IResultOfT<number, typeof sentinel>> = ofSome(err(sentinel));
        const result = transpose(input);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe(sentinel);
    });

    it('Some(Ok(v)) value reference is preserved on the inner Some (Group B)', () => {
        const sentinel = { id: 7 };
        const input: IOption<IResultOfT<typeof sentinel, string>> = ofSome(ok(sentinel));
        const result = transpose(input);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess && result.value.isSome) {
            expect(result.value.value).toBe(sentinel);
        }
    });

    it('direction invariant — T stays T and E stays E (Group B)', () => {
        const input: IOption<IResultOfT<number, string>> = ofSome(ok(1));
        const result = transpose(input);
        // Result must be IResultOfT<IOption<number>, string>
        expectTypeOf(result).toEqualTypeOf<IResultOfT<IOption<number>, string>>();
    });
});
