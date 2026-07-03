/**
 * Option FP (batteries included) — barrel export.
 *
 * Re-exports everything from the sub-modules: core constructors (`some`/`none`)
 * and operators for use in point-free pipelines.
 */

export { ofSome, ofNone } from './core.js';
export { map, andThen, orElse, match, tap, unwrapOr, filter, flatten, contains } from './operators.js';
