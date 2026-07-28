import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { all } from './all.js';
import type { IResultOfT } from '../index.js';

describe('all()', () => {
    function makeResults(n: number, failAt = -1): IResultOfT<number, string>[] {
        const results: IResultOfT<number, string>[] = [];
        for (let i = 0; i < n; i++) {
            results.push(i === failAt ? err(`fail at ${i}`) : ok(i));
        }
        return results;
    }

    const allPass10 = makeResults(10);
    const lastFails10 = makeResults(10, 9);

    // @ts-ignore
    bench('all (10 pass)', () => {
        all(allPass10 as any);
    });

    // @ts-ignore
    bench('all (10 - last fails)', () => {
        all(lastFails10 as any);
    });

    // @ts-ignore
    bench('baseline: manual Array.every (10 pass)', () => {
        const isSuccess = allPass10.every(r => r.isSuccess);
        return isSuccess ? { isSuccess: true, value: undefined } as any : { isSuccess: false, error: '...' } as any;
    });

    // @ts-ignore
    bench('baseline: manual Array.every (10 - last fails)', () => {
        const isSuccess = lastFails10.every(r => r.isSuccess);
        return isSuccess ? { isSuccess: true, value: undefined } as any : { isSuccess: false, error: '...' } as any;
    });
});
