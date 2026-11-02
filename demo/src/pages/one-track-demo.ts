import { pipe } from '@sandlada/result/composition';
import { ok } from '@sandlada/result/factories';
import { map } from '@sandlada/result/operators';
import { FormatReceipt } from '../application.js';
import { wireExample } from '../demo-ui.js';
import { OrderLine } from '../domain.js';

const sampleLine = OrderLine.from(
    { sku: { value: 'notebook' }, name: 'Notebook', unitPriceCents: 1200 },
    { value: 2 },
);

function printLine(): object {
    const result = pipe(
        ok(sampleLine),
        map(line => FormatReceipt.execute(line)),
        map(receipt => ({ track: 'one-track' as const, receipt })),
    );
    return result.isSuccess ? result.value : { track: 'one-track', error: 'Unexpected failure on one-track demo' };
}

wireExample('#print-receipt', 'One track / map only', printLine);
