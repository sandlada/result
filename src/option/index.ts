/**
 * Option FP (batteries included) — barrel export.
 *
 * Re-exports everything from the sub-modules: core constructors (`ofSome`/`ofNone`)
 * and operators for use in point-free pipelines.
 */

export { ofSome } from './ofSome.js';
export { ofNone } from './ofNone.js';
export { map } from './map.js';
export { andThen } from './andThen.js';
export { orElse } from './orElse.js';
export { match } from './match.js';
export { tap } from './tap.js';
export { unwrapOr } from './unwrapOr.js';
export { filter } from './filter.js';
export { flatten } from './flatten.js';
export { contains } from './contains.js';
export { all } from './all.js';
export { zipWith } from './zipWith.js';

