export type TransactionItem = {
	barcodeId: string;
	title: string;
	quantityType: string;
	quantity: number;
	price: number;
	totalPrice: number;
	discount: number;
	taxable: boolean;
	listUnitItem: UnitTransactionItem[] | string | null;
}

export type TransactionInvoice = {
	transactionDate: string;
	accountPos: number;
	totalTransaction: number;
	payAmount: number;
	listTransactionItems: TransactionItemApiModel[];
}

export type ListTransactionItemInvoice = {
	barcodeId: string;
	title: string;
	quantityType: string;
	quantity: number;
	price: number;
	totalPrice: number;
	discount: number;
	taxable: boolean;
	listUnitItem: UnitTransactionItem[] | string | null;
}

export type TransactionItemApiModel = {
	priceId?: number;
	barcodeId: string;
	title: string;
	quantity: number;
	quantityType: string;
	price: number;
	totalPrice: number;
	unitList: UnitTransactionItem[] | string | null;
}

export type UnitTransactionItem = {
	id?: number;
	name: string;
}
