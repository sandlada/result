import { bench, describe } from 'vitest';
import { ok, err } from './factories/index.js';
import { map, bind } from './operators/index.js';
import { mapAsync, bindAsync } from './promise-result/index.js';
import { fromPromise } from './async-result/index.js';
import { pipe } from './composition/pipe.js';
import { pipeAsync } from './composition/pipeAsync.js';

describe('Integration Pipelines', () => {
    describe('Synchronous Pipeline', () => {
        const startVal = ok(10);

        // @ts-ignore
    bench('Abstracted Pipeline', () => {
            pipe(
                startVal,
                map((x: number) => x + 2),
                bind((x: number) => x > 5 ? ok(x * 2) : err('too small')),
                map((x: number) => x.toString())
            );
        });

        // @ts-ignore
    bench('Native baseline', () => {
            let res: any = startVal;
            if (!res.isSuccess) return res;
            res = ok(res.value + 2);
            if (!res.isSuccess) return res;
            res = res.value > 5 ? ok(res.value * 2) : err('too small');
            if (!res.isSuccess) return res;
            return ok(res.value.toString());
        });
    });

    describe('Asynchronous Pipeline', () => {
        const startValAsync = Promise.resolve(ok(10));

        // @ts-ignore
    bench('Abstracted Pipeline', async () => {
            await pipeAsync(
                startValAsync,
                mapAsync((x: number) => x + 2),
                bindAsync((x: number) => Promise.resolve(x > 5 ? ok(x * 2) : err('too small'))),
                mapAsync((x: number) => x.toString())
            );
        });

        // @ts-ignore
    bench('Native baseline', async () => {
            let res: any = await startValAsync;
            if (!res.isSuccess) return res;
            res = ok(res.value + 2);
            if (!res.isSuccess) return res;
            res = await Promise.resolve(res.value > 5 ? ok(res.value * 2) : err('too small'));
            if (!res.isSuccess) return res;
            return ok(res.value.toString());
        });
    });
});
