import { describe, expect, it, vi } from 'vitest';
import * as adapters from '../../adapters/index.js';
import * as composition from '../../composition/index.js';
import * as factories from '../../factories/index.js';
import * as operators from '../../operators/index.js';
import * as primitives from '../../primitives/index.js';

/**
 * Conformance suite for the split policies of the module summary table:
 * exports that capture under one configuration and propagate under another,
 * and the exports the table names explicitly. Each assertion names the
 * policy it pins.
 */

describe('factories capture to values', () => {
    it('tryCatch captures a synchronous throw', () => {
        const r = factories.tryCatch(() => { throw new Error('boom'); });
        expect(r.isFailure).toBe(true);
    });

    it('tryCatch maps the throw through errorFn', () => {
        const r = factories.tryCatch(() => { throw new Error('boom'); }, (e) => `mapped:${String(e)}`);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('mapped:Error: boom');
    });

    it('fromThrowable captures a synchronous throw', () => {
        const r = factories.fromThrowable(() => { throw new Error('boom'); })();
        expect(r.isFailure).toBe(true);
    });

    it('fromPromise captures a rejection', async () => {
        const r = await factories.fromPromise(Promise.reject(new Error('boom')));
        expect(r.isFailure).toBe(true);
    });

    it('fromSafePromise normalizes a non-Error rejection to an Error', async () => {
        const r = await factories.fromSafePromise(Promise.reject('plain-string'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
    });

    it('fromSafePromise maps the rejection through errorFn', async () => {
        const r = await factories.fromSafePromise(Promise.reject('plain-string'), (e) => `mapped:${String(e)}`);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('mapped:plain-string');
    });
});

describe('adapters split by policy', () => {
    it('switchFn captures a throwing callback', () => {
        const r = adapters.switchFn(() => { throw new Error('boom'); })(1);
        expect(r.isFailure).toBe(true);
    });

    it('tee propagates a throwing callback', () => {
        expect(() => adapters.tee(() => { throw new Error('boom'); })(1)).toThrow('boom');
    });

    it('liftMap captures a throwing callback', () => {
        const r = adapters.liftMap(() => { throw new Error('boom'); }, factories.ok(1));
        expect(r.isFailure).toBe(true);
    });
});

describe('primitives split by policy', () => {
    it('lift captures the throw when an errorFn is supplied', () => {
        const r = primitives.lift((s: string) => { throw new Error(s); }, (e) => new Error(String(e)))('boom');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
    });

    it('lift propagates the throw when no errorFn is supplied', () => {
        expect(() => primitives.lift((s: string) => { throw new Error(s); })('boom')).toThrow('boom');
    });

    it('cond propagates a throwing predicate', () => {
        expect(() => primitives.cond(() => { throw new Error('boom'); }, factories.ok(1))).toThrow('boom');
    });

    it('reduce propagates a throwing reducer', () => {
        expect(() => primitives.reduce(
            (acc: number) => { throw new Error('boom'); },
            0,
            [factories.ok(1)],
        )).toThrow('boom');
    });
});

describe('operators split by family', () => {
    it('choose propagates a throwing callback and skips an Err', () => {
        expect(() => operators.choose(() => { throw new Error('boom'); }, [1])).toThrow('boom');
        const chosen = operators.choose(
            (v: number) => (v === 1 ? factories.err('skip') : factories.ok(v * 2)),
            [1, 2],
        );
        expect(chosen).toEqual([4]);
    });

    it('separate accumulates into partitions', () => {
        const parts = operators.separate([factories.ok(1), factories.err('a'), factories.ok(2)]);
        expect(parts.ok).toEqual([1, 2]);
        expect(parts.err).toEqual(['a']);
    });

    it('bind propagates a synchronous throw', () => {
        expect(() => operators.bind(() => { throw new Error('boom'); })(factories.ok(1))).toThrow('boom');
    });

    it('mapErr propagates a synchronous throw', () => {
        expect(() => operators.mapErr(() => { throw new Error('boom'); })(factories.err('a'))).toThrow('boom');
    });

    it('match propagates a synchronous throw', () => {
        expect(() => operators.match(
            () => { throw new Error('boom'); },
            () => 1,
        )(factories.ok(1))).toThrow('boom');
    });
});

describe('composition split by policy', () => {
    it('pipe propagates a synchronous step throw', () => {
        expect(() => composition.pipe(
            factories.ok(1),
            () => { throw new Error('boom'); },
        )).toThrow('boom');
    });

    it('pipeAsync turns a synchronous step throw into a rejection', async () => {
        await expect(composition.pipeAsync(
            Promise.resolve(factories.ok(1)),
            () => { throw new Error('boom'); },
        )).rejects.toThrow('boom');
    });

    it('composeK captures a synchronous throw', () => {
        const composed = composition.composeK(
            (v: number) => factories.ok(v),
            () => { throw new Error('boom'); },
        );
        const r = composed(1);
        expect(r.isFailure).toBe(true);
    });

    it('composeKAsync captures a rejection', async () => {
        const composed = composition.composeKAsync(
            (v: number) => Promise.resolve(factories.ok(v)),
            () => Promise.reject(new Error('boom')),
        );
        const r = await composed(1);
        expect(r.isFailure).toBe(true);
    });
});

describe('observer errors never change the outcome', () => {
    it('an observer that throws does not break the pipeline', async () => {
        const observer = vi.fn(() => { throw new Error('observer-boom'); });
        // The observer is installed and removed around the call, so the
        // assertion does not depend on the process-wide stack.
        const { installObserver, observe } = await import('../../observability/index.js');
        const cancel = installObserver(observer);
        try {
            const r = observe(factories.ok(1));
            expect(r.isSuccess).toBe(true);
        } finally {
            cancel();
        }
    });
});
