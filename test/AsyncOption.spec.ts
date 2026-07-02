import { describe, it, expect } from 'vitest';
import { AsyncOption } from '../src/promise/AsyncOption.js';
import { Option } from '../src/Option.js';

describe('AsyncOption', () => {
    it('AsyncOption.Some creates a Some', async () => {
        const ao = AsyncOption.Some(42);
        const o = await ao;
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('AsyncOption.None creates a None', async () => {
        const ao = AsyncOption.None();
        const o = await ao;
        expect(o.isNone).toBe(true);
    });

    it('map transforms Some', async () => {
        const ao = AsyncOption.Some(21).map(x => x * 2);
        const o = await ao;
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('map passes through None', async () => {
        const ao = AsyncOption.None().map((x: number) => x * 2);
        const o = await ao;
        expect(o.isNone).toBe(true);
    });

    it('mapAsync transforms Some asynchronously', async () => {
        const ao = AsyncOption.Some(21).mapAsync(async x => x * 2);
        const o = await ao;
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('andThen chains Some', async () => {
        const ao = AsyncOption.Some(21).andThen(x => AsyncOption.Some(x * 2));
        const o = await ao;
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('flatten flattens nested AsyncOption', async () => {
        const ao = AsyncOption.Some(AsyncOption.Some(42));
        const o = await ao.flatten();
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('unwrapOr returns default on None', async () => {
        const v = await AsyncOption.None().unwrapOr(99);
        expect(v).toBe(99);
    });
});
