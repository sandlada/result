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

import {
    bind as aoBind, exists as aoExists, fromOption, map as aoMap, mapAsync as aoMapAsync, orElse as aoOrElse,
    zipWith as aoZipWith,
} from '../../async-option/index.js';
import {
    andThrough, ap as arAp, bind as arBind, catchErr, fromResult, map as arMap, mapAsync as arMapAsync,
    mapOr as arMapOr, mapOrElse as arMapOrElse, orElse as arOrElse, tapAsync as arTapAsync,
} from '../../async-result/index.js';
import { composeKAsync, pipeAsync } from '../../composition/index.js';
import { err, fromPromise, fromSafePromise, ok } from '../../factories/index.js';
import { installObserver, observe, tapErrContext } from '../../observability/index.js';
import {
    andTee as opAndTee, andThrough as opAndThrough, bimap as opBimap, choose, filterOrElse as opFilterOrElse,
    map as opMap, orElse as opOrElse, orTee as opOrTee, tap as opTap, tapErr as opTapErr,
    traverseArray as opTraverseArray,
} from '../../operators/index.js';
import {
    map as optMap, ofNone, ofSome, traverse as optTraverse, traverseArray as optTraverseArray,
    zipWith as optZipWith,
} from '../../option/index.js';
import { sequenceAsyncResult } from '../../primitives/index.js';
import {
    bind as boBind, map as boMap, orElse as boOrElse, tap as boTap,
} from '../../bridge-option/index.js';
import { bindThrough as brBindThrough, match as brMatch } from '../../bridge-result/index.js';
import {
    bindAsync as poBindAsync, mapAsync as poMapAsync, orElseAsync as poOrElseAsync, tapErrAsync as poTapErrAsync,
} from '../../promise-option/index.js';
import {
    ap as prAp, bindAsync as prBindAsync, bindThroughAsync, bimapAsync, catchErrAsync, map as prMap,
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
    { module: 'operators', api: 'map', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opMap(() => { throw new Error('probe'); }, ok(1), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'tap', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opTap(() => { throw new Error('probe'); }, ok(1), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'tapErr', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opTapErr(() => { throw new Error('probe'); }, err('orig'), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'andTee', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opAndTee(() => { throw new Error('probe'); }, ok(1), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'orTee', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opOrTee(() => { throw new Error('probe'); }, err('orig'), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'andThrough', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opAndThrough(() => { throw new Error('probe'); }, ok(1), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'bimap', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opBimap(() => { throw new Error('probe'); }, (e: string) => e, ok(1), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'orElse', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opOrElse(() => { throw new Error('probe'); }, err('orig'), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'filterOrElse', scenario: 'errorFn throw', policy: 'capture', note: 'a buggy errorFn never escapes the Result wrapper', run: () => syncChannel(() => opFilterOrElse(() => { throw new Error('probe'); }, () => 'orig', ok(1), () => { throw new Error('probe-errorfn'); })) },
    { module: 'operators', api: 'traverseArray', scenario: 'callback throw', policy: 'capture', run: () => syncChannel(() => opTraverseArray(() => { throw new Error('probe'); }, [1])) },
    { module: 'operators', api: 'choose', scenario: 'callback throw', policy: 'propagate', note: 'declared: no Err channel in the return type', run: () => syncChannel(() => choose(() => { throw new Error('probe'); }, [1])) },

    // ── factories ───────────────────────────────────────────────────────
    { module: 'factories', api: 'fromPromise', scenario: 'promise rejection', policy: 'capture', run: () => asyncChannel(fromPromise(Promise.reject('probe'))) },
    { module: 'factories', api: 'fromSafePromise', scenario: 'promise rejection', policy: 'capture', run: () => asyncChannel(fromSafePromise(Promise.reject('probe'))) },

    // ── async-result ────────────────────────────────────────────────────
    { module: 'async-result', api: 'map', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(arMap(() => { throw new Error('probe'); }, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'map', scenario: 'thenable mapper misuse', policy: 'capture', run: () => asyncChannel(arMap((() => Promise.resolve(1)) as never, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'mapAsync', scenario: 'callback throw', policy: 'propagate', note: 'JSDoc: sync throws and callback rejections propagate through .run()', run: () => asyncChannel(arMapAsync(() => { throw new Error('probe'); }, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'bind', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(arBind(() => rejectingCarrier, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'orElse', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(arOrElse(() => rejectingCarrier, fromResult(err('e'))).run()) },
    { module: 'async-result', api: 'andThrough', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(andThrough(() => rejectingCarrier, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'catchErr', scenario: 'recovery callback throw', policy: 'capture', run: () => asyncChannel(catchErr(() => { throw new Error('probe'); }, fromResult(err('e'))).run()) },
    { module: 'async-result', api: 'mapOr', scenario: 'mapper throw → default', policy: 'capture', run: () => asyncChannel(arMapOr('default', () => { throw new Error('probe'); }, fromResult(ok(1)))) },
    { module: 'async-result', api: 'mapOrElse', scenario: 'handler throw', policy: 'propagate', run: () => asyncChannel(arMapOrElse(() => { throw new Error('probe'); }, () => 'default', fromResult(err('e')))) },
    { module: 'async-result', api: 'tapAsync', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(arTapAsync(() => { throw new Error('probe'); }, fromResult(ok(1))).run()) },
    { module: 'async-result', api: 'ap', scenario: 'applied function throw', policy: 'capture', run: () => asyncChannel(arAp(fromResult(ok(() => { throw new Error('probe'); })), fromResult(ok(1))).run()) },

    // ── async-option ────────────────────────────────────────────────────
    { module: 'async-option', api: 'map', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(aoMap(() => { throw new Error('probe'); }, fromOption(ofSome(1))).run()) },
    { module: 'async-option', api: 'mapAsync', scenario: 'callback throw', policy: 'capture', note: 'declared mirror asymmetry with async-result/mapAsync', run: () => asyncChannel(aoMapAsync(async () => { throw new Error('probe'); }, fromOption(ofSome(1))).run()) },
    { module: 'async-option', api: 'bind', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(aoBind(() => rejectingCarrier, fromOption(ofSome(1))).run()) },
    { module: 'async-option', api: 'orElse', scenario: 'inner carrier async rejection', policy: 'capture', run: () => asyncChannel(aoOrElse(() => rejectingCarrier, fromOption(ofNone())).run()) },
    { module: 'async-option', api: 'zipWith', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(aoZipWith(() => { throw new Error('probe'); }, fromOption(ofSome(1)), fromOption(ofSome(2))).run()) },
    { module: 'async-option', api: 'exists', scenario: 'predicate throw', policy: 'capture', run: () => asyncChannel(aoExists(() => { throw new Error('probe'); }, fromOption(ofSome(1)))) },

    // ── composition ─────────────────────────────────────────────────────
    { module: 'composition', api: 'composeKAsync', scenario: 'step throw', policy: 'capture', run: () => asyncChannel(composeKAsync(() => { throw new Error('probe'); })(1)) },
    { module: 'composition', api: 'pipeAsync', scenario: 'step throw', policy: 'propagate', run: () => asyncChannel(pipeAsync(1, () => { throw new Error('probe'); })) },

    // ── primitives ──────────────────────────────────────────────────────
    { module: 'primitives', api: 'sequenceAsyncResult', scenario: 'carrier sync throw', policy: 'propagate', note: 'declared: sync and async failures both propagate', run: () => asyncChannel(sequenceAsyncResult([syncThrowingCarrier]).run()) },

    // ── promise-result ──────────────────────────────────────────────────
    { module: 'promise-result', api: 'map', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(prMap(() => { throw new Error('probe'); }, Promise.resolve(ok(1)))) },
    { module: 'promise-result', api: 'bindAsync', scenario: 'callback throw', policy: 'propagate', run: () => asyncChannel(prBindAsync(() => { throw new Error('probe'); }, Promise.resolve(ok(1)))) },
    { module: 'bridge-result', api: 'bindThrough', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(brBindThrough(() => { throw new Error('probe'); }, ok(1))) },
    { module: 'promise-result', api: 'bindThroughAsync', scenario: 'callback throw', policy: 'capture', run: () => asyncChannel(bindThroughAsync(() => { throw new Error('probe'); }, Promise.resolve(ok(1)))) },
    { module: 'promise-result', api: 'catchErrAsync', scenario: 'recovery callback throw', policy: 'propagate', note: 'declared escape hatch (recovery failures surface)', run: () => asyncChannel(catchErrAsync(() => { throw new Error('probe'); }, Promise.resolve(err('e')))) },
    { module: 'promise-result', api: 'bimapAsync', scenario: 'error branch throw', policy: 'capture', run: () => asyncChannel(bimapAsync(() => 1, () => { throw new Error('probe'); }, Promise.resolve(err('e')))) },
    { module: 'bridge-result', api: 'match', scenario: 'handler throw', policy: 'propagate', run: () => asyncChannel(brMatch({ ok: () => { throw new Error('probe'); }, err: () => 0 }, ok(1))) },
    { module: 'promise-result', api: 'ap', scenario: 'applied function throw', policy: 'capture', run: () => asyncChannel(prAp(Promise.resolve(ok(() => { throw new Error('probe'); })), Promise.resolve(ok(1)))) },

    // ── promise-option (promotion family: sync → None, async → propagate) ──
    { module: 'promise-option', api: 'mapAsync', scenario: 'mapper sync throw', policy: 'capture', run: () => asyncChannel(poMapAsync(() => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },
    { module: 'promise-option', api: 'mapAsync', scenario: 'mapper async rejection', policy: 'capture', run: () => asyncChannel(poMapAsync(async () => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },
    { module: 'promise-option', api: 'bindAsync', scenario: 'callback sync throw', policy: 'capture', run: () => asyncChannel(poBindAsync(() => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },
    { module: 'promise-option', api: 'orElseAsync', scenario: 'fallback sync throw', policy: 'capture', run: () => asyncChannel(poOrElseAsync(() => { throw new Error('probe'); }, Promise.resolve(ofNone()))) },
    { module: 'bridge-option', api: 'map', scenario: 'mapper sync throw', policy: 'capture', run: () => asyncChannel(boMap(() => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'bridge-option', api: 'map', scenario: 'mapper async rejection', policy: 'propagate', run: () => asyncChannel(boMap(async () => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'bridge-option', api: 'bind', scenario: 'callback sync throw', policy: 'capture', run: () => asyncChannel(boBind(() => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'bridge-option', api: 'bind', scenario: 'callback async rejection', policy: 'propagate', run: () => asyncChannel(boBind(async () => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'bridge-option', api: 'tap', scenario: 'callback sync throw', policy: 'capture', run: () => asyncChannel(boTap(() => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'bridge-option', api: 'tap', scenario: 'callback async rejection', policy: 'propagate', run: () => asyncChannel(boTap(async () => { throw new Error('probe'); }, ofSome(1))) },
    { module: 'bridge-option', api: 'orElse', scenario: 'fallback sync throw', policy: 'capture', run: () => asyncChannel(boOrElse(() => { throw new Error('probe'); }, ofNone())) },
    { module: 'bridge-option', api: 'orElse', scenario: 'fallback async rejection', policy: 'propagate', run: () => asyncChannel(boOrElse(async () => { throw new Error('probe'); }, ofNone())) },
    { module: 'promise-option', api: 'tapErrAsync', scenario: 'observer sync throw', policy: 'capture', run: () => asyncChannel(poTapErrAsync(() => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },
    { module: 'promise-option', api: 'tapErrAsync', scenario: 'observer async rejection', policy: 'propagate', run: () => asyncChannel(poTapErrAsync(async () => { throw new Error('probe'); }, Promise.resolve(ofSome(1)))) },

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
    'async-option': ['from', 'fromPromise', 'fromOption', 'ofSome', 'ofNone', 'all', 'contains', 'filter', 'flatten', 'isNone', 'isSome', 'mapOr', 'mapOrElse', 'match', 'okOr', 'okOrElse', 'tap', 'tapAsync', 'transpose', 'unwrap', 'unwrapOr', 'unwrapOrElse'],
    'async-result': ['from', 'fromPromise', 'fromResult', 'and', 'andTee', 'bimap', 'combine', 'combineWithAllErrors', 'contains', 'containsErr', 'exists', 'expect', 'expectErr', 'filterOrElse', 'flatten', 'isErr', 'isOk', 'mapErr', 'mapErrAsync', 'match', 'or', 'orTee', 'swapAsync', 'tap', 'tapErr', 'tapErrAsync', 'unwrap', 'unwrapErr', 'unwrapOr', 'unwrapOrElse'],
    'bridge-result': ['map', 'bind', 'orElse', 'tap', 'tapErr'],
    'bridge-option': ['match'],
    combine: ['combine', 'all', 'combineWithAllErrors'],
    composition: ['composeK', 'fromSafeTry', 'pipe', 'safeTry', 'fromSafeTryAsync', 'safeTryAsync'],
    factories: ['asyncErr', 'asyncOk', 'err', 'fromPredicate', 'fromThrowable', 'ok', 'tryCatch', 'tryCatchAsync'],
    observability: ['getPath', 'withPath', 'format', 'inspect', 'installObserver', 'getActiveObserver'],
    operators: ['and', 'andTee', 'andThrough', 'ap', 'bimap', 'bind', 'contains', 'exists', 'filterOrElse', 'flatten', 'mapErr', 'mapOr', 'mapOrElse', 'match', 'or', 'orElse', 'orTee', 'separate', 'swap', 'tap', 'tapErr', 'expect', 'expectErr', 'orThrow', 'orThrowWith', 'unsafeUnwrap', 'unsafeUnwrapErr', 'unwrap', 'unwrapErr', 'unwrapOr', 'unwrapOrElse', 'unzip', 'catchErr'],
    option: ['all', 'bind', 'contains', 'filter', 'flatten', 'match', 'ofNone', 'ofSome', 'okOr', 'okOrElse', 'orElse', 'tap', 'transpose', 'unwrapOr'],
    primitives: ['cond', 'condErr', 'sequence', 'reduce', 'partitionOption', 'lift'],
    'promise-option': ['containsAsync', 'existsAsync', 'filterAsync', 'flattenAsync', 'mapOrAsync', 'mapOrElseAsync', 'matchAsync', 'tapAsync', 'unwrapOrAsync', 'unwrapOrElseAsync'],
    'promise-result': ['flatten', 'mapErr', 'unwrapOr', 'unwrapOrElse', 'containsAsync', 'existsAsync', 'filterOrElseAsync', 'flattenAsync', 'mapAsync', 'mapErrAsync', 'mapOrAsync', 'mapOrElseAsync', 'matchAsync', 'orElseAsync', 'swapAsync', 'tapAsync', 'tapErrAsync', 'unwrapOrAsync', 'unwrapOrElseAsync', 'combine', 'combineWithAllErrors'],
    reliability: ['retry', 'retryLazy', 'timeoutEager'],
};

export interface PolicyShadowDiff {
    readonly module: string;
    readonly api: string;
    readonly scenario: string;
    readonly declared: ChannelOutcome;
    readonly defaultPolicy: ChannelOutcome;
}

export interface PolicyException {
    readonly module: string;
    readonly api: string;
    readonly scenario: string;
    readonly policy: ChannelOutcome;
    readonly reason: string;
}

/** Hand-written overrides where the default table does not apply. Phase 4.3 requires a `reason`. */
export const POLICY_EXCEPTIONS: readonly PolicyException[] = [];

const probeIdentity = (probe: Pick<ChannelProbe, 'module' | 'api' | 'scenario'>): string =>
    `${probe.module}|${probe.api}|${probe.scenario}`;

/**
 * Default throw-channel expectation for a probe scenario. Used for shadow
 * comparison only. It does not change runtime behavior.
 */
export const defaultProbePolicy = (
    probe: Pick<ChannelProbe, 'module' | 'api' | 'scenario'>,
): ChannelOutcome | undefined => {
    const { module, api, scenario } = probe;

    const exception = POLICY_EXCEPTIONS.find(
        (e) => e.module === module && e.api === api && e.scenario === scenario,
    );
    if (exception) return exception.policy;

    if (module === 'async-result' && api === 'mapAsync') return 'propagate';
    if (api === 'choose') return 'propagate';
    if (api === 'pipeAsync') return 'propagate';
    if (api === 'sequenceAsyncResult') return 'propagate';
    if (module === 'async-result' && api === 'mapOrElse') return 'propagate';
    if (module === 'promise-result' && api === 'bindAsync') return 'propagate';
    if (module === 'promise-result' && api === 'catchErrAsync') return 'propagate';
    if (module === 'bridge-result' && api === 'match') return 'propagate';
    if (module === 'bridge-option' && api === 'map' && scenario.includes('async rejection')) return 'propagate';
    if (module === 'bridge-option' && api === 'map' && scenario.includes('sync throw')) return 'capture';
    if (module === 'bridge-option' && scenario.includes('async rejection')) return 'propagate';
    if (scenario === 'errorFn throw') return 'capture';
    if (module === 'async-option' && api === 'exists') return 'capture';
    if (api === 'exists' || api === 'contains') return 'propagate';
    if (module === 'promise-option' && api === 'mapAsync') return 'capture';
    if (module === 'promise-option' && scenario.includes('async rejection')) return 'propagate';
    if (scenario === 'recovery callback throw' && api === 'catchErrAsync') return 'propagate';
    if (scenario === 'recovery callback throw') return 'capture';
    if (scenario === 'callback throw') return 'capture';
    if (scenario === 'inner carrier async rejection') return 'capture';
    if (scenario === 'predicate throw') return 'propagate';
    if (scenario === 'step throw' && api === 'composeKAsync') return 'capture';
    if (scenario.includes('throw') || scenario.includes('rejection')) return 'capture';
    return undefined;
};

/** Declared matrix policy vs default table. Phase 4.1 logs these; Phase 4.3 fails on them. */
export const policyShadowDiffs = (): readonly PolicyShadowDiff[] => {
    const diffs: PolicyShadowDiff[] = [];
    for (const probe of CHANNEL_PROBES) {
        const defaultPolicy = defaultProbePolicy(probe);
        if (defaultPolicy === undefined) continue;
        if (probe.policy !== defaultPolicy) {
            diffs.push({
                module: probe.module,
                api: probe.api,
                scenario: probe.scenario,
                declared: probe.policy,
                defaultPolicy,
            });
        }
    }
    return diffs;
};

export const policyShadowDiffKeys = (): readonly string[] =>
    policyShadowDiffs().map((d) => probeIdentity(d));
