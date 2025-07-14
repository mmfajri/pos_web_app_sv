import type { Product } from "$lib/models/Product";
import type { TransactionItem } from "$lib/models/TransactionItems";
import { quintOut } from "svelte/easing";

export class TransactionController {
	private productDb: Product[];
	private item: TransactionItem[] = [];

	constructor(productDb: Product[]) {
		this.productDb = productDb;
	}

	getItem(): TransactionItem[] {
		return this.item;
	}

	// method to add product
	addItemByCode(code: string): boolean {
		const product = this.productDb.find(p => p.code.toLowerCase() === code.toLowerCase());
		if (!product) return false;

		this.item.push({
			code: product.code,
			description: product.description,
			category: product.category,
			quantity: 1,
			price: product.price ?? 0,
			amount: product.price ?? 0,
			taxable: false,
		});
		return true
	}

	// method to change the quantity and calculate the amount price
	updateQuantity(index: number, qty: number): void {
		if (index < 0 || index >= this.item.length) return;
		const item = this.item[index];
		item.quantity = qty;
		item.amount = parseFloat((qty * item.price).toFixed(2));

	}

	// method to delete the product in the transaction list 
	removeItem(index: number): void {
		this.item.splice(index, 1);
	}

	getSubTotal(): number {
		return parseFloat(this.item.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
	}


}


