import { bench, describe } from 'vitest';
import { fromPromise } from './fromPromise.js';

describe('fromPromise()', () => {
    const successPromise = () => Promise.resolve(42);
    const failPromise = () => Promise.reject(new Error('fail'));
    const errMap = (e: unknown) => e instanceof Error ? e.message : 'error';

    // @ts-ignore
    bench('fromPromise (resolve)', async () => {
        await fromPromise(successPromise(), errMap);
    });

    // @ts-ignore
    bench('fromPromise (reject)', async () => {
        await fromPromise(failPromise(), errMap);
    });

    // @ts-ignore
    bench('baseline: native try-catch promise (resolve)', async () => {
        try {
            const v = await successPromise();
            return { isOk: true, value: v };
        } catch (e) {
            return { isOk: false, error: errMap(e) };
        }
    });

    // @ts-ignore
    bench('baseline: native try-catch promise (reject)', async () => {
        try {
            const v = await failPromise();
            return { isOk: true, value: v };
        } catch (e) {
            return { isOk: false, error: errMap(e) };
        }
    });
});
