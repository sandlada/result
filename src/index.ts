/**
 * @sandlada/result — main entry.
 *
 * Type-only barrel. All runtime values are imported from the dedicated
 * subpath packages (`./factories`, `./operators`, `./option`,
 * `./async-result`, `./async-option`, `./promise-result`, `./promise-option`,
 * `./composition`, `./adapters`, `./combine`, `./reliability`,
 * `./observability`, `./primitives`).
 *
 * Rationale: see `ARCH.md` ADR 9.
 */

export type {
    IResult,
    IResultSuccess,
    IResultFailure,
} from './types/IResult.js';
export type {
    IResultOfT,
    IResultOfTSuccess,
    IResultOfTFailure,
} from './types/IResultOfT.js';
export type { IOption, IOptionSome, IOptionNone } from './types/Option.js';
export type { AsyncResult } from './types/AsyncResult.js';
export type { AsyncOption } from './types/AsyncOption.js';