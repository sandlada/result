/**
 * Option FP (batteries included) — barrel export.
 *
 * Re-exports everything from the sub-modules: core constructors (`ofSome`/`ofNone`)
 * and operators for use in point-free pipelines.
 */

export { all } from './all.js';
export { bind } from './bind.js';
export { contains } from './contains.js';
export { filter } from './filter.js';
export { flatten } from './flatten.js';
export { map } from './map.js';
export { match } from './match.js';
export { ofNone } from './ofNone.js';
export { ofSome } from './ofSome.js';
export { okOr } from './okOr.js';
export { okOrElse } from './okOrElse.js';
export { orElse } from './orElse.js';
export { tap } from './tap.js';
export { transpose } from './transpose.js';
export { unwrapOr } from './unwrapOr.js';
export { zipWith } from './zipWith.js';
