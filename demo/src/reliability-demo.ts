import { err, ok, orElse, pipe, retry, timeout } from '@sandlada/result';
import { from as asyncResultFrom } from '@sandlada/result/async-result';
import type { IResultOfT } from '@sandlada/result';
import { wireExample } from './demo-ui.js';
import { wait } from './mock-api.js';
import type { DemoError } from './mock-api.js';

async function retryInventory(): Promise<object> {
    let attempts = 0;
    const events: string[] = [];
    const result = await retry<number, DemoError>(async () => {
        await wait(90);
        attempts += 1;
        events.push(`Attempt ${attempts}: ${attempts < 3 ? 'service unavailable' : '12 units available'}`);
        return attempts < 3
            ? err({ kind: 'Unavailable', service: 'inventory' })
            : ok(12);
    }, {
        times: 3,
        delayMs: 80,
        shouldRetry: error => error.kind === 'Unavailable',
        onRetry: (_error, attempt) => console.warn(`Retry scheduled after attempt ${attempt + 1}`),
    });

    return result.isSuccess
        ? { status: 'recovered', attempts, inventory: result.value, events }
        : { status: 'failed', attempts, error: result.error, events };
}

function useCachedPrice(): object {
    const livePrice = err<DemoError>({
        kind: 'Unavailable',
        service: 'pricing',
    }) as IResultOfT<number, DemoError>;

    const result = pipe(
        livePrice,
        orElse(error => {
            console.warn('Live pricing failed:', error);
            return ok(109);
        }),
    );

    return result.isSuccess
        ? { status: 'fallback', source: 'cache', price: result.value }
        : { status: 'failed', error: result.error };
}

async function enforceTimeout(): Promise<object> {
    const slowQuote = asyncResultFrom(async () => {
        await wait(300);
        return ok(8.5) as IResultOfT<number, DemoError>;
    });
    const result = await timeout(120, slowQuote).run();
    return result.isSuccess
        ? { status: 'ready', shipping: result.value }
        : { status: 'timed-out', error: result.error };
}

wireExample('#retry-inventory', 'Reliability / retry', retryInventory);
wireExample('#cached-price', 'Reliability / fallback', useCachedPrice);
wireExample('#shipping-timeout', 'Reliability / timeout', enforceTimeout);