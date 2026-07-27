import { bench, describe } from 'vitest';
import { fromThrowable } from './fromThrowable.js';

describe('fromThrowable()', () => {
    const successFn = (x: number) => x * 2;
    const failFn = (x: number) => { throw new Error(`fail ${x}`); };
    const errMap = (e: unknown) => e instanceof Error ? e.message : 'error';

    const wrappedSuccess = fromThrowable(successFn, errMap);
    const wrappedFail = fromThrowable(failFn, errMap);

    // @ts-ignore
    bench('fromThrowable (success)', () => {
        wrappedSuccess(21);
    });

    // @ts-ignore
    bench('fromThrowable (throw)', () => {
        wrappedFail(21);
    });

    // @ts-ignore
    bench('baseline: native wrap (success)', () => {
        try {
            return { isOk: true, value: successFn(21) };
        } catch (e) {
            return { isOk: false, error: errMap(e) };
        }
    });

    // @ts-ignore
    bench('baseline: native wrap (throw)', () => {
        try {
            return { isOk: true, value: failFn(21) };
        } catch (e) {
            return { isOk: false, error: errMap(e) };
        }
    });
});
