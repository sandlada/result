import { bench, describe } from 'vitest';
import { ok } from './ok.js';

describe('ok()', () => {
    // @ts-ignore
    bench('ok() void', () => {
        ok();
    });

    // @ts-ignore
    bench('ok(number)', () => {
        ok(42);
    });

    const obj = { id: 1, name: 'test', tags: [1, 2, 3] };
    // @ts-ignore
    bench('ok(object)', () => {
        ok(obj);
    });

    // @ts-ignore
    bench('baseline: manual object creation', () => {
        return { isSuccess: true, isFailure: false, value: obj } as any;
    });
});
