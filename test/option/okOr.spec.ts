import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
import type { IOption } from '../../src/types/Option.js';
import { okOr } from '../../src/option/index.js';

describe('Option — okOr', () => {
    it('Some returns Ok(value)', () => {
        const result = okOr('default')(ofSome(42));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('None returns Err(error)', () => {
        const result = okOr('default')(ofNone() as IOption<number>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('default');
    });

    it('works with different error types', () => {
        const result = okOr(404)(ofNone() as IOption<string>);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe(404);
    });

    it('works with Some string values', () => {
        const result = okOr('missing')(ofSome('hello'));
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('hello');
    });
});
