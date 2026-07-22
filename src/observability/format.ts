/**
 * @fileoverview Human-readable formatting for `IResultOfT`. Useful in logs, error
 * reporters, and assertions. Falls back to `String(...)` for non-primitive errors.
 *
 * - `Ok(42)` → `Ok(42)`
 * - `Err('boom')` → `Err("boom")`
 * - `Err(new Error('boom'))` → `Err(Error: boom)` (and optionally a stack trace)
 *
 * @example
 * ```ts
 * import { format } from '@sandlada/result/observability';
 * import { ok, err } from '@sandlada/result';
 *
 * console.log(format(ok(42)));           // "Ok(42)"
 * console.log(format(err('boom')));       // "Err(\"boom\")"
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export interface FormatOptions {
    /** Wrap strings in quotes so values with whitespace don't confuse readers. Default `true`. */
    readonly quoteStrings?: boolean;
    /** Include `Error.stack` if available. Default `false`. */
    readonly includeStack?: boolean;
    /** Truncate long values at `maxDepth` recursive levels for object values. Default `3`. */
    readonly maxDepth?: number;
}

const QUOTE_DEFAULT = true;
const STACK_DEFAULT = false;
const MAX_DEPTH_DEFAULT = 3;

const formatValue = (v: unknown, depth: number, opts: Required<FormatOptions>): string => {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    const t = typeof v;
    if (t === 'string') return opts.quoteStrings ? JSON.stringify(v) : String(v);
    if (t === 'number' || t === 'boolean' || t === 'bigint' || t === 'symbol') return String(v);
    if (t === 'function') return '[Function]';
    if (v instanceof Error) {
        const msg = v.message ? `: ${v.message}` : '';
        const stack = opts.includeStack && v.stack ? `\n${v.stack}` : '';
        return `${v.name || 'Error'}${msg}${stack}`;
    }
    if (depth >= opts.maxDepth) return Array.isArray(v) ? '[...]' : '{...}';
    try {
        if (Array.isArray(v)) {
            if (v.length === 0) return '[]';
            return '[' + v.map((x) => formatValue(x, depth + 1, opts)).join(', ') + ']';
        }
        const obj = v as Record<string, unknown>;
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        return '{' + keys.map((k) => JSON.stringify(k) + ': ' + formatValue(obj[k], depth + 1, opts)).join(', ') + '}';
    } catch {
        return '[Unserializable]';
    }
};

/**
 * Render a result as a one-line `Ok(...)` / `Err(...)` string. Suitable for logs.
 */
export function format<T, E>(
    r: IResultOfT<T, E>,
    options: FormatOptions = {},
): string {
    const opts: Required<FormatOptions> = {
        quoteStrings: options.quoteStrings ?? QUOTE_DEFAULT,
        includeStack: options.includeStack ?? STACK_DEFAULT,
        maxDepth: options.maxDepth ?? MAX_DEPTH_DEFAULT,
    };
    if (r.isSuccess) return 'Ok(' + formatValue(r.value, 0, opts) + ')';
    return 'Err(' + formatValue(r.error, 0, opts) + ')';
}