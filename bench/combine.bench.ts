import { bench, describe } from 'vitest';
import { ok, err, combine, all, combineWithAllErrors, asyncResultCombine } from '../src/index.js';
import type { IResultOfT, AsyncResult } from '../src/index.js';

// ── Helpers ────────────────────────────────────────────────────────────────
function makeResults(n: number, failAt = -1): IResultOfT<number, string>[] {
    const results: IResultOfT<number, string>[] = [];
    for (let i = 0; i < n; i++) {
        results.push(i === failAt ? err(`fail at ${i}`) : ok(i));
    }
    return results;
}

// ── combine (short-circuit) ────────────────────────────────────────────────
describe('combine (short-circuit)', () => {
    const allPass10 = makeResults(10);
    const firstFails10 = makeResults(10, 0);
    const lastFails10 = makeResults(10, 9);

    bench('combine — 10 items, all pass', () => {
        combine(allPass10);
    });
    bench('combine — 10 items, first fails', () => {
        combine(firstFails10);
    });
    bench('combine — 10 items, last fails', () => {
        combine(lastFails10);
    });

    const allPass100 = makeResults(100);

    bench('combine — 100 items, all pass', () => {
        combine(allPass100);
    });
});

// ── combineWithAllErrors (accumulate all) ──────────────────────────────────
describe('combineWithAllErrors (accumulate)', () => {
    const allPass10 = makeResults(10);
    const halfFail10 = makeResults(10).map((r, i) =>
        i % 2 === 0 ? err(`err ${i}`) : r,
    );

    bench('combineWithAllErrors — 10 items, all pass', () => {
        combineWithAllErrors(allPass10);
    });
    bench('combineWithAllErrors — 10 items, half fail', () => {
        combineWithAllErrors(halfFail10);
    });

    const allPass100 = makeResults(100);
    const halfFail100 = makeResults(100).map((r, i) =>
        i % 2 === 0 ? err(`err ${i}`) : r,
    );

    bench('combineWithAllErrors — 100 items, all pass', () => {
        combineWithAllErrors(allPass100);
    });
    bench('combineWithAllErrors — 100 items, half fail', () => {
        combineWithAllErrors(halfFail100);
    });
});

// ── all (heterogeneous tuple) ──────────────────────────────────────────────
describe('all (tuple combine)', () => {
    bench('all — 3-element tuple, all success', () => {
        all([ok(1), ok('hello'), ok(true)] as const);
    });
});

// ── Helpers (async) ────────────────────────────────────────────────────────
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

// ── async-result combine ───────────────────────────────────────────────────
describe('async-result combine', () => {
    bench('asyncResultCombine — 50 short async results', async () => {
        const results = Array.from({ length: 50 }, (_, i) => fromPromiseDelay(1, i));
        const ar = asyncResultCombine(results);
        await ar.run();
    });
});
