import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { composeK } from './composeK.js';

describe('composeK()', () => {
    const start = 10;
    const f1 = (x: number) => ok(x * 2);
    const f2 = (x: number) => ok(x + 5);
    const f3 = (x: number) => ok(x * 10);
    const fFail = (x: number) => err('fail');

    const composedSuccess = composeK(f1, f2, f3);
    const composedFail = composeK(f1, fFail, f3);

    // @ts-ignore
    bench('composeK (success path)', () => {
        composedSuccess(start);
    });

    // @ts-ignore
    bench('composeK (fail path)', () => {
        composedFail(start);
    });

    // @ts-ignore
    bench('baseline: manual nesting (success path)', () => {
        const r1 = f1(start);
        if (!r1.isSuccess) return r1;
        const r2 = f2(r1.value);
        if (!r2.isSuccess) return r2;
        return f3(r2.value);
    });

    // @ts-ignore
    bench('baseline: manual nesting (fail path)', () => {
        const r1 = f1(start);
        if (!r1.isSuccess) return r1;
        const r2 = fFail(r1.value);
        if (!r2.isSuccess) return r2;
        return f3(r2.value);
    });
});
