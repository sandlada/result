/**
 * @fileoverview Scenario runner — types, helpers, and step tracking infrastructure.
 *
 * Provides the building blocks for running demo scenarios and collecting
 * structured results for UI display.
 */

// ── Types ───────────────────────────────────────────────────────────────

export interface StepRecord {
    name: string;
    duration: number;
    status: 'success' | 'failure' | 'skipped';
    detail?: string;
}

export interface ScenarioResult {
    status: 'success' | 'failure';
    duration: number;
    title: string;
    output: string;
    outputType: 'text' | 'json' | 'card';
    code: string;
    steps: StepRecord[];
    stepsCode: string[];
}

export interface ScenarioControl {
    key: string;
    label: string;
    defaultValue: string;
    type: 'number' | 'text';
}

export interface Scenario {
    id: string;
    title: string;
    description: string;
    icon: string;
    controls?: ScenarioControl[];
    run(inputs: Record<string, string>): Promise<ScenarioResult>;
}

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Fetches a URL and parses the JSON response. Rejects on HTTP errors or
 * network failures — caller should wrap with `tryCatchAsync` or `fromPromise`.
 */
export async function safeFetchJson(url: string): Promise<unknown> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<unknown>;
}

/**
 * Formats a millisecond duration for display.
 */
export function fmtMs(ms: number): string {
    if (ms < 0.01) return '<0.01ms';
    if (ms < 1) return `${ms.toFixed(2)}ms`;
    if (ms < 10) return `${ms.toFixed(1)}ms`;
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Creates a 0-based index map lookup for a list of IDs.
 */
export function indexOf<T>(items: T[], id: T): number {
    return items.indexOf(id);
}

/**
 * Calculates HTTP method + path from a URL for concise step display.
 */
export function conciseUrl(url: string): string {
    try {
        const u = new URL(url);
        const path = u.pathname.length > 30
            ? u.pathname.slice(0, 27) + '…'
            : u.pathname;
        return `${u.hostname}${path}${u.search}`;
    } catch {
        return url;
    }
}
