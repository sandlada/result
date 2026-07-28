import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { combine } from './combine.js';
import type { IResultOfT } from '../index.js';

describe('combine()', () => {
    function makeResults(n: number, failAt = -1): IResultOfT<number, string>[] {
        const results: IResultOfT<number, string>[] = [];
        for (let i = 0; i < n; i++) {
            results.push(i === failAt ? err(`fail at ${i}`) : ok(i));
        }
        return results;
    }

    const allPass10 = makeResults(10);
    const firstFails10 = makeResults(10, 0);
    const lastFails10 = makeResults(10, 9);

    // @ts-ignore
    bench('combine (10 pass)', () => {
        combine(allPass10);
    });

    // @ts-ignore
    bench('combine (10 - first fails)', () => {
        combine(firstFails10);
    });

    // @ts-ignore
    bench('combine (10 - last fails)', () => {
        combine(lastFails10);
    });

    // @ts-ignore
    bench('baseline: manual for-loop (10 pass)', () => {
        const values: number[] = new Array(allPass10.length);
        for (let i = 0; i < allPass10.length; i++) {
            const r = allPass10[i]!;
            if (!r.isSuccess) return r;
            values[i] = r.value;
        }
        return { isSuccess: true, value: values } as any;
    });

    // @ts-ignore
    bench('baseline: manual for-loop (10 - first fails)', () => {
        const values: number[] = new Array(firstFails10.length);
        for (let i = 0; i < firstFails10.length; i++) {
            const r = firstFails10[i]!;
            if (!r.isSuccess) return r;
            values[i] = r.value;
        }
        return { isSuccess: true, value: values } as any;
    });

    // @ts-ignore
    bench('baseline: manual for-loop (10 - last fails)', () => {
        const values: number[] = new Array(lastFails10.length);
        for (let i = 0; i < lastFails10.length; i++) {
            const r = lastFails10[i]!;
            if (!r.isSuccess) return r;
            values[i] = r.value;
        }
        return { isSuccess: true, value: values } as any;
    });
});
