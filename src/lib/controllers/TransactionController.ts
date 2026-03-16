import type { TransactionItem, TransactionItemApiModel } from "$lib/models/TransactionItems";
import type { ApiResponse } from "$lib/utils/ApiResponse";
import { API_BASE_URL, API_ENDPOINTS } from "$lib/utils/const_variable";

export interface TransactionListItem {
	id: number;
	transactionDate: string;
	totalAmmount: number;
}

interface TransactionListResponse {
	totalRecord: number;
	currentPage: number;
	totalPage: number;
	dataTable: TransactionListItem[];
}

export interface PaginatedTransactionRequest {
	sortColumn?: string;
	sortColumnDir?: "asc" | "desc";
	rowsPerPage?: number;
	pageNumber?: number;
	transactionDate?: string;
}

export interface PaginatedTransactionResponse {
	data: TransactionListItem[];
	totalRecords: number;
	currentPage: number;
	totalPages: number;
}

interface TransactionDetailResponse {
	totalRecord: number;
	currentPage: number;
	totalPage: number;
	dataTable: TransactionItemApiDetail[];
}

export interface TransactionItemApiDetail {
	transactionId?: number;
	barcodeId: string;
	titleProduct: string;
	quantityType: string;
	quantity: number;
	priceProduct: number;
	totalPrice: number;
}

export async function getTransactionsPaginated(
	params: PaginatedTransactionRequest
): Promise<PaginatedTransactionResponse> {
	const queryParams = new URLSearchParams();

	if (params.sortColumn) queryParams.append("sortColumn", params.sortColumn);
	if (params.sortColumnDir) queryParams.append("sortColumnDir", params.sortColumnDir);
	if (params.rowsPerPage) queryParams.append("rowsPerPage", params.rowsPerPage.toString());
	if (params.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
	if (params.transactionDate) queryParams.append("transactionDate", params.transactionDate);

	const url = `${API_BASE_URL}${API_ENDPOINTS.TRANSACTION}?${queryParams.toString()}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch transactions: ${response.status}`);
	}

	const apiResponse: ApiResponse<TransactionListResponse> = await response.json();
	const backendData = apiResponse.data;

	if (!backendData) {
		return { data: [], totalRecords: 0, currentPage: 1, totalPages: 0 };
	}

	return {
		data: backendData.dataTable || [],
		totalRecords: backendData.totalRecord,
		currentPage: backendData.currentPage,
		totalPages: backendData.totalPage,
	};
}

export async function getTransactionDetail(
	transactionId: number
): Promise<TransactionItemApiDetail[]> {
	const url = `${API_BASE_URL}${API_ENDPOINTS.TRANSACTION}/${transactionId}?req=${transactionId}`;
	const response = await fetch(url);

	if (!response.ok) {
		if (response.status === 404) return [];
		throw new Error(`Failed to fetch transaction detail: ${response.status}`);
	}

	const apiResponse: ApiResponse<TransactionDetailResponse> = await response.json();
	return apiResponse.data?.dataTable || [];
}

export interface UpdateTransactionItemRequest {
	transactionId: number;
	listTransactionItem: {
		barcodeId: string;
		titleProduct: string;
		quantityType: string;
		quantity: number;
		priceProduct: number;
		totalPrice: number;
	}[];
}

export async function updateTransactionItems(
	req: UpdateTransactionItemRequest
): Promise<ApiResponse<boolean>> {
	const url = `${API_BASE_URL}${API_ENDPOINTS.TRANSACTION}/UpdateTransactionItems`;
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(req),
	});

	const result: ApiResponse<boolean> = await response.json();

	if (!response.ok) {
		throw new Error(result.message || `Update failed with status: ${response.status}`);
	}

	return result;
}
