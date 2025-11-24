export const API_ENDPOINTS = {
	AUTH: "/Auth",
	EMPLOYEE: "/Employee",
	PRICE: "/Price",
	PRODUCT: "/Product",
	ROLE: "/Role",
	TRANSACTION: "/Transaction",
	UNIT: "/Unit"
} as const

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

