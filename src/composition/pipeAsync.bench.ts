import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { pipeAsync } from './pipeAsync.js';
import { mapAsync, bindAsync } from '../promise-result/index.js';

describe('pipeAsync()', () => {
    const successRes = Promise.resolve(ok(10));
    const failRes = Promise.resolve(err('fail'));

    const op1 = mapAsync((x: number) => x * 2);
    const op2 = bindAsync((x: number) => Promise.resolve(ok(x + 5)));
    const op3 = mapAsync((x: number) => x * 10);

    // @ts-ignore
    bench('pipeAsync (3 operations, success)', async () => {
        await pipeAsync(successRes, op1, op2, op3);
    });

    // @ts-ignore
    bench('pipeAsync (3 operations, fail)', async () => {
        await pipeAsync(failRes, op1, op2, op3);
    });

    // @ts-ignore
    bench('baseline: manual async/await chaining (success)', async () => {
        const r1 = await op1(successRes);
        const r2 = await op2(Promise.resolve(r1));
        await op3(Promise.resolve(r2));
    });

    // @ts-ignore
    bench('baseline: manual async/await chaining (fail)', async () => {
        const r1 = await op1(failRes);
        const r2 = await op2(Promise.resolve(r1));
        await op3(Promise.resolve(r2));
    });
});
