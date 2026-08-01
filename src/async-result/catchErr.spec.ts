import { describe, it, expect } from 'vitest';
import { catchErr } from './catchErr.js';
import { fromResult } from './fromResult.js';
import { ok, err } from '../factories/index.js';

describe('AsyncResult catchErr', () => {
    it('returns original Ok if the result is successful (direct)', async () => {
        const result = await catchErr(async (e: string) => 0, fromResult(ok(42))).run();
        expect(result).toEqual(ok(42));
    });

    it('returns original Ok if the result is successful (curried)', async () => {
        const recover = catchErr(async (e: string) => 0);
        const result = await recover(fromResult(ok(42))).run();
        expect(result).toEqual(ok(42));
    });

    it('converts Err to Ok with the recovered value (direct)', async () => {
        const result = await catchErr(async (e: string) => 0, fromResult(err('boom'))).run();
        expect(result).toEqual(ok(0));
    });

    it('converts Err to Ok with the recovered value (curried)', async () => {
        const recover = catchErr(async (e: string) => e.length);
        const result = await recover(fromResult(err('boom'))).run();
        expect(result).toEqual(ok(4));
    });

    it('works with synchronous recovery function', async () => {
        const result = await catchErr((e: string) => e.length, fromResult(err('boom'))).run();
        expect(result).toEqual(ok(4));
    });
});
