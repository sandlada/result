import { bench, describe } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { map as mapOption } from './map.js';

describe('mapOption()', () => {
    const someRes = ofSome(42);
    const noneRes = ofNone();
    const mapper = (x: number) => x * 2;
    const curriedMap = mapOption(mapper);

    // @ts-ignore
    bench('mapOption (Some)', () => {
        curriedMap(someRes);
    });

    // @ts-ignore
    bench('mapOption (None)', () => {
        curriedMap(noneRes);
    });

    // @ts-ignore
    bench('baseline: native null/undefined map (Some)', () => {
        const val: number | null = 42;
        return val !== null && val !== undefined ? mapper(val) : null;
    });

    // @ts-ignore
    bench('baseline: native null/undefined map (None)', () => {
        const val: number | null = null;
        return val !== null && val !== undefined ? mapper(val) : null;
    });
});
