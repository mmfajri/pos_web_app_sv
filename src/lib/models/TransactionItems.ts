export type TransactionItem = {
	code: string;
	product_name?: string;
	category?: string;
	quantity: number;
	price: number;
	amount: number;
	discount?: number;
	taxable: boolean;
}
