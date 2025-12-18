export const API_ENDPOINTS = {
	AUTH: "/Auth",
	EMPLOYEE: "/Employee",
	PRICE: "/Price",
	PRODUCT: "/Product",
	ROLE: "/Role",
	TRANSACTION: "/Transaction",
	UNIT: "/Unit",
	INVOICE: "/Invoice"
} as const

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_STATUS_CODE = {
	NOT_FOUND: 404,
	OK: 200,
	BAD_REQUEST: 504,
}



