import { bench, describe } from 'vitest';
import { tryCatch } from './tryCatch.js';

describe('tryCatch()', () => {
    const successFn = () => 42;
    const failFn = () => { throw new Error('fail'); };
    const errMap = (e: unknown) => e instanceof Error ? e.message : 'error';

    // @ts-ignore
    bench('tryCatch (success)', () => {
        tryCatch(successFn, errMap);
    });

    // @ts-ignore
    bench('tryCatch (throw)', () => {
        tryCatch(failFn, errMap);
    });

    // @ts-ignore
    bench('baseline: native try-catch (success)', () => {
        try {
            return { isOk: true, value: successFn() };
        } catch (e) {
            return { isOk: false, error: errMap(e) };
        }
    });

    // @ts-ignore
    bench('baseline: native try-catch (throw)', () => {
        try {
            return { isOk: true, value: failFn() };
        } catch (e) {
            return { isOk: false, error: errMap(e) };
        }
    });
});
