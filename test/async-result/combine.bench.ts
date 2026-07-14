import { bench, describe } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { combine } from '../../src/async-result/combine.js';
import type { AsyncResult } from '../../src/types/AsyncResult.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';

function delay<T>(ms: number, value: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

function fromPromiseDelay<T, E>(ms: number, value: T): AsyncResult<T, E> {
    return {
        run: async (): Promise<IResultOfT<T, E>> => {
            const val = await delay(ms, value);
            return { isSuccess: true as const, isFailure: false as const, value: val } as IResultOfT<T, E>;
        }
    };
}

describe('combine', () => {
    bench('combine 50 short async results', async () => {
        const results = Array.from({ length: 50 }, (_, i) => fromPromiseDelay(1, i));
        const ar = combine(results);
        await ar.run();
    });
});
