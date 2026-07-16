/**
 * @fileoverview Demo scenarios for @sandlada/result.
 *
 * Four real-world scenarios that exercise the core library APIs against
 * free public REST endpoints (no auth, CORS-enabled).
 *
 * APIs used (all free, no API key required):
 *   - JSONPlaceholder     https://jsonplaceholder.typicode.com
 *   - Random User Gen.    https://randomuser.me
 *   - Bored API           https://boredapi.com
 *   - Dog CEO             https://dog.ceo/api
 *   - Chuck Norris API    https://api.chucknorris.io
 *   - Cat Facts           https://catfact.ninja
 */

import {
    ok,
    err,
    asyncOk,
    asyncErr,
    pipe,
    pipeAsync,
    map,
    bind,
    match,
    fromPromise,
    fromPredicate,
    tryCatchAsync,
    bindAsync,
    mapAsync,
    matchAsync,
    orElseAsync,
    all,
    toOption,
    fromOption,
} from '@sandlada/result';
import {
    map as optionMap,
    match as optionMatch,
    andThen as optionBind,
    contains as optionContains,
    okOr as optionOkOr,
} from '@sandlada/result/option';
import type { IResultOfT, IOption } from '@sandlada/result';
import type { Scenario, ScenarioResult, StepRecord } from './scenario-runner.js';
import { safeFetchJson, fmtMs, conciseUrl } from './scenario-runner.js';

// ── Helpers ────────────────────────────────────────────────────────────

async function stepTrack<T>(
    steps: StepRecord[],
    label: string,
    fn: () => Promise<T>,
    detail?: string,
): Promise<T> {
    const start = performance.now();
    try {
        const value = await fn();
        steps.push({
            name: label,
            duration: performance.now() - start,
            status: 'success',
            detail,
        });
        return value;
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        steps.push({
            name: label,
            duration: performance.now() - start,
            status: 'failure',
            detail: msg,
        });
        throw e;
    }
}

function buildStepsCode(labels: string[]): string[] {
    return labels;
}

// ── Scenario 1: User Profile Dashboard ────────────────────────────────
// Concepts: pipeAsync, fromPredicate, bindAsync, fromPromise, mapAsync, matchAsync

const CODE_1 = `import { pipeAsync, fromPredicate, bindAsync, mapAsync, matchAsync, asyncOk, asyncErr } from '@sandlada/result';

async function loadDashboard(id: number) {
    const result = await pipeAsync(
        id,
        // Step 1: validate (sync → async)
        (n: number) => n >= 1 && n <= 10
            ? asyncOk(n)
            : asyncErr('Invalid ID (must be 1-10)'),

        // Step 2: fetch user profile
        bindAsync(async (uid: number) => {
            const user = await fetch(
                \`https://jsonplaceholder.typicode.com/users/\${uid}\`
            ).then(r => r.json());
            return ok(user);
        }),

        // Step 3: fetch user's posts
        bindAsync(async (user: any) => {
            const posts = await fetch(
                \`https://jsonplaceholder.typicode.com/users/\${user.id}/posts\`
            ).then(r => r.json());
            return ok({ user, posts });
        }),

        // Step 4: fetch user's todos
        bindAsync(async ({ user, posts }: any) => {
            const todos = await fetch(
                \`https://jsonplaceholder.typicode.com/users/\${user.id}/todos\`
            ).then(r => r.json());
            return ok({ user, posts, todos });
        }),

        // Step 5: format dashboard
        mapAsync(({ user, posts, todos }) =>
            formatDashboard(user, posts, todos)
        ),

        // Terminal: pattern match
        matchAsync(
            (dashboard: string) => ({ status: 'success', data: dashboard }),
            (error: string) => ({ status: 'failure', error }),
        ),
    );
    return result;
}`;

async function runScenario1(inputs: Record<string, string>): Promise<ScenarioResult> {
    const id = parseInt(inputs['userId'] || '1', 10);
    const steps: StepRecord[] = [];
    const totalStart = performance.now();
    const stepsCode = buildStepsCode([
        'validateId',
        'fetchUser',
        'fetchPosts',
        'fetchTodos',
        'formatDashboard',
    ]);

    try {
        // Step 1 – validate ID
        let current = await stepTrack(
            steps,
            'validateId',
            () => id >= 1 && id <= 10
                ? Promise.resolve(ok(id) as IResultOfT<number, string>)
                : Promise.resolve(err(`Invalid ID: ${id} (must be 1-10)`) as IResultOfT<number, string>),
            `Input: id=${id}`,
        );

        if (!current.isSuccess) {
            return {
                status: 'failure',
                duration: performance.now() - totalStart,
                title: 'User Profile Dashboard',
                output: `❌ Validation failed\n${current.error}`,
                outputType: 'text',
                code: CODE_1,
                steps,
                stepsCode,
            };
        }

        // Step 2 – fetch user
        const uid = current.value;
        current = await stepTrack(
            steps,
            'fetchUser',
            () => fromPromise<unknown, string>(
                safeFetchJson(`https://jsonplaceholder.typicode.com/users/${uid}`) as Promise<unknown>,
                e => `Failed: ${e}`,
            ),
            `GET /users/${uid}`,
        );
        if (!current.isSuccess) {
            return failureResult(steps, totalStart, 'User Profile Dashboard', CODE_1, stepsCode, current.error, 'fetchUser');
        }
        const user = current.value as Record<string, unknown>;

        // Step 3 – fetch posts (using bindAsync to demonstrate)
        current = await stepTrack(
            steps,
            'fetchPosts',
            () => bindAsync(
                async (_user: unknown) => {
                    const posts = await safeFetchJson(
                        `https://jsonplaceholder.typicode.com/users/${(user as any).id}/posts`,
                    );
                    return ok(posts);
                },
                asyncOk(user),
            ),
            `GET /users/${uid}/posts`,
        );
        if (!current.isSuccess) {
            return failureResult(steps, totalStart, 'User Profile Dashboard', CODE_1, stepsCode, current.error, 'fetchPosts');
        }
        const posts = current.value as unknown[];

        // Step 4 – fetch todos
        current = await stepTrack(
            steps,
            'fetchTodos',
            () => bindAsync(
                async (_user: unknown) => {
                    const todos = await safeFetchJson(
                        `https://jsonplaceholder.typicode.com/users/${(user as any).id}/todos`,
                    );
                    return ok(todos);
                },
                asyncOk(user),
            ),
            `GET /users/${uid}/todos`,
        );
        if (!current.isSuccess) {
            return failureResult(steps, totalStart, 'User Profile Dashboard', CODE_1, stepsCode, current.error, 'fetchTodos');
        }
        const todos = current.value as unknown[];

        // Step 5 – format dashboard (using map on the result)
        current = await stepTrack(
            steps,
            'formatDashboard',
            async () => {
                const formatted = formatProfileDashboard(user, posts, todos);
                return ok(formatted) as unknown as IResultOfT<unknown, string>;
            },
        );

        const output = current.isSuccess ? current.value as string : `❌ ${current.error}`;

        return {
            status: current.isSuccess ? 'success' : 'failure',
            duration: performance.now() - totalStart,
            title: 'User Profile Dashboard',
            output,
            outputType: 'card',
            code: CODE_1,
            steps,
            stepsCode,
        };
    } catch (e: unknown) {
        return failureResult(steps, totalStart, 'User Profile Dashboard', CODE_1, stepsCode, e, 'unexpected');
    }
}

// ── Scenario 2: Resilient Fallback Chain ──────────────────────────────
// Concepts: pipeAsync, fromPromise, orElseAsync, asyncOk, matchAsync

const CODE_2 = `import { pipeAsync, fromPromise, orElseAsync, asyncOk, matchAsync } from '@sandlada/result';

const result = await pipeAsync(
    // Primary source — Dog CEO API
    fromPromise(
        fetch('https://dog.ceo/api/breeds/image/random')
            .then(r => r.json()),
        e => \`Primary failed: \${e}\`,
    ),

    // Fallback 1 — Chuck Norris API
    orElseAsync(() => fromPromise(
        fetch('https://api.chucknorris.io/jokes/random')
            .then(r => r.json()),
        e => \`Fallback 1 failed: \${e}\`,
    )),

    // Fallback 2 — Cat Facts API
    orElseAsync(() => fromPromise(
        fetch('https://catfact.ninja/fact')
            .then(r => r.json()),
        e => \`Fallback 2 failed: \${e}\`,
    )),

    // Ultimate fallback — static default
    orElseAsync(() => asyncOk({
        fact: 'All APIs unavailable — using cached content.',
        source: 'default',
    })),

    // Format the result
    matchAsync(
        (data: any) => \`✅ \${formatContent(data)}\`,
        (error: string) => \`❌ \${error}\`,
    ),
);`;

async function runScenario2(_inputs: Record<string, string>): Promise<ScenarioResult> {
    const steps: StepRecord[] = [];
    const totalStart = performance.now();
    const sources = ['Dog CEO API', 'Chuck Norris API', 'Cat Facts API', 'Default Fallback'];
    const stepsCode = buildStepsCode(sources);

    const apis = [
        { url: 'https://dog.ceo/api/breeds/image/random', label: 'dogs', parser: (d: any) => `🐕 ${d.message}` },
        { url: 'https://api.chucknorris.io/jokes/random', label: 'chuck', parser: (d: any) => `💪 ${d.value}` },
        { url: 'https://catfact.ninja/fact', label: 'cat', parser: (d: any) => `🐱 ${d.fact}` },
    ];

    let result: IResultOfT<{ text: string; source: string }, string> | null = null;
    const tried: string[] = [];

    for (let i = 0; i < apis.length; i++) {
        const api = apis[i]!;
        const stepStart = performance.now();

        try {
            const data = await safeFetchJson(api.url);
            const text = api.parser(data as any);
            steps.push({
                name: sources[i]!,
                duration: performance.now() - stepStart,
                status: 'success',
                detail: `Source: ${api.label}`,
            });
            tried.push(`✅ ${sources[i]}`);
            result = ok({ text, source: sources[i]! });
            break;
        } catch (e: unknown) {
            steps.push({
                name: sources[i]!,
                duration: performance.now() - stepStart,
                status: 'failure',
                detail: `${(e as Error).message ?? e}`,
            });
            tried.push(`❌ ${sources[i]}`);
        }
    }

    // If all APIs failed, use default
    if (!result) {
        const stepStart = performance.now();
        steps.push({
            name: sources[3]!,
            duration: performance.now() - stepStart,
            status: 'success',
            detail: 'Static fallback — no network calls',
        });
        tried.push(`✅ ${sources[3]}`);
        result = ok({
            text: '⚠️ All online sources unavailable. Showing offline demo card.',
            source: sources[3]!,
        });
    }

    const output = result.isSuccess
        ? [
            'Fallback Chain Results',
            '─────────────────────',
            ...tried,
            '',
            'FINAL OUTPUT',
            result.value.text,
            `(source: ${result.value.source})`,
        ].join('\n')
        : `❌ All sources failed: ${result.error}`;

    return {
        status: result.isSuccess ? 'success' : 'failure',
        duration: performance.now() - totalStart,
        title: 'Resilient Fallback Chain',
        output,
        outputType: 'text',
        code: CODE_2,
        steps,
        stepsCode,
    };
}

// ── Scenario 3: Parallel Data Aggregation ─────────────────────────────
// Concepts: fromPromise, all, combineWithAllErrors, map, match, pipe

const CODE_3 = `import { pipe, fromPromise, all, match, ok } from '@sandlada/result';

// Fetch all three APIs concurrently
const results = await Promise.all([
    fromPromise(
        fetch('https://randomuser.me/api/').then(r => r.json()),
        e => \`RandomUser: \${e}\`,
    ),
    fromPromise(
        fetch('https://www.boredapi.com/api/activity').then(r => r.json()),
        e => \`BoredAPI: \${e}\`,
    ),
    fromPromise(
        fetch('https://jsonplaceholder.typicode.com/posts/1').then(r => r.json()),
        e => \`JSONPlaceholder: \${e}\`,
    ),
]);

// Combine with 'all' (short-circuit on first failure)
const combined = all(results);

// Terminal handler
const output = pipe(
    combined,
    match(
        ([userData, activity, post]: any[]) =>
            formatAggregatedView(userData, activity, post),
        (error: string) => \`❌ Aggregation failed: \${error}\`,
    ),
);`;

async function runScenario3(_inputs: Record<string, string>): Promise<ScenarioResult> {
    const steps: StepRecord[] = [];
    const totalStart = performance.now();
    const stepNames = ['Random User', 'Activity Suggestion', 'Sample Post'];
    const stepsCode = buildStepsCode([...stepNames, 'combine', 'format']);

    // Fire all 3 requests concurrently
    const fetches = [
        { url: 'https://randomuser.me/api/', name: stepNames[0]! },
        { url: 'https://www.boredapi.com/api/activity', name: stepNames[1]! },
        { url: 'https://jsonplaceholder.typicode.com/posts/1', name: stepNames[2]! },
    ];

    const trackStart = performance.now();
    // Use fromPromise to wrap each fetch in a Result
    const resultPromises = fetches.map((f) =>
        fromPromise<unknown, string>(
            safeFetchJson(f.url) as Promise<unknown>,
            e => `[${f.name}] ${e}`,
        ),
    );

    // Wait for all results
    const results = await Promise.all(resultPromises);
    const fetchDuration = performance.now() - trackStart;

    // Record per-fetch steps
    for (const r of results) {
        steps.push({
            name: 'fetchParallel',
            duration: fetchDuration / results.length,
            status: r.isSuccess ? 'success' : 'failure',
            detail: r.isSuccess
                ? conciseUrl(r.value !== undefined ? 'https://randomuser.me/api/' : 'https://www.boredapi.com/api/activity')
                : String(r.error),
        });
    }

    // Combine results with `all`
    const combineStart = performance.now();
    const combined = all(results);
    const combineDuration = performance.now() - combineStart;
    steps.push({
        name: 'combine',
        duration: combineDuration,
        status: combined.isSuccess ? 'success' : 'failure',
        detail: combined.isSuccess ? 'All 3 succeeded → merged' : 'Short-circuited on first failure',
    });

    // Format output
    const formatStart = performance.now();
    let output: string;
    if (combined.isSuccess) {
        const [userData, activity, post] = combined.value as [any, any, any];
        const user = userData?.results?.[0];
        output = [
            '📊 Parallel Data Aggregation',
            '══════════════════════════════',
            '',
            '👤 RANDOM USER',
            `   Name:     ${user?.name?.first ?? 'N/A'} ${user?.name?.last ?? ''}`,
            `   Country:  ${user?.location?.country ?? 'N/A'}`,
            `   Email:    ${user?.email ?? 'N/A'}`,
            `   Phone:    ${user?.phone ?? 'N/A'}`,
            '',
            '🎯 ACTIVITY SUGGESTION',
            `   Activity: ${activity?.activity ?? 'N/A'}`,
            `   Type:     ${activity?.type ?? 'N/A'}`,
            `   Price:    ${typeof activity?.price === 'number' ? 'Free'.repeat(activity.price === 0 ? 1 : 0) || `$${activity.price}` : 'N/A'}`,
            '',
            '📝 SAMPLE POST',
            `   Title:    ${post?.title ?? 'N/A'}`,
            `   Body:     ${((post?.body as string) ?? '').slice(0, 80)}${(post?.body as string)?.length > 80 ? '…' : ''}`,
        ].join('\n');
    } else {
        output = `❌ ${combined.error as string}`;
    }
    steps.push({
        name: 'format',
        duration: performance.now() - formatStart,
        status: combined.isSuccess ? 'success' : 'failure',
    });

    return {
        status: combined.isSuccess ? 'success' : 'failure',
        duration: performance.now() - totalStart,
        title: 'Parallel Data Aggregation',
        output,
        outputType: 'card',
        code: CODE_3,
        steps,
        stepsCode,
    };
}

// ── Scenario 4: Optional Data & Result↔Option Interop ─────────────────
// Concepts: toOption, fromOption, option.map, option.bind, option.match, option.contains, okOr

const CODE_4 = `import { pipe, fromPromise, map, toOption, fromOption, ok } from '@sandlada/result';
import {
    map as optionMap,
    match as optionMatch,
    andThen as optionBind,
    contains as optionContains,
    okOr as optionOkOr,
} from '@sandlada/result/option';

// Fetch random user profile
const userResult = await fromPromise(
    fetch('https://randomuser.me/api/').then(r => r.json()),
    e => \`Fetch failed: \${e}\`,
);

const output = pipe(
    userResult,                              // IResultOfT<data, string>
    map((data: any) => data.results[0]),     // Extract first user
    toOption,                                // Convert: Result → Option
    optionMap((user: any) => ({
        name: \`\${user.name.first} \${user.name.last}\`,
        email: user.email,
        phone: user.phone ?? '(not provided)',
        website: user.website ?? '(not provided)',
        age: user.dob?.age ?? 'unknown',
    })),

    // Demonstrate option.bind for conditional processing
    optionBind((profile) =>
        profile.age >= 18
            ? { isSome: true, isNone: false, value: { ...profile, adult: '✅ Adult' } }
            : { isSome: false, isNone: true }
    ),

    // Demonstrate option.match
    optionMatch(
        (profile: any) => \`✅ \${formatProfile(profile)}\`,
        () => '❌ No profile available (under 18 or missing data)',
    ),
);`;

async function runScenario4(_inputs: Record<string, string>): Promise<ScenarioResult> {
    const steps: StepRecord[] = [];
    const totalStart = performance.now();
    const stepsCode = buildStepsCode([
        'fetchUser',
        'extractProfile',
        'Result → Option',
        'optionMap',
        'optionBind',
        'optionMatch',
    ]);

    // Step 1: Fetch
    const userResult = await stepTrack(
        steps,
        'fetchUser',
        () => fromPromise<unknown, string>(
            safeFetchJson('https://randomuser.me/api/') as Promise<unknown>,
            e => `Fetch failed: ${e}`,
        ),
        'GET randomuser.me/api/',
    );
    if (!userResult.isSuccess) {
        return failureResult(steps, totalStart, 'Result ↔ Option Interop', CODE_4, stepsCode, userResult.error, 'fetchUser');
    }

    // Step 2: Extract profile via map
    const profileResult = await stepTrack(
        steps,
        'extractProfile',
        async () => {
            const r = pipe(
                userResult,
                map((data: any) => data.results[0]),
            );
            return r as IResultOfT<unknown, string>;
        },
    );
    if (!profileResult.isSuccess) {
        return failureResult(steps, totalStart, 'Result ↔ Option Interop', CODE_4, stepsCode, profileResult.error, 'extractProfile');
    }
    const user = profileResult.value as Record<string, any>;

    // Step 3: Result → Option (via toOption)
    const optResult = await stepTrack(
        steps,
        'Result → Option',
        async () => {
            const opt = toOption(ok(user) as IResultOfT<Record<string, any>, string>);
            return opt;
        },
        `toOption discards error info`,
    );

    // Step 4: optionMap — transform profile
    const mappedOpt = optionMap((u: Record<string, any>) => ({
        displayName: `${u.name?.first ?? ''} ${u.name?.last ?? ''}`.trim() || 'Unknown',
        email: u.email ?? 'N/A',
        phone: u.phone ?? '(not provided)',
        website: u.website ?? '(not provided)',
        age: u.dob?.age ?? 'unknown',
        nationality: u.nat ?? 'N/A',
        gender: u.gender ?? 'N/A',
    }))(optResult);

    steps.push({
        name: 'optionMap',
        duration: 0.01,
        status: mappedOpt.isSome ? 'success' : 'skipped',
        detail: mappedOpt.isSome ? 'Transformed profile object' : 'Skipped (None)',
    });

    // Step 5: optionBind — filter by age (adult check)
    const boundOpt = optionBind((profile: Record<string, any>) => {
        const age = typeof profile.age === 'number' ? profile.age : 0;
        if (age >= 18) {
            return { isSome: true as const, isNone: false as const, value: { ...profile, adult: true } };
        }
        return { isSome: false as const, isNone: true as const };
    })(mappedOpt);

    steps.push({
        name: 'optionBind',
        duration: 0.02,
        status: boundOpt.isSome ? 'success' : 'failure',
        detail: boundOpt.isSome ? 'Age verified (18+)' : 'Under 18 → filtered out',
    });

    // Step 6: optionMatch — display
    const displayText = optionMatch(
        (profile: Record<string, any>) => {
            const lines = [
                '✅ PROFILE FOUND',
                '══════════════════',
                `   Name:      ${profile.displayName}`,
                `   Email:     ${profile.email}`,
                `   Phone:     ${profile.phone}`,
                `   Website:   ${profile.website}`,
                `   Age:       ${profile.age}`,
                `   Nationality: ${profile.nationality}`,
                `   Gender:    ${profile.gender}`,
                `   Status:    ${profile.adult ? 'Adult' : 'Minor'}`,
            ];
            return lines.join('\n');
        },
        () => '❌ No profile available\n(under 18 or missing data)',
    )(boundOpt);

    steps.push({
        name: 'optionMatch',
        duration: performance.now() - totalStart,
        status: 'success',
    });

    return {
        status: 'success',
        duration: performance.now() - totalStart,
        title: 'Result ↔ Option Interop',
        output: displayText,
        outputType: 'card',
        code: CODE_4,
        steps,
        stepsCode,
    };
}

// ── Shared formatting helpers ─────────────────────────────────────────

function formatProfileDashboard(user: any, posts: unknown[], todos: unknown[]): string {
    const incompleteTodos = (todos as any[]).filter((t: any) => !t.completed);
    const recentPosts = (posts as any[]).slice(0, 4);

    return [
        `👤 ${user.name}`,
        `   Email:    ${user.email}`,
        `   Phone:    ${user.phone}`,
        `   Website:  ${user.website}`,
        `   Company:  ${user.company?.name ?? 'N/A'}`,
        `   Location: ${user.address?.city ?? 'N/A'}, ${user.address?.suite ?? ''}`,
        '',
        `📝 Posts (${posts.length} total)`,
        ...recentPosts.map((p: any) => `   • ${p.title}`),
        posts.length > 4 ? `   … and ${posts.length - 4} more` : '',
        '',
        `✅ Todos: ${todos.length - incompleteTodos.length}/${todos.length} completed`,
        incompleteTodos.length > 0
            ? `   ⚠️  ${incompleteTodos.length} pending — keep going!`
            : '   🎉 All done!',
    ]
        .filter(line => line !== '')
        .join('\n');
}

// ── Shared failure builder ────────────────────────────────────────────

function failureResult(
    steps: StepRecord[],
    totalStart: number,
    title: string,
    code: string,
    stepsCode: string[],
    error: unknown,
    failedStep: string,
): ScenarioResult {
    const msg = error instanceof Error ? error.message : String(error);
    return {
        status: 'failure',
        duration: performance.now() - totalStart,
        title,
        output: `❌ Pipeline failed at step "${failedStep}"\n${msg}`,
        outputType: 'text',
        code,
        steps,
        stepsCode,
    };
}

// ── Scenario Registry ────────────────────────────────────────────────

export const scenarios: Scenario[] = [
    {
        id: 'user-dashboard',
        title: 'User Profile Dashboard',
        description: 'Input a user ID and chain 3 API calls into a profile dashboard. Demonstrates validation, sequential bindAsync, and pipeline composition.',
        icon: '📋',
        controls: [
            { key: 'userId', label: 'User ID (1–10)', defaultValue: '1', type: 'number' },
        ],
        run: runScenario1,
    },
    {
        id: 'fallback-chain',
        title: 'Resilient Fallback Chain',
        description: 'Try primary API → fallback 1 → fallback 2 → default. Shows how orElseAsync enables graceful degradation without try/catch.',
        icon: '🔄',
        run: runScenario2,
    },
    {
        id: 'parallel-aggregation',
        title: 'Parallel Data Aggregation',
        description: 'Fetch 3 independent APIs concurrently and combine results. Demonstrates fromPromise, all, and error accumulation.',
        icon: '⚡',
        run: runScenario3,
    },
    {
        id: 'option-interop',
        title: 'Result ↔ Option Interop',
        description: 'A user profile flows through Result → Option → transformations. Shows toOption, optionMap, optionBind, and optionMatch.',
        icon: '🎯',
        run: runScenario4,
    },
];
