import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { map } from './map.js';

describe('map()', () => {
    const successRes = ok(42);
    const failRes = err('error');
    const mapper = (x: number) => x * 2;
    const curriedMap = map(mapper);

    // @ts-ignore
    bench('map (success)', () => {
        curriedMap(successRes);
    });

    // @ts-ignore
    bench('map (fail)', () => {
        curriedMap(failRes);
    });

    // @ts-ignore
    bench('baseline: manual if-else (success)', () => {
        if (successRes.isSuccess) {
            return { isSuccess: true, value: mapper(successRes.value) };
        }
        return successRes;
    });

    // @ts-ignore
    bench('baseline: manual if-else (fail)', () => {
        if (failRes.isSuccess) {
            return { isSuccess: true, value: mapper(failRes.value) };
        }
        return failRes;
    });
});
