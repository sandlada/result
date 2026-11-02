import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Human-readable formatting for `IResultOfT`. Useful in logs, error
 * reporters, and assertions. Falls back to `String(...)` for non-primitive errors.
 *
 * - `Ok(42)` → `Ok(42)`
 * - `Err('boom')` → `Err("boom")`
 * - `Err(new Error('boom'))` → `Err(Error: boom)` (and optionally a stack trace)
 *
 * @example
 * ```ts
 * import { format, inspect } from '@sandlada/result/observability';
 * import { ok, err } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const success = ok(42);
 * const failure = err('boom');
 * const okLine = format(success);
 * const errLine = format(failure);
 * const view = inspect(failure);
 * // okLine === 'Ok(42)'; errLine === 'Err("boom")'; view.kind === 'err' on failure input
 * ```
 */
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

/**
 * The header of an `Error` rendering: `Name: message` (the message part is
 * omitted for an empty message).
 */
const errorHeader = (v: Error): string => v.name + (v.message ? ': ' + v.message : '');

const formatValue = (
    v: unknown,
    depth: number,
    opts: Required<FormatOptions>,
    ancestors: readonly object[],
): string => {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    const t = typeof v;
    if (t === 'string') return opts.quoteStrings ? JSON.stringify(v) : String(v);
    if (t === 'number' || t === 'boolean' || t === 'bigint' || t === 'symbol') return String(v);
    if (t === 'function') return '[Function]';
    if (v instanceof Error) {
        const header = errorHeader(v);
        if (opts.includeStack && v.stack) {
            // Emits `<Name>: <msg>\n<stack>` so the stack is emitted on a fresh line.
            return header + '\n' + v.stack;
        }
        return header;
    }
    // Object types need cycle detection. The check is **path-scoped**: only the
    // objects on the current ancestor chain count as circular. A single global
    // "seen anywhere" set would mislabel a value that is simply referenced twice
    // in a DAG (a shared config object, a logger context) as `[Circular]`.
    let nextAncestors = ancestors;
    if (typeof v === 'object') {
        if (ancestors.includes(v)) return '[Circular]';
        nextAncestors = [...ancestors, v];
    }
    if (depth >= opts.maxDepth) return Array.isArray(v) ? '[...]' : '{...}';
    try {
        if (Array.isArray(v)) {
            if (v.length === 0) return '[]';
            const parts: string[] = [];
            for (let i = 0; i < v.length; i++) {
                parts.push(formatValue(v[i], depth + 1, opts, nextAncestors));
            }
            return '[' + parts.join(', ') + ']';
        }
        const obj = v as Record<string, unknown>;
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        const parts: string[] = [];
        for (const k of keys) {
            parts.push(JSON.stringify(k) + ': ' + formatValue(obj[k], depth + 1, opts, nextAncestors));
        }
        return '{' + parts.join(', ') + '}';
    } catch {
        return '[Unserializable]';
    }
};

/**
 * Render a result as `Ok(...)` / `Err(...)`. Stack traces (when requested)
 * appear on subsequent lines after the closing parenthesis.
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
    const tag = r.isSuccess ? 'Ok(' : 'Err(';
    const value = r.isSuccess ? r.value : r.error;
    const body = formatValue(value, 0, opts, []);
    if (value instanceof Error && opts.includeStack && value.stack) {
        // The stack trace starts on its own line, so the closing parenthesis
        // goes before it. Only the stack separator is skipped - a newline that
        // belongs to the *message* keeps the parenthesis at the very end.
        const header = errorHeader(value);
        return tag + header + ')' + body.slice(header.length);
    }
    return tag + body + ')';
}
