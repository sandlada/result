import { pipe } from '@sandlada/result/composition';
import { match } from '@sandlada/result/operators';
import { PlaceOrder } from '../application.js';
import { wireExample } from '../demo-ui.js';
import type { OrderError } from '../domain.js';

type OrderView =
    | { readonly status: 'confirmed'; readonly receipt: string }
    | { readonly status: 'blocked'; readonly error: OrderError };

function checkout(items: readonly { readonly sku: string; readonly quantity: number }[]): object {
    return pipe(
        PlaceOrder.execute(items),
        match(
            (receipt): OrderView => ({ status: 'confirmed', receipt }),
            (error): OrderView => ({ status: 'blocked', error }),
        ),
    );
}

wireExample('#full-cart', 'Many tracks / combine then continue', () => checkout([
    { sku: 'notebook', quantity: 1 },
    { sku: 'pen', quantity: 3 },
]));
wireExample('#bad-line-stops-cart', 'Many tracks / first failure wins', () => checkout([
    { sku: 'notebook', quantity: 1 },
    { sku: 'eraser', quantity: 1 },
]));
