import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { map, bind } from '../operators/index.js';
import { pipe } from './pipe.js';

describe('pipe()', () => {
    const successRes = ok(10);
    const failRes = err('fail');

    const op1 = map((x: number) => x * 2);
    const op2 = bind((x: number) => ok(x + 5));
    const op3 = map((x: number) => x * 10);

    // @ts-ignore
    bench('pipe (3 operations, success)', () => {
        pipe(successRes, op1, op2, op3);
    });

    // @ts-ignore
    bench('pipe (3 operations, fail)', () => {
        pipe(failRes, op1, op2, op3);
    });

    // @ts-ignore
    bench('baseline: nested curried function calls (success)', () => {
        op3(op2(op1(successRes)));
    });

    // @ts-ignore
    bench('baseline: nested curried function calls (fail)', () => {
        op3(op2(op1(failRes)));
    });
});
