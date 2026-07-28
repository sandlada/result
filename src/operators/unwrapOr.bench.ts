import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { unwrapOr } from './unwrapOr.js';

describe('unwrapOr()', () => {
    const successRes = ok(42);
    const failRes = err('error');

    const curriedUnwrapOr = unwrapOr(0);

    // @ts-ignore
    bench('unwrapOr (success)', () => {
        curriedUnwrapOr(successRes);
    });

    // @ts-ignore
    bench('unwrapOr (fail)', () => {
        curriedUnwrapOr(failRes);
    });

    // @ts-ignore
    bench('baseline: manual if-else (success)', () => {
        if (successRes.isSuccess) {
            return successRes.value;
        }
        return 0;
    });

    // @ts-ignore
    bench('baseline: manual if-else (fail)', () => {
        if (failRes.isSuccess) {
            return failRes.value;
        }
        return 0;
    });
});
