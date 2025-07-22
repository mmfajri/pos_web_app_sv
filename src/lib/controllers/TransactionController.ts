import type { Product } from "$lib/models/Product";
import type { TransactionItem } from "$lib/models/TransactionItems";

export function addItemByCode(products: Product[], transactionItems: TransactionItem[], code: string): TransactionItem[] {
	const product = products.find(p => p.code.toLowerCase() === code.toLowerCase());
	if (!product) return transactionItems

	return [...transactionItems, {
		code: product.code,
		product_name: product.product_name,
		category: product.category,
		quantity: 1,
		price: product.price ?? 0,
		amount: product.price ?? 0,
		taxable: false
	}];
}

export function updateQuantity(transactionItem: TransactionItem[], index: number, quantity: number): TransactionItem[] {
	return transactionItem.map((item, i) => {
		if (i === index) {
			const updatedAmount = parseFloat((quantity * item.price).toFixed(2));
			return { ...item, quantity: quantity, amount: updatedAmount };
		}
		return item;
	});
}

export function removeItem(transactionItem: TransactionItem[], index: number): TransactionItem[] {
	return transactionItem.filter((_, i) => i !== index);
}

export function getSubtotal(items: TransactionItem[]): number {
	return parseFloat(items.reduce((sum, item) => sum + item.amount, 0).toFixed(2))
}
