import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr } from '../factories/index.js';
import { pipeAsync } from './pipeAsync.js';
import { mapAsync, bindAsync, matchAsync } from '../promise-result/index.js';

describe('pipeAsync', () => {
    it('pipes through async operators', async () => {
        const result = await pipeAsync(
            asyncOk(21),
            mapAsync((x: number) => x * 2),
            mapAsync((x: number) => x + 1),
            matchAsync<string, number, string>(
                v => `Value: ${v}`,
                e => `Error: ${e}`,
            ),
        );
        expect(result).toBe('Value: 43');
    });

    it('handles failure in pipeline', async () => {
        const result = await pipeAsync(
            asyncOk(5),
            bindAsync((_x: number) => asyncErr<string>('pipeline fail')),
            mapAsync((x: number) => x * 2),
            matchAsync<string, number, string>(
                v => `ok: ${v}`,
                e => `err: ${e}`,
            ),
        );
        expect(result).toBe('err: pipeline fail');
    });

    it('single argument returns Promise<value>', async () => {
        const p = pipeAsync(42);
        expect(await p).toBe(42);
    });

    it('chains 10 sync-returning functions (top of the documented ladder)', async () => {
        // pipeAsync's overload ladder covers up to 10 functions. Each step
        // returns the next stage's value; the entire chain is awaited at
        // the call site.
        const result = await pipeAsync(
            1,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x * 5,
            (x: number) => x * 6,
            (x: number) => x * 7,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        // 1 → 2 → 4 → 12 → 48 → 240 → 1440 → 10080 → "10080" → 5
        expect(result).toBe(5);
    });

    it('threads AsyncResult carriers through the chain in order', async () => {
        // Each AsyncResult-returning step (mapAsync / bindAsync / matchAsync)
        // must receive the previous stage's value. Verify by capturing the
        // observed inputs to each step.
        const seen: number[] = [];
        const r = await pipeAsync(
            asyncOk(10),
            mapAsync((x: number) => { seen.push(x); return x * 2; }),
            mapAsync((x: number) => { seen.push(x); return x + 1; }),
            matchAsync<string, number, string>(
                v => { seen.push(v); return `done: ${v}`; },
                e => { seen.push(-1); return `err: ${e}`; },
            ),
        );
        expect(r).toBe('done: 21');
        expect(seen).toEqual([10, 20, 21]);
    });
});