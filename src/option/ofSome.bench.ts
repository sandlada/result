import { bench, describe } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';

describe('Option factories', () => {
    // @ts-ignore
    bench('ofSome(value)', () => {
        ofSome(42);
    });

    // @ts-ignore
    bench('ofNone()', () => {
        ofNone();
    });

    // @ts-ignore
    bench('baseline: manual Option object (Some)', () => {
        return { isSome: true, isNone: false, value: 42 } as any;
    });

    // @ts-ignore
    bench('baseline: manual Option object (None)', () => {
        return { isSome: false, isNone: true } as any;
    });
});
