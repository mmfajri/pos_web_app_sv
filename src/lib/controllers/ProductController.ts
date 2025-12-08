import { API_BASE_URL, API_ENDPOINTS, API_STATUS_CODE } from "$lib/utils/const_variable";
import type { ApiResponse } from "$lib/utils/ApiResponse";

export interface Product {
	id?: number;
	barcodeID: string;
	title: string;
	quantityType: string;
	amount: number;
}

export interface ProductModel {
	id?: number;
	barcodeId: string;
	title: string;
	quantityType: string;
	amount: number;
}

export interface ProductModelDropdown {
	barcodeId: string;
	title: string;
}

export async function getAllProductDropdown(): Promise<ProductModelDropdown[]> {
	try {
		let url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/GetAllProductDropdown`;
		const response = await fetch(url);

		if (!response.ok) {
			if (response.status === API_STATUS_CODE.NOT_FOUND) {
				return [];
			}
			else {
				throw new Error(`Failed to fetch products: ${response.status}`);
			}
		}

		const apiResponse: ApiResponse<ProductModelDropdown[]> = await response.json();

		// Map API response to Product interface
		const products: ProductModelDropdown[] = (apiResponse.data || []).map(item => ({
			barcodeId: item.barcodeId,
			title: item.title,
		}));

		return products;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}

export async function getProductByBarcodeDropdown(barcodeId: string): Promise<ProductModelDropdown | null> {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/GetProductByBarcodeIdDropdown?barcodeId=${encodeURIComponent(barcodeId)}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			if (response.status === API_STATUS_CODE.NOT_FOUND) {
				return null
			} else {
				console.error("Failed to fetch data from api:", response.status);
				return null;
			}
		}

		const apiResponse: ApiResponse<ProductModelDropdown> = await response.json();
		return apiResponse.data || null;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

export async function getAllProducts(barcodeID?: string): Promise<Product[]> {
	try {
		let url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}`;
		if (barcodeID) {
			url += `?barcodeID=${encodeURIComponent(barcodeID)}`;
		}

		const response = await fetch(url);

		if (!response.ok) {
			if (response.status === API_STATUS_CODE.NOT_FOUND) {
				return [];
			}
			else {
				throw new Error(`Failed to fetch products: ${response.status}`);
			}
		}

		const apiResponse: ApiResponse<ProductModel[]> = await response.json();

		// Map API response to Product interface
		const products: Product[] = (apiResponse.data || []).map(item => ({
			id: item.id,
			barcodeID: item.barcodeId,
			title: item.title,
			quantityType: item.quantityType,  // Map 'unit' to 'quantityType'
			amount: item.amount        // Keep 'amount' as is
		}));

		return products;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}

export async function createProduct(product: Product): Promise<ApiResponse> {
	try {
		const createProductModel: ProductModel = {
			barcodeId: product.barcodeID,
			title: product.title,
			quantityType: product.quantityType,
			amount: product.amount,
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
			id: product.id,
			barcodeId: product.barcodeID,
			title: product.title,
			quantityType: product.quantityType,
			amount: product.amount,
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
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/Delete?id=${encodeURIComponent(id)}`, {
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

export interface PaginatedRequest {
  sortColumn?: string;
  sortColumnDir?: 'asc' | 'desc';
  rowsPerPage?: number;
  pageNumber?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

// New paginated API function
export async function getAllProductsPaginated(
  params: PaginatedRequest
): Promise<PaginatedResponse<Product>> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.sortColumn) queryParams.append('sortColumn', params.sortColumn);
    if (params.sortColumnDir) queryParams.append('sortColumnDir', params.sortColumnDir);
    if (params.rowsPerPage) queryParams.append('rowsPerPage', params.rowsPerPage.toString());
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());

    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/Paginated?${queryParams.toString()}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const apiResponse: ApiResponse<PaginatedResponse<Product>> = await response.json();

    return apiResponse.data || {
      data: [],
      totalRecords: 0,
      currentPage: 1,
      totalPages: 0,
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    throw error;
  }
}
