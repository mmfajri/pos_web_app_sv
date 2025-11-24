import { API_BASE_URL, API_ENDPOINTS } from "$lib/utils/const_variable";
import type { ApiResponse } from "$lib/utils/ApiResponse";

export interface Product {
	id?: number;
	barcodeID: string;
	title: string;
	quantityType: string;
	pricePerQty: number;
}

export interface ProductModel {
	id?: number;
	barcodeID: string;
	title: string;
	unit: string;
	amount: number;
}

export async function getAllProducts(barcodeID?: string): Promise<Product[]> {
	try {
		let url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}`;
		if (barcodeID) {
			url += `?barcodeID=${encodeURIComponent(barcodeID)}`;
		}

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch products: ${response.status}`);
		}

		const apiResponse: ApiResponse<Product[]> = await response.json();
		return apiResponse.data || [];
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}

export async function createProduct(product: Product): Promise<ApiResponse> {
	try {
		const createProductModel: ProductModel = {
			barcodeID: product.barcodeID,
			title: product.title,
			unit: product.quantityType,
			amount: product.pricePerQty,
		};

		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/Create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(createProductModel),
		});

		const result: ApiResponse = await response.json();

		if (!response.ok) {
			throw new Error(result.message || `Create product failed with status: ${response.status}`);
		}

		return result;
	} catch (error) {
		console.error("Error creating product:", error);
		throw error;
	}
}

export async function updateProduct(product: Product): Promise<ApiResponse> {
	try {
		const updateProductModel: ProductModel = {
			barcodeID: product.barcodeID,
			title: product.title,
			unit: product.quantityType,
			amount: product.pricePerQty,
		};

		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/Update`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updateProductModel),
		});

		const result: ApiResponse = await response.json();

		if (!response.ok) {
			throw new Error(result.message || `Update product failed with status: ${response.status}`);
		}

		return result;
	} catch (error) {
		console.error("Error updating product:", error);
		throw error;
	}
}

export async function deleteProduct(id: number): Promise<void> {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/Delete/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error(`Delete product failed with status: ${response.status}`);
		}
	} catch (error) {
		console.error("Error deleting product:", error);
		throw error;
	}
}
