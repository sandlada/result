import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { combineWithAllErrors } from './combineWithAllErrors.js';
import type { IResultOfT } from '../index.js';

describe('combineWithAllErrors()', () => {
    function makeResults(n: number, numFails = 0): IResultOfT<number, string>[] {
        const results: IResultOfT<number, string>[] = [];
        for (let i = 0; i < n; i++) {
            results.push(i < numFails ? err(`fail at ${i}`) : ok(i));
        }
        return results;
    }

    const allPass10 = makeResults(10, 0);
    const halfFails10 = makeResults(10, 5);

    // @ts-ignore
    bench('combineWithAllErrors (10 pass)', () => {
        combineWithAllErrors(allPass10);
    });

    // @ts-ignore
    bench('combineWithAllErrors (10 - half fails)', () => {
        combineWithAllErrors(halfFails10);
    });

    // @ts-ignore
    bench('baseline: manual collection loop (10 pass)', () => {
        const values = [];
        const errors = [];
        for (let i = 0; i < allPass10.length; i++) {
            const r = allPass10[i]!;
            if (r.isSuccess) values.push(r.value);
            else errors.push(r.error);
        }
        if (errors.length > 0) return { isSuccess: false, error: errors } as any;
        return { isSuccess: true, value: values } as any;
    });

    // @ts-ignore
    bench('baseline: manual collection loop (10 - half fails)', () => {
        const values = [];
        const errors = [];
        for (let i = 0; i < halfFails10.length; i++) {
            const r = halfFails10[i]!;
            if (r.isSuccess) values.push(r.value);
            else errors.push(r.error);
        }
        if (errors.length > 0) return { isSuccess: false, error: errors } as any;
        return { isSuccess: true, value: values } as any;
    });
});
