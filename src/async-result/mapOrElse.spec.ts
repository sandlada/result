import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { mapOrElse } from '../../src/async-result/mapOrElse.js';

describe('AsyncResult mapOrElse', () => {
    it('maps Ok', async () => {
        const v = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(ok(21)));
        expect(v).toBe(42);
    });

    it('uses onErr on Err', async () => {
        const v = await mapOrElse((e: string) => -1, (x: number) => x * 2, fromResult(err('boom')));
        expect(v).toBe(-1);
    });

    it('does not call onErr on Ok', async () => {
        const onErr = vi.fn(() => -1);
        await mapOrElse(onErr, (x: number) => x * 2, fromResult(ok(1)));
        expect(onErr).not.toHaveBeenCalled();
    });

    it('supports async callbacks', async () => {
        const v = await mapOrElse(async () => -2, async (x: number) => x * 3, fromResult(ok(5)));
        expect(v).toBe(15);
    });

    it('does not call onOk on Err', async () => {
        const onOk = vi.fn((x: number) => x);
        await mapOrElse(() => -1, onOk, fromResult(err<string>('x')));
        expect(onOk).not.toHaveBeenCalled();
    });

    it('passes the original error to onErr', async () => {
        let received: unknown;
        await mapOrElse((e: string) => { received = e; return -1; }, (x: number) => x, fromResult(err('orig')));
        expect(received).toBe('orig');
    });
});