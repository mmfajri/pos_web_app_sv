import { API_BASE_URL, API_ENDPOINTS } from "$lib/utils/const_variable";
import type { ApiResponse } from "$lib/utils/ApiResponse";

export interface LoginRequest {
	username: string;
	password: string;
}

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface AuthResponse {
	token?: string;
	userId?: string;
	username?: string;
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/Login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});

		const result: ApiResponse<AuthResponse> = await response.json();

		if (!response.ok) {
			throw new Error(result.message || `Login failed with status: ${response.status}`);
		}

		return result;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("An unexpected error occurred during login");
	}
}

export async function register(data: RegisterRequest): Promise<ApiResponse> {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/Register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		const result: ApiResponse = await response.json();

		if (!response.ok) {
			throw new Error(result.message || `Registration failed with status: ${response.status}`);
		}

		return result;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("An unexpected error occurred during registration");
	}
}
