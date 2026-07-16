import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
import type { IOption } from '../../src/types/Option.js';
import { flatten } from '../../src/option/index.js';

describe('Option — flatten', () => {
    it('Some(Some(value)) -> Some(value)', () => {
        const inner: IOption<number> = ofSome(42);
        const outer: IOption<IOption<number>> = ofSome(inner);
        const result = flatten(outer);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(42);
    });

    it('Some(None) -> None', () => {
        const inner: IOption<number> = ofNone();
        const outer: IOption<IOption<number>> = ofSome(inner);
        const result = flatten(outer);
        expect(result.isSome).toBe(false);
    });

    it('None -> None', () => {
        const outer: IOption<IOption<number>> = ofNone();
        const result = flatten(outer);
        expect(result.isSome).toBe(false);
    });

    it('direct form', () => {
        const inner: IOption<string> = ofSome('hi');
        const outer: IOption<IOption<string>> = ofSome(inner);
        const result = flatten(outer);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe('hi');
    });
});
