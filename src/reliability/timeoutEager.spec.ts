import { describe, it, expect } from 'vitest';
import { timeoutEager } from './index.js';

const asyncOk = <T>(value: T, ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve({ isSuccess: true as const, isFailure: false as const, value }), ms));

describe('timeoutEager', () => {
    it('returns Ok when fn resolves before window', async () => {
        const r = await timeoutEager(50, () => asyncOk('ok', 5));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('ok');
    });

    it('returns Err on timeout', async () => {
        const r = await timeoutEager(10, () => asyncOk('ok', 80));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error.kind).toBe('Timeout');
    });

    it('accepts a custom onTimeout factory', async () => {
        const onTimeout = (ms: number) => ({ reason: 'slow', ms } as const);
        const r = await timeoutEager(10, () => asyncOk('ok', 80), onTimeout);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toEqual({ reason: 'slow', ms: 10 });
        }
    });

    it('converts a sync throw from fn into Err (no rejection escapes)', async () => {
        const r = await timeoutEager(50, () => { throw new Error('sync-throw'); });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).message).toBe('sync-throw');
        }
    });

    it('captures a rejected promise from fn as Err', async () => {
        const r = await timeoutEager(50, () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('rejected')), 5)));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error).toBeInstanceOf(Error);
            expect((r.error as Error).message).toBe('rejected');
        }
    });
});
