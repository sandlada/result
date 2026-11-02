import { pipe } from '@sandlada/result/composition';
import { match } from '@sandlada/result/operators';
import { PlaceOneItem } from '../application.js';
import { wireExample } from '../demo-ui.js';
import type { OrderError } from '../domain.js';

type ItemView =
    | { readonly status: 'placed'; readonly line: string }
    | { readonly status: 'blocked'; readonly error: OrderError };

function formatLine(input: { readonly sku: string; readonly quantity: number }): object {
    return pipe(
        PlaceOneItem.execute(input),
        match(
            line => ({
                status: 'placed' as const,
                line: `${line.product.name} × ${line.quantity.value} = $${(line.lineTotalCents / 100).toFixed(2)}`,
            }),
            (error): ItemView => ({ status: 'blocked', error }),
        ),
    );
}

wireExample('#known-item', 'Two tracks / success path', () => formatLine({ sku: 'notebook', quantity: 2 }));
wireExample('#unknown-item', 'Two tracks / short-circuit', () => formatLine({ sku: 'eraser', quantity: 1 }));
