export type TransactionItem = {
	code: string;
	description?: string;
	category?: string;
	quantity: number;
	price: number;
	amount: number;
	discount?: number;
	taxable: boolean;
}
