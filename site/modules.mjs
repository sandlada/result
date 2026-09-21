// The published module list shared by the sidebar and the narrative sync.
//
// Order matches the module map in the repository's AGENTS.md. Every module owns
// a spec at `src/<module>/README.md`; `specDescriptions` supplies the search
// description for its synced page, and `scripts/sync-narrative.mjs` fails the
// site build when a module is missing one.
export const modules = [
    'types',
    'factories',
    'operators',
    'option',
    'composition',
    'adapters',
    'combine',
    'promise-result',
    'promise-option',
    'async-result',
    'async-option',
    'reliability',
    'observability',
    'primitives',
];

export const specDescriptions = {
    types: 'The discriminated-union contracts — IResult, IResultOfT, IOption, AsyncResult and AsyncOption — plus the type-focused root barrel.',
    factories: 'Constructors that turn values, predicates, throws and Promises into Results, including the eager async factories.',
    operators: 'Data-last curried operators on IResultOfT: map, bind, match, unwrap, the escape hatches and the collection helpers.',
    option: 'Synchronous IOption operators — ofSome, ofNone, map, bind, okOr, transpose — independent of Result.',
    composition: 'pipe, pipeAsync, composeK, composeKAsync and the generator-based safeTry family.',
    adapters: 'Bridges between plain functions and the railway: switchFn, liftMap, tee, toOption and fromOption.',
    combine: 'Parallel Result combination with two policies: combine/all fail fast, combineWithAllErrors accumulates.',
    'promise-result': 'Eager operators on Promise<IResultOfT>, including the async-callback and lift families.',
    'promise-option': 'Eager operators on Promise<IOption>, mirroring promise-result on the Option track.',
    'async-result': 'Lazy AsyncResult thunk operators; nothing runs until a terminal calls run().',
    'async-option': 'Lazy AsyncOption thunk operators; nothing runs until a terminal calls run().',
    reliability: 'Retry, timeout and concurrency primitives — the only async layer that never rejects.',
    observability: 'Breadcrumb context (ctx/withPath), formatters and process-wide observer hooks.',
    primitives: 'High-frequency helpers: cond, condErr, sequence, reduce, partitionOption and lift.',
};
