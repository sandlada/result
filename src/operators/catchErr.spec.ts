import { describe, it, expect } from 'vitest';
import { catchErr } from './catchErr.js';
import { ok, err } from '../factories/index.js';

describe('catchErr', () => {
    it('returns original Ok if the result is successful (direct)', () => {
        const result = catchErr((e: string) => 0, ok(42));
        expect(result).toEqual(ok(42));
    });

    it('returns original Ok if the result is successful (curried)', () => {
        const recover = catchErr((e: string) => 0);
        const result = recover(ok(42));
        expect(result).toEqual(ok(42));
    });

    it('converts Err to Ok with the recovered value (direct)', () => {
        const result = catchErr((e: string) => 0, err('boom'));
        expect(result).toEqual(ok(0));
    });

    it('converts Err to Ok with the recovered value (curried)', () => {
        const recover = catchErr((e: string) => e.length);
        const result = recover(err('boom'));
        expect(result).toEqual(ok(4));
    });
});
