import type { TransactionInvoice, TransactionItem, TransactionItemApiModel } from "$lib/models/Transaction";
import type { ApiResponse } from "$lib/utils/ApiResponse";
import { API_BASE_URL, API_ENDPOINTS } from "$lib/utils/ConstVariable";

export async function saveTransactionInvoice(transactionData: TransactionInvoice): Promise<boolean> {
	try {
		let url = `${API_BASE_URL}${API_ENDPOINTS.INVOICE}/SaveInvoiceTransaction`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(transactionData),
		});

		const result: ApiResponse = await response.json();

		if (!response.ok) {
			console.error(result.message || `Create Transaction Invoice failed with status: ${response.status}`);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error saving transaction:", error);
		return false;
	}
}

export async function getItemByBarcodeId(
	transactionItems: TransactionItem[],
	barcodeId: string,
	unit?: string,
): Promise<TransactionItem[] | null> {
	try {
		// Calling Api
		let url = `${API_BASE_URL}${API_ENDPOINTS.INVOICE}/GetProductPriceByBarcode?BarcodeId=${encodeURIComponent(barcodeId)}`;
		if (unit !== undefined) {
			url += `&Unit=${encodeURIComponent(unit)}`;
		}

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			return null;
		}
		debugger;

		const apiResponse: ApiResponse<TransactionItemApiModel> = await response.json();
		if (apiResponse.data !== undefined && apiResponse.data !== null) {
			const data = apiResponse.data;
			const itemProduct: TransactionItem = {
				barcodeId: data.barcodeId,
				title: data.title,
				quantityType: data.quantityType,
				quantity: 1,
				price: data.amount,
				totalPrice: data.amount * 1,
				discount: 0,
				taxable: false,
				listUnitItem: data.unitList,
			};
			return [...transactionItems, itemProduct];
		} else {
			return null;
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

export function updateQuantity(transactionItem: TransactionItem[], index: number, quantity: number): TransactionItem[] {
	return transactionItem.map((item, i) => {
		if (i === index) {
			const updatedAmount = parseFloat((quantity * item.price).toFixed(2));
			return { ...item, quantity: quantity, totalPrice: updatedAmount };
		}
		return item;
	});
}

export function removeItem(transactionItem: TransactionItem[], index: number): TransactionItem[] {
	return transactionItem.filter((_, i) => i !== index);
}

export function getSubtotal(items: TransactionItem[]): number {
	return parseFloat(items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
}
