import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { fromPromise } from '../async-result/index.js';
import { retry } from './retry.js';
import { timeout } from './timeout.js';
import { race } from './race.js';

describe('Reliability APIs', () => {
    describe('retry()', () => {
        let attempts = 0;
        const fn = async () => {
            attempts++;
            if (attempts < 3) return err('fail');
            return ok(42);
        };

        // @ts-ignore
    bench('retry (3 attempts to success)', async () => {
            attempts = 0;
            await retry(fn, { limit: 3, delay: 0 } as any);
        });

        // @ts-ignore
    bench('baseline: manual retry loop', async () => {
            attempts = 0;
            let result;
            for (let i = 0; i < 3; i++) {
                result = await fn();
                if (result.isSuccess) return result;
                // manual 0 delay wait emulation omitted to just bench the logic wrapper overhead
            }
            return result;
        });
    });

    describe('timeout()', () => {
        const fastSuccess = fromPromise(() => Promise.resolve(ok(42)));

        // @ts-ignore
    bench('timeout (success before)', async () => {
            // Note: timeout function signature is timeout(ms, ar, onTimeout?)
            await timeout(1000, fastSuccess).run();
        });

        // @ts-ignore
    bench('baseline: native Promise.race (success before)', async () => {
            const resultPromise = fastSuccess.run();
            let timer: ReturnType<typeof setTimeout>;
            const timeoutPromise = new Promise((resolve) => {
                timer = setTimeout(() => resolve(err({ kind: 'Timeout', ms: 1000 })), 1000);
            });
            const result = await Promise.race([resultPromise, timeoutPromise]);
            clearTimeout(timer!);
            return result;
        });
    });

    describe('race()', () => {
        const arr = [
            fromPromise(() => Promise.resolve(err('error'))),
            fromPromise(() => Promise.resolve(ok(42))),
        ];

        // @ts-ignore
    bench('race', async () => {
            await race(arr as any).run();
        });

        // @ts-ignore
    bench('baseline: native Promise.any', async () => {
            try {
                // Approximate behavior with Promise.any mapped to Result
                const firstOk = await Promise.any(arr.map(async (ar) => {
                    const r = await ar.run();
                    if (r.isSuccess) return r;
                    throw r;
                }));
                return firstOk;
            } catch (e: any) {
                return e.errors[0];
            }
        });
    });
});
