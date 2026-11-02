import { pipe } from '@sandlada/result/composition';
import { match } from '@sandlada/result/operators';
import { wireExample } from '../demo-ui.js';
import { Quantity } from '../domain.js';
import type { OrderError } from '../domain.js';

type ErrorView =
    | { readonly status: 'accepted'; readonly quantity: number }
    | { readonly status: 'rejected'; readonly error: OrderError };

function tryQuantity(quantity: number): object {
    return pipe(
        Quantity.create(quantity),
        match(
            (value): ErrorView => ({ status: 'accepted', quantity: value.value }),
            (error): ErrorView => ({ status: 'rejected', error }),
        ),
    );
}

wireExample('#valid-quantity', 'Error / success value', () => tryQuantity(2));
wireExample('#invalid-quantity', 'Error / typed failure', () => tryQuantity(0));
