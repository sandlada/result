import {
    all, bindAsync, map, mapAsync, matchAsync, pipe, pipeAsync, tryCatchAsync,
} from '@sandlada/result';
import { wireExample } from './demo-ui.js';
import { simulatedApi, unavailable } from './mock-api.js';
import type { DemoError, Order } from './mock-api.js';

type CheckoutView =
    | { readonly status: 'accepted'; readonly order: Omit<Order, 'total'> & { readonly total: string } }
    | { readonly status: 'rejected'; readonly error: DemoError };

async function placeOrder(): Promise<object> {
    return pipeAsync(
        tryCatchAsync(
            () => simulatedApi.getProduct('keyboard-01'),
            () => unavailable('catalog'),
        ),
        bindAsync(product => tryCatchAsync(
            () => simulatedApi.createOrder(product),
            () => unavailable('orders'),
        )),
        mapAsync(order => ({ ...order, total: `$${order.total.toFixed(2)}` })),
        matchAsync(
            (order): CheckoutView => ({ status: 'accepted', order }),
            (error): CheckoutView => ({ status: 'rejected', error }),
        ),
    );
}

async function loadCheckoutSummary(): Promise<object> {
    const [product, customer, shipping] = await Promise.all([
        tryCatchAsync(() => simulatedApi.getProduct('keyboard-01'), () => unavailable('catalog')),
        tryCatchAsync(() => simulatedApi.getCustomer('customer-01'), () => unavailable('customers')),
        tryCatchAsync(() => simulatedApi.getShippingQuote(), () => unavailable('shipping')),
    ]);

    const result = pipe(
        all([product, customer, shipping]),
        map(([item, buyer, shippingCost]) => ({
            buyer: buyer.name,
            item: item.name,
            shipping: shippingCost,
            total: (item.salePrice ?? item.price) + shippingCost,
        })),
    );

    return result.isSuccess
        ? { status: 'ready', summary: result.value }
        : { status: 'failed', error: result.error };
}

wireExample('#place-order', 'Async / sequential pipeline', placeOrder);
wireExample('#parallel-summary', 'Async / parallel combine', loadCheckoutSummary);