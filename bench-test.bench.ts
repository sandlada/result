import { bench, describe } from 'vitest';
import { ok, err } from './src/index.js';

function makeResults(n: number) {
    const results = [];
    for (let i = 0; i < n; i++) {
        results.push(i % 2 === 0 ? err(`err ${i}`) : ok(i));
    }
    return results;
}

const results100 = makeResults(100);

function combineWithAllErrorsPush<A, E>(results: readonly any[]) {
    const values: A[] = [];
    const errors: E[] = [];
    for (let i = 0; i < results.length; i++) {
        const r = results[i]!;
        if(r.isSuccess) values.push(r.value);
        else errors.push(r.error);
    }
    if(errors.length > 0) return err(errors);
    return ok(values);
}

function combineWithAllErrorsPrealloc<A, E>(results: readonly any[]) {
    const len = results.length;
    const values = new Array(len);
    const errors = new Array(len);
    let vIdx = 0;
    let eIdx = 0;
    for (let i = 0; i < len; i++) {
        const r = results[i]!;
        if(r.isSuccess) values[vIdx++] = r.value;
        else errors[eIdx++] = r.error;
    }
    values.length = vIdx;
    errors.length = eIdx;
    if(eIdx > 0) return err(errors);
    return ok(values);
}

describe('combineWithAllErrors', () => {
    bench('push', () => {
        combineWithAllErrorsPush(results100);
    });
    bench('prealloc', () => {
        combineWithAllErrorsPrealloc(results100);
    });
});
