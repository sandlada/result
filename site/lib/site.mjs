// Single source of truth for the documentation site: shared constants, the
// published module registry, and repository paths.
//
// Order of `moduleRegistry` matches the module map in the repository's
// AGENTS.md. Every module owns a spec at `src/<module>/README.md`. The
// derived exports keep the previous import shapes so existing consumers only
// need an import-path change:
//   - `modules` / `specDescriptions` feed the sidebar and the content sync;
//   - `entryPoints` drives TypeDoc generation and the API sidebar group;
//   - `apiPages` supplies the curated search metadata for generated API pages.
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

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

const moduleRegistry = [
    {
        name: 'types',
        specDescription:
            'The discriminated-union contracts — IResult, IResultOfT, IOption, AsyncResult and AsyncOption — plus the type-focused root barrel.',
        apiTitle: 'Type contracts: IResult, IOption',
        apiDescription:
            'Core contracts of @sandlada/result: IResult, IResultOfT, IOption, AsyncResult and AsyncOption — plain discriminated unions, no classes or methods.',
    },
    {
        name: 'factories',
        specDescription:
            'Constructors that turn values, predicates, throws and Promises into Results, including the eager async factories.',
        apiTitle: 'Factories: ok, err, tryCatch',
        apiDescription:
            'Create typed Results and Options: ok, err, fromPredicate, fromThrowable, tryCatch, fromPromise and friends — the narrowest possible return types.',
    },
    {
        name: 'operators',
        specDescription:
            'Data-last curried operators on IResultOfT: map, bind, match, unwrap, the escape hatches and the collection helpers.',
        apiTitle: 'Result operators: map, bind, match',
        apiDescription:
            'Synchronous operators on IResultOfT: map, bind, orElse, match, unwrap, unwrapOr, tap, separate and the unwrap/expect escape hatches.',
    },
    {
        name: 'option',
        specDescription:
            'Synchronous IOption operators — ofSome, ofNone, map, bind, okOr, transpose — independent of Result.',
        apiTitle: 'Option operators: map, bind, match',
        apiDescription:
            'Operators for IOption<T>: ofSome, ofNone, map, bind, filter, orElse, okOr, traverseArray and all — every callback throw becomes None.',
    },
    {
        name: 'composition',
        specDescription:
            'pipe, pipeAsync, composeK, composeKAsync and the generator-based safeTry family.',
        apiTitle: 'Composition: pipe, composeK, safeTry',
        apiDescription:
            'Kleisli composition and generator syntax for typed pipelines: pipe, pipeAsync, composeK, composeKAsync, safeTry and safeTryAsync.',
    },
    {
        name: 'adapters',
        specDescription:
            'Bridges between plain functions and the railway: switchFn, liftMap, tee, toOption and fromOption.',
        apiTitle: 'Adapters: switchFn, liftMap, tee',
        apiDescription:
            'Bridge existing code into Result pipelines with switchFn, liftMap, tee, toOption and fromOption — adapters without rewriting call sites.',
    },
    {
        name: 'combine',
        specDescription:
            'Parallel Result combination with two policies: combine/all fail fast, combineWithAllErrors accumulates.',
        apiTitle: 'Combine Results: combine, all',
        apiDescription:
            'Combine several Results into one: combine and all fail fast on the first Err, combineWithAllErrors accumulates every error in input order.',
    },
    {
        name: 'promise-result',
        specDescription:
            'Eager operators on Promise<IResultOfT>, including the async-callback and lift families.',
        apiTitle: 'Promise Result operators',
        apiDescription:
            'Eager operators on Promise<IResultOfT>: map, bind, mapAsync, match, combine, filterOrElse and the rejection-aware wrappers built for async pipelines.',
    },
    {
        name: 'promise-option',
        specDescription:
            'Eager operators on Promise<IOption>, mirroring promise-result on the Option track.',
        apiTitle: 'Promise Option operators',
        apiDescription:
            'Eager operators on Promise<IOption<T>>: map, bind, filter, orElse, okOr, match plus async map, bind and tap variants.',
    },
    {
        name: 'async-result',
        specDescription:
            'Lazy AsyncResult thunk operators; nothing runs until a terminal calls run().',
        apiTitle: 'Lazy AsyncResult operators',
        apiDescription:
            'Operators for lazy AsyncResult<T, E> thunks: mapAsync, bind, catchErr, combineWithAllErrors, match and terminal unwrap variants that run the thunk.',
    },
    {
        name: 'async-option',
        specDescription:
            'Lazy AsyncOption thunk operators; nothing runs until a terminal calls run().',
        apiTitle: 'Lazy AsyncOption operators',
        apiDescription:
            'Operators for lazy AsyncOption<T> thunks: map, bind, filter, orElse, okOr, zipWith, all and the terminal unwrap that runs the thunk.',
    },
    {
        name: 'reliability',
        specDescription:
            'Retry, timeout and concurrency primitives — the only async layer that never rejects.',
        apiTitle: 'Reliability: retry, timeout, race',
        apiDescription:
            'Never-rejecting async helpers: retry, retryLazy, timeout, timeoutEager, race, any and allSettled — every throw and rejection becomes Err.',
    },
    {
        name: 'observability',
        specDescription:
            'Breadcrumb context (ctx/withPath), formatters and process-wide observer hooks.',
        apiTitle: 'Observability: ctx, withPath, format',
        apiDescription:
            'Breadcrumb context and observer hooks for Result pipelines: ctx, withPath, tapErrContext, observe, installObserver, format and inspect.',
    },
    {
        name: 'primitives',
        specDescription:
            'High-frequency helpers: cond, condErr, sequence, reduce, partitionOption and lift.',
        apiTitle: 'Primitives: cond, sequence, reduce',
        apiDescription:
            'High-frequency building blocks: cond, condErr, sequence, sequenceAsyncResult, reduce, partitionOption and lift.',
    },
];

export const modules = moduleRegistry.map((module) => module.name);

export const specDescriptions = Object.fromEntries(
    moduleRegistry.map((module) => [module.name, module.specDescription]),
);

// The TypeScript entry points documented in the API reference. Each one mirrors a
// published subpath export of `@sandlada/result`. The root barrel is not listed
// because it re-exports the same type contracts as `/types` without adding a
// runtime API.
export const entryPoints = moduleRegistry.map((module) => `../src/${module.name}/index.ts`);

export const apiPages = {
    index: {
        title: 'API Reference',
        description: `Every export of the ${moduleRegistry.length} published @sandlada/result subpaths: factories, operators, async and promise layers, reliability, observability, primitives.`,
    },
    ...Object.fromEntries(
        moduleRegistry.map((module) => [
            module.name,
            { title: module.apiTitle, description: module.apiDescription },
        ]),
    ),
};

export const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const repositoryRoot = resolve(siteRoot, '..');

export const contentDocsDirectory = join(siteRoot, 'src/content/docs');

export const specsDirectory = join(contentDocsDirectory, 'specs');

export const distDirectory = join(siteRoot, 'dist');

export const versionsFile = join(siteRoot, 'versions.json');
