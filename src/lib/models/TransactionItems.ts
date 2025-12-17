export type TransactionItem = {
	barcodeId: string;
	title: string;
	quantityType: string;
	quantity: number;
	price: number;
	totalPrice: number;
	discount: number;
	taxable: boolean;
	listUnit: UnitTransactionItem[];
}

export type TransactionItemApiModel = {
	priceId?: number;
	barcodeId: string;
	title: string;
	quantityType: string;
	amount: number;
	unitList: UnitTransactionItem[];
}

export type UnitTransactionItem = {
	id?: number;
	name: string;
}
