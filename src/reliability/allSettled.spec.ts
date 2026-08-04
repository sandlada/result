import { describe, it, expect, vi } from 'vitest';
import { allSettled } from './index.js';
import { ok, err } from '../factories/index.js';

describe('allSettled', () => {
    it('collects every outcome in input order', async () => {
        const ar1 = { run: () => Promise.resolve(ok(1)) };
        const ar2 = { run: () => Promise.resolve(err<string>('a')) };
        const ar3 = { run: () => Promise.resolve(ok(3)) };
        const r = await allSettled([ar1, ar2, ar3]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value).toEqual([
                { ok: true, value: 1 },
                { ok: false, error: 'a' },
                { ok: true, value: 3 },
            ]);
        }
    });

    it('always succeeds', async () => {
        const ar1 = { run: () => Promise.resolve(err<string>('a')) };
        const ar2 = { run: () => Promise.resolve(err<string>('b')) };
        const r = await allSettled([ar1, ar2]).run();
        expect(r.isSuccess).toBe(true);
    });

    it('Ok([]) on empty input', async () => {
        const r = await allSettled([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('captures rejections as failures', async () => {
        const ar1 = { run: () => Promise.reject(new Error('boom')) };
        const ar2 = { run: () => Promise.resolve(ok(2)) };
        const r = await allSettled([ar1, ar2]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value[0]!.ok).toBe(false);
            expect((r.value[0] as { ok: false; error: unknown }).error).toBeInstanceOf(Error);
            expect(r.value[1]!.ok).toBe(true);
        }
    });

    it('does NOT short-circuit — every thunk runs even if an early one fails', async () => {
        let ar3Invoked = false;
        const r = await allSettled([
            { run: () => Promise.resolve(err('e1')) },
            { run: () => Promise.resolve(err('e2')) },
            { run: () => { ar3Invoked = true; return Promise.resolve(ok(3)); } },
            { run: () => Promise.resolve(ok(4)) },
        ]).run();
        expect(ar3Invoked).toBe(true);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value.length).toBe(4);
    });

    it('preserves input order in the output even when results arrive out of order', async () => {
        const r = await allSettled([
            { run: () => new Promise<ReturnType<typeof ok<number>> | ReturnType<typeof err<string>>>((resolve) => setTimeout(() => resolve(ok(1)), 50)) },
            { run: () => Promise.resolve(err<string>('fast-fail')) },
            { run: () => new Promise<ReturnType<typeof ok<number>> | ReturnType<typeof err<string>>>((resolve) => setTimeout(() => resolve(ok(3)), 10)) },
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value).toEqual([
                { ok: true, value: 1 },
                { ok: false, error: 'fast-fail' },
                { ok: true, value: 3 },
            ]);
        }
    });

    it('discriminator narrowing: ok=true branch has .value, no .error', async () => {
        const r = await allSettled([
            { run: () => Promise.resolve(ok(42)) },
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            const item = r.value[0]!;
            if (item.ok) {
                expect(item.value).toBe(42);
                // @ts-expect-error: error is forbidden in the success branch.
                const _e: string = item.error;
                void _e;
            }
        }
    });

    it('discriminator narrowing: ok=false branch has .error, no .value', async () => {
        const r = await allSettled([
            { run: () => Promise.resolve(err('boom')) },
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            const item = r.value[0]!;
            if (!item.ok) {
                expect(item.error).toBe('boom');
                // @ts-expect-error: value is forbidden in the failure branch.
                const _v: number = item.value;
                void _v;
            }
        }
    });

    it('captures rejected-promise rejections as { ok: false, error: rejection }', async () => {
        const r = await allSettled([
            { run: () => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('boom')), 5)) },
            { run: () => Promise.resolve(ok('ok')) },
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value[0]!.ok).toBe(false);
            expect((r.value[0] as { ok: false; error: unknown }).error).toBeInstanceOf(Error);
            expect((r.value[1] as { ok: true; value: string }).value).toBe('ok');
        }
    });

    it('does not invoke any .run() until the consumer calls .run() on allSettled', () => {
        const ar1 = { run: vi.fn(() => Promise.resolve(ok(1))) };
        const ar2 = { run: vi.fn(() => Promise.resolve(err('nope'))) };
        allSettled([ar1, ar2]);
        expect(ar1.run).not.toHaveBeenCalled();
        expect(ar2.run).not.toHaveBeenCalled();
    });

    it('handles many thunks (10) — all outcomes captured', async () => {
        const inputs = Array.from({ length: 10 }, (_, i) => i);
        const ars = inputs.map((i) => ({
            run: () => Promise.resolve(i % 2 === 0 ? ok(i) : err(`e${i}`)),
        }));
        const r = await allSettled(ars).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value.length).toBe(10);
            for (let i = 0; i < 10; i++) {
                const item = r.value[i]!;
                if (i % 2 === 0) {
                    expect(item.ok).toBe(true);
                    if (item.ok) expect(item.value).toBe(i);
                } else {
                    expect(item.ok).toBe(false);
                    if (!item.ok) expect(item.error).toBe(`e${i}`);
                }
            }
        }
    });
});