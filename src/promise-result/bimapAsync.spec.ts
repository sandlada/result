import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr, bimapAsync } from '../../src/index.js';

describe('bimapAsync', () => {
    it('maps success value (curried)', async () => {
        const double = bimapAsync(
            (x: number) => x * 2,
            (e: string) => e.toUpperCase()
        );
        const r = await double(asyncOk(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps success value (direct)', async () => {
        const r = await bimapAsync(
            (x: number) => x * 2,
            (e: string) => e.toUpperCase(),
            asyncOk(21)
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps failure value (curried)', async () => {
        const double = bimapAsync(
            (x: number) => x * 2,
            (e: string) => e.toUpperCase()
        );
        const r = await double(asyncErr('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('FAIL');
    });

    it('maps failure value (direct)', async () => {
        const r = await bimapAsync(
            (x: number) => x * 2,
            (e: string) => e.toUpperCase(),
            asyncErr('fail')
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('FAIL');
    });

    it('maps with async callbacks (curried)', async () => {
        const doubleAsync = bimapAsync(
            async (x: number) => x * 2,
            async (e: string) => e.toUpperCase()
        );
        const r1 = await doubleAsync(asyncOk(21));
        expect(r1.isSuccess).toBe(true);
        if (r1.isSuccess) expect(r1.value).toBe(42);

        const r2 = await doubleAsync(asyncErr('fail'));
        expect(r2.isFailure).toBe(true);
        if (r2.isFailure) expect(r2.error).toBe('FAIL');
    });

    it('catches exceptions in onOk callback', async () => {
        const r = await bimapAsync(
            () => { throw 'ok error'; },
            (e: string) => e,
            asyncOk(1)
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('ok error');
    });

    it('catches exceptions in onErr callback', async () => {
        const r = await bimapAsync(
            (x: number) => x,
            () => { throw 'err error'; },
            asyncErr('fail')
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('err error');
    });

    it('catches async exceptions in onOk callback', async () => {
        const r = await bimapAsync(
            async () => { throw 'async ok error'; },
            async (e: string) => e,
            asyncOk(1)
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('async ok error');
    });

    it('catches async exceptions in onErr callback', async () => {
        const r = await bimapAsync(
            async (x: number) => x,
            async () => { throw 'async err error'; },
            asyncErr('fail')
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('async err error');
    });
});
