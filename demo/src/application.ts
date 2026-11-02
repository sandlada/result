import type { IResultOfT } from '@sandlada/result';
import { all } from '@sandlada/result/combine';
import { pipe } from '@sandlada/result/composition';
import { err, ok } from '@sandlada/result/factories';
import { bind, map } from '@sandlada/result/operators';
import { findProduct } from './catalog.js';
import { Money, Order, OrderLine, Quantity, Sku } from './domain.js';
import type { OrderError, OrderLine as OrderLineModel } from './domain.js';

export const FormatReceipt = {
    execute(line: OrderLineModel): string {
        return `${line.product.name} × ${line.quantity.value} = ${Money.format(line.lineTotalCents)}`;
    },
};

function formatOrderReceipt(lines: readonly OrderLineModel[], totalCents: number): string {
    const body = lines
        .map(line => `${line.product.name} × ${line.quantity.value} = ${Money.format(line.lineTotalCents)}`)
        .join('\n');
    return `${body}\nTotal: ${Money.format(totalCents)}`;
}

export const PlaceOneItem = {
    execute(input: { readonly sku: string; readonly quantity: number }): IResultOfT<OrderLineModel, OrderError> {
        return pipe(
            Sku.create(input.sku),
            bind(sku => {
                const product = findProduct(sku);
                return product ? ok(product) : err<OrderError>({ kind: 'UnknownProduct', sku: sku.value });
            }),
            bind(product => pipe(
                Quantity.create(input.quantity),
                map(quantity => OrderLine.from(product, quantity)),
            )),
        );
    },
};

export const PlaceOrder = {
    execute(items: readonly { readonly sku: string; readonly quantity: number }[]): IResultOfT<string, OrderError> {
        const lineResults = items.map(item => PlaceOneItem.execute(item));
        return pipe(
            all(lineResults),
            bind(lines => Order.create(lines)),
            map(order => formatOrderReceipt(order.lines, order.totalCents)),
        );
    },
};
