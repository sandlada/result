// Minimal ambient declarations for the runtime helpers used by reliability
// operators. Avoids pulling in the full DOM lib while keeping the public
// surface ergonomic on Node 18+, modern browsers, and Deno.

declare function setTimeout(handler: (...args: any[]) => void, ms?: number, ...args: any[]): unknown;
declare function clearTimeout(handle: unknown): void;
declare function queueMicrotask(callback: () => void): void;

interface ImportMeta {
    readonly url: string;
}

declare class URL {
    constructor(url: string, base?: string | URL);
    readonly href: string;
}

interface AbortSignalEventMap {
    abort: Event;
}

interface AbortSignal {
    readonly aborted: boolean;
    addEventListener(type: 'abort', listener: (this: AbortSignal, ev: Event) => unknown, options?: boolean | { once?: boolean }): void;
    removeEventListener(type: 'abort', listener: (this: AbortSignal, ev: Event) => unknown, options?: boolean | { once?: boolean } | Event): void;
}

interface AbortController {
    readonly signal: AbortSignal;
    abort(reason?: unknown): void;
}
declare const AbortController: { new (): AbortController };