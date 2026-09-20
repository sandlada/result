// Curated search metadata for the generated API reference pages.
//
// starlight-typedoc regenerates `src/content/docs/api/` on every build and
// titles each module page with the bare module name (`operators`, `types`, …)
// while leaving the description empty, which would fall back to the site-wide
// description on every page. This registry is the single source for what each
// generated page advertises to search engines.
//
// `plugins/seo-api-pages.mjs` writes these values into the generated
// frontmatter during the build and fails when a generated page is missing an
// entry. `scripts/verify-seo.mjs` fails when an entry no longer matches a
// generated page, so the registry and the TypeDoc entry points stay in step.
//
// Keep descriptions between 50 and 160 characters and free of double quotes:
// they are emitted verbatim as YAML double-quoted scalars.

export const packageName = '@sandlada/result';

export const siteUrl = 'https://result.sandlada.com';

export const repositoryUrl = 'https://github.com/sandlada/result';

export const npmUrl = 'https://www.npmjs.com/package/@sandlada/result';

export const siteDescription =
    'Type-safe Result Pattern and Railway Oriented Programming for TypeScript.';

export const packageKeywords = [
    'result pattern',
    'railway oriented programming',
    'typescript',
    'error handling',
    'option type',
    'functional programming',
];

export const apiPages = {
    index: {
        title: 'API Reference',
        description:
            'Every export of the 14 published @sandlada/result subpaths: factories, operators, async and promise layers, reliability, observability, primitives.',
    },
    types: {
        title: 'Type contracts: IResult, IOption',
        description:
            'Core contracts of @sandlada/result: IResult, IResultOfT, IOption, AsyncResult and AsyncOption — plain discriminated unions, no classes or methods.',
    },
    factories: {
        title: 'Factories: ok, err, tryCatch',
        description:
            'Create typed Results and Options: ok, err, fromPredicate, fromThrowable, tryCatch, fromPromise and friends — the narrowest possible return types.',
    },
    operators: {
        title: 'Result operators: map, bind, match',
        description:
            'Synchronous operators on IResultOfT: map, bind, orElse, match, unwrap, unwrapOr, tap, separate and the unwrap/expect escape hatches.',
    },
    option: {
        title: 'Option operators: map, bind, match',
        description:
            'Operators for IOption<T>: ofSome, ofNone, map, bind, filter, orElse, okOr, traverseArray and all — every callback throw becomes None.',
    },
    'async-result': {
        title: 'Lazy AsyncResult operators',
        description:
            'Operators for lazy AsyncResult<T, E> thunks: mapAsync, bind, catchErr, combineWithAllErrors, match and terminal unwrap variants that run the thunk.',
    },
    'async-option': {
        title: 'Lazy AsyncOption operators',
        description:
            'Operators for lazy AsyncOption<T> thunks: map, bind, filter, orElse, okOr, zipWith, all and the terminal unwrap that runs the thunk.',
    },
    'promise-result': {
        title: 'Promise Result operators',
        description:
            'Eager operators on Promise<IResultOfT>: map, bind, mapAsync, match, combine, filterOrElse and the rejection-aware wrappers built for async pipelines.',
    },
    'promise-option': {
        title: 'Promise Option operators',
        description:
            'Eager operators on Promise<IOption<T>>: map, bind, filter, orElse, okOr, match plus async map, bind and tap variants.',
    },
    composition: {
        title: 'Composition: pipe, composeK, safeTry',
        description:
            'Kleisli composition and generator syntax for typed pipelines: pipe, pipeAsync, composeK, composeKAsync, safeTry and safeTryAsync.',
    },
    adapters: {
        title: 'Adapters: switchFn, liftMap, tee',
        description:
            'Bridge existing code into Result pipelines with switchFn, liftMap, tee, toOption and fromOption — adapters without rewriting call sites.',
    },
    combine: {
        title: 'Combine Results: combine, all',
        description:
            'Combine several Results into one: combine and all fail fast on the first Err, combineWithAllErrors accumulates every error in input order.',
    },
    reliability: {
        title: 'Reliability: retry, timeout, race',
        description:
            'Never-rejecting async helpers: retry, retryLazy, timeout, timeoutEager, race, any and allSettled — every throw and rejection becomes Err.',
    },
    observability: {
        title: 'Observability: ctx, withPath, format',
        description:
            'Breadcrumb context and observer hooks for Result pipelines: ctx, withPath, tapErrContext, observe, installObserver, format and inspect.',
    },
    primitives: {
        title: 'Primitives: cond, sequence, reduce',
        description:
            'High-frequency building blocks: cond, condErr, sequence, sequenceAsyncResult, reduce, partitionOption and lift.',
    },
};
