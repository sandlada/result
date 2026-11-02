import type { Product, Sku } from './domain.js';

const products: readonly Product[] = [
    { sku: { value: 'notebook' }, name: 'Notebook', unitPriceCents: 1200 },
    { sku: { value: 'pen' }, name: 'Pen', unitPriceCents: 350 },
];

export function findProduct(sku: Sku): Product | undefined {
    return products.find(item => item.sku.value === sku.value);
}
