import { bench, describe } from 'vitest';
import { err } from './err.js';

describe('err()', () => {
    // @ts-ignore
    bench('err(string)', () => {
        err('error');
    });

    const e = new Error('test');
    // @ts-ignore
    bench('err(Error)', () => {
        err(e);
    });

    // @ts-ignore
    bench('baseline: manual err object creation', () => {
        return { isSuccess: false, isFailure: true, error: e } as any;
    });
});
