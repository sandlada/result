/**
 * Observability — barrel export.
 *
 * Re-exports formatters, breadcrumbs, global observer hooks, and structured
 * error-context plumbing.
 */

export { ctx, getPath, type PathSegment, type PathStack } from './ctx.js';
export { withPath } from './withPath.js';
export { tapErrContext, type ErrContext } from './tapErrContext.js';
export { format, type FormatOptions } from './format.js';
export { inspect, type Inspected } from './inspect.js';
export { observe, installObserver, getActiveObserver, type Observer, type ObserveEvent } from './observe.js';