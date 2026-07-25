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
});