export type DemoError =
    | { readonly kind: 'ValidationError'; readonly message: string }
    | { readonly kind: 'NotFound'; readonly resource: string }
    | { readonly kind: 'Unavailable'; readonly service: string };

export interface Product {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly salePrice?: number;
}

export interface Customer {
    readonly id: string;
    readonly name: string;
    readonly loyaltyPoints: number;
    readonly phone?: string;
}

export interface Order {
    readonly orderId: string;
    readonly customer: string;
    readonly product: string;
    readonly total: number;
}

export const products: readonly Product[] = [
    { id: 'keyboard-01', name: 'Mechanical Keyboard', price: 129, salePrice: 109 },
    { id: 'mouse-01', name: 'Wireless Mouse', price: 59 },
];

export const customers: readonly Customer[] = [
    { id: 'customer-01', name: 'Mina Chen', loyaltyPoints: 720 },
];

export const wait = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

export const simulatedApi = {
    async getProduct(id: string): Promise<Product> {
        await wait(160);
        const product = products.find(item => item.id === id);
        if (!product) throw new Error(`Product ${id} was not found`);
        return product;
    },

    async getCustomer(id: string): Promise<Customer> {
        await wait(120);
        const customer = customers.find(item => item.id === id);
        if (!customer) throw new Error(`Customer ${id} was not found`);
        return customer;
    },

    async getShippingQuote(): Promise<number> {
        await wait(90);
        return 8.5;
    },

    async createOrder(product: Product): Promise<Order> {
        await wait(140);
        return {
            orderId: 'order-2026-0722',
            customer: 'Mina Chen',
            product: product.name,
            total: (product.salePrice ?? product.price) + 8.5,
        };
    },
};

export const unavailable = (service: string): DemoError => ({
    kind: 'Unavailable',
    service,
});