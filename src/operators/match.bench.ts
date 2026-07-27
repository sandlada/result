import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { match } from './match.js';

describe('match()', () => {
    const successRes = ok(42);
    const failRes = err('error');

    const onOk = (x: number) => `value: ${x}`;
    const onErr = (e: string) => `error: ${e}`;

    const curriedMatch = match(onOk, onErr);

    // @ts-ignore
    bench('match (success)', () => {
        curriedMatch(successRes);
    });

    // @ts-ignore
    bench('match (fail)', () => {
        curriedMatch(failRes);
    });

    // @ts-ignore
    bench('baseline: manual if-else (success)', () => {
        if (successRes.isSuccess) {
            return onOk(successRes.value);
        }
        return onErr(successRes.error);
    });

    // @ts-ignore
    bench('baseline: manual if-else (fail)', () => {
        if (failRes.isSuccess) {
            return onOk(failRes.value);
        }
        return onErr(failRes.error);
    });
});
