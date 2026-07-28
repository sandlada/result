import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { bind } from './bind.js';

describe('bind()', () => {
    const successRes = ok(42);
    const failRes = err('error');

    const binder = (x: number) => x > 10 ? ok(x * 2) : err('too small');
    const curriedBind = bind(binder);

    // @ts-ignore
    bench('bind (success)', () => {
        curriedBind(successRes);
    });

    // @ts-ignore
    bench('bind (fail)', () => {
        curriedBind(failRes);
    });

    // @ts-ignore
    bench('baseline: manual if-else (success)', () => {
        if (successRes.isSuccess) {
            return binder(successRes.value);
        }
        return successRes;
    });

    // @ts-ignore
    bench('baseline: manual if-else (fail)', () => {
        if (failRes.isSuccess) {
            return binder(failRes.value);
        }
        return failRes;
    });
});
