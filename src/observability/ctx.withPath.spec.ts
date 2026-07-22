import { describe, it, expect } from 'vitest';
import { ok, err, pipe } from '../index.js';
import { ctx, getPath, withPath, tapErrContext } from './index.js';

describe('ctx / getPath / withPath / tapErrContext', () => {
    it('returns empty path when no frame is active', () => {
        expect(getPath()).toEqual([]);
    });

    it('pushes path segments inside ctx.run', () => {
        const out = ctx.run(() => {
            withPath('a');
            withPath('b');
            return ctx.run(() => {
                withPath('c');
                return getPath();
            });
        });
        expect(out).toEqual(['a', 'b', 'c']);
    });

    it('popping ctx restores empty path after exit', () => {
        ctx.run(() => {
            withPath('a');
            expect(getPath()).toEqual(['a']);
        });
        expect(getPath()).toEqual([]);
    });

    it('withPath is a pass-through on the result', () => {
        expect(withPath('seg', ok(42)).isSuccess).toBe(true);
        const r = err('boom');
        expect(withPath('seg', r)).toBe(r);
    });

    it('withPath pushes synchronously even without a result', () => {
        ctx.run(() => {
            withPath('a');
            expect(getPath()).toEqual(['a']);
        });
    });

    it('withPath passes through when given a result', () => {
        const r = err('boom');
        expect(withPath('seg', r)).toBe(r);
    });

    it('tapErrContext invokes fn only on failure', () => {
        const seen: Array<{ err: unknown; path: ReadonlyArray<string | number> }> = [];
        const r1 = tapErrContext((err, ctx) => { seen.push({ err, path: ctx.path }); }, err('boom'));
        const r2 = tapErrContext(() => { seen.push({ err: 'should not run', path: [] }); }, ok(42));
        expect(r1.isFailure).toBe(true);
        expect(r2.isSuccess).toBe(true);
        expect(seen.length).toBe(1);
        expect(seen[0]!.err).toBe('boom');
    });

    it('tapErrContext sees the path breadcrumb', () => {
        const seen: Array<{ err: unknown; path: ReadonlyArray<string | number> }> = [];
        ctx.run(() => {
            withPath('outer');
            withPath('inner');
            const captured = getPath();
            expect(captured).toEqual(['outer', 'inner']);
            tapErrContext((err, c) => { seen.push({ err, path: c.path }); }, err('oh'));
        });
        expect(seen).toEqual([{ err: 'oh', path: ['outer', 'inner'] }]);
    });

    it('tapErrContext supports async callbacks', async () => {
        const seen: unknown[] = [];
        const r = await tapErrContext(async (err) => { seen.push(err); }, err('async boom'));
        expect(r.isFailure).toBe(true);
        expect(seen).toEqual(['async boom']);
    });

    it('withPath is pipe-compatible when given a result', () => {
        const r = pipe(
            err('x'),
            (x) => withPath('first', x),
            (x) => withPath('second', x),
        );
        expect(r.isFailure).toBe(true);
    });
});