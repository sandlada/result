import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, ok, err } from '../../src/index.js';
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
});
