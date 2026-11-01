import { describe, expect, it } from 'vitest';
import * as asyncOption from '../../async-option/index.js';
import * as asyncResult from '../../async-result/index.js';
import * as combine from '../../combine/index.js';
import * as composition from '../../composition/index.js';
import { err, ok } from '../../factories/index.js';
import * as option from '../../option/index.js';
import * as primitives from '../../primitives/index.js';
import * as promiseResult from '../../promise-result/index.js';
import * as reliability from '../../reliability/index.js';

/**
 * Conformance suite for the empty-input and failure-input columns of the
 * per-module behavior table. Those columns are a documented contract, so
 * every claim gets an executable assertion here.
 */

describe('empty input', () => {
    it('combine returns an empty success', () => {
        const r = combine.combine([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('combine/all returns an empty success', () => {
        const r = combine.all([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('combineWithAllErrors returns an empty success', () => {
        const r = combine.combineWithAllErrors([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('option/all returns an empty success', () => {
        const r = option.all([]);
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toEqual([]);
    });

    it('primitives/sequence returns an empty success', () => {
        const r = primitives.sequence([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('promise-result/combine returns an empty success', async () => {
        const r = await promiseResult.combine([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('promise-result/combineWithAllErrors returns an empty success', async () => {
        const r = await promiseResult.combineWithAllErrors([]);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('async-result/combine returns an empty success', async () => {
        const r = await asyncResult.combine([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('async-result/combineWithAllErrors returns an empty success', async () => {
        const r = await asyncResult.combineWithAllErrors([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('async-option/all returns an empty success', async () => {
        const r = await asyncOption.all([]).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toEqual([]);
    });

    it('reliability/race turns an empty input into a failure', async () => {
        const r = await reliability.race([]).run();
        expect(r.isFailure).toBe(true);
    });

    it('reliability/any returns an empty success', async () => {
        const r = await reliability.any([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('reliability/allSettled returns an empty success', async () => {
        const r = await reliability.allSettled([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });
});

describe('composition with zero functions', () => {
    it('composeK panics at construction time', () => {
        expect(() => (composition.composeK as () => unknown)()).toThrow(TypeError);
    });

    it('composeKAsync panics at construction time', () => {
        expect(() => (composition.composeKAsync as () => unknown)()).toThrow(TypeError);
    });
});

describe('failure inputs', () => {
    it('reliability/race settles on the first Ok regardless of input order', async () => {
        const r = await reliability.race([
            { run: async () => err('slow-failure') },
            { run: async () => ok(2) },
        ]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(2);
    });

    it('reliability/race prefers the lowest input index among failures', async () => {
        const r = await reliability.race([
            { run: async () => err('first') },
            { run: async () => err('second') },
        ]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('first');
    });

    it('reliability/any runs every input', async () => {
        let ran = 0;
        const carrier = { run: async () => { ran++; return ok(1); } };
        await reliability.any([carrier, carrier, carrier]).run();
        expect(ran).toBe(3);
    });

    it('reliability/allSettled runs every input', async () => {
        let ran = 0;
        const carrier = { run: async () => { ran++; return ok(1); } };
        await reliability.allSettled([carrier, carrier, carrier]).run();
        expect(ran).toBe(3);
    });

    it('combine fails fast and keeps the first failure', () => {
        const r = combine.combine([err('first'), err('second')]);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('first');
    });

    it('combineWithAllErrors accumulates every error', () => {
        const r = combine.combineWithAllErrors([err('a'), err('b')]);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toEqual(['a', 'b']);
    });

    it('async-option/all runs every carrier', async () => {
        let ran = 0;
        const carrier = asyncOption.fromOption(option.ofSome(1));
        const counting = { run: async () => { ran++; return option.ofSome(1); } };
        await asyncOption.all([counting, counting]).run();
        expect(ran).toBe(2);
        void carrier;
    });
});

describe('lazy execution', () => {
    it('async-result middleware does not run until a terminal triggers it', async () => {
        let ran = 0;
        const carrier = asyncResult.from(async () => { ran++; return ok(1); });
        const mapped = asyncResult.map((v: number) => v * 2, carrier);
        expect(ran).toBe(0);
        await mapped.run();
        expect(ran).toBe(1);
    });

    it('primitives/sequenceAsyncResult only grabs the carrier at construction time', async () => {
        let ran = 0;
        const carrier = { run: async () => { ran++; return ok(1); } };
        const sequenced = primitives.sequenceAsyncResult([carrier]);
        expect(ran).toBe(0);
        await sequenced.run();
        expect(ran).toBe(1);
    });
});
