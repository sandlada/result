import { bind, err, fromPredicate, map, match, ok, pipe, tap } from '@sandlada/result';
import type { IResultOfT } from '@sandlada/result';
import { wireExample } from './demo-ui.js';
import { products } from './mock-api.js';
import type { DemoError } from './mock-api.js';

type ValidationView =
    | { readonly status: 'success'; readonly productId: string; readonly next: string }
    | { readonly status: 'failure'; readonly error: DemoError; readonly next: string };

function validateProduct(productId: string): IResultOfT<string, DemoError> {
    return pipe(
        productId,
        fromPredicate(
            value => value.trim().length > 0,
            { kind: 'ValidationError', message: 'Product ID is required' } as DemoError,
        ),
        map(value => value.trim().toLowerCase()),
        bind(id => products.some(product => product.id === id)
            ? ok(id)
            : err<DemoError>({ kind: 'NotFound', resource: id })),
        tap(id => console.info('Validated product:', id)),
    );
}

function formatValidation(productId: string): object {
    return pipe(
        validateProduct(productId),
        match(
            (id): ValidationView => ({ status: 'success', productId: id, next: 'Ready for checkout' }),
            (error): ValidationView => ({ status: 'failure', error, next: 'Correct the product ID and retry' }),
        ),
    );
}

wireExample('#valid-product', 'Core / success track', () => formatValidation('keyboard-01'));
wireExample('#missing-product', 'Core / failure track', () => formatValidation('camera-99'));