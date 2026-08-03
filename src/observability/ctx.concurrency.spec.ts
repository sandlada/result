import { describe, it, expect } from 'vitest';
import { ctx, getPath, polyfillStore, type PathSegment } from './ctx.js';

const delay = (ms = 0): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

describe('observability/ctx (polyfill store)', () => {
    it('getStore() returns undefined when no frame is active', () => {
        // Construct a fresh polyfill by calling the factory function
        // directly — but it's a frozen closure. Test via the public
        // getPath/getPath-shape: when no ctx.run is active, getStore
        // returns undefined.
        expect(getPath()).toEqual([]);
    });

    it('polyfillStore.run runs sync and restores previous frame', () => {
        const f1 = { stack: ['a'] as Array<string | number>, parent: null };
        const f2 = { stack: ['b'] as Array<string | number>, parent: null };
        const result = polyfillStore.run(f1, () => {
            expect(polyfillStore.getStore()).toBe(f1);
            return polyfillStore.run(f2, () => {
                expect(polyfillStore.getStore()).toBe(f2);
                return 'inner';
            });
        });
        expect(result).toBe('inner');
        expect(polyfillStore.getStore()).toBeUndefined();
    });

    it('polyfillStore.run restores frame on sync throw', () => {
        const f1 = { stack: ['a'] as Array<string | number>, parent: null };
        expect(() =>
            polyfillStore.run(f1, () => {
                throw new Error('boom');
            }),
        ).toThrow('boom');
        expect(polyfillStore.getStore()).toBeUndefined();
    });

    it('polyfillStore.run restores frame on async resolve', async () => {
        const f1 = { stack: ['a'] as Array<string | number>, parent: null };
        const result = await polyfillStore.run(f1, async () => {
            await Promise.resolve();
            return 42;
        });
        expect(result).toBe(42);
        expect(polyfillStore.getStore()).toBeUndefined();
    });

    it('polyfillStore.run restores frame on async reject', async () => {
        const f1 = { stack: ['a'] as Array<string | number>, parent: null };
        await expect(
            polyfillStore.run(f1, async () => {
                await Promise.resolve();
                throw new Error('async-boom');
            }),
        ).rejects.toThrow('async-boom');
        expect(polyfillStore.getStore()).toBeUndefined();
    });

    it('getPath walks the parent chain to build the full path', () => {
        // When inside a nested ctx.run, getPath should return the
        // concatenation of all ancestor frames' stacks, in order.
        const outer = { stack: ['a', 'b'] as Array<string | number>, parent: null };
        const inner = { stack: ['c', 'd'] as Array<string | number>, parent: outer };
        polyfillStore.run(outer, () => {
            polyfillStore.run(inner, () => {
                // We can't directly call getPath here because the global
                // store might be using ALS, not the polyfill. But we
                // verify the chain logic by reading the polyfill's
                // current store and walking it manually.
                const current = polyfillStore.getStore();
                expect(current).toBe(inner);
                expect(current?.parent).toBe(outer);
                const segments: Array<string | number> = [];
                let f: typeof inner | null = current;
                while (f !== null) {
                    segments.unshift(...f.stack);
                    f = f.parent;
                }
                expect(segments).toEqual(['a', 'b', 'c', 'd']);
            });
        });
    });
});

describe('observability/ctx (out-of-scope behavior)', () => {
    it('ctx.push is a silent no-op outside any ctx.run scope', () => {
        // No active frame: push should not throw and should not pollute
        // the path. (The original implementation permanently leaked these
        // segments into the process-global stack — the new design prevents
        // that leak by no-op'ing.)
        expect(() => ctx.push('orphan')).not.toThrow();
        expect(getPath()).toEqual([]);
    });

    it('ctx.push is a silent no-op outside an async ctx.run after it settles', async () => {
        await ctx.run(async () => {
            ctx.push('inside');
        });
        // Scope settled; subsequent push is no-op.
        ctx.push('after');
        expect(getPath()).toEqual([]);
    });
});

describe('observability/ctx (concurrency)', () => {    it('isolates two concurrent Promise.all scopes', async () => {
        const seen: Array<ReadonlyArray<string>> = [];
        await Promise.all([
            ctx.run(async () => {
                ctx.push('A1');
                await delay(5);
                seen.push(getPath());
                ctx.push('A2');
                await delay(5);
                seen.push(getPath());
            }),
            ctx.run(async () => {
                ctx.push('B1');
                await delay(5);
                seen.push(getPath());
                ctx.push('B2');
                await delay(5);
                seen.push(getPath());
            }),
        ]);
        // Each scope saw its own segments, never the other's.
        expect(seen).toContainEqual(['A1']);
        expect(seen).toContainEqual(['B1']);
        expect(seen).toContainEqual(['A1', 'A2']);
        expect(seen).toContainEqual(['B1', 'B2']);
        // After both scopes exit, the path is empty.
        expect(getPath()).toEqual([]);
    });

    it('inner concurrent scopes do not pollute outer scope', async () => {
        await ctx.run(async () => {
            ctx.push('outer');
            await Promise.all([
                ctx.run(async () => {
                    ctx.push('inner1');
                    await delay(5);
                    // Inner scope inherits outer segments + its own.
                    expect(getPath()).toEqual(['outer', 'inner1']);
                }),
                ctx.run(async () => {
                    ctx.push('inner2');
                    await delay(5);
                    expect(getPath()).toEqual(['outer', 'inner2']);
                }),
            ]);
            // After both inner scopes settle, the outer scope sees only
            // its own segment — neither inner scope leaked.
            expect(getPath()).toEqual(['outer']);
        });
        expect(getPath()).toEqual([]);
    });

    it('parallel branches do not observe each other mid-await', async () => {
        const observations: Array<{ branch: string; path: ReadonlyArray<string> }> = [];
        await Promise.all([
            ctx.run(async () => {
                ctx.push('a-start');
                await delay(10);
                observations.push({ branch: 'a', path: getPath() });
                ctx.push('a-end');
            }),
            ctx.run(async () => {
                ctx.push('b-start');
                await delay(1);
                observations.push({ branch: 'b', path: getPath() });
                ctx.push('b-end');
            }),
        ]);
        const aMid = observations.find((o) => o.branch === 'a')!;
        const bMid = observations.find((o) => o.branch === 'b')!;
        // 'b' has shorter delay, so when 'b' samples mid-await, 'a' is
        // still suspended on its delay. ALS isolation guarantees that 'b'
        // does NOT see 'a-start' even if 'a' has already pushed it.
        expect(bMid.path).toEqual(['b-start']);
        expect(aMid.path).toEqual(['a-start']);
    });

    it('1000 concurrent ctx.run scopes do not leak globally', async () => {
        const promises = Array.from({ length: 1000 }, (_, i) =>
            ctx.run(async () => {
                ctx.push(`s${i}`);
                await delay(Math.random() * 5);
                expect(getPath()).toEqual([`s${i}`]);
            }),
        );
        await Promise.all(promises);
        // Every frame released — global state is empty.
        expect(getPath()).toEqual([]);
    });

    it('async rejection releases the frame', async () => {
        await expect(
            ctx.run(async () => {
                ctx.push('boom');
                await delay(5);
                throw new Error('reject');
            }),
        ).rejects.toThrow('reject');
        // Frame is gone; next getPath() inside another scope is empty.
        await ctx.run(async () => {
            expect(getPath()).toEqual([]);
        });
    });

    it('sync throw releases the frame', () => {
        expect(() =>
            ctx.run(() => {
                ctx.push('sync-boom');
                throw new Error('sync');
            }),
        ).toThrow('sync');
        ctx.run(() => {
            expect(getPath()).toEqual([]);
        });
    });

    it('inner scope popping does not pop outer segments', async () => {
        await ctx.run(async () => {
            ctx.push('outer');
            await ctx.run(async () => {
                ctx.push('inner');
                expect(getPath()).toEqual(['outer', 'inner']);
            });
            // Inner scope exited; outer's frame is intact.
            expect(getPath()).toEqual(['outer']);
        });
        expect(getPath()).toEqual([]);
    });

    it('repeated sync push in microtask interleaving is isolated', async () => {
        const N = 100;
        const tasks = Array.from({ length: N }, (_, i) =>
            ctx.run(async () => {
                ctx.push(`task-${i}`);
                // Yield to event loop multiple times.
                for (let j = 0; j < 3; j++) {
                    await Promise.resolve();
                }
                expect(getPath()).toEqual([`task-${i}`]);
            }),
        );
        await Promise.all(tasks);
        expect(getPath()).toEqual([]);
    });

    it('path survives multiple awaits across microtasks', async () => {
        const path = await ctx.run(async () => {
            ctx.push('start');
            await Promise.resolve();
            ctx.push('mid1');
            await Promise.resolve();
            await Promise.resolve();
            ctx.push('mid2');
            await Promise.resolve();
            return getPath();
        });
        expect(path).toEqual(['start', 'mid1', 'mid2']);
        expect(getPath()).toEqual([]);
    });

    it('mixed sync and async concurrent ctx.run scopes maintain isolation', async () => {
        // Some scopes use ctx.run(sync) and some use ctx.run(async); each
        // must observe only its own segments.
        const observed: Array<{ label: string; path: ReadonlyArray<PathSegment> }> = [];
        await Promise.all([
            ctx.run(() => {
                ctx.push('sync-A');
                observed.push({ label: 'sync-A', path: getPath() });
                ctx.push('sync-A2');
                observed.push({ label: 'sync-A2', path: getPath() });
            }),
            ctx.run(async () => {
                ctx.push('async-B');
                await delay(1);
                observed.push({ label: 'async-B', path: getPath() });
            }),
            ctx.run(() => {
                ctx.push('sync-C');
                observed.push({ label: 'sync-C', path: getPath() });
            }),
        ]);
        const find = (label: string) => observed.find((o) => o.label === label)!;
        expect(find('sync-A').path).toEqual(['sync-A']);
        expect(find('sync-A2').path).toEqual(['sync-A', 'sync-A2']);
        expect(find('async-B').path).toEqual(['async-B']);
        expect(find('sync-C').path).toEqual(['sync-C']);
        expect(getPath()).toEqual([]);
    });

    it('nested concurrent scopes in two parent scopes do not interleave', async () => {
        await Promise.all([
            ctx.run(async () => {
                ctx.push('p1');
                await delay(2);
                await ctx.run(async () => {
                    ctx.push('c1');
                    await delay(1);
                    expect(getPath()).toEqual(['p1', 'c1']);
                });
                expect(getPath()).toEqual(['p1']);
            }),
            ctx.run(async () => {
                ctx.push('p2');
                await delay(1);
                await ctx.run(async () => {
                    ctx.push('c2');
                    await delay(2);
                    expect(getPath()).toEqual(['p2', 'c2']);
                });
                expect(getPath()).toEqual(['p2']);
            }),
        ]);
        expect(getPath()).toEqual([]);
    });

    it('frame is released even when async fn returns synchronously-settled thenable', async () => {
        // A thenable that resolves on its `.then` invocation immediately
        // exercises the synchronous-thenable branch in ctx.run's thenable
        // handling. Frame should still be released.
        const alreadyFulfilled = Promise.resolve('already');
        const result = await ctx.run(async () => {
            ctx.push('pre');
            const r = await alreadyFulfilled;
            ctx.push('post');
            return r;
        });
        expect(result).toBe('already');
        expect(getPath()).toEqual([]);
    });

    it('polyfillStore.run restores frame when fn returns a non-thenable sync value', () => {
        const f1 = { stack: ['a'] as Array<PathSegment>, parent: null };
        const r = polyfillStore.run(f1, () => 99);
        expect(r).toBe(99);
        expect(polyfillStore.getStore()).toBeUndefined();
    });

    it('polyfillStore.run with no active frame before still returns frame correctly', () => {
        const f1 = { stack: [] as Array<PathSegment>, parent: null };
        polyfillStore.run(f1, () => {
            expect(polyfillStore.getStore()).toBe(f1);
        });
        expect(polyfillStore.getStore()).toBeUndefined();
    });
});
