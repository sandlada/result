import type { IResultOfT } from '@sandlada/result';
import { err, ok } from '@sandlada/result/factories';

export type OrderError =
    | { readonly kind: 'InvalidQuantity'; readonly quantity: number }
    | { readonly kind: 'InvalidSku'; readonly raw: string }
    | { readonly kind: 'UnknownProduct'; readonly sku: string }
    | { readonly kind: 'EmptyOrder' };

export interface Sku {
    readonly value: string;
}

export interface Quantity {
    readonly value: number;
}

export interface Product {
    readonly sku: Sku;
    readonly name: string;
    readonly unitPriceCents: number;
}

export interface OrderLine {
    readonly product: Product;
    readonly quantity: Quantity;
    readonly lineTotalCents: number;
}

export interface Order {
    readonly lines: readonly OrderLine[];
    readonly totalCents: number;
}

export const Sku = {
    create(raw: string): IResultOfT<Sku, OrderError> {
        const value = raw.trim().toLowerCase();
        if (value.length === 0) {
            return err({ kind: 'InvalidSku', raw });
        }
        return ok({ value });
    },
};

export const Quantity = {
    create(quantity: number): IResultOfT<Quantity, OrderError> {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
            return err({ kind: 'InvalidQuantity', quantity });
        }
        return ok({ value: quantity });
    },
};

export const Money = {
    format(cents: number): string {
        return `$${(cents / 100).toFixed(2)}`;
    },
};

export const OrderLine = {
    from(product: Product, quantity: Quantity): OrderLine {
        return {
            product,
            quantity,
            lineTotalCents: product.unitPriceCents * quantity.value,
        };
    },
};

export const Order = {
    create(lines: readonly OrderLine[]): IResultOfT<Order, OrderError> {
        if (lines.length === 0) {
            return err({ kind: 'EmptyOrder' });
        }
        const totalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
        return ok({ lines, totalCents });
    },
};
