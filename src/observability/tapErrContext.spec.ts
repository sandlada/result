import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { ctx, getPath, withPath, tapErrContext } from './index.js';

describe('tapErrContext', () => {
    const inScope = <T>(fn: () => T): T => ctx.run(fn);

    it('does not invoke fn on Ok result', async () => {
        let called = false;
        await inScope(async () => {
            await tapErrContext(() => { called = true; }, ok(42));
        });
        expect(called).toBe(false);
    });

    it('invokes fn on Err result with the error', async () => {
        const seen: Array<{ err: unknown }> = [];
        await inScope(async () => {
            await tapErrContext((errVal) => { seen.push({ err: errVal }); }, err('boom'));
        });
        expect(seen).toEqual([{ err: 'boom' }]);
    });

    it('snapshot of path is captured at the time of error', async () => {
        const seen: Array<{ path: ReadonlyArray<string | number> }> = [];
        await inScope(async () => {
            withPath('outer');
            withPath('inner');
            await tapErrContext((_e, ctx) => { seen.push({ path: ctx.path }); }, err('oh'));
            // Push another segment AFTER calling tapErrContext — the
            // callback must not see this segment in its captured path.
            withPath('after-tap');
            expect(getPath()).toEqual(['outer', 'inner', 'after-tap']);
        });
        expect(seen).toEqual([{ path: ['outer', 'inner'] }]);
    });

    it('returns the result unchanged on success', async () => {
        const r = await inScope(async () => {
            return await tapErrContext(() => { /* never */ }, ok(99));
        });
        const rTyped: IResultOfT<number, never> = r;
        expect(rTyped.isSuccess).toBe(true);
        if (rTyped.isSuccess) expect(rTyped.value).toBe(99);
    });

    it('returns the result unchanged on failure (sync callback)', async () => {
        const original = err('boom');
        const r = await inScope(async () => {
            return await tapErrContext(() => { /* saw it */ }, original);
        });
        // After Task L31 fix, the result is wrapped in a Promise — the
        // original carrier still equals the resolved value.
        expect(r).toBe(original);
        expect(r.isFailure).toBe(true);
    });

    it('awaits async callback then returns the result', async () => {
        const events: string[] = [];
        const r = await inScope(async () => {
            return await tapErrContext(async (errVal) => {
                events.push(`saw ${errVal}`);
                await Promise.resolve();
                events.push('post-await');
            }, err('async boom'));
        });
        expect(events).toEqual(['saw async boom', 'post-await']);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('async boom');
    });

    it('curried form (no result) returns a function that defers the callback', async () => {
        const seen: Array<{ err: unknown; path: ReadonlyArray<string | number> }> = [];
        await inScope(async () => {
            const fn = tapErrContext<number, string>((errVal, ctx) => {
                seen.push({ err: errVal, path: ctx.path });
            });
            withPath('curried');
            const r1 = await fn(ok(1));
            expect(r1.isSuccess).toBe(true);
            const r2 = await fn(err('curried boom'));
            expect(r2.isFailure).toBe(true);
        });
        expect(seen).toEqual([{ err: 'curried boom', path: ['curried'] }]);
    });

    it('curried form awaits async callback returned promise', async () => {
        const events: string[] = [];
        const r = await inScope(async () => {
            const fn = tapErrContext<string, string>(async (errVal) => {
                events.push(`async saw ${errVal}`);
                await Promise.resolve();
                events.push('async done');
            });
            return await fn(err('curried-async boom'));
        });
        expect(events).toEqual(['async saw curried-async boom', 'async done']);
        expect(r.isFailure).toBe(true);
    });

    it('ErrContext.path is a frozen snapshot (cannot be mutated)', async () => {
        let captured: ReadonlyArray<string | number> | null = null;
        await inScope(async () => {
            withPath('x');
            await tapErrContext((_e, ctx) => {
                captured = ctx.path;
            }, err('boom'));
        });
        expect(captured).not.toBeNull();
        expect(Object.isFrozen(captured)).toBe(true);
    });

    it('callback thrown error propagates to caller (rejects the outer Promise)', async () => {
        await expect(
            (async () => {
                await inScope(async () => {
                    return await tapErrContext(() => {
                        throw new Error('callback boom');
                    }, err('trigger'));
                });
            })(),
        ).rejects.toThrow('callback boom');
    });

    it('callback throwing a non-Error value propagates verbatim', async () => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        await expect(
            (async () => {
                await inScope(async () => {
                    return await tapErrContext(() => {
                        throw 'string boom';
                    }, err('trigger'));
                });
            })(),
        ).rejects.toThrow('string boom');
    });

    it('async callback rejection rejects the returned promise', async () => {
        await expect(
            (async () => {
                await inScope(async () => {
                    return await tapErrContext(async () => {
                        throw new Error('async cb boom');
                    }, err('trigger'));
                });
            })(),
        ).rejects.toThrow('async cb boom');
    });

    it('callback receives path from the current ctx.run scope at error time', async () => {
        const observed: Array<ReadonlyArray<string | number>> = [];
        await ctx.run(async () => {
            withPath('outer');
            await ctx.run(async () => {
                withPath('inner');
                await tapErrContext((_e, c) => { observed.push(c.path); }, err('x'));
            });
        });
        expect(observed).toEqual([['outer', 'inner']]);
        expect(getPath()).toEqual([]);
    });
});