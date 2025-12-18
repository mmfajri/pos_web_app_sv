import type { TransactionItem, TransactionItemApiModel } from "$lib/models/TransactionItems";
import type { ApiResponse } from "$lib/utils/ApiResponse"
import { API_BASE_URL, API_ENDPOINTS } from "$lib/utils/ConstVariable";

export async function getItemByBarcodeId(transactionItems: TransactionItem[], barcodeId: string, unit?: string): Promise<TransactionItem[] | null> {
	try {
		// Calling Api
		let url = `${API_BASE_URL}${API_ENDPOINTS.INVOICE}/GetProductPriceByBarcode?BarcodeId=${encodeURIComponent(barcodeId)}`
		if (unit !== undefined) {
			url += `&Unit=${encodeURIComponent(unit)}`
		}

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			return null
		}

		const apiResponse: ApiResponse<TransactionItemApiModel> = await response.json();
		if (apiResponse.data !== undefined && apiResponse.data !== null) {
			const data = apiResponse.data
			const itemProduct: TransactionItem = {
				barcodeId: data.barcodeId,
				title: data.title,
				quantityType: data.quantityType,
				quantity: 1,
				price: data.amount,
				totalPrice: data.amount,
				discount: 0,
				taxable: false,
				listUnit: data.unitList
			}
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
	return parseFloat(items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2))
}
