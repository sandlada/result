/**
 * Machine-readable throw-policy matrix behind the behavior conformance suite.
 *
 * Every runtime export of every public barrel must be classified here:
 * - `CHANNEL_PROBES` — entries with a runnable probe that exercises a failing
 *   callback or carrier and reports whether the failure was captured
 *   (`Err` / `None` / default) or propagated (throw / rejection).
 * - `UNPROBED_EXPORTS` — constructors, projections, predicates, and the
 *   documented escape hatches (panic APIs) that intentionally throw.
 *
 * The conformance spec fails when a barrel gains an export that is not
 * classified here, or when a probe's observed channel differs from its declared
 * policy.
 */

import { liftMap } from '../../adapters/index.js';
import {
    bind as aoBind, fromOption, map as aoMap, mapAsync as aoMapAsync, orElse as aoOrElse,
    zipWith as aoZipWith,
} from '../../async-option/index.js';
import {
    andThrough, bind as arBind, catchErr, fromResult, map as arMap, mapAsync as arMapAsync,
    mapOr as arMapOr, mapOrElse as arMapOrElse, orElse as arOrElse, tapAsync as arTapAsync,
} from '../../async-result/index.js';
import { composeKAsync, pipeAsync } from '../../composition/index.js';
import { err, fromPromise, fromSafePromise, ok } from '../../factories/index.js';
import { installObserver, observe, tapErrContext } from '../../observability/index.js';
import { choose, map as opMap, traverseArray as opTraverseArray } from '../../operators/index.js';
import {
    map as optMap, ofNone, ofSome, traverse as optTraverse, traverseArray as optTraverseArray,
    zipWith as optZipWith,
} from '../../option/index.js';
import { sequenceAsyncResult } from '../../primitives/index.js';
import {
    asyncBindOption, asyncMapOption, asyncOrElseOption, asyncTapOption, bindAsyncOption,
    mapAsyncOption, orElseAsyncOption, tapErrAsyncOption,
} from '../../promise-option/index.js';
import {
    asyncBindThrough, bindAsync, bindThroughAsync, bimapAsync, catchErrAsync, map as prMap,
} from '../../promise-result/index.js';
import { allSettled, any, race, timeout } from '../../reliability/index.js';

export type ChannelOutcome = 'capture' | 'propagate';

export interface ChannelProbe {
    readonly module: string;
    readonly api: string;
    readonly scenario: string;
    readonly policy: ChannelOutcome;
    readonly run: () => ChannelOutcome | Promise<ChannelOutcome>;
    readonly note?: string;
}

/** Runs a synchronous scenario; a throw means the failure propagated. */
export const syncChannel = (fn: () => unknown): ChannelOutcome => {
    try { fn(); return 'capture'; } catch { return 'propagate'; }
};

/** Runs an async scenario; a rejection means the failure propagated. */
export const asyncChannel = async (promise: Promise<unknown>): Promise<ChannelOutcome> => {
    try { await promise; return 'capture'; } catch { return 'propagate'; }
};

// Shared carriers whose `.run()` fails before the microtask queue is reached.
const rejectingCarrier = { run: (): Promise<never> => Promise.reject(new Error('probe-inner-reject')) };
const syncThrowingCarrier = { run: (): Promise<never> => { throw new Error('probe-inner-sync'); } };

export const CHANNEL_PROBES: readonly ChannelProbe[] = [
    // ── adapters ────────────────────────────────────────────────────────
    { module: 'adapters', api: 'liftMap', scenario: 'callback throw', policy: 'capture', run: () => syncChannel(() => liftMap(() => { throw new Error('probe'); }, ok(1))) },

    // ── option ──────────────────────────────────────────────────────────
    { module: 'option', api: 'map', scenario: 'callback throw', policy: 'capture', run: () => syncChannel(() => optMap(() => { throw new Error('probe'); })(ofSome(1))) },
    { module: 'option', api: 'traverseArray', scenario: 'callback throw', policy: 'capture', run: () => syncChannel(() => optTraverseArray(() => { throw new Error('probe'); }, [1])) },
    { module: 'option', api: 'traverse', scenario: 'iterator next() throw', policy: 'capture', run: () => syncChannel(() => {
        function* gen(): Generator<number> { throw new Error('probe'); }
        return optTraverse(() => ofSome(1), gen());
    }) },
    { module: 'option', api: 'zipWith', scenario: 'callback throw', policy: 'capture', run: () => syncChannel(() => optZipWith(() => { throw new Error('probe'); }, ofSome(1), ofSome(2))) },

    // ── operators ───────────────────────────────────────────────────────
    { module: 'operators', api: 'map', scenario: 'callback throw', policy: 'capture', run: () => syncChannel(() => opMap(() => { throw new Error('probe'); }, ok(1))) },
    { module: 'operators', api: 'traverseArray', scenario: 'callback throw', policy: 'capture', run: () => syncChannel(() => opTraverseArray(() => { throw new Error('probe'); }, [1])) },
    { module: 'operators', api: 'choose', scenario: 'callback throw', policy: 'propagate', note: 'declared: no Err channel in the return type', run: () => syncChannel(() => choose(() => { throw new Error('probe'); }, [1])) },

    // ── factories ───────────────────────────────────────────────────────
    { module: 'factories', api: 'fromPromise', scenario: 'promise rejection', policy: 'capture', run: () => asyncChannel(fromPromise(Promise.reject('probe'))) },
    { module: 'factories', api: 'fromSafePromise', scenario: 'promise rejection', policy: 'capture', run: () => asyncChannel(fromSafePromise(Promise.reject('probe'))) },

    // ── async-result ────────────────────────────────────────────────────
    { module: 'async-result', api: 'map', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(arMap(() => { throw new Error('probe'); }, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'map', scenario: 'thenable mapper misuse', policy: 'capture', run: () => asyncChannel(arMap((() => Promise.resolve(1)) as never, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'mapAsync', scenario: 'callback throw', policy: 'propagate', note: 'declared anti-pattern (escape hatch)', run: () => asyncChannel(arMapAsync(() => { throw new Error('probe'); }, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'bind', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(arBind(() => rejectingCarrier, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'orElse', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(arOrElse(() => rejectingCarrier, fromResult(err('e'))).run()) },
    { module: 'async-result', api: 'andThrough', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(andThrough(() => rejectingCarrier, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'catchErr', scenario: 'recovery callback throw', policy: 'capture', run: () => asyncChannel(catchErr(() => { throw new Error('probe'); }, fromResult(err('e'))).run()) },
    { module: 'async-result', api: 'mapOr', scenario: 'mapper throw → default', policy: 'capture', run: () => asyncChannel(arMapOr('default', () => { throw new Error('probe'); }, fromResult(ok(1)))) },
    { module: 'async-result', api: 'mapOrElse', scenario: 'handler throw', policy: 'propagate', run: () => asyncChannel(arMapOrElse(() => { throw new Error('probe'); }, () => 'default', fromResult(err('e')))) },
    { module: 'async-result', api: 'tapAsync', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(arTapAsync(() => { throw new Error('probe'); }, fromResult(ok(1))).run()) },

    // ── async-option ────────────────────────────────────────────────────
    { module: 'async-option', api: 'map', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(aoMap(() => { throw new Error('probe'); }, fromOption(ofSome(1))).run()) },
    { module: 'async-option', api: 'mapAsync', scenario: 'callback throw', policy: 'capture', note: 'declared mirror asymmetry with async-result/mapAsync', run: () => asyncChannel(aoMapAsync(async () => { throw new Error('probe'); }, fromOption(ofSome(1))).run()) },
    { module: 'async-option', api: 'bind', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(aoBind(() => rejectingCarrier, fromOption(ofSome(1))).run()) },
    { module: 'async-option', api: 'orElse', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(aoOrElse(() => rejectingCarrier, fromOption(ofNone())).run()) },
    { module: 'async-option', api: 'zipWith', scenario: 'callback throw', policy: 'propagate', note: 'declared exception, listed in the behavior table', run: () => asyncChannel(aoZipWith(() => { throw new Error('probe'); }, fromOption(ofSome(1)), fromOption(ofSome(2))).run()) },

    // ── composition ─────────────────────────────────────────────────────
    { module: 'composition', api: 'composeKAsync', scenario: 'step throw', policy: 'capture', run: () => asyncChannel(composeKAsync(() => { throw new Error('probe'); })(1)) },
    { module: 'composition', api: 'pipeAsync', scenario: 'step throw', policy: 'propagate', run: () => asyncChannel(pipeAsync(1, () => { throw new Error('probe'); })) },

    // ── primitives ──────────────────────────────────────────────────────
    { module: 'primitives', api: 'sequenceAsyncResult', scenario: 'carrier sync throw', policy: 'propagate', note: 'declared: sync and async failures both propagate', run: () => asyncChannel(sequenceAsyncResult([syncThrowingCarrier]).run()) },

    // ── promise-result ──────────────────────────────────────────────────
    { module: 'promise-result', api: 'map', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(prMap(() => { throw new Error('probe'); }, Promise.resolve(ok(1)))) },
    { module: 'promise-result', api: 'bindAsync', scenario: 'callback throw', policy: 'propagate', run: () => asyncChannel(bindAsync(() => { throw new Error('probe'); }, Promise.resolve(ok(1)))) },
    { module: 'promise-result', api: 'asyncBindThrough', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(asyncBindThrough(() => { throw new Error('probe'); }, ok(1))) },
    { module: 'promise-result', api: 'bindThroughAsync', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(bindThroughAsync(() => { throw new Error('probe'); }, Promise.resolve(ok(1)))) },
    { module: 'promise-result', api: 'catchErrAsync', scenario: 'recovery callback throw', policy: 'propagate', note: 'declared escape hatch (recovery failures surface)', run: () => asyncChannel(catchErrAsync(() => { throw new Error('probe'); }, Promise.resolve(err('e')))) },
    { module: 'promise-result', api: 'bimapAsync', scenario: 'error branch throw', policy: 'capture', run: () => asyncChannel(bimapAsync(() => 1, () => { throw new Error('probe'); }, Promise.resolve(err('e')))) },

    // ── promise-option (promotion family: sync → None, async → propagate) ──
    { module: 'promise-option', api: 'mapAsyncOption', scenario: 'mapper sync throw', policy: 'capture', run: () => asyncChannel(mapAsyncOption(() => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },
    { module: 'promise-option', api: 'mapAsyncOption', scenario: 'mapper async rejection', policy: 'capture', run: () => asyncChannel(mapAsyncOption(async () => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },
    { module: 'promise-option', api: 'bindAsyncOption', scenario: 'callback sync throw', policy: 'capture', run: () => asyncChannel(bindAsyncOption(() => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },
    { module: 'promise-option', api: 'orElseAsyncOption', scenario: 'fallback sync throw', policy: 'capture', run: () => asyncChannel(orElseAsyncOption(() => { throw new Error('probe'); }, Promise.resolve(ofNone()))) },
    { module: 'promise-option', api: 'asyncMapOption', scenario: 'mapper sync throw', policy: 'capture', run: () => asyncChannel(asyncMapOption(() => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'promise-option', api: 'asyncMapOption', scenario: 'mapper async rejection', policy: 'propagate', run: () => asyncChannel(asyncMapOption(async () => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'promise-option', api: 'asyncBindOption', scenario: 'callback sync throw', policy: 'capture', run: () => asyncChannel(asyncBindOption(() => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'promise-option', api: 'asyncBindOption', scenario: 'callback async rejection', policy: 'propagate', run: () => asyncChannel(asyncBindOption(async () => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'promise-option', api: 'asyncTapOption', scenario: 'callback sync throw', policy: 'capture', run: () => asyncChannel(asyncTapOption(() => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'promise-option', api: 'asyncTapOption', scenario: 'callback async rejection', policy: 'propagate', run: () => asyncChannel(asyncTapOption(async () => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'promise-option', api: 'asyncOrElseOption', scenario: 'fallback sync throw', policy: 'capture', run: () => asyncChannel(asyncOrElseOption(() => { throw new Error('probe'); }, ofNone())) },
    { module: 'promise-option', api: 'asyncOrElseOption', scenario: 'fallback async rejection', policy: 'propagate', run: () => asyncChannel(asyncOrElseOption(async () => { throw new Error('probe'); }, ofNone())) },
    { module: 'promise-option', api: 'tapErrAsyncOption', scenario: 'observer sync throw', policy: 'capture', run: () => asyncChannel(tapErrAsyncOption(() => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },
    { module: 'promise-option', api: 'tapErrAsyncOption', scenario: 'observer async rejection', policy: 'propagate', run: () => asyncChannel(tapErrAsyncOption(async () => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },

    // ── reliability (never rejects) ─────────────────────────────────────
    { module: 'reliability', api: 'timeout', scenario: 'carrier sync throw', policy: 'capture', run: () => asyncChannel(timeout(20, syncThrowingCarrier).run()) },
    { module: 'reliability', api: 'race', scenario: 'carrier sync throw', policy: 'capture', run: () => asyncChannel(race([syncThrowingCarrier]).run()) },
    { module: 'reliability', api: 'race', scenario: 'onEmpty throw', policy: 'capture', run: () => asyncChannel(race([], () => { throw new Error('probe'); }).run()) },
    { module: 'reliability', api: 'any', scenario: 'carrier sync throw', policy: 'capture', run: () => asyncChannel(any([syncThrowingCarrier]).run()) },
    { module: 'reliability', api: 'allSettled', scenario: 'carrier sync throw', policy: 'capture', run: () => asyncChannel(allSettled([syncThrowingCarrier]).run()) },

    // ── observability (observers never change the pipeline) ─────────────
    { module: 'observability', api: 'tapErrContext', scenario: 'observer throw', policy: 'capture', run: () => asyncChannel(tapErrContext(() => { throw new Error('probe'); }, err('e'))) },
    { module: 'observability', api: 'observe', scenario: 'observer throw', policy: 'capture', run: () => syncChannel(() => {
        const dispose = installObserver(() => { throw new Error('probe'); });
        try { return observe(err('e')); } finally { dispose(); }
    }) },
];

/**
 * Exports with no probe. The conformance spec requires every runtime barrel
 * export to be either probed or listed here, so adding a new export without a
 * policy decision fails the suite.
 */
export const UNPROBED_EXPORTS: Readonly<Record<string, readonly string[]>> = {
    adapters: ['switchFn', 'switchFnAsync', 'tee', 'teeAsync', 'toOption', 'fromOption'],
    'async-option': ['from', 'fromPromise', 'fromOption', 'ofSome', 'ofNone', 'all', 'contains', 'exists', 'filter', 'flatten', 'isNone', 'isSome', 'mapOr', 'mapOrElse', 'match', 'okOr', 'okOrElse', 'tap', 'tapAsync', 'transpose', 'unwrap', 'unwrapOr', 'unwrapOrElse'],
    'async-result': ['from', 'fromPromise', 'fromResult', 'and', 'andTee', 'ap', 'bimap', 'combine', 'combineWithAllErrors', 'contains', 'containsErr', 'exists', 'expect', 'expectErr', 'filterOrElse', 'flatten', 'isErr', 'isOk', 'mapErr', 'mapErrAsync', 'match', 'or', 'orTee', 'swapAsync', 'tap', 'tapErr', 'tapErrAsync', 'unwrap', 'unwrapErr', 'unwrapOr', 'unwrapOrElse'],
    combine: ['combine', 'all', 'combineWithAllErrors'],
    composition: ['composeK', 'fromSafeTry', 'pipe', 'safeTry', 'fromSafeTryAsync', 'safeTryAsync'],
    factories: ['asyncErr', 'asyncOk', 'err', 'fromPredicate', 'fromThrowable', 'ok', 'tryCatch', 'tryCatchAsync'],
    observability: ['getPath', 'withPath', 'format', 'inspect', 'installObserver', 'getActiveObserver'],
    operators: ['and', 'andTee', 'andThrough', 'ap', 'bimap', 'bind', 'contains', 'exists', 'filterOrElse', 'flatten', 'mapErr', 'mapOr', 'mapOrElse', 'match', 'or', 'orElse', 'orTee', 'separate', 'swap', 'tap', 'tapErr', 'expect', 'expectErr', 'orThrow', 'orThrowWith', 'unsafeUnwrap', 'unsafeUnwrapErr', 'unwrap', 'unwrapErr', 'unwrapOr', 'unwrapOrElse', 'unzip', 'catchErr'],
    option: ['all', 'bind', 'contains', 'filter', 'flatten', 'match', 'ofNone', 'ofSome', 'okOr', 'okOrElse', 'orElse', 'tap', 'transpose', 'unwrapOr'],
    primitives: ['cond', 'condErr', 'sequence', 'reduce', 'partitionOption', 'lift'],
    'promise-option': ['asyncOk', 'asyncErr', 'ofSome', 'ofNone', 'containsAsyncOption', 'existsAsyncOption', 'filterAsyncOption', 'flattenAsyncOption', 'mapOrAsyncOption', 'mapOrElseAsyncOption', 'matchAsyncOption', 'tapAsyncOption', 'unwrapOrAsyncOption', 'unwrapOrElseAsyncOption', 'asyncMatchOption'],
    'promise-result': ['asyncOk', 'asyncErr', 'flatten', 'mapErr', 'unwrapOr', 'unwrapOrElse', 'containsAsync', 'existsAsync', 'filterOrElseAsync', 'flattenAsync', 'mapAsync', 'mapErrAsync', 'mapOrAsync', 'mapOrElseAsync', 'matchAsync', 'orElseAsync', 'swapAsync', 'tapAsync', 'tapErrAsync', 'unwrapOrAsync', 'unwrapOrElseAsync', 'asyncBind', 'asyncMap', 'asyncOrElse', 'asyncTap', 'asyncTapErr', 'ap', 'combine', 'combineWithAllErrors'],
    reliability: ['retry', 'retryLazy', 'timeoutEager'],
};
