import { describe, it, expect } from 'vitest';
import { catchErrAsync } from './catchErrAsync.js';
import { asyncOk, asyncErr } from '../factories/index.js';
import { ok } from '../factories/index.js';

describe('catchErrAsync', () => {
    it('returns original Ok if the result is successful (direct)', async () => {
        const result = await catchErrAsync(async (e: string) => 0, asyncOk(42));
        expect(result).toEqual(ok(42));
    });

    it('returns original Ok if the result is successful (curried)', async () => {
        const recover = catchErrAsync(async (e: string) => 0);
        const result = await recover(asyncOk(42));
        expect(result).toEqual(ok(42));
    });

    it('converts Err to Ok with the recovered value (direct)', async () => {
        const result = await catchErrAsync(async (e: string) => 0, asyncErr('boom'));
        expect(result).toEqual(ok(0));
    });

    it('converts Err to Ok with the recovered value (curried)', async () => {
        const recover = catchErrAsync(async (e: string) => e.length);
        const result = await recover(asyncErr('boom'));
        expect(result).toEqual(ok(4));
    });

    it('works with synchronous recovery function', async () => {
        const result = await catchErrAsync((e: string) => e.length, asyncErr('boom'));
        expect(result).toEqual(ok(4));
    });
});
